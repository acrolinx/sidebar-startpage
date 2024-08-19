/*
 * Copyright 2016-present Acrolinx GmbH
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

const IS_WITH_CREDENTIALS_NEEDED = /^https:\/\/[a-z-_]+\.(corp\.google\.com|gcpnode\.com|corp\.goog)(:[0-9]+)?/;

export function isCorsWithCredentialsNeeded(url: string) {
  return IS_WITH_CREDENTIALS_NEEDED.test(url);
}

type FetchErrorCode = 'connectionError' | 'timeout' | 'httpErrorStatus';

export class FetchError extends Error {
  constructor(
    public readonly acrolinxErrorCode: FetchErrorCode,
    message: string,
    public url: string,
  ) {
    super(message);
  }
}

interface FetchOptions {
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
        callback(new FetchError('httpErrorStatus', `Error while loading ${url}. Status = ${request.status}`, url));
      }
    };

    if (opts.timeout) {
      request.timeout = opts.timeout;
    }

    request.ontimeout = () => {
      callback(new FetchError('timeout', `Timeout while loading ${url}.`, url));
    };

    request.onerror = () => {
      callback(new FetchError('connectionError', `Error while loading ${url}.`, url));
    };

    request.withCredentials = isCorsWithCredentialsNeeded(url);

    request.send();
  } catch (error) {
    callback(new FetchError('connectionError', (error as Error).message, url));
  }
}
