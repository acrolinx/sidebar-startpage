import {
  AcrolinxSidebar,
  InitParameters,
  CheckOptions,
  Check,
  InvalidDocumentPart,
  CheckedDocumentRange, SidebarConfiguration
} from "../acrolinx-libs/plugin-interfaces";

// Functions are not cloneable and don't work with postMessage.
function removeFunctions(object: any) {
  return JSON.parse(JSON.stringify(object));
}


function postCommandAsMessage(window: Window, command: string, ...args: any[]) {
  window.postMessage({
    command,
    args: removeFunctions(args)
  }, '*');
}

type WindowProvider = () => Window;

function injectPostCommandAsMessage(windowProvider: WindowProvider, object: any) {
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
export function createSidebarMessageProxy(sidebarWindow: Window) : AcrolinxSidebar {
  const sidebar: AcrolinxSidebar = {
    init (_initParameters: InitParameters): void {
    },
    configure (_initParameters: SidebarConfiguration): void {
    },
    checkGlobal(_documentContent: string, _options: CheckOptions): Check {
      return {checkId: 'dummyCheckId'};
    },
    onGlobalCheckRejected(): void {
    },

    invalidateRanges(_invalidCheckedDocumentRanges: InvalidDocumentPart[]) {
    },

    onVisibleRangesChanged(_checkedDocumentRanges: CheckedDocumentRange[]) {
    }
  };

  injectPostCommandAsMessage(() => sidebarWindow, sidebar);

  return sidebar;
}

