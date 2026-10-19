import { EnvironmentProviders, effect, inject, provideEnvironmentInitializer } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { useIntlayer, useLocale } from 'angular-intlayer';
import { filter, map } from 'rxjs';
import type { AppLocale } from '../i18n/locale-labels';

export const DOCUMENT_META_PAGES = [
  'home',
  'services',
  'solutions',
  'about',
  'partnerships',
  'contact',
  'privacy-policy',
  'terms-of-use',
] as const;

export type DocumentMetaPage = (typeof DOCUMENT_META_PAGES)[number];
export interface DocumentMetaRouteData {
  meta: DocumentMetaPage;
}

export function isDocumentMetaPage(value: unknown): value is DocumentMetaPage {
  return typeof value === 'string' && (DOCUMENT_META_PAGES as readonly string[]).includes(value);
}

const OG_LOCALES: Readonly<Record<AppLocale, string>> = { en: 'en_US', hy: 'hy_AM', ru: 'ru_RU' };

function activePage(root: ActivatedRouteSnapshot): DocumentMetaPage | undefined {
  let page: unknown;
  for (let node: ActivatedRouteSnapshot | null = root; node; node = node.firstChild) {
    if ('meta' in node.data) {
      page = node.data['meta'];
    }
  }
  return isDocumentMetaPage(page) ? page : undefined;
}

/**
 * Keeps the document title, description and Open Graph tags in sync with the active route and
 * the active locale. Routes opt in through `data: { meta }`; the copy lives in the
 * `document-meta` dictionary. Until the first navigation completes, `index.html` provides the
 * baseline values.
 */
export function provideDocumentMeta(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const router = inject(Router);
    const title = inject(Title);
    const meta = inject(Meta);
    const content = useIntlayer('document-meta');
    const locale = useLocale().locale;
    const page = toSignal(
      router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => activePage(router.routerState.snapshot.root)),
      ),
    );

    effect(() => {
      const current = page();
      if (!current) {
        return;
      }
      const entry = content().pages[current];
      title.setTitle(entry.title.value);
      meta.updateTag({ name: 'description', content: entry.description.value });
      meta.updateTag({ property: 'og:title', content: entry.title.value });
      meta.updateTag({ property: 'og:description', content: entry.description.value });
      meta.updateTag({ property: 'og:locale', content: OG_LOCALES[locale()] });
    });
  });
}
