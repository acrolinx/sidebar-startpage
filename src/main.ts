import {
  $,
  getDefaultServerAddress,
  hide,
  sanitizeServerAddress,
  show,
  startsWith,
  startsWithAnyOf,
  validateServerAddress
} from "./utils";
import {loadSidebarIntoIFrame, LoadSidebarProps} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxy-acrolinx-plugin";
import {FORCE_MESSAGE_ADAPTER, SERVER_SELECTOR_VERSION} from "./constants";
import {createSidebarMessageProxy} from "./acrolinx-sidebar-integration/message-adapter/message-adapter";
import {ProxyAcrolinxSidebar} from "./proxy-acrolinx-sidebar";
import {
  AcrolinxPlugin,
  InitParameters,
  SoftwareComponentCategory
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {isCorsWithCredentialsNeeded} from "./acrolinx-sidebar-integration/utils/utils";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const TEMPLATE = `
  
  <form id="serverSelectorForm" style="display: none">
      
    <div class="loginHeader" title="www.acrolinx.com"></div>
    <div class="formContent">
      <h1>Server Address</h1>
      <input type="text" id="serverAddress" placeholder="Acrolinx Server Address" autofocus>
      <div class="buttonGroup">
        <input type="submit" class="submitButton" value="CONNECT">
      </div>
    </div>
  </form>
  
  <div id="errorMessage" style="display: none"></div>
  
  <div id="sidebarContainer"></div>
`;


const EXTENSION_URL_PREFIXES = ['chrome-extension://', 'moz-extension://', 'resource://', 'ms-browser-extension://', 'safari-extension://'];
const NEEDS_MESSAGE_ADAPTER = EXTENSION_URL_PREFIXES;
const URL_PREFIXES_REQUIRING_HTTPS = [...EXTENSION_URL_PREFIXES, 'https://'];


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
  loginHeaderEl.addEventListener('click', onClickHeaderEl)

  const form = $('#serverSelectorForm')!;
  form.addEventListener('submit', onSubmit);

  let sidebarIFrameElement: HTMLIFrameElement;

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

  function onClickHeaderEl(event: Event) {
    event.preventDefault();
    acrolinxPlugin.openWindow({url: 'https://www.acrolinx.com/'});
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    let newServerAddress = serverAddressField.value.trim();

    if (startsWith(newServerAddress, 'http:') && isHttpsRequired()) {
      showErrorMessage("The server isn't secure. You must connect to a secure server. A secure server address starts with \"https\" .");
      return;
    }
    newServerAddress = sanitizeServerAddress(newServerAddress, window.location.protocol);
    if (!validateServerAddress(newServerAddress)) {
      showErrorMessage("This doesn't look like a URL. Check the address for any mistakes and try again.");
      return;
    }

    serverAddress = newServerAddress;

    console.log(serverAddress);

    tryToLoadSidebar(serverAddress);
  }

  function tryToLoadSidebar(serverAddress: string) {
    console.log('tryToLoadSidebar', serverAddress);

    sidebarContainer.innerHTML = '';
    sidebarIFrameElement = document.createElement('iframe') as HTMLIFrameElement;
    sidebarContainer.appendChild(sidebarIFrameElement);

    const sidebarUrl = serverAddress + '/sidebar/v14/';
    const loadSidebarProps: LoadSidebarProps = {sidebarUrl, useMessageAdapter};

    loadSidebarIntoIFrame(loadSidebarProps, sidebarIFrameElement, (error) => {
      if (error) {
        onSidebarLoadError();
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

      const contentWindowAny = sidebarIFrameElement.contentWindow as any;
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

  function onSidebarLoadError() {
    showErrorMessage("We couldn't establish a connection to your server. \n\nEither your server isn't set up to accept secure connections or it's not running at all.\n\nIf you're using Acrolinx in a web application, your server might not be set up for cross-origin resource sharing (CORS). \n\nIf you're sure you entered the correct address, ask your server administrator to check your server availability.");
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
    if (initParameters.showServerSelector) {
      if (oldServerAddress) {
        tryToLoadSidebar(oldServerAddress);
      } else {
        if (initParameters.serverAddress) {
          serverAddressField.value = initParameters.serverAddress;
        }
        show(form);
      }
    } else {
      console.log('Load directly!');
      serverAddress = initParameters.serverAddress || getDefaultServerAddress();
      tryToLoadSidebar(serverAddress);
    }

  }


  function onMessageFromSidebar(messageEvent: MessageEvent) {
    if (messageEvent.source !== sidebarIFrameElement.contentWindow) {
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

}

function isHttpsRequired(windowUrl = window.location.href) {
  return startsWithAnyOf(windowUrl, URL_PREFIXES_REQUIRING_HTTPS);
}

function hackInitParameters(initParameters: InitParameters, serverAddress: string): InitParameters {
  return {
    ...initParameters,
    serverAddress: serverAddress,
    showServerSelector: false,
    corsWithCredentials: initParameters.corsWithCredentials || isCorsWithCredentialsNeeded(serverAddress),
    supported: {...initParameters.supported, showServerSelector: initParameters.showServerSelector},
    clientComponents: (initParameters.clientComponents || []).concat({
      id: 'com.acrolinx.serverselector',
      name: 'Server Selector',
      version: SERVER_SELECTOR_VERSION,
      category: SoftwareComponentCategory.DETAIL
    })
  };
}


setTimeout(main, 500);

