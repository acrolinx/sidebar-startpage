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

import {
  AcrolinxSidebar,
  InitParameters,
  CheckOptions,
  Check,
  InvalidDocumentPart,
  CheckedDocumentRange,
  SidebarConfiguration,
  Message,
  Cluster,
} from "@acrolinx/sidebar-interface";
import {
  ExtendedAcrolinxSidebar,
  SetStorageProps,
} from "../../sidebar-interface-extensions";

// Functions are not cloneable and don't work with postMessage.
function removeFunctions(object: any) {
  return JSON.parse(JSON.stringify(object));
}

function postCommandAsMessage(window: Window, command: string, ...args: any[]) {
  window.postMessage(
    {
      command,
      args: removeFunctions(args),
    },
    "*"
  );
}

type WindowProvider = () => Window;

function injectPostCommandAsMessage(
  windowProvider: WindowProvider,
  object: any
) {
  for (const key in object) {
    const originalMethod = object[key];
    object[key] = (...args: any[]) => {
      postCommandAsMessage(windowProvider(), key, ...args);
      return originalMethod.apply(object, args);
    };
  }
}

/**
 * Connects to a sidebar iframe that is on a different domain and uses the plugin message adapter.
 */
export function createSidebarMessageProxy(
  sidebarWindow: Window
): AcrolinxSidebar {
  const sidebar: ExtendedAcrolinxSidebar = {
    init(_initParameters: InitParameters): void {},
    configure(_initParameters: SidebarConfiguration): void {},
    checkGlobal(_documentContent: string, _options: CheckOptions): Check {
      return { checkId: "dummyCheckId" };
    },
    onGlobalCheckRejected(): void {},

    invalidateRanges(_invalidCheckedDocumentRanges: InvalidDocumentPart[]) {},

    onVisibleRangesChanged(_checkedDocumentRanges: CheckedDocumentRange[]) {},

    showMessage(_message: Message): void {},

    setStorage(_props: SetStorageProps): void {},

    callReuse(): Cluster[] {
      return [];
    },
  };

  injectPostCommandAsMessage(() => sidebarWindow, sidebar);

  return sidebar;
}
