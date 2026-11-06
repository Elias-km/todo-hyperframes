import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations.js';

const STORAGE_KEY = 'todo-react:language';
const supportedLanguages = ['en', 'es', 'ca', 'gl', 'eu'];

function loadLanguage() {
  try {
    const language = localStorage.getItem(STORAGE_KEY);
    return supportedLanguages.includes(language) ? language : 'en';
  } catch {
    return 'en';
  }
}

const initialLanguage = loadLanguage();

document.documentElement.lang = initialLanguage;

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLanguage(language) {
  if (!supportedLanguages.includes(language)) return;

  await i18n.changeLanguage(language);

  document.documentElement.lang = language;

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // La aplicación continúa funcionando sin persistencia.
  }
}

export default i18n;
