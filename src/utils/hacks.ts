/*
 * Copyright 2018-present Acrolinx GmbH
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

function includes(s: string, needle: string) {
  return s.indexOf(needle) >= 0;
}

function isWebkit() {
  const ua = navigator.userAgent;
  return includes(ua, 'AppleWebKit') && !(includes(ua, 'Chrome') || includes(ua, 'Edge'));
}

export let DEV_NULL = 0;

// https://stackoverflow.com/questions/3485365/
// how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes/3485654#3485654
export function forceRedrawInWebkit() {
  if (!isWebkit()) {
    return;
  }
  const el = document.querySelector('body');
  if (el) {
    el.style.display = 'none';
    // No need to use el.offsetHeight. Just accessing it triggers redraw.
    // We store it just to prevent some optimizers to optimize it away :-)
    // Maybe this is not needed, but you can never know in crazy browser land.
    DEV_NULL = el.offsetHeight;
    el.style.display = 'block';
  }
}
