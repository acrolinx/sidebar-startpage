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
  InitParameters,
  SidebarConfiguration,
  CheckOptions,
  Check,
  InvalidDocumentPart,
  CheckedDocumentRange
} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";


export class ProxyAcrolinxSidebar implements AcrolinxSidebar {
  private _acrolinxSidebar: AcrolinxSidebar;
  private _serverAddress: string;
  private configureQueue: SidebarConfiguration[] = [];

  constructor(private initListener: (initParameters: InitParameters) => void) {
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
}
