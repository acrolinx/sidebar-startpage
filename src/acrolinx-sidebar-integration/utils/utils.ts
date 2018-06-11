const IS_WITH_CREDENTIALS_NEEDED = /^https:\/\/[a-z-_]+\.(corp\.google|gcpnode)\.com(:[0-9]+)?/;

export function isCorsWithCredentialsNeeded(url: string) {
  return IS_WITH_CREDENTIALS_NEEDED.test(url);
}


type FetchErrorCode = 'connectionError' | 'timeout' | 'httpErrorStatus';

export class FetchError extends Error {
  constructor(public readonly acrolinxErrorCode: FetchErrorCode, message: string) {
    super(message);
  }
}

interface  FetchOptions {
  timeout?: number;
}

export function fetch(url: string, opts: FetchOptions, callback: (responseTextOrError: string | FetchError) => void) {
  try {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        callback(request.responseText);
      } else {
        callback(new FetchError('httpErrorStatus', `Error while loading ${url}. Status = ${request.status}`));
      }
    };

    if (opts.timeout) {
      request.timeout = opts.timeout;
    }


    request.ontimeout = () => {
      callback(new FetchError('timeout', `Timeout while loading ${url}.`));
    };

    request.onerror = () => {
      callback(new FetchError('connectionError', `Error while loading ${url}.`));
    };

    request.withCredentials = isCorsWithCredentialsNeeded(url);

    request.send();
  } catch (error) {
    callback(new FetchError('connectionError', error.message));
  }
}