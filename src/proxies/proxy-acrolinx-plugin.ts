/*
 * Copyright 2017-present Acrolinx GmbH
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

import {
  AcrolinxPlugin,
  InitResult,
  AcrolinxPluginConfiguration,
  CheckResult,
  MatchWithReplacement,
  DownloadInfo,
  OpenWindowParameters, RequestGlobalCheckOptions,
} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import * as logging from "../utils/logging";

export const POLL_FOR_PLUGIN_INTERVAL_MS = 10;

export interface ProxyAcrolinxPluginProps {
  requestInitListener: () => void;
  acrolinxPlugin: AcrolinxPlugin;
  serverAddress: string;
  showServerSelector: Function;
  openWindow: (opts: OpenWindowParameters) => void;
}

/**
 * Made for injection into the sidebar iframe.
 * It will forward method calls from the sidebar to the startpage or directly to the acrolinxPlugin.
 */
export class ProxyAcrolinxPlugin implements AcrolinxPlugin {

  constructor(private props: ProxyAcrolinxPluginProps) {
  }

  requestInit() {
    this.props.requestInitListener();
  }

  onInitFinished(initFinishedResult: InitResult) {
    this.props.acrolinxPlugin.onInitFinished(initFinishedResult);
  }

  configure(configuration: AcrolinxPluginConfiguration) {
    this.props.acrolinxPlugin.configure(configuration);
  }

  requestGlobalCheck(options?: RequestGlobalCheckOptions) {
    if (options) {
      this.props.acrolinxPlugin.requestGlobalCheck(options);
    } else {
      this.props.acrolinxPlugin.requestGlobalCheck();
    }
  }

  onCheckResult(checkResult: CheckResult) {
    this.props.acrolinxPlugin.onCheckResult(checkResult);
  }

  selectRanges(checkId: string, matches: MatchWithReplacement[]) {
    this.props.acrolinxPlugin.selectRanges(checkId, matches);
  }

  replaceRanges(checkId: string, matchesWithReplacement: MatchWithReplacement[]) {
    this.props.acrolinxPlugin.replaceRanges(checkId, matchesWithReplacement);
  }

  download(download: DownloadInfo) {
    this.props.acrolinxPlugin.download(download);
  }

  openWindow(opts: OpenWindowParameters) {
    this.props.openWindow(opts);
  }

  showServerSelector() {
    this.props.showServerSelector();
  }

  openLogFile() {
    if (this.props.acrolinxPlugin.openLogFile) {
      this.props.acrolinxPlugin.openLogFile();
    } else {
      logging.error('openLogFile is not supported');
    }
  }
}


export function waitForAcrolinxPlugin(callback: (acrolinxPlugin: AcrolinxPlugin) => void) {
  const windowAny = window as any;
  if (windowAny.acrolinxPlugin) {
    callback(windowAny.acrolinxPlugin);
  } else {
    setTimeout(() => {
      waitForAcrolinxPlugin(callback);
    }, POLL_FOR_PLUGIN_INTERVAL_MS);
  }
}
