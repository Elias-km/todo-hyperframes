import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations.js';
import { promptResources } from './prompts/index.js';

const STORAGE_KEY = 'todo-ia:language';
const supportedLanguages = ['es', 'en'];

function loadLanguage() {
  try {
    const language = localStorage.getItem(STORAGE_KEY);
    return supportedLanguages.includes(language) ? language : 'es';
  } catch {
    return 'es';
  }
}

const initialLanguage = loadLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    es: { ...resources.es, prompts: promptResources.es },
    en: { ...resources.en, prompts: promptResources.en },
  },
  ns: ['translation', 'prompts'],
  defaultNS: 'translation',
  lng: initialLanguage,
  fallbackLng: 'es',
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLanguage(language) {
  if (!supportedLanguages.includes(language)) return;

  await i18n.changeLanguage(language);

  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // La aplicación continúa funcionando sin persistencia.
  }
}

export default i18n;
