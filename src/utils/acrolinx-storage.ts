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
  if (!storage) {
    return false;
  }
  try {
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
    console.log('acrolinxStartpage: Using window.acrolinxStorage');
    return acrolinxStorageArg;
  } else if (isLocalStorageAvailable(localStorageArg) && !disableLocalStorageForTesting) {
    console.log('acrolinxStartpage: Using window.localStorage');
    return localStorageArg!;
  } else {
    console.log('acrolinxStartpage: Using AcrolinxSimpleStorageInMemory');
    return new AcrolinxSimpleStorageInMemory();
  }
}

function getAcrolinxSimpleStorageAtInit(): AcrolinxSimpleStorage {
  const pimpedWindow = window as WindowWithAcrolinxStorage;
  return getAcrolinxSimpleStorageAtInitInternal(pimpedWindow.acrolinxStorage, window.localStorage);
}

let acrolinxSimpleStorage = getAcrolinxSimpleStorageAtInit();

export function getAcrolinxSimpleStorage() {
  return acrolinxSimpleStorage;
}

export function initAcrolinxStorage() {
  acrolinxSimpleStorage = getAcrolinxSimpleStorageAtInit();
}

export function injectAcrolinxStorageIntoSidebarIfAvailable(currentWindow: {acrolinxStorage?: AcrolinxSimpleStorage}, sidebarIFrameWindow: WindowWithAcrolinxStorage) {
  if (currentWindow.acrolinxStorage) {
    console.log('Inject window.acrolinxStorage into sidebar');
    sidebarIFrameWindow.acrolinxStorage = currentWindow.acrolinxStorage;
  }
}

export const forTesting = {
  getAcrolinxSimpleStorageAtInitInternal
};
