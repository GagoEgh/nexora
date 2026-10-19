import { ViewportScroller } from '@angular/common';
import { ApplicationRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import { getLocalizedUrl } from 'intlayer';
import { type AppLocale, LOCALE_NAMES } from './locale-labels';

export function useLocaleSwitcher() {
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  const app = inject(ApplicationRef);
  const { locale, availableLocales } = useLocale();

  return {
    locale,
    locales: availableLocales,
    names: LOCALE_NAMES,
    switchTo: async (next: AppLocale): Promise<boolean> => {
      const position = scroller.getScrollPosition();
      const navigated = await router.navigateByUrl(getLocalizedUrl(router.url, next), {
        scroll: 'manual',
      });
      await app.whenStable();
      scroller.scrollToPosition(position);
      return navigated;
    },
  };
}
