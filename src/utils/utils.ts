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

import * as logging from './logging';

export function $(selector: string): HTMLElement | undefined {
  return document.querySelector(selector) as HTMLElement;
}

export function $byId(id: string): HTMLElement | undefined {
  return document.getElementById(id) as HTMLElement;
}

export function setDisplayed(el: HTMLElement, isDisplayed: boolean, display = 'block') {
  if (el.style) {
    el.style.display = isDisplayed ? display : 'none';
  }
}

export function startsWith(haystack: string, needle: string) {
  return haystack.indexOf(needle) === 0;
}

export function startsWithAnyOf(haystack: string, needles: string[]) {
  return needles.some(needle => startsWith(haystack, needle));
}

// Inspired by https://gist.github.com/dperini/729294
const SERVER_ADDRESS_REGEXP = new RegExp(
  '^' +
    // protocol identifier
    '(?:(?:https?)://)' +
    // user:pass authentication
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
    '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // host name
    '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
    // domain name
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
    // TLD identifier
    '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))?' +
    ')' +
    // port number
    '(?::\\d{2,5})?' +
    // resource path
    '(?:[/?#]\\S*)?' +
    '$',
  'i',
);

export interface WindowLocation {
  protocol: string; // example: 'http:' or 'https:'
  hostname: string;
  port?: string;
}

export interface SanitizeOpts {
  enforceHTTPS?: boolean;
  windowLocation: WindowLocation;
}

/**
 * Converts input like integration2.acrolinx.com, http://integration2.acrolinx.com or integration2.acrolinx.com:8031
 * to a valid server address (including port if there is no provided port or path)
 */
export function sanitizeServerAddress(serverAddressArg: string, opts: SanitizeOpts) {
  const trimmedAddress = serverAddressArg.trim();
  if (startsWith(trimmedAddress, '/')) {
    return getDefaultServerAddress(opts.windowLocation) + trimmedAddress;
  }
  const defaultHttpPort = 8031;
  const defaultProtocol = includes(trimmedAddress, ':443') || isHttpsRequired(opts) ? 'https' : 'http';
  const normalizedAddress = trimmedAddress.replace(/\/$/, '');
  const addressWithProtocol = startsWith(normalizedAddress, 'http')
    ? normalizedAddress
    : defaultProtocol + '://' + normalizedAddress;
  const hasPortRegExp = /\/\/.+((:\d+.*)|(\/.+))$/;
  if (hasPortRegExp.test(addressWithProtocol)) {
    return addressWithProtocol;
  } else {
    if (startsWith(addressWithProtocol, 'http:')) {
      return addressWithProtocol + ':' + defaultHttpPort;
    } else {
      return addressWithProtocol;
    }
  }
}

export function combinePathParts(part1: string, part2: string) {
  return part1.replace(/\/$/, '') + '/' + part2.replace(/^\//, '');
}

export function isHttpsRequired(opts: SanitizeOpts) {
  return opts.enforceHTTPS || opts.windowLocation.protocol === 'https:';
}

export function getDefaultServerAddress(location: WindowLocation) {
  if (isValidServerProtocol(location.protocol)) {
    return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
  } else {
    return '';
  }
}

export function isValidServerProtocol(protocol: string) {
  return protocol === 'http:' || protocol === 'https:';
}

export function isHttpUrl(url: string) {
  return startsWith(url, 'http:');
}

export function validateUrl(url: string) {
  return SERVER_ADDRESS_REGEXP.test(url);
}

function includes(haystack: string, needle: string) {
  return haystack.indexOf(needle) >= 0;
}

export function getCorsOrigin() {
  const location = window.location;
  return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

export function sortBy<T>(array: T[], getSortKey: (el: T) => string) {
  const cloned_array = array.slice();
  cloned_array.sort((a, b) => {
    const sortKeyA = getSortKey(a);
    const sortKeyB = getSortKey(b);
    return sortKeyA.localeCompare(sortKeyB);
  });
  return cloned_array;
}

export function isVersionGreaterEqual(version: number[], minimumVersion: number[]): boolean {
  for (let i = 0; i < version.length; i++) {
    const versionPart = version[i] || 0;
    const minimumVersionPart = minimumVersion[i] || 0;
    if (versionPart > minimumVersionPart) {
      return true;
    } else if (versionPart < minimumVersionPart) {
      return false;
    }
  }
  return true;
}

export function parseVersionNumberWithFallback(s: string | undefined): number[] {
  if (!s) {
    return [];
  }

  if (!/^(\d+.?)+$/.test(s)) {
    logging.error('Invalid version number:', s);
    return [];
  }

  try {
    return s.split('.').map(part => parseInt(part, 10));
  } catch (error) {
    logging.error('Invalid version number:', s, error);
    return [];
  }
}

export function cleanIFrameContainerIfNeeded(sidebarContainer: HTMLElement, callback: () => void) {
  const iFrame: HTMLIFrameElement | null = sidebarContainer.querySelector('iframe');
  if (iFrame) {
    // Changing the src before cleaning the whole container is needed at least in IE 11
    // to avoid exceptions inside the iFrame caused by disappearing javascript objects.
    // The try/catch is just added to be on the safe side.
    try {
      iFrame.src = 'about:blank';
      setTimeout(() => {
        sidebarContainer.innerHTML = '';
        callback();
      }, 0);
    } catch (error) {
      logging.error(error);
      callback();
    }
  } else {
    callback();
  }
}

function createScriptElement(src: string) {
  const el = document.createElement('script');
  el.src = src;
  el.type = 'text/javascript';
  el.async = false;
  el.defer = false;
  return el;
}

export function loadScript(url: string) {
  const head = document.querySelector('head');
  if (head) {
    head.appendChild(createScriptElement(url));
  } else {
    logging.error(`Can not load script "${url}" because of missing head element.`);
  }
}

export class TimeoutWatcher {
  private timeoutId: number | undefined;

  constructor(
    private readonly onTimeout: () => void,
    private readonly durationMs: number,
  ) {}

  start() {
    if (this.timeoutId !== undefined) {
      this.stop();
      logging.warn('TimeoutWatcher: start was called twice');
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      this.onTimeout();
    }, this.durationMs) as unknown as number;
  }

  stop() {
    if (this.timeoutId === undefined) {
      logging.warn('TimeoutWatcher: stop was called before start');
    } else {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
