export const SERVER_SELECTOR_VERSION = '§SERVER_SELECTOR_VERSION';

export const FALLBACK_SIDEBAR_URL = 'https://sidebar-classic.acrolinx-cloud.com/v14.3/prod/';

/* Some extensions need the message adapter, because it's not possible to load javascript from arbitrary hosts
 * due to the content security policy.
 * Safari ( 'safari-extension://') has currently no content security policy, that would prevent the normal loading of the
 * sidebar.
 */
export const URL_PREFIXES_NEEDING_MESSAGE_ADAPTER = ['chrome-extension://', 'moz-extension://', 'resource://', 'ms-browser-extension://'];

export const REQUEST_INIT_TIMEOUT_MS = 60 * 1000;

/**
 * Just for Development.
 */
export const FORCE_SIDEBAR_URL = '';

export const FORCE_MESSAGE_ADAPTER = false;
