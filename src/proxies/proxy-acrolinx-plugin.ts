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
  CheckResult,
  InitResult,
  LogEntry,
  MatchWithReplacement,
  OpenWindowParameters,
  RequestGlobalCheckOptions,
} from '@acrolinx/sidebar-interface';
import { AcrolinxPluginWithReuse, ReuseSearchResult, UILanguage } from '../sidebar-interface-extensions';
import * as logging from "../utils/logging";

export const POLL_FOR_PLUGIN_INTERVAL_MS = 10;

export interface ProxyAcrolinxPluginProps {
  requestInitListener: () => void;
  acrolinxPlugin: AcrolinxPluginWithReuse;
  serverAddress: string;
  showServerSelector: Function;
  openWindow: (opts: OpenWindowParameters) => void;
}

/**
 * Made for injection into the sidebar iframe.
 * It will forward method calls from the sidebar to the startpage or directly to the acrolinxPlugin.
 */
export class ProxyAcrolinxPlugin implements AcrolinxPluginWithReuse {

  constructor(private readonly props: ProxyAcrolinxPluginProps) {
  }

  requestInit() {
    this.props.requestInitListener();
  }

  onInitFinished(initFinishedResult: InitResult) {
    this.props.acrolinxPlugin.onInitFinished(initFinishedResult);
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

  requestCheckForDocumentInBatch(documentIdentifier: string): void {
    if (this.props.acrolinxPlugin.requestCheckForDocumentInBatch) {
      this.props.acrolinxPlugin.requestCheckForDocumentInBatch(documentIdentifier);
    } else {
      logging.error('requestCheckForDocumentInBatch is not supported');
    }
  }

  onReusePrefixSearchResult(reuseSearchResult: ReuseSearchResult): void {
    if(this.props.acrolinxPlugin.onReusePrefixSearchResult) {
      this.props.acrolinxPlugin.onReusePrefixSearchResult(reuseSearchResult);
    } else {
      logging.error("onReusePrefixSearchResult is not supported");
    }
  }

  openReusePanel(): void {
    if(this.props.acrolinxPlugin.openReusePanel) {
      this.props.acrolinxPlugin.openReusePanel();
    } else {
      logging.error("openReusePanel is not supported");
    }
  }

  onUiLanguageChanged(uiLanguage: UILanguage): void {
    if(this.props.acrolinxPlugin.onUiLanguageChanged) {
      this.props.acrolinxPlugin.onUiLanguageChanged(uiLanguage);
    } else {
      logging.error("onUiLanguageChanged is not supported");
    }
  }


  openDocumentInEditor(documentIdentifier: string): void | Promise<void> {
    if (this.props.acrolinxPlugin.openDocumentInEditor) {
      return this.props.acrolinxPlugin.openDocumentInEditor(documentIdentifier);
    } else {
      logging.error('openDocumentInEditor is not supported');
    }
  }

  log(logEntry: LogEntry): void {
    if (this.props.acrolinxPlugin.log) {
      this.props.acrolinxPlugin.log(logEntry);
    } else {
      logging.error('log is not supported', logEntry);
    }
  }
}


export function waitForAcrolinxPlugin(callback: (acrolinxPlugin: AcrolinxPluginWithReuse) => void) {
  const windowAny = window as any;
  if (windowAny.acrolinxPlugin) {
    callback(windowAny.acrolinxPlugin);
  } else {
    setTimeout(() => {
      waitForAcrolinxPlugin(callback);
    }, POLL_FOR_PLUGIN_INTERVAL_MS);
  }
}
