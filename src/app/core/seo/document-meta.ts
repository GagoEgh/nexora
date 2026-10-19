import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, effect, inject, provideEnvironmentInitializer } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { useIntlayer, useLocale } from 'angular-intlayer';
import { defaultLocale, getMultilingualUrls, getPathWithoutLocale } from 'intlayer';
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

export function provideDocumentMeta(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const router = inject(Router);
    const title = inject(Title);
    const meta = inject(Meta);
    const document = inject(DOCUMENT);
    const content = useIntlayer('document-meta');
    const locale = useLocale().locale;
    const route = toSignal(
      router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => ({
          page: activePage(router.routerState.snapshot.root),
          path: new URL(router.url, document.location.origin).pathname,
        })),
      ),
    );

    const link = (rel: string, hreflang?: string): HTMLLinkElement => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let element = document.head.querySelector<HTMLLinkElement>(selector);
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        if (hreflang) {
          element.hreflang = hreflang;
        }
        document.head.append(element);
      }
      return element;
    };

    effect(() => {
      const current = route();
      if (!current?.page) {
        return;
      }
      const entry = content().pages[current.page];
      const origin = document.location.origin;
      const alternates = getMultilingualUrls(getPathWithoutLocale(current.path));
      const canonical = origin + alternates[locale()];

      title.setTitle(entry.title.value);
      meta.updateTag({ name: 'description', content: entry.description.value });
      meta.updateTag({ property: 'og:title', content: entry.title.value });
      meta.updateTag({ property: 'og:description', content: entry.description.value });
      meta.updateTag({ property: 'og:locale', content: OG_LOCALES[locale()] });
      meta.updateTag({ property: 'og:url', content: canonical });
      link('canonical').href = canonical;
      for (const [alternate, path] of Object.entries(alternates)) {
        link('alternate', alternate).href = origin + path;
      }
      link('alternate', 'x-default').href = origin + alternates[defaultLocale];
    });
  });
}
