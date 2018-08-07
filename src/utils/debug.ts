/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript} from "./utils";
import * as logging from "./logging";

function patchFirebugUI() {
  const iFrameEl = document.getElementById('FirebugUI') as HTMLIFrameElement;
  if (!iFrameEl || !iFrameEl.contentWindow) {
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
