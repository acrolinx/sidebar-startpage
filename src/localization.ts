import {translations, en} from "../tmp/generated/translations";

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