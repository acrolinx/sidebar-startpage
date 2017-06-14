export function $(selector: string): HTMLElement | undefined {
  return document.querySelector(selector) as HTMLElement;
}

export function hide(el: HTMLElement) {
  el.style.display = 'none';
}

export function show(el: HTMLElement) {
  el.style.display = 'block';
}

export function startsWith(haystack: string, needle: string) {
  return haystack.indexOf(needle) === 0;
}

export function startsWithAnyOf(haystack: string, needles: string[]) {
  return needles.some(needle => startsWith(haystack, needle));
}


// Inspired by https://gist.github.com/dperini/729294
const SERVER_ADDRESS_REGEXP = new RegExp(
  "^" +
  // protocol identifier
  "(?:(?:https?)://)" +
  // user:pass authentication
  "(?:\\S+(?::\\S*)?@)?" +
  "(?:" +
  // IP address exclusion
  // private & local networks
  "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
  "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
  "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
  // IP address dotted notation octets
  // excludes loopback network 0.0.0.0
  // excludes reserved space >= 224.0.0.0
  // excludes network & broacast addresses
  // (first & last IP address of each class)
  "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
  "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
  "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
  "|" +
  // host name
  "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
  // domain name
  "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
  // TLD identifier
  "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))?" +
  ")" +
  // port number
  "(?::\\d{2,5})?" +
  // resource path
  "(?:[/?#]\\S*)?" +
  "$", "i"
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
  const defaultProtocol = (includes(trimmedAddress, ':443') || isHttpsRequired(opts)) ? 'https' : 'http';
  const normalizedAddress = trimmedAddress.replace(/\/$/, '');
  const addressWithProtocol = startsWith(normalizedAddress, 'http') ? normalizedAddress : (defaultProtocol + '://' + normalizedAddress);
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

export function isHttpsRequired(opts: SanitizeOpts) {
  return opts.enforceHTTPS || opts.windowLocation.protocol == 'https:';
}

export function getDefaultServerAddress(location: WindowLocation) {
  if (isValidServerProtocol(location.protocol)) {
    return location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
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


export function setInnerText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = text;
  }
}

function includes(haystack: string, needle: string) {
  return haystack.indexOf(needle) >= 0;
}