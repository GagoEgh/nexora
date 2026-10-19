import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import { getLocalizedUrl } from 'intlayer';
import { type AppLocale, LOCALE_NAMES } from './locale-labels';

export function useLocaleSwitcher() {
  const router = inject(Router);
  const { locale, availableLocales } = useLocale();

  return {
    locale,
    locales: availableLocales,
    names: LOCALE_NAMES,
    switchTo: (next: AppLocale): Promise<boolean> =>
      router.navigateByUrl(getLocalizedUrl(router.url, next)),
  };
}
