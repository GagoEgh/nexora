import type { DeclaredLocales } from 'intlayer';

export type AppLocale = DeclaredLocales;
export const LOCALE_NAMES: Readonly<Record<AppLocale, string>> = {
  en: 'English',
  hy: 'Հայերեն',
  ru: 'Русский',
};
