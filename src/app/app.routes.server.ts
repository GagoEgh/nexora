import { RenderMode, type ServerRoute } from '@angular/ssr';
import { defaultLocale, locales } from 'intlayer';
import { DOCUMENT_META_PAGES } from './core/seo/document-meta';

const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);
const pageSegments = DOCUMENT_META_PAGES.map((page) => (page === 'home' ? '' : page));
const localeHomes = () => Promise.resolve(prefixedLocales.map((locale) => ({ locale })));
const localisedPages = () =>
  Promise.resolve(
    prefixedLocales.flatMap((locale) =>
      pageSegments.filter(Boolean).map((segment) => ({ locale, '**': segment })),
    ),
  );

export const serverRoutes: ServerRoute[] = [
  { path: ':locale', renderMode: RenderMode.Prerender, getPrerenderParams: localeHomes },
  { path: ':locale/**', renderMode: RenderMode.Prerender, getPrerenderParams: localisedPages },
  { path: '**', renderMode: RenderMode.Prerender },
];
