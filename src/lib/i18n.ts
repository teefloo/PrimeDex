"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation as useReactTranslation } from 'react-i18next';
import enTranslations from './i18n/en';

// Lazy-load map for on-demand language loading
const languageResources: Record<string, () => Promise<{ default: { translation: Record<string, unknown> } }>> = {
  fr: () => import('./i18n/fr'),
  es: () => import('./i18n/es'),
  de: () => import('./i18n/de'),
  it: () => import('./i18n/it'),
  ja: () => import('./i18n/ja'),
  ko: () => import('./i18n/ko'),
};

// Try to get initial language synchronously from localStorage
const getInitialLang = () => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('primedex-lang') || 'en';
};

// Initialize with English only (smallest initial bundle)
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
    },
    lng: getInitialLang(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Dynamically load a language and add it to i18n
export const loadLanguage = async (lang: string): Promise<void> => {
  if (lang === 'en' || !languageResources[lang]) return;
  
  const hasResourceBundle = i18n.hasResourceBundle(lang, 'translation');
  if (hasResourceBundle) return;

  try {
    const module = await languageResources[lang]();
    i18n.addResourceBundle(lang, 'translation', module.default.translation, true, true);
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
  }
};

export const useTranslation = () => useReactTranslation();
export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export default i18n;
