import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi }
};

// Auto-detect language from system/browser
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  if (lang && lang.toLowerCase().startsWith('vi')) {
    return 'vi';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
