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

import {assert} from "chai";
import * as $ from "jquery";

export function assertDeepEqual(val: any, expected: any) {
  assert.equal(JSON.stringify(val), JSON.stringify(expected));
}

export function assertExistCount(jQuerySelector: any, expectedCount: number, message?: string) {
  const realCount = $(jQuerySelector).length;
  assert.equal(realCount, expectedCount, message || `Element ${jQuerySelector} count(${realCount}) is not expected (${expectedCount}).`);
}

export function getExistingElement(jQuerySelector: string, message?: string) {
  assertExistCount(jQuerySelector, 1, message);
  return $(jQuerySelector);
}

export function simulateClick(jQuerySelector: any) {
  getExistingElement(jQuerySelector).get(0).click();
}


export function waitUntilSuccess(f: () => void, timeoutMs: number) {
  const startTime = Date.now();

  function waitUntilSuccessInternal() {
    setTimeout(() => {
      try {
        f();
      } catch (error) {
        if (Date.now() < startTime + timeoutMs) {
          waitUntilSuccessInternal();
        } else {
          throw error;
        }
      }
    }, 100);
  }

  waitUntilSuccessInternal();
}