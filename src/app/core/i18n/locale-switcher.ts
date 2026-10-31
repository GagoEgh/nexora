import { ViewportScroller } from '@angular/common';
import { ApplicationRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import { getLocalizedUrl } from 'intlayer';
import { filter, map } from 'rxjs';
import { type AppLocale, LOCALE_NAMES } from './locale-labels';

export function useLocaleSwitcher() {
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  const app = inject(ApplicationRef);
  const { locale, availableLocales } = useLocale();
  const currentUrl = toSignal(
    router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => router.url),
    ),
    { initialValue: router.url },
  );

  return {
    locale,
    locales: availableLocales,
    names: LOCALE_NAMES,

    urlFor: (next: AppLocale): string => getLocalizedUrl(currentUrl(), next),

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
