import { ViewportScroller } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import { getLocalizedUrl } from 'intlayer';
import { filter, take } from 'rxjs';
import { type AppLocale, LOCALE_NAMES } from './locale-labels';

export function useLocaleSwitcher() {
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  const destroyRef = inject(DestroyRef);
  const { locale, availableLocales } = useLocale();

  return {
    locale,
    locales: availableLocales,
    names: LOCALE_NAMES,
    switchTo: (next: AppLocale): Promise<boolean> => {
      const url = getLocalizedUrl(router.url, next);
      const position = scroller.getScrollPosition();
      router.events
        .pipe(
          filter(
            (event) =>
              event instanceof Scroll &&
              event.routerEvent instanceof NavigationEnd &&
              event.routerEvent.urlAfterRedirects === url,
          ),
          take(1),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe(() => scroller.scrollToPosition(position));
      return router.navigateByUrl(url, { scroll: 'manual' });
    },
  };
}
