import i18n from 'i18next';
import type { TOptions } from 'i18next';
import { resources } from './i18n-resources';

const serverI18n = i18n.createInstance();

serverI18n.init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const t = (key: string, options?: TOptions) => serverI18n.t(key, options);

export async function getTranslations() {
  return (key: string, options?: TOptions) => serverI18n.t(key, options);
}
