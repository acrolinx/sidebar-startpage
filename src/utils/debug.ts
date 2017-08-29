import {loadScript} from "./utils";

function loadFirebugLite() {
  console.log('Loading firebug lite into sidebar startpage ...');
  loadScript('https://getfirebug.com/releases/lite/1.3/firebug-lite.js#startOpened=true');
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
          console.log('Unknown command:', cheatCode);
        }
    }
    cheatCode = '';
  });
}


export function initDebug() {
  waitForFirebugCheatCode();
}
