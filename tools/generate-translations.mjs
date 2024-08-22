import fs from 'fs';
import _ from 'lodash';

const OUTPUT_FILE = 'tmp/generated/translations.ts';
const ENCODING = 'utf8';
const EN_US = 'en-US';
const LANGUAGES = ['de-DE', 'fr-FR', 'sv-SE', 'ja-JP'];

const readJson = file => JSON.parse(fs.readFileSync(file, ENCODING));

const readLocalization = (basePath, languageCodeLong) => readJson(`${basePath}${languageCodeLong}-localization.json`);

const getShortLanguageCode = languageCode => languageCode.slice(0, 2);

const createTranslationTs = (translationObj, constantName) =>
  `export const ${constantName} = ${JSON.stringify(translationObj, null, 2)}`;

const fillTypeScriptTemplate = (localizationEn, languageTranslationPairs) => `
${createTranslationTs(localizationEn, getShortLanguageCode(EN_US))}

type Translation = typeof ${getShortLanguageCode(EN_US)};

${_.map(languageTranslationPairs, ([shortCode, translation]) => createTranslationTs(translation, shortCode)).join(' as Translation;\n\n')}

export const translations: { [language: string]: Translation | undefined } = {
  ${LANGUAGES.map(getShortLanguageCode).join(', ')}
}`;

const compileLocalizationToTypeScript = () => {
  const basePath = 'i18n/';
  const localizationEn = readLocalization(basePath, EN_US);

  const languageTranslationPairs = LANGUAGES.map(languageCodeLong => [
    getShortLanguageCode(languageCodeLong),
    _.defaultsDeep({}, readLocalization(basePath, languageCodeLong), localizationEn),
  ]);

  const translationsTs = fillTypeScriptTemplate(localizationEn, languageTranslationPairs);

  fs.writeFileSync(OUTPUT_FILE, translationsTs, ENCODING);
};

compileLocalizationToTypeScript();
