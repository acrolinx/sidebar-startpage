import {
  $, $byId, getDefaultServerAddress, hide, isHttpsRequired, isHttpUrl, setDisplayed, setInnerText, setTooltip, show,
  startsWithAnyOf
} from "./utils/utils";
import {
  LoadSidebarError, loadSidebarIntoIFrame,
  LoadSidebarProps
} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxies/proxy-acrolinx-plugin";
import {EXTENSION_URL_PREFIXES, FORCE_MESSAGE_ADAPTER, SERVER_SELECTOR_VERSION} from "./constants";
import {createSidebarMessageProxy} from "./acrolinx-sidebar-integration/message-adapter/message-adapter";
import {ProxyAcrolinxSidebar} from "./proxies/proxy-acrolinx-sidebar";
import {
  AcrolinxPlugin,
  InitParameters
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {getTranslation, setLanguage} from "./localization";
import {sanitizeAndValidateServerAddress} from "./utils/validation";

import {render} from 'preact';
import {aboutComponent} from "./about";
import {extendClientComponents, hackInitParameters} from "./init-parameters";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const ID_SERVER_ADDRESS_TITLE = 'serverAddressTitle';
const HTTP_REQUIRED_ICON = 'httpsRequiredIcon';
const ID_SERVER_ADDRESS_TITLE_TEXT = 'serverAddressTitleText';
const ID_CONNECT_BUTTON = 'connectButton';
const ABOUT_PAGE_ID = 'aboutPage';
const ABOUT_LINK_ID = 'aboutLink';


const TEMPLATE = `
  
  <form id="serverSelectorForm" style="display: none">
    <div class="loginHeader" title="www.acrolinx.com"></div>
    <div class="formContent">
      <h1 id="${ID_SERVER_ADDRESS_TITLE}"><span id="${ID_SERVER_ADDRESS_TITLE_TEXT}">Server Addresss</span><span id="${HTTP_REQUIRED_ICON}"></span></h1>
      <input type="text" id="serverAddress" placeholder="Acrolinx Server Address" autofocus>
      <div class="buttonGroup">
        <button id="${ID_CONNECT_BUTTON}" type="submit" class="submitButton" value="CONNECT">CONNECT</button>
      </div>
      <a id="${ABOUT_LINK_ID}" href="#">About Acrolinx</a>
    </div>
  </form>
  
  <div id="${ABOUT_PAGE_ID}" style="display: none"></div>
  
  <div id="errorMessage" style="display: none"></div>
  
  <div id="sidebarContainer"></div>
`;


const NEEDS_MESSAGE_ADAPTER = EXTENSION_URL_PREFIXES;


function isMessageAdapterNeeded() {
  return FORCE_MESSAGE_ADAPTER || startsWithAnyOf(window.location.href, NEEDS_MESSAGE_ADAPTER);
}

function main() {
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
  const errorMessageEl = $('#errorMessage')!;

  const loginHeaderEl = $('.loginHeader')!;
  loginHeaderEl.addEventListener('click', onClickHeaderEl);

  const form = $('#serverSelectorForm')!;
  form.addEventListener('submit', onSubmit);

  const connectButton = $byId(ID_CONNECT_BUTTON) as HTMLButtonElement;

  const aboutLink = $byId(ABOUT_LINK_ID)!;
  aboutLink.addEventListener('click', onAboutLink);
  const aboutPage = $byId(ABOUT_PAGE_ID)!;

  let sidebarIFrameElement: HTMLIFrameElement | undefined;

  const serverAddressField = $('#serverAddress')! as HTMLInputElement;
  const oldServerAddress = localStorage.getItem(SERVER_ADDRESS_KEY);
  let serverAddress: string;
  if (oldServerAddress) {
    serverAddressField.value = oldServerAddress;
    serverAddress = oldServerAddress;
  }
  serverAddressField.focus();

  waitForAcrolinxPlugin(acrolinxPluginArg => {
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

  function onClickHeaderEl(event: Event) {
    event.preventDefault();
    acrolinxPlugin.openWindow({url: 'https://www.acrolinx.com/'});
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    const newServerAddressResult = sanitizeAndValidateServerAddress(serverAddressField.value, {
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
        showErrorMessage(errorMessage);
      }
    });
  }

  function tryToLoadSidebar(serverAddress: string) {
    console.log('tryToLoadSidebar', serverAddress);

    sidebarContainer.innerHTML = '';
    sidebarIFrameElement = document.createElement('iframe') as HTMLIFrameElement;
    sidebarContainer.appendChild(sidebarIFrameElement);

    const sidebarUrl = serverAddress + '/sidebar/v14/';
    const loadSidebarProps: LoadSidebarProps = {sidebarUrl, useMessageAdapter};

    connectButton.disabled = true;

    loadSidebarIntoIFrame(loadSidebarProps, sidebarIFrameElement, (error) => {
      if (error) {
        connectButton.disabled = false;
        onSidebarLoadError(serverAddress, error);
        return;
      }

      removeErrorMessage();
      if (initParametersFromPlugin.showServerSelector) {
        localStorage.setItem(SERVER_ADDRESS_KEY, serverAddress);
      }
      showSidebarIFrame();

      if (useMessageAdapter) {
        return;
      }

      const contentWindowAny = sidebarIFrameElement!.contentWindow as any;
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

  function getSidebarLoadErrorMessage(serverAddress: string, error: LoadSidebarError) {
    const errorMessages = getTranslation().serverSelector.message;
    switch (error.acrolinxErrorCode) {
      case 'httpErrorStatus':
      case 'noSidebar':
        return errorMessages.serverIsNoAcrolinxServerOrHasNoSidebar;
      case 'noCloudSidebar':
        return errorMessages.noCloudSidebar;
      case 'timeout':
        return isHttpUrl(serverAddress) ? errorMessages.serverConnectionProblemTimeoutHttp : errorMessages.serverConnectionProblemTimeoutHttps;
      default:
        return isHttpUrl(serverAddress) ? errorMessages.serverConnectionProblemHttp : errorMessages.serverConnectionProblemHttps;
    }
  }

  function onSidebarLoadError(serverAddress: string, error: LoadSidebarError) {
    showErrorMessage(getSidebarLoadErrorMessage(serverAddress, error));
    if (initParametersFromPlugin.showServerSelector) {
      showServerSelector();
    }
  }

  function showSidebarIFrame() {
    hide(form);
    show(sidebarContainer);
  }

  function showServerSelector() {
    sidebarContainer.innerHTML = '';
    hide(sidebarContainer);
    show(form);
    connectButton.disabled = false;
    serverAddressField.focus();
  }

  function showErrorMessage(message: string) {
    errorMessageEl.textContent = message;
    show(errorMessageEl);
  }

  function removeErrorMessage() {
    hide(errorMessageEl);
    errorMessageEl.textContent = '';
  }

  function onInitFromPlugin(initParameters: InitParameters) {
    initParametersFromPlugin = initParameters;
    setLanguage(initParameters.clientLocale);
    setupUiAccordingToInitParameters(initParameters);

    if (initParameters.showServerSelector) {
      if (oldServerAddress) {
        tryToLoadSidebar(oldServerAddress);
      } else {
        if (initParameters.serverAddress) {
          serverAddressField.value = initParameters.serverAddress;
        }
        show(form);
        // onAboutLink();
      }
    } else {
      console.log('Load directly!');
      serverAddress = initParameters.serverAddress || getDefaultServerAddress(window.location);
      tryToLoadSidebar(serverAddress);
    }

  }

  function setupUiAccordingToInitParameters(initParameters: InitParameters) {
    const t = getTranslation().serverSelector;
    loginHeaderEl.title = t.tooltip.headerLogo;

    setInnerText(ID_SERVER_ADDRESS_TITLE_TEXT, t.title.serverAddress);
    const httpsRequired = isHttpsRequired({enforceHTTPS: initParameters.enforceHTTPS, windowLocation: window.location});
    setTooltip(ID_SERVER_ADDRESS_TITLE, httpsRequired ? t.tooltip.httpsRequired : '');
    setDisplayed(document.getElementById(HTTP_REQUIRED_ICON)!, httpsRequired, 'inline-block');

    serverAddressField.placeholder = t.placeHolder.serverAddress;
    setInnerText(ID_CONNECT_BUTTON, t.button.connect);
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
        acrolinxPluginAny[command].apply(acrolinxPluginAny, args);
    }
  }

  function onRequestInit() {
    sidebarProxy.acrolinxSidebar.init(hackInitParameters(initParametersFromPlugin, serverAddress));
  }

  function onAboutLink() {
    hide(form);
    show(aboutPage);
    render(aboutComponent({
      onBack () {
        hide(aboutPage);
        showServerSelector();
      },
      logFileLocation: initParametersFromPlugin.logFileLocation,
      openLogFile,
      clientComponents: extendClientComponents(initParametersFromPlugin.clientComponents)
    }), aboutPage, aboutPage.firstChild as Element);
  }

}


setTimeout(main, 500);
