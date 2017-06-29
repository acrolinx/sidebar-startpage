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
