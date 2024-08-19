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

import { translations, en } from '../tmp/generated/translations';

let currentTranslation = en;
let currentLocale = 'en';

export function setLanguage(languageCode?: string) {
  currentLocale = sanitizeClientLocale(languageCode);
  currentTranslation = translations[currentLocale] || en;
}

export function getTranslation() {
  return currentTranslation;
}

export function getLocale() {
  return currentLocale;
}

function sanitizeClientLocale(languageCode?: string): string {
  return (languageCode || 'en').toLowerCase().slice(0, 2).replace('jp', 'ja');
}
