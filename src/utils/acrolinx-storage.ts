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

import * as logging from "./logging";

interface WindowWithAcrolinxStorage extends Window {
  acrolinxStorage: AcrolinxSimpleStorage;
}

export interface AcrolinxSimpleStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, data: string): void;
  clear(): void;
}


// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function isLocalStorageAvailable(storage: Storage | undefined) {
  try {
    if (!storage) {
      return false;
    }
    const x = '__storage_test__';
    storage.setItem(x, x);
    if (storage.getItem(x) !== x) {
      return false;
    }
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
}

export class AcrolinxSimpleStorageInMemory implements AcrolinxSimpleStorage {
  dataMap: { [key: string]: string } = {};

  clear(): void {
    this.dataMap = {};
  }

  setItem(key: string, data: string): void {
    this.dataMap[key] = data;
  }

  getItem(key: string): string | null {
    const value = this.dataMap[key];
    return value === undefined ? null : value;
  }

  removeItem(key: string): void {
    delete this.dataMap[key];
  }
}


const disableLocalStorageForTesting = false;

function getAcrolinxSimpleStorageAtInitInternal(acrolinxStorageArg: AcrolinxSimpleStorage | undefined, localStorageArg: Storage | undefined): AcrolinxSimpleStorage {
  if (acrolinxStorageArg) {
    logging.log('acrolinxStartpage: Using window.acrolinxStorage');
    return acrolinxStorageArg;
  } else if (isLocalStorageAvailable(localStorageArg) && !disableLocalStorageForTesting) {
    logging.log('acrolinxStartpage: Using window.localStorage');
    return localStorageArg!;
  } else {
    logging.log('acrolinxStartpage: Using AcrolinxSimpleStorageInMemory');
    return new AcrolinxSimpleStorageInMemory();
  }
}

/**
 * Catches exceptions which might occur if loaded in IE from res://
 * See https://acrolinx.atlassian.net/browse/DEV-13088
 */
function getLocalStorageSafe(): Storage | undefined {
  try {
    return window.localStorage;
  } catch (_error) {
    return undefined;
  }
}

function getAcrolinxSimpleStorageAtInit(): AcrolinxSimpleStorage {
  const pimpedWindow = window as unknown as WindowWithAcrolinxStorage;
  return getAcrolinxSimpleStorageAtInitInternal(pimpedWindow.acrolinxStorage, getLocalStorageSafe());
}

let acrolinxSimpleStorage: AcrolinxSimpleStorage | undefined;

export function getAcrolinxSimpleStorage(): AcrolinxSimpleStorage {
  if (!acrolinxSimpleStorage) {
    acrolinxSimpleStorage = getAcrolinxSimpleStorageAtInit();
  }
  return acrolinxSimpleStorage;
}

export function initAcrolinxStorage() {
  acrolinxSimpleStorage = getAcrolinxSimpleStorageAtInit();
}

export function injectAcrolinxStorageIntoSidebarIfAvailable(currentWindow: { acrolinxStorage?: AcrolinxSimpleStorage }, sidebarIFrameWindow: WindowWithAcrolinxStorage) {
  if (currentWindow.acrolinxStorage) {
    logging.log('Inject window.acrolinxStorage into sidebar');
    sidebarIFrameWindow.acrolinxStorage = currentWindow.acrolinxStorage;
  }
}

export const forTesting = {
  getAcrolinxSimpleStorageAtInitInternal
};
