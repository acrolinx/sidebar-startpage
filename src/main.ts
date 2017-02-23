import {$, show, hide} from "./utils";
import {loadSidebarIntoIFrame} from "./acrolinx-sidebar-integration/utils/sidebar-loader";
import {ProxyAcrolinxPlugin, waitForAcrolinxPlugin} from "./proxy-acrolinx-plugin";

const SERVER_ADDRESS_KEY = 'acrolinx.serverSelector.serverAddress';

const TEMPLATE = `
  <form id="serverSelectorForm" style="display: none">
    <h1>Acrolinx Server Selector</h1>
    <input type="text" id="serverAddress" placeholder="Acrolinx Server Address">
    <input type="submit" value="Go">
    <div id="errorMessage" style="display: none"></div>
  </form>
  
  <div id="sidebarContainer"></div>
`;

function main() {
  const appElement = $('#app')!;
  appElement.innerHTML = TEMPLATE;

  const sidebarContainer = $('#sidebarContainer')!;
  const errorMessageEl = $('#errorMessage')!;

  const form = $('#serverSelectorForm')!;
  form.addEventListener('submit', onSubmit);

  const serverAddressField = $('#serverAddress')! as HTMLInputElement;
  const oldServerAddress = localStorage.getItem(SERVER_ADDRESS_KEY);
  if (oldServerAddress) {
    serverAddressField.value = oldServerAddress;
  }
  serverAddressField.focus();

  if (oldServerAddress) {
    tryToLoadSidebar(oldServerAddress);
  } else {
    show(form);
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    const serverAddress = serverAddressField.value;
    console.log(serverAddress);

    tryToLoadSidebar(serverAddress);
  }

  function tryToLoadSidebar(serverAddress: string) {
    console.log(serverAddress);

    sidebarContainer.innerHTML = '';
    const sidebarIFrameElement = document.createElement('iframe') as HTMLIFrameElement;
    sidebarContainer.appendChild(sidebarIFrameElement);

    const sidebarUrl = serverAddress + '/sidebar/v14/';
    loadSidebarIntoIFrame({sidebarUrl}, sidebarIFrameElement, (error) => {
      if (error) {
        setErrorMessage("Can't load the provided URL.");
        return;
      }

      hide(form);
      show(sidebarContainer);

      localStorage.setItem(SERVER_ADDRESS_KEY, serverAddress);
      waitForAcrolinxPlugin(acrolinxPlugin => {
        const contentWindowAny = sidebarIFrameElement.contentWindow as any;
        contentWindowAny.acrolinxPlugin = new ProxyAcrolinxPlugin({
          window,
          sidebarWindow: sidebarIFrameElement.contentWindow,
          acrolinxPlugin,
          serverAddress,
          onSignOut
        });
      });
    });
  }

  function onSignOut() {
    sidebarContainer.innerHTML = '';
    hide(sidebarContainer);
    show(form);
  }

  function setErrorMessage(message: string) {
    errorMessageEl.textContent = message;
    errorMessageEl.style.display = 'block';
  }

}


main();

