import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, effect, inject, provideEnvironmentInitializer } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { useDictionary, useLocale } from 'angular-intlayer';
import {
  defaultLocale,
  getLocalizedUrl,
  getMultilingualUrls,
  getPathWithoutLocale,
} from 'intlayer';
import { filter, map } from 'rxjs';
import type { AppLocale } from '../i18n/locale-labels';
import documentMetaContent from './document-meta.content';
import { ORGANIZATION } from './organization';
import { SITE_ORIGIN } from './site-origin';

export const DOCUMENT_META_PAGES = [
  'home',
  'services',
  'services/ai_agent',
  'solutions',
  'about',
  'engagement-models',
  'partnerships',
  'contact',
  'not-found',
] as const;

export type DocumentMetaPage = (typeof DOCUMENT_META_PAGES)[number];
export interface DocumentMetaRouteData {
  meta: DocumentMetaPage;
}

export function isDocumentMetaPage(value: unknown): value is DocumentMetaPage {
  return typeof value === 'string' && (DOCUMENT_META_PAGES as readonly string[]).includes(value);
}

const PARSE_BASE = 'http://nexora.invalid';
const OG_LOCALES: Readonly<Record<AppLocale, string>> = { en: 'en_US', hy: 'hy_AM', ru: 'ru_RU' };
const OG_IMAGE = { path: '/brand/og-cover.png', width: '1200', height: '630' } as const;

export function pagePath(page: string): string {
  return page === 'home' ? '/' : `/${page}`;
}

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
    const origin = inject(SITE_ORIGIN);
    const content = useDictionary(documentMetaContent);
    const locale = useLocale().locale;
    const route = toSignal(
      router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => ({
          page: activePage(router.routerState.snapshot.root),
          path: new URL(router.url, PARSE_BASE).pathname,
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
        document.head.appendChild(element);
      }
      return element;
    };

    const jsonLd = (): HTMLScriptElement => {
      let element = document.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      );
      if (!element) {
        element = document.createElement('script');
        element.type = 'application/ld+json';
        document.head.appendChild(element);
      }
      return element;
    };

    const breadcrumbItems = (page: DocumentMetaPage) => {
      if (page === 'home') {
        return [];
      }
      const names = content().breadcrumbs;
      const named = (value: string): value is keyof typeof names => value in names;
      const segments = page.split('/');
      return segments
        .map((_, index) => segments.slice(0, index + 1).join('/'))
        .filter(named)
        .map((key) => ({ name: names[key].value, path: pagePath(key) }));
    };

    effect(() => {
      const current = route();
      if (!current?.page) {
        return;
      }
      const entry = content().pages[current.page];
      const alternates = getMultilingualUrls(getPathWithoutLocale(current.path));
      const canonical = origin + alternates[locale()];

      title.setTitle(entry.title.value);
      meta.updateTag({ name: 'description', content: entry.description.value });
      meta.updateTag({ property: 'og:title', content: entry.title.value });
      meta.updateTag({ property: 'og:description', content: entry.description.value });
      meta.updateTag({ property: 'og:locale', content: OG_LOCALES[locale()] });
      meta.updateTag({ property: 'og:url', content: canonical });
      meta.updateTag({ property: 'og:image', content: origin + OG_IMAGE.path });
      meta.updateTag({ property: 'og:image:width', content: OG_IMAGE.width });
      meta.updateTag({ property: 'og:image:height', content: OG_IMAGE.height });
      meta.updateTag({ property: 'og:image:alt', content: ORGANIZATION.name });
      link('canonical').href = canonical;
      for (const [alternate, path] of Object.entries(alternates)) {
        link('alternate', alternate).href = origin + path;
      }
      link('alternate', 'x-default').href = origin + alternates[defaultLocale];

      const organizationId = `${origin}/#organization`;
      const graph: Record<string, unknown>[] = [
        {
          '@type': 'Organization',
          '@id': organizationId,
          name: ORGANIZATION.name,
          url: `${origin}/`,
          logo: origin + ORGANIZATION.logoPath,
          email: ORGANIZATION.email,
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: ORGANIZATION.name,
          url: `${origin}/`,
          publisher: { '@id': organizationId },
          inLanguage: locale(),
        },
      ];

      const trail = breadcrumbItems(current.page);
      if (trail.length > 0) {
        graph.push({
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: content().breadcrumbs.home.value,
              item: origin + getLocalizedUrl('/', locale()),
            },
            ...trail.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: crumb.name,
              item: origin + getLocalizedUrl(crumb.path, locale()),
            })),
          ],
        });
      }

      jsonLd().textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    });
  });
}
