import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import {
  type DeclaredLocales,
  defaultLocale,
  getLocaleFromPath,
  getLocalizedUrl,
  locales,
} from 'intlayer';

const prefixedLocales: readonly string[] = locales.filter((locale) => locale !== defaultLocale);

export const matchLocalePrefix: CanMatchFn = (_route, segments) =>
  segments.length > 0 && prefixedLocales.includes(segments[0].path);

export const syncLocaleWithUrl: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const i18n = useLocale();
  const target: DeclaredLocales = getLocaleFromPath(state.url) ?? defaultLocale;
  const inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (
    inBrowser &&
    !router.navigated &&
    target === defaultLocale &&
    i18n.locale() !== defaultLocale
  ) {
    return router.parseUrl(getLocalizedUrl(state.url, i18n.locale()));
  }
  if (i18n.locale() !== target) {
    i18n.setLocale(target);
  }
  return true;
};

export function localeFromLocation(pathname: string | undefined): DeclaredLocales | undefined {
  if (!pathname) {
    return undefined;
  }
  const locale = getLocaleFromPath(pathname);
  return locale && locale !== defaultLocale ? locale : undefined;
}
