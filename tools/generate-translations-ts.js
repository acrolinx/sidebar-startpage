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

const fs = require('fs');
const _ = require('lodash');

const OUTPUT_FILE = 'tmp/generated/translations.ts';
const ENCODING = 'utf8';
const EN_US = 'en-US';
const LANGUAGES = [EN_US, 'de-DE', 'fr-FR', 'sv-SE', 'ja-JP'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, ENCODING));
}

function readLocalization(basePath, languageCodeLong) {
  return readJson(basePath + languageCodeLong + '-localization.json');
}

function getShortLanguageCode(languageCode) {
  return languageCode.slice(0, 2);
}

function createTranslationTs(translationObj, constantName) {
  return `export const ${constantName} = ${JSON.stringify(translationObj, null, 2)}`;
}


function fillTypeScriptTemplate(localizationDev, languageTranslationPairs) {
  return `
${createTranslationTs(localizationDev, 'devTranslation')}

type Translation = typeof devTranslation;

${_.map(languageTranslationPairs, pair => createTranslationTs(pair[1], pair[0])).join(' as Translation;\n\n')}

export const translations: { [language: string]: Translation|undefined } = {
  dev: devTranslation,
  ${LANGUAGES.map(getShortLanguageCode).join(', ')}
}`;
}


function compileLocalizationToTypeScript() {
  const basePath = 'i18n/';
  const localizationDev = readLocalization(basePath, 'dev');
  const localizationEn = readLocalization(basePath, EN_US);

  const languageTranslationPairs = LANGUAGES.map(languageCodeLong => [
    getShortLanguageCode(languageCodeLong),
    _.defaultsDeep({}, readLocalization(basePath, languageCodeLong), localizationEn, localizationDev)
  ]);

  const translationsTs = fillTypeScriptTemplate(localizationDev, languageTranslationPairs);

  fs.writeFileSync(OUTPUT_FILE, translationsTs, ENCODING);
};

compileLocalizationToTypeScript();