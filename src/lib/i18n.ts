"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation as useReactTranslation } from 'react-i18next';
import { resources } from './i18n-resources';

// Try to get initial language synchronously from localStorage
const getInitialLang = () => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('primedex-lang') || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLang(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const useTranslation = () => useReactTranslation();
export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export default i18n;

// force reload
