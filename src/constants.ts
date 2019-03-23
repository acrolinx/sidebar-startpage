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

export const SERVER_SELECTOR_VERSION = '§SERVER_SELECTOR_VERSION';

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
