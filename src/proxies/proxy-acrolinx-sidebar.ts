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
  AcrolinxSidebar,
  BatchCheckRequestOptions,
  Check,
  CheckedDocumentRange,
  CheckOptions,
  InitParameters,
  InvalidDocumentPart,
  Message,
  SidebarConfiguration
} from '@acrolinx/sidebar-interface';
import * as logging from "../utils/logging";

export class ProxyAcrolinxSidebar implements AcrolinxSidebar {
  private _acrolinxSidebar: AcrolinxSidebar;
  private _serverAddress: string;
  private readonly configureQueue: SidebarConfiguration[] = [];

  constructor(private readonly initListener: (initParameters: InitParameters) => void) {
  }

  get serverAddress(): string {
    return this._serverAddress;
  }

  set serverAddress(value: string) {
    this._serverAddress = value;
  }

  get acrolinxSidebar(): AcrolinxSidebar {
    return this._acrolinxSidebar;
  }

  set acrolinxSidebar(sidebar: AcrolinxSidebar) {
    this._acrolinxSidebar = sidebar;
    while (this.configureQueue.length > 0) {
      this._acrolinxSidebar.configure(this.configureQueue.splice(0, 1)[0]);
    }
  }

  init(initParameters: InitParameters): void {
    this.initListener(initParameters);
  }

  configure(sidebarConfiguration: SidebarConfiguration): void {
    if (this.acrolinxSidebar) {
      this.acrolinxSidebar.configure(sidebarConfiguration);
    } else {
      this.configureQueue.push(sidebarConfiguration);
    }
  }

  checkGlobal(documentContent: string, options: CheckOptions): Check {
    return this.acrolinxSidebar.checkGlobal(documentContent, options);
  }

  onGlobalCheckRejected(): void {
    this.acrolinxSidebar.onGlobalCheckRejected();
  }

  invalidateRanges(invalidCheckedDocumentRanges: InvalidDocumentPart[]) {
    this.acrolinxSidebar.invalidateRanges(invalidCheckedDocumentRanges);
  }

  onVisibleRangesChanged(checkedDocumentRanges: CheckedDocumentRange[]) {
    return this.acrolinxSidebar.onVisibleRangesChanged(checkedDocumentRanges);
  }

  showMessage(message: Message): void {
    return this.acrolinxSidebar.showMessage(message);
  }

  initBatchCheck(documentIdentifiers: BatchCheckRequestOptions[]): void {
    if (this.acrolinxSidebar.initBatchCheck) {
      return this.acrolinxSidebar.initBatchCheck(documentIdentifiers);
    } else {
      logging.error('initBatchCheck is not supported');
    }
  }

  checkDocumentInBackground(documentIdentifier: string, documentContent: string, options: CheckOptions): void {
    if (this.acrolinxSidebar.checkDocumentInBackground) {
      return this.acrolinxSidebar.checkDocumentInBackground(documentIdentifier, documentContent, options);
    } else {
      logging.error('checkDocumentInBackground is not supported');
    }
  }

}
