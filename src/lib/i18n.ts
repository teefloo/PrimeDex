"use client";

import i18n from 'i18next';
import type { TOptions } from 'i18next';
import { useMemo, useSyncExternalStore } from 'react';
import { initReactI18next, useTranslation as useReactTranslation } from 'react-i18next';
import enTranslations from './i18n/en';
import type { SupportedLanguage } from './languages';

const emptySubscribe = () => () => {};

// Lazy-load map for on-demand language loading
type TranslationBundle = {
  default: {
    translation: object;
  };
};

const languageResources: Partial<Record<SupportedLanguage, () => Promise<TranslationBundle>>> = {
  fr: () => import('./i18n/fr'),
  es: () => import('./i18n/es'),
  de: () => import('./i18n/de'),
  it: () => import('./i18n/it'),
  ja: () => import('./i18n/ja'),
  ko: () => import('./i18n/ko'),
};

// Initialize with the same language as server rendering, then switch after hydration.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Dynamically load a language and add it to i18n
export const loadLanguage = async (lang: string): Promise<void> => {
  if (lang === 'en' || !languageResources[lang as SupportedLanguage]) return;
  
  const hasResourceBundle = i18n.hasResourceBundle(lang, 'translation');
  if (hasResourceBundle) return;

  try {
    const langModule = await languageResources[lang as SupportedLanguage]?.();
    if (!langModule) return;
    i18n.addResourceBundle(lang, 'translation', langModule.default.translation, true, true);
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
  }
};

export const useTranslation = () => {
  const translation = useReactTranslation();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const hydrationT = useMemo(() => i18n.getFixedT('en'), []);

  return mounted ? translation : { ...translation, t: hydrationT };
};

export const t = (key: string, options?: TOptions) => i18n.t(key, options);

export default i18n;
