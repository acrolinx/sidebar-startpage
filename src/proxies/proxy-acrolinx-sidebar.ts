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
  Cluster as TCluster,
  InitParameters,
  InvalidDocumentPart,
  Message,
  SidebarConfiguration,
} from "@acrolinx/sidebar-interface";
import * as logging from "../utils/logging";

export class ProxyAcrolinxSidebar implements AcrolinxSidebar {
  private _acrolinxSidebar: AcrolinxSidebar;
  private _serverAddress: string;
  private readonly configureQueue: SidebarConfiguration[] = [];

  constructor(
    private readonly initListener: (initParameters: InitParameters) => void
  ) {}

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
      logging.error("initBatchCheck is not supported");
    }
  }

  checkDocumentInBatch(
    documentIdentifier: string,
    documentContent: string,
    options: CheckOptions
  ): void {
    if (this.acrolinxSidebar.checkDocumentInBatch) {
      return this.acrolinxSidebar.checkDocumentInBatch(
        documentIdentifier,
        documentContent,
        options
      );
    } else {
      logging.error("checkDocumentInBatch is not supported");
    }
  }

  callReuse(): TCluster[] {
    
    console?.log?.("Hello Reuse this is the sidebarstart page!");
    // fetch(
    //   "https://claus.targets.acrolinx.sh/reuse-service/api/v1/phrases/preferred?language=en&prefix=The+preferred+phrase"
    // )
    //   .then(console.log)
    //   .catch(console.error);

    (window as any).reuseTestFunction?.(JSON.stringify(clusters));
    return clusters;
  }
}

const clusters: TCluster[] = [
  {
    uuid: "bc20a5b4-36fa-4bb3-b2e2-761282f7e35a",
    preferredPhrase: "The preferred phrase number one",
    deprecatedPhrases: [
      "The phrase number one",
      "The phrase one",
      "The one phrase",
    ],
    active: true,
    reuseDomains: ["c692fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "ClusterDescription 1",
    language: "en",
  },
  {
    uuid: "553282db-464b-4dcf-8043-870f94552382",
    preferredPhrase: "The preferred phrase number two",
    deprecatedPhrases: ["The phrase number two", "The two phrase"],
    active: true,
    reuseDomains: ["c692fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "ClusterDescription 2",
    language: "en",
  },
  {
    uuid: "d8fd44f5-fb9f-4a2d-8b18-6f65212201e6",
    preferredPhrase: "The preferred phrase number three",
    deprecatedPhrases: ["The phrase three"],
    active: true,
    reuseDomains: ["0600d5b2-3645-4152-a904-a3b4e9251e89"],
    description: "ClusterDescription 3",
    language: "en",
  },
  {
    uuid: "a30e6266-6292-4117-be1d-1ce6d34e6cb4",
    preferredPhrase: "Preferred phrase D",
    deprecatedPhrases: ["Phrase AAA", "Phrase BB", "Phrase C"],
    active: true,
    reuseDomains: ["ff92fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "ClusterDescription D",
    language: "en",
  },
  {
    uuid: "918659b7-5f54-4702-a8f2-5e1d2d3984c0",
    preferredPhrase: "new pref phrase",
    deprecatedPhrases: [],
    active: true,
    reuseDomains: ["c692fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "",
    language: "de",
  },
  {
    uuid: "8400c947-940a-4528-a86b-ddab94f75208",
    preferredPhrase: "izuhiouguig",
    deprecatedPhrases: [],
    active: true,
    reuseDomains: ["c692fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "",
    language: "de",
  },
  {
    uuid: "af4632f1-4065-48c6-a3b6-aa6433b6de86",
    preferredPhrase: "preferred phrase number three",
    deprecatedPhrases: [],
    active: true,
    reuseDomains: ["c692fe37-c0d5-4178-94bb-9243808d46c6"],
    description: "",
    language: "de",
  },
];
