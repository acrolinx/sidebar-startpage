import {ErrorFirstCallback} from "../../utils/utils";

const IS_WITH_CREDENTIALS_NEEDED = /^https:\/\/acrolinx-(dev|uat|prod)\.corp\.google\.com(:[0-9]+)?/;

export function isCorsWithCredentialsNeeded(url: string) {
  return IS_WITH_CREDENTIALS_NEEDED.test(url);
}

export function fetch(url: string, callback: ErrorFirstCallback<string>) {
  try {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        callback(null, request.responseText);
      } else {
        callback(new Error(`Error while loading ${url}.`));
      }
    };

    request.onerror = function () {
      callback(new Error(`Error while loading ${url}.`));
    };

    request.withCredentials = isCorsWithCredentialsNeeded(url);

    request.send();
  } catch (error) {
    callback(error);
  }
}