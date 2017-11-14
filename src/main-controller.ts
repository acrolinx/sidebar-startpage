import {
  $,
  $byId,
  cleanIFrameContainerIfNeeded,
  getDefaultServerAddress,
  isHttpUrl,
  parseVersionNumberWithFallback,
  setDisplayed,
  startsWithAnyOf, TimeoutWatcher,
} from "./utils/utils";
import {
  LoadSidebarError,
  loadSidebarIntoIFrame,
  LoadSidebarProps
} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxies/proxy-acrolinx-plugin";
import {
  EXTENSION_URL_PREFIXES, FORCE_MESSAGE_ADAPTER, REQUEST_INIT_TIMEOUT_MS,
  SERVER_SELECTOR_VERSION
} from "./constants";
import {createSidebarMessageProxy} from "./acrolinx-sidebar-integration/message-adapter/message-adapter";
import {ProxyAcrolinxSidebar} from "./proxies/proxy-acrolinx-sidebar";
import {AcrolinxPlugin, InitParameters} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {getTranslation, setLanguage} from "./localization";
import {sanitizeAndValidateServerAddress} from "./utils/validation";

import {render} from 'preact';
import {aboutComponent} from "./components/about";
import {extendClientComponents, hackInitParameters} from "./init-parameters";
import {focusAddressInputField, severSelectorFormComponent} from "./components/server-selector-form";
import {errorMessageComponent, ErrorMessageProps} from "./components/error-message";
import {
  getAcrolinxSimpleStorage,
  initAcrolinxStorage,
  injectAcrolinxStorageIntoSidebarIfAvailable
} from "./utils/acrolinx-storage";
import {initDebug} from "./utils/debug";
import * as logging from "./utils/logging";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

enum PageId {
  ABOUT = 'aboutPage',
  SERVER_SELECTOR = 'serverSelectorFormPage',
  ERROR_MESSAGE = 'errorMessagePage',
  LOADING_SIDEBAR_MESSAGE = 'loadingSidebarMessagePage',
  SIDEBAR_CONTAINER = 'sidebarContainer',
}

const TEMPLATE = `
  <div id="${PageId.SERVER_SELECTOR}" style="display: none"></div>
  <div id="${PageId.ABOUT}" style="display: none"></div>
  <div id="${PageId.ERROR_MESSAGE}" style="display: none"></div>
  <div id="${PageId.LOADING_SIDEBAR_MESSAGE}">
    <div class="loader loaderJsLoaded"><span class="fallbackLoadingMessage">Loading ...</span></div>
  </div>
  <div id="${PageId.SIDEBAR_CONTAINER}" style="display: none"></div>
`;

const NEEDS_MESSAGE_ADAPTER = EXTENSION_URL_PREFIXES;

function isMessageAdapterNeeded() {
  return FORCE_MESSAGE_ADAPTER || startsWithAnyOf(window.location.href, NEEDS_MESSAGE_ADAPTER);
}

enum SidebarState {
  BEFORE_REQUEST_INIT, AFTER_REQUEST_INIT
}

export interface MainControllerOpts {
  requestInitTimeOutMs?: number;
}

export function startMainController(opts: MainControllerOpts = {}) {
  logging.log('Loading acrolinx sidebar startpage ' + SERVER_SELECTOR_VERSION);
  initDebug();

  const windowAny = window as any;
  const sidebarProxy = new ProxyAcrolinxSidebar(onInitFromPlugin);
  let acrolinxPlugin: AcrolinxPlugin;
  let initParametersFromPlugin: InitParameters;
  windowAny.acrolinxSidebar = sidebarProxy;

  const useMessageAdapter = isMessageAdapterNeeded();
  const appElement = $('#app')!;
  appElement.innerHTML = TEMPLATE;

  const sidebarContainer = $byId(PageId.SIDEBAR_CONTAINER)!;
  const errorMessageEl = $byId(PageId.ERROR_MESSAGE)!;

  const aboutPage = $byId(PageId.ABOUT)!;

  const serverSelectorFormPage = $byId(PageId.SERVER_SELECTOR)!;

  let sidebarIFrameElement: HTMLIFrameElement | undefined;

  let serverAddress: string | null;

  let selectedPage: PageId;

  const requestInitTimeoutWatcher = new TimeoutWatcher(onRequestInitTimeout, opts.requestInitTimeOutMs || REQUEST_INIT_TIMEOUT_MS);
  let sidebarState = SidebarState.BEFORE_REQUEST_INIT;

  showPage(PageId.LOADING_SIDEBAR_MESSAGE);

  waitForAcrolinxPlugin(acrolinxPluginArg => {
    initAcrolinxStorage();
    serverAddress = getAcrolinxSimpleStorage().getItem(SERVER_ADDRESS_KEY);
    acrolinxPlugin = acrolinxPluginArg;
    acrolinxPlugin.requestInit();

    if (useMessageAdapter) {
      logging.log('useMessageAdapter');
      addEventListener('message', onMessageFromSidebar, false);
    }
  });

  function openLogFile() {
    logging.log("clicked openLogFile");
    if (acrolinxPlugin.openLogFile) {
      acrolinxPlugin.openLogFile();
    } else {
      logging.error("acrolinxPlugin.openLogFile is not defined!");
    }
  }

  function openExternalWindow(url: string) {
    acrolinxPlugin.openWindow({url});
  }

  function onSubmit(serverAddressInput: string) {
    logging.log(`User tries to connect with server "${serverAddressInput}"`);
    const newServerAddressResult = sanitizeAndValidateServerAddress(serverAddressInput, {
      enforceHTTPS: initParametersFromPlugin.enforceHTTPS,
      windowLocation: window.location
    });

    newServerAddressResult.match({
      ok: newServerAddress => {
        serverAddress = newServerAddress;
        tryToLoadSidebar(serverAddress);
      },
      err: errorMessage => {
        showServerSelector({errorMessage: simpleErrorMessage(errorMessage)});
      }
    });
  }

  function tryToLoadSidebar(serverAddress: string) {
    logging.log(`Try to load sidebar from "${serverAddress}"`);

    sidebarContainer.innerHTML = '';
    sidebarIFrameElement = document.createElement('iframe') as HTMLIFrameElement;
    sidebarContainer.appendChild(sidebarIFrameElement);

    const sidebarUrl = serverAddress + '/sidebar/v14/';

    const loadSidebarProps: LoadSidebarProps = {
      sidebarUrl, useMessageAdapter,
      minimumSidebarVersion: parseVersionNumberWithFallback(initParametersFromPlugin.minimumSidebarVersion)
    };

    if (selectedPage === PageId.SERVER_SELECTOR) {
      renderServerSelectorForm({isConnectButtonDisabled: true});
    } else {
      addSidebarLoadingStyles();
      showPage(PageId.LOADING_SIDEBAR_MESSAGE);
    }

    loadSidebarIntoIFrame(loadSidebarProps, sidebarIFrameElement, (error) => {
      if (error) {
        renderServerSelectorForm({isConnectButtonDisabled: false});
        onSidebarLoadError(serverAddress, error);
        return;
      }

      if (initParametersFromPlugin.showServerSelector) {
        getAcrolinxSimpleStorage().setItem(SERVER_ADDRESS_KEY, serverAddress);
      }

      showPage(PageId.SIDEBAR_CONTAINER);
      requestInitTimeoutWatcher.start();

      if (useMessageAdapter) {
        return;
      }

      const contentWindowAny = sidebarIFrameElement!.contentWindow as any;

      injectAcrolinxStorageIntoSidebarIfAvailable(window as any, contentWindowAny);

      contentWindowAny.acrolinxPlugin = new ProxyAcrolinxPlugin({
        requestInitListener: () => {
          sidebarProxy.acrolinxSidebar = contentWindowAny.acrolinxSidebar;
          onRequestInit();
        },
        acrolinxPlugin,
        serverAddress,
        showServerSelector
      });
    });

  }

  function addSidebarLoadingStyles() {
    const loader = appElement.querySelector('.loader');
    if (loader) {
      loader.classList.add('loadSidebarHtml');
    }
  }

  function simpleErrorMessage(messageHtml: string): ErrorMessageProps {
    return {messageHtml: {html: messageHtml}};
  }

  function getSidebarLoadErrorMessage(serverAddress: string, error: LoadSidebarError): ErrorMessageProps {
    const errorMessages = getTranslation().serverSelector.message;
    switch (error.acrolinxErrorCode) {
      case 'httpErrorStatus':
      case 'noSidebar':
        return simpleErrorMessage(errorMessages.serverIsNoAcrolinxServerOrHasNoSidebar);
      case 'noCloudSidebar':
        return simpleErrorMessage(errorMessages.noCloudSidebar);
      case 'sidebarVersionIsBelowMinimum':
        return simpleErrorMessage(errorMessages.outdatedServer);
      default:
        return simpleErrorMessage(isHttpUrl(serverAddress) ? errorMessages.serverConnectionProblemHttp : errorMessages.serverConnectionProblemHttps);
    }
  }

  function onSidebarLoadError(serverAddress: string, error: LoadSidebarError) {
    showSidebarLoadError(getSidebarLoadErrorMessage(serverAddress, error));
  }

  function showSidebarLoadError(errorMessage: ErrorMessageProps) {
    if (initParametersFromPlugin.showServerSelector) {
      showServerSelector({errorMessage: errorMessage});
    } else {
      showErrorMessagePage(errorMessage);
    }
  }

  function showPage(page: PageId) {
    const divs = appElement.childNodes;
    for (let i = 0; i < divs.length; ++i) {
      const div = divs[i] as HTMLElement;
      setDisplayed(div, page == div.id);
    }
    selectedPage = page;
  }


  function showServerSelector(props: { isConnectButtonDisabled?: boolean, errorMessage?: ErrorMessageProps } = {}) {
    sidebarState = SidebarState.BEFORE_REQUEST_INIT;
    cleanIFrameContainerIfNeeded(sidebarContainer, () => {
      showPage(PageId.SERVER_SELECTOR);
      focusAddressInputField(serverSelectorFormPage);
      renderServerSelectorForm(props);
    });
  }

  function renderServerSelectorForm(props: { isConnectButtonDisabled?: boolean, errorMessage?: ErrorMessageProps } = {}) {
    render(severSelectorFormComponent({
      onSubmit: onSubmit,
      onAboutLink,
      serverAddress,
      enforceHTTPS: initParametersFromPlugin.enforceHTTPS,
      isConnectButtonDisabled: props.isConnectButtonDisabled!!,
      openWindow: openExternalWindow,
      errorMessage: props.errorMessage,
      initParameters: initParametersFromPlugin
    }), serverSelectorFormPage, serverSelectorFormPage.firstChild as Element);
  }

  function showErrorMessagePage(errorMessageProps: ErrorMessageProps) {
    showPage(PageId.ERROR_MESSAGE);
    render(errorMessageComponent(errorMessageProps), errorMessageEl, errorMessageEl.firstChild as Element);
  }

  function onInitFromPlugin(initParameters: InitParameters) {
    initParametersFromPlugin = initParameters;
    setLanguage(initParameters.clientLocale);

    if (initParameters.showServerSelector) {
      if (serverAddress) {
        tryToLoadSidebar(serverAddress);
      } else {
        if (initParameters.serverAddress) {
          serverAddress = initParameters.serverAddress;
        }
        showServerSelector();
      }
    } else {
      logging.log('Load directly!');
      serverAddress = initParameters.serverAddress || getDefaultServerAddress(window.location);
      tryToLoadSidebar(serverAddress);
    }

  }

  function onMessageFromSidebar(messageEvent: MessageEvent) {
    if (!sidebarIFrameElement || messageEvent.source !== sidebarIFrameElement.contentWindow) {
      return;
    }

    const {command, args} = messageEvent.data;
    logging.log('onMessageFromSidebar', messageEvent, command, args);
    switch (command) {
      case 'requestInit':
        sidebarProxy.acrolinxSidebar = createSidebarMessageProxy(sidebarIFrameElement.contentWindow);
        onRequestInit();
        break;
      case 'showServerSelector':
        showServerSelector();
        break;
      default:
        const acrolinxPluginAny = windowAny.acrolinxPlugin;
        const commandFunction = acrolinxPluginAny[command];
        if (commandFunction) {
          commandFunction.apply(acrolinxPluginAny, args);
        } else {
          logging.error(`Plugin does not support command "${command}"`, args);
        }
    }
  }

  function onRequestInit() {
    logging.log(`Sidebar is loaded completely and has requested init ("${serverAddress}")`);
    sidebarState = SidebarState.AFTER_REQUEST_INIT;
    requestInitTimeoutWatcher.stop();
    sidebarProxy.acrolinxSidebar.init(hackInitParameters(initParametersFromPlugin, serverAddress!));
  }

  function onRequestInitTimeout() {
    if (sidebarState === SidebarState.BEFORE_REQUEST_INIT) {
      logging.error(`Sidebar took too long to load from "${serverAddress}"`);
      showSidebarLoadError({messageHtml: {html: getTranslation().serverSelector.message.loadSidebarTimeout}});
    }
  }

  function onAboutLink() {
    showPage(PageId.ABOUT);
    render(aboutComponent({
      onBack() {
        showServerSelector();
      },
      logFileLocation: initParametersFromPlugin.logFileLocation,
      openLogFile,
      clientComponents: extendClientComponents(initParametersFromPlugin.clientComponents),
      openWindow: openExternalWindow,
      initParameters: initParametersFromPlugin
    }), aboutPage, aboutPage.firstChild as Element);
  }

}
