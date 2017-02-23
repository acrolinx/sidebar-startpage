import {ErrorFirstCallback} from "../../utils";

export function fetch(url: string, callback: ErrorFirstCallback<string>) {
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

  request.send();
}