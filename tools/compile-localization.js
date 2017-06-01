const fs = require('fs');
const _ = require('lodash');

const OUTPUT_FILE = 'tmp/generated/translations.ts';
const ENCODING = 'utf8';
const LANGUAGES = ['en-US', 'de-DE'];

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

  const languageTranslationPairs = LANGUAGES.map(languageCodeLong => [
    getShortLanguageCode(languageCodeLong),
    _.defaultsDeep({}, readLocalization(basePath, languageCodeLong), localizationDev)
  ]);

  const translationsTs = fillTypeScriptTemplate(localizationDev, languageTranslationPairs);

  fs.writeFileSync(OUTPUT_FILE, translationsTs, ENCODING);
};

compileLocalizationToTypeScript();