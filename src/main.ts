import {$, show, hide} from "./utils";
import {loadSidebarIntoIFrame, LoadSidebarProps} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxy-acrolinx-plugin";
import {FORCE_MESSAGE_ADAPTER} from "./constants";
import {createSidebarMessageProxy} from "./acrolinx-sidebar-integration/message-adapter/message-adapter";
import {ProxyAcrolinxSidebar} from "./proxy-acrolinx-sidebar";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const TEMPLATE = `
  
  <form id="serverSelectorForm" style="display: none">
      
    <div class="loginHeader"></div>
    <div class="formContent">
      <h1>Server Address</h1>
      <input type="text" id="serverAddress" placeholder="Acrolinx Server Address">
      <div class="buttonGroup">
        <input type="submit" class="submitButton" value="CONNECT">
      </div>
      <div id="errorMessage" style="display: none"></div>
    </div>
  </form>
  
  <div id="sidebarContainer"></div>
`;


const NEEDS_MESSAGE_ADAPTER = ['chrome-extension://', 'moz-extension://', 'resource://'];

function isMessageAdapterNeeded() {
  return FORCE_MESSAGE_ADAPTER || NEEDS_MESSAGE_ADAPTER.some(prefix => window.location.href.indexOf(prefix) === 0);
}

function main() {
  const useMessageAdapter = isMessageAdapterNeeded();
  const appElement = $('#app')!;
  appElement.innerHTML = TEMPLATE;

  const sidebarContainer = $('#sidebarContainer')!;
  const errorMessageEl = $('#errorMessage')!;

  const form = $('#serverSelectorForm')!;
  form.addEventListener('submit', onSubmit);

  let sidebarIFrameElement: HTMLIFrameElement;

  const serverAddressField = $('#serverAddress')! as HTMLInputElement;
  const oldServerAddress = localStorage.getItem(SERVER_ADDRESS_KEY);
  let serverAddress: string ;
  if (oldServerAddress) {
    serverAddressField.value = oldServerAddress;
    serverAddress = oldServerAddress;
  }
  serverAddressField.focus();

  if (useMessageAdapter) {
    console.log('useMessageAdapter');
    addEventListener('message', onMessageFromSidebar, false);
  }

  if (oldServerAddress) {
    tryToLoadSidebar(oldServerAddress);
  } else {
    show(form);
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    serverAddress = serverAddressField.value;
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

      localStorage.setItem(SERVER_ADDRESS_KEY, serverAddress);
      showSidebarIFrame();

      if (useMessageAdapter) {
        return;
      }

      waitForAcrolinxPlugin(acrolinxPlugin => {
        const contentWindowAny = sidebarIFrameElement.contentWindow as any;
        contentWindowAny.acrolinxPlugin = new ProxyAcrolinxPlugin({
          window,
          sidebarWindow: sidebarIFrameElement.contentWindow,
          acrolinxPlugin,
          serverAddress,
          showServerSelector
        });
      });
    });

  }

  function onSidebarLoadError() {
    setErrorMessage("Can't load the provided URL.");
  }

  function showSidebarIFrame() {
    hide(form);
    show(sidebarContainer);
  }

  function showServerSelector() {
    sidebarContainer.innerHTML = '';
    hide(sidebarContainer);
    show(form);
  }

  function setErrorMessage(message: string) {
    errorMessageEl.textContent = message;
    errorMessageEl.style.display = 'block';
  }

  function onMessageFromSidebar(messageEvent: MessageEvent) {
    if (messageEvent.source !== sidebarIFrameElement.contentWindow) {
      return;
    }
    
    const windowAny = window as any;
    const {command, args} = messageEvent.data;
    console.log('onMessageFromSidebar', messageEvent, command, args);
    switch (command) {
      case 'requestInit':
        waitForAcrolinxPlugin(acrolinxPlugin => {
          const sidebar = new ProxyAcrolinxSidebar(createSidebarMessageProxy(sidebarIFrameElement.contentWindow), serverAddress);
          windowAny.acrolinxSidebar = sidebar;
          acrolinxPlugin.requestInit();
        });
        break;
      case 'showServerSelector':
        showServerSelector();
        break;
      default:
        const acrolinxPluginAny = windowAny.acrolinxPlugin;
        acrolinxPluginAny[command].apply(acrolinxPluginAny, args);
    }
  }
}

main();

