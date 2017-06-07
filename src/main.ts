import {
  $,
  getDefaultServerAddress,
  hide,
  sanitizeServerAddress, setInnerText,
  show,
  startsWith,
  startsWithAnyOf,
  validateServerAddress
} from "./utils/utils";
import {loadSidebarIntoIFrame, LoadSidebarProps} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxies/proxy-acrolinx-plugin";
import {FORCE_MESSAGE_ADAPTER, SERVER_SELECTOR_VERSION} from "./constants";
import {createSidebarMessageProxy} from "./acrolinx-sidebar-integration/message-adapter/message-adapter";
import {ProxyAcrolinxSidebar} from "./proxies/proxy-acrolinx-sidebar";
import {
  AcrolinxPlugin,
  InitParameters,
  SoftwareComponentCategory
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {isCorsWithCredentialsNeeded} from "./acrolinx-sidebar-integration/utils/utils";
import {setLanguage, getTranslation} from "./localization";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const ID_SERVER_ADDRESS_TITLE = 'serverAddressTitle';
const ID_CONNECT_BUTTON = 'connectButton';
const ID_LOG_FILE_TITLE = 'logFileTitle';


const TEMPLATE = `
  
  <form id="serverSelectorForm" style="display: none">
      
    <div class="loginHeader" title="www.acrolinx.com"></div>
    <div class="formContent">
      <h1 id="${ID_SERVER_ADDRESS_TITLE}">Server Address</h1>
      <input type="text" id="serverAddress" placeholder="Acrolinx Server Address" autofocus>
      <div class="buttonGroup">
        <button id="${ID_CONNECT_BUTTON}" type="submit" class="submitButton" value="CONNECT">CONNECT</button>
      </div>
      <div class="logFileContent" style="display: none">
        <h1 id="${ID_LOG_FILE_TITLE}">Log File</h1>
        <p type="text" readonly style="word-break: break-all" id="logfileLocationValue"/>
        <div class="buttonGroup">
          <button class="submitButton" id="openLogFileButton">Open Logfile</button>
        </div>
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
  loginHeaderEl.addEventListener('click', onClickHeaderEl);

  const form = $('#serverSelectorForm')!;
  form.addEventListener('submit', onSubmit);

  const openLogFileButton = $('#openLogFileButton')!;
  openLogFileButton.addEventListener('click', openLogFile);

  const logFileLocationValue = $('#logfileLocationValue')!;
  logFileLocationValue.addEventListener('click', selectLogFileLocationValue);

  const logFileElement = $('.logFileContent')!;


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

  function openLogFile(event: Event) {
    event.preventDefault();
    console.log("clicked openLogFile");
    if (acrolinxPlugin.openLogFile) {
      acrolinxPlugin.openLogFile();
    }
    else console.log("No log file defined!");
  }

  function selectLogFileLocationValue(event: Event) {
    event.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(logFileLocationValue);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function onClickHeaderEl(event: Event) {
    event.preventDefault();
    acrolinxPlugin.openWindow({url: 'https://www.acrolinx.com/'});
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    let newServerAddress = serverAddressField.value.trim();

    if (startsWith(newServerAddress, 'http:') && isHttpsRequired()) {
      showErrorMessage(getTranslation().serverSelector.message.serverIsNotSecure);
      return;
    }
    newServerAddress = sanitizeServerAddress(newServerAddress, window.location.protocol);
    if (!validateServerAddress(newServerAddress)) {
      showErrorMessage(getTranslation().serverSelector.message.invalidServerAddress);
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

  function onSidebarLoadError() {
    showErrorMessage(getTranslation().serverSelector.message.serverConnectionProblem);
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
    if (initParametersFromPlugin.logFileLocation) {
      showLogfileOpenener(initParametersFromPlugin.logFileLocation);
    }
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

  function showLogfileOpenener(logFileLocation: string) {
    logFileLocationValue.innerText = logFileLocation;
    show(logFileElement);
  }


  function onInitFromPlugin(initParameters: InitParameters) {
    initParametersFromPlugin = initParameters;
    setLanguage(initParameters.clientLocale);
    localizeUI();
    if (initParameters.showServerSelector) {
      if (oldServerAddress) {
        tryToLoadSidebar(oldServerAddress);
      } else {
        if (initParameters.serverAddress) {
          serverAddressField.value = initParameters.serverAddress;
        }
        show(form);
        if (initParametersFromPlugin.logFileLocation) {
          showLogfileOpenener(initParametersFromPlugin.logFileLocation);
        }
      }
    } else {
      console.log('Load directly!');
      serverAddress = initParameters.serverAddress || getDefaultServerAddress();
      tryToLoadSidebar(serverAddress);
    }

  }

  function localizeUI() {
    const t = getTranslation().serverSelector;
    loginHeaderEl.title = t.tooltip.headerLogo;
    setInnerText(ID_SERVER_ADDRESS_TITLE, t.title.serverAddress);
    serverAddressField.placeholder = t.placeHolder.serverAddress;
    setInnerText(ID_CONNECT_BUTTON, t.button.connect);
    setInnerText(ID_LOG_FILE_TITLE, t.title.logFile);
    openLogFileButton.innerText = t.button.openLogFile;
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

