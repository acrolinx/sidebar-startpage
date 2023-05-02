/*
 * Copyright 2016-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as utils from './utils';
import {FetchError} from './utils';
import {FORCE_SIDEBAR_URL} from '../../constants';
import {isVersionGreaterEqual, TimeoutWatcher} from '../../utils/utils';
import * as logging from '../../utils/logging';

// TODO not sure on what values use here?
const DEFAULT_MINIMUM_SIDEBAR_VERSION = [15, 12, 0];

export interface LoadSidebarProps {
  sidebarUrl: string;
  useMessageAdapter: boolean;
  minimumSidebarVersion: number[];
  timeoutWatcher: TimeoutWatcher;
}

export function getSidebarVersion(sidebarHtml: string): [number, number, number] | null {
  const match = sidebarHtml.match(/<meta name=\"sidebar-version\" content=\"(\d+)\.(\d+)\.(\d+)/);
  if (!match || match.length !== 4) {
    return null;
  }
  const versionParts = match.slice(1, 4).map(s => parseInt(s));
  return [versionParts[0], versionParts[1], versionParts[2]];
}

type NoValidSidebarErrorCode = 'noSidebar' | 'sidebarVersionIsBelowMinimum';

export class NoValidSidebarError extends Error {
  constructor(public acrolinxErrorCode: NoValidSidebarErrorCode, message: string, public url: string) {
    super(message);
  }
}

export type LoadSidebarError = FetchError | NoValidSidebarError;

export function loadSidebarIntoIFrame(config: LoadSidebarProps, sidebarIFrameElement: HTMLIFrameElement, onSidebarLoaded: (error?: LoadSidebarError) => void) {
  logging.log('loadSidebarIntoIFrame', config);
  const sidebarBaseUrl = FORCE_SIDEBAR_URL || config.sidebarUrl;
  const completeSidebarUrl = sidebarBaseUrl + 'index.html?t=' + Date.now();
  utils.fetch(completeSidebarUrl, {timeout: 10000}, (sidebarHtmlOrError) => {
    // Handle fetch errors.
    if (typeof sidebarHtmlOrError !== 'string') {
      const fetchError: FetchError = sidebarHtmlOrError;
      logging.error('Error while fetching the sidebar: ' + fetchError.acrolinxErrorCode, fetchError);
      onSidebarLoaded(fetchError);
      return;
    }

    const sidebarHtml = sidebarHtmlOrError;

    // Handle invalid sidebar html error.
    if (sidebarHtml.indexOf('<meta name="sidebar-version"') < 0) {
      onSidebarLoaded(new NoValidSidebarError('noSidebar',
        'No valid sidebar html code:' + sidebarHtml, completeSidebarUrl));
      return;
    }

    const sidebarVersion = getSidebarVersion(sidebarHtml);
    const wrongSidebarVersion = !sidebarVersion
      || !isVersionGreaterEqual(sidebarVersion, DEFAULT_MINIMUM_SIDEBAR_VERSION)
      || !isVersionGreaterEqual(sidebarVersion, config.minimumSidebarVersion);

    if (!FORCE_SIDEBAR_URL && wrongSidebarVersion) {
      logging.warn(`Found sidebar version ${formatVersion(sidebarVersion)} ` +
        `(default minimumSidebarVersion=${formatVersion(DEFAULT_MINIMUM_SIDEBAR_VERSION)}, configured minimumSidebarVersion=${formatVersion(config.minimumSidebarVersion)})`);
      onSidebarLoaded(new NoValidSidebarError('sidebarVersionIsBelowMinimum',
        'Sidebar version is smaller than minimumSidebarVersion', completeSidebarUrl));
      return;
    }

    logging.log('Sidebar HTML is loaded successfully');

    config.timeoutWatcher.start();

    if (config.useMessageAdapter) {
      const onLoadHandler = () => {
        sidebarIFrameElement.removeEventListener('load', onLoadHandler);
        onSidebarLoaded();
      };
      sidebarIFrameElement.addEventListener('load', onLoadHandler);
      sidebarIFrameElement.src = completeSidebarUrl + '&acrolinxUseMessageApi=true';
    } else {
      writeSidebarHtmlIntoIFrame(sidebarHtml, sidebarIFrameElement, sidebarBaseUrl);
      onSidebarLoaded();
    }
  });
}

function formatVersion(version: number[] | null) {
  return version && version.join('.');
}

function writeSidebarHtmlIntoIFrame(sidebarHtml: string, sidebarIFrameElement: HTMLIFrameElement, sidebarBaseUrl: string) {
  const sidebarContentWindow = sidebarIFrameElement.contentWindow!;
  const sidebarHtmlWithAbsoluteLinks = sidebarHtml
    .replace(/src="/g, 'src="' + sidebarBaseUrl)
    .replace(/href="/g, 'href="' + sidebarBaseUrl);
  sidebarContentWindow.document.open();
  sidebarContentWindow.document.write(sidebarHtmlWithAbsoluteLinks);
  sidebarContentWindow.document.close();
}

export function pickSidebarVersion(minimumSidebarVersion: number[], platformVersion: string): number {

  let defaultSidebarVersion = 15;

  if (minimumSidebarVersion.length !== 0 && minimumSidebarVersion[0] < defaultSidebarVersion) {
    defaultSidebarVersion = minimumSidebarVersion[0];
  }

  // Check compatibility with the platform version
  const isCompatible = isCompatibleWithPlatform(defaultSidebarVersion, platformVersion);

  // TODO not sure what to do when its not compatible?
  if (!isCompatible) {
    logging.error(`The sidebar version ${minimumSidebarVersion} is not compatible with the platform version ${platformVersion}`)
  }

  return defaultSidebarVersion;
}

export function isCompatibleWithPlatform(sidebarVersion: number, platformVersion: string): boolean {
  const compatibilityList = [
    { sidebarVersion: 15, platformVersion: '2021.12.1' },
    { sidebarVersion: 14, platformVersion: '2021.12.1' },
  ];

  // Check if the current sidebar and platform versions are in the compatibility list
  return compatibilityList.some(pair => pair.sidebarVersion === sidebarVersion && pair.platformVersion === platformVersion);
}
