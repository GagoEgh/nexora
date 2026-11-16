import { RenderMode, type ServerRoute } from '@angular/ssr';
import { defaultLocale, locales } from 'intlayer';
import { DOCUMENT_META_PAGES } from './core/seo/document-meta';
import { OUR_WORK_SEGMENT } from './core/routing/paths';
import { PRODUCT_IDS } from './pages/our-work/products/data/product-ids';

const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);
const pageSegments = DOCUMENT_META_PAGES.map((page) => (page === 'home' ? '' : page));

const localeHomes = () => Promise.resolve(prefixedLocales.map((locale) => ({ locale })));
const localisedPages = () =>
  Promise.resolve(
    prefixedLocales.flatMap((locale) =>
      pageSegments.filter(Boolean).map((segment) => ({ locale, '**': segment })),
    ),
  );

const productParams = () => Promise.resolve(PRODUCT_IDS.map((slug) => ({ slug })));
const localisedProductParams = () =>
  Promise.resolve(
    prefixedLocales.flatMap((locale) => PRODUCT_IDS.map((slug) => ({ locale, slug }))),
  );

export const serverRoutes: ServerRoute[] = [
  {
    path: `${OUR_WORK_SEGMENT}/:slug`,
    renderMode: RenderMode.Prerender,
    getPrerenderParams: productParams,
  },
  {
    path: `:locale/${OUR_WORK_SEGMENT}/:slug`,
    renderMode: RenderMode.Prerender,
    getPrerenderParams: localisedProductParams,
  },
  { path: ':locale', renderMode: RenderMode.Prerender, getPrerenderParams: localeHomes },
  { path: ':locale/**', renderMode: RenderMode.Prerender, getPrerenderParams: localisedPages },
  { path: 'not-found', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },
];
