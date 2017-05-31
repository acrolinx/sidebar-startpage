import {translations, en} from "../tmp/generated/translations";

let currentTranslation = en;

export function setLanguage(languageCode?: string) {
  const shortLanguageCode = (languageCode || 'en') .slice(0, 2);
  currentTranslation = translations[shortLanguageCode] || en;
}

export function getTranslation() {
  return currentTranslation;
}