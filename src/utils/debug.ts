import {loadScript} from "./utils";
import * as logging from "./logging";

function patchFirebugUI() {
  const iFrameEl = document.getElementById('FirebugUI') as HTMLIFrameElement;
  if (!iFrameEl) {
    return false;
  }

  try {
    const closeButton = iFrameEl.contentWindow.document.getElementById('fbWindow_btDeactivate')!;
    closeButton.style.display = 'none';
  } catch (_error) {
    return false;
  }

  return true;
}

function waitToPatchFirebugUI() {
  if (!patchFirebugUI()) {
    setTimeout(waitToPatchFirebugUI, 500);
  }
}

function loadFirebugLite() {
  logging.log('Loading firebug lite into sidebar startpage ...');
  loadScript('https://getfirebug.com/releases/lite/1.3/firebug-lite.js#startOpened=true');
  waitToPatchFirebugUI();
}

function waitForFirebugCheatCode() {
  let cheatCode = '';
  let isMouseDown = false;

  document.addEventListener('keypress', (keyEvent: KeyboardEvent) => {
    if (isMouseDown) {
      const key = keyEvent.key || String.fromCharCode(keyEvent.charCode); // Webkit has only charCode
      cheatCode += key;
    }
  });

  document.addEventListener('mousedown', () => {
    isMouseDown = true;
    cheatCode = '';
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    switch (cheatCode) {
      case 'acrofire':
        loadFirebugLite();
        break;
      default:
        if (cheatCode.length > 3) {
          logging.log('Unknown command:', cheatCode);
        }
    }
    cheatCode = '';
  });
}


export function initDebug() {
  waitForFirebugCheatCode();
}
