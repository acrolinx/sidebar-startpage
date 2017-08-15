import {
  $,
  $byId,
  getDefaultServerAddress,
  hide,
  isHttpUrl,
  parseVersionNumberWithFallback,
  show,
  startsWithAnyOf
} from "./utils/utils";
import {
  LoadSidebarError,
  loadSidebarIntoIFrame,
  LoadSidebarProps
} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxies/proxy-acrolinx-plugin";
import {EXTENSION_URL_PREFIXES, FORCE_MESSAGE_ADAPTER, SERVER_SELECTOR_VERSION} from "./constants";
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

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const ABOUT_PAGE_ID = 'aboutPage';
const SERVER_SELECTOR_FORM_PAGE_ID = 'serverSelectorFormPage';
const ERROR_MESSAGE_CONTAINER_ID = 'errorMessagePage';

const TEMPLATE = `
  <div id="${SERVER_SELECTOR_FORM_PAGE_ID}" style="display: none"></div>
  <div id="${ABOUT_PAGE_ID}" style="display: none"></div>
  <div id="${ERROR_MESSAGE_CONTAINER_ID}" style="display: none"></div>
  <div id="sidebarContainer"></div>
`;

const NEEDS_MESSAGE_ADAPTER = EXTENSION_URL_PREFIXES;

function isMessageAdapterNeeded() {
  return FORCE_MESSAGE_ADAPTER || startsWithAnyOf(window.location.href, NEEDS_MESSAGE_ADAPTER);
}

export function startMainController() {
  console.log('Loading acrolinx server selector ' + SERVER_SELECTOR_VERSION);

  const windowAny = window as any;
  const sidebarProxy = new ProxyAcrolinxSidebar(onInitFromPlugin);
  let acrolinxPlugin: AcrolinxPlugin;
  let initParametersFromPlugin: InitParameters;
  windowAny.acrolinxSidebar = sidebarProxy;

  const useMessageAdapter = isMessageAdapterNeeded();
  const appElement = $('#app')!;
  appElement.innerHTML = TEMPLATE;

  const sidebarContainer = $('#sidebarContainer')!;
  const errorMessageEl = $byId(ERROR_MESSAGE_CONTAINER_ID)!;

  const aboutPage = $byId(ABOUT_PAGE_ID)!;

  const serverSelectorFormPage = $byId(SERVER_SELECTOR_FORM_PAGE_ID)!;

  let sidebarIFrameElement: HTMLIFrameElement | undefined;

  let serverAddress: string | null;

  waitForAcrolinxPlugin(acrolinxPluginArg => {
    initAcrolinxStorage();
    serverAddress = getAcrolinxSimpleStorage().getItem(SERVER_ADDRESS_KEY);
    acrolinxPlugin = acrolinxPluginArg;
    acrolinxPlugin.requestInit();

    if (useMessageAdapter) {
      console.log('useMessageAdapter');
      addEventListener('message', onMessageFromSidebar, false);
    }
  });

  function openLogFile() {
    console.log("clicked openLogFile");
    if (acrolinxPlugin.openLogFile) {
      acrolinxPlugin.openLogFile();
    } else {
      console.error("acrolinxPlugin.openLogFile is not defined!");
    }
  }

  function openExternalWindow(url: string) {
    acrolinxPlugin.openWindow({url});
  }

  function onSubmit(serverAddressInput: string) {
    const newServerAddressResult = sanitizeAndValidateServerAddress(serverAddressInput, {
      enforceHTTPS: initParametersFromPlugin.enforceHTTPS,
      windowLocation: window.location
    });

    newServerAddressResult.match({
      ok: newServerAddress => {
        serverAddress = newServerAddress;
        console.log(serverAddress);
        tryToLoadSidebar(serverAddress);
      },
      err: errorMessage => {
        showServerSelector({errorMessage: simpleErrorMessage(errorMessage)});
      }
    });
  }

  function tryToLoadSidebar(serverAddress: string) {
    console.log('tryToLoadSidebar', serverAddress);

    sidebarContainer.innerHTML = '';
    sidebarIFrameElement = document.createElement('iframe') as HTMLIFrameElement;
    sidebarContainer.appendChild(sidebarIFrameElement);

    const sidebarUrl = serverAddress + '/sidebar/v14/';

    const loadSidebarProps: LoadSidebarProps = {
      sidebarUrl, useMessageAdapter,
      minimumSidebarVersion: parseVersionNumberWithFallback(initParametersFromPlugin.minimumSidebarVersion)
    };

    renderServerSelectorForm({isConnectButtonDisabled: true});

    loadSidebarIntoIFrame(loadSidebarProps, sidebarIFrameElement, (error) => {
      if (error) {
        renderServerSelectorForm({isConnectButtonDisabled: false});
        onSidebarLoadError(serverAddress, error);
        return;
      }

      if (initParametersFromPlugin.showServerSelector) {
        getAcrolinxSimpleStorage().setItem(SERVER_ADDRESS_KEY, serverAddress);
      }
      showSidebarIFrame();

      if (useMessageAdapter) {
        return;
      }

      const contentWindowAny = sidebarIFrameElement!.contentWindow as any;

      injectAcrolinxStorageIntoSidebarIfAvailable(window, contentWindowAny);

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
    const errorMessage = getSidebarLoadErrorMessage(serverAddress, error);
    if (initParametersFromPlugin.showServerSelector) {
      showServerSelector({errorMessage: errorMessage});
    } else {
      showErrorMessagePage(errorMessage);
    }
  }

  function showSidebarIFrame() {
    hide(serverSelectorFormPage);
    show(sidebarContainer);
  }

  function showServerSelector(props: { isConnectButtonDisabled?: boolean, errorMessage?: ErrorMessageProps } = {}) {
    sidebarContainer.innerHTML = '';
    hide(sidebarContainer);
    show(serverSelectorFormPage);
    focusAddressInputField(serverSelectorFormPage);
    renderServerSelectorForm(props);
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
    show(errorMessageEl);
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
      console.log('Load directly!');
      serverAddress = initParameters.serverAddress || getDefaultServerAddress(window.location);
      tryToLoadSidebar(serverAddress);
    }

  }

  function onMessageFromSidebar(messageEvent: MessageEvent) {
    if (!sidebarIFrameElement || messageEvent.source !== sidebarIFrameElement.contentWindow) {
      return;
    }

    const {command, args} = messageEvent.data;
    console.log('onMessageFromSidebar', messageEvent, command, args);
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
          console.error(`Plugin does not support command "${command}"`, args);
        }
    }
  }

  function onRequestInit() {
    sidebarProxy.acrolinxSidebar.init(hackInitParameters(initParametersFromPlugin, serverAddress!));
  }

  function onAboutLink() {
    hide(serverSelectorFormPage);
    show(aboutPage);
    render(aboutComponent({
      onBack() {
        hide(aboutPage);
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
