import type { Route, Routes } from '@angular/router';
import { routes } from '../../app.routes';
import {
  DOCUMENT_META_PAGES,
  isDocumentMetaPage,
  pagePath,
  type DocumentMetaPage,
} from './document-meta';

/**
 * The route table and `DOCUMENT_META_PAGES` are two separate lists of strings that have to say
 * the same thing, and nothing in the type system makes them. `data.meta` is typed
 * `DocumentMetaRouteData`, so `satisfies` only checks that the value is *a* member of the
 * union - it cannot tell that the `our_work` route was carrying `'not-found'`, which is how
 * that page shipped deindexed, titled "Page not found", with its own dictionary entry unused.
 *
 * The same pair also drives the prerender: `app.routes.server.ts` builds the localized URLs
 * from `DOCUMENT_META_PAGES`, so an id that no route matches is prerendered as a 200-OK copy
 * of the 404 page, with a canonical pointing at itself.
 *
 * These assert the bijection directly: every page id names a route, every route names a page
 * id, and the id agrees with the path it is served at.
 */

/** Every leaf route under the locale-less branch, as `path` and `data.meta`. */
function leaves(table: Routes, prefix = ''): { path: string; meta: unknown }[] {
  const found: { path: string; meta: unknown }[] = [];

  for (const route of table) {
    const segment = route.path ?? '';
    const path = [prefix, segment].filter(Boolean).join('/');

    if (route.children) {
      found.push(...leaves(route.children, path));
      continue;
    }
    found.push({ path, meta: route.data?.['meta'] });
  }

  return found;
}

/**
 * The locale-less branch of the table - the second entry, whose `path` is `''`. The first is
 * the `:locale` branch and renders the same `children`, so reading one of them is enough.
 */
const localeless = routes.find((route: Route) => route.path === '');
const pages = leaves(localeless?.children ?? []);

/** `**` is the catch-all; it answers at every unmatched URL rather than at a path of its own. */
const realPages = pages.filter((page) => page.path !== '**');

/**
 * `home` is the one id that is not its own route path: it is served at `''` and `pagePath()`
 * turns it into `/`. Mapping it here keeps that single exception in one place instead of
 * special-casing it inside each assertion - and it is asserted on its own below.
 */
const pathForId = (page: DocumentMetaPage): string => (page === 'home' ? '' : page);

describe('the route table and the document-meta page list', () => {
  it('finds the route table it is asserting about', () => {
    // A restructure that moves the pages out of this branch would otherwise make every
    // assertion below pass vacuously against an empty list.
    expect(localeless, 'no locale-less branch in app.routes.ts').toBeDefined();
    expect(realPages.length).toBeGreaterThanOrEqual(DOCUMENT_META_PAGES.length);
  });

  it('gives every route a meta id that exists', () => {
    const unknown = realPages
      .filter((page) => !isDocumentMetaPage(page.meta))
      .map((page) => `/${page.path} -> ${JSON.stringify(page.meta)}`);

    expect(unknown, 'these routes carry a meta id that is not in DOCUMENT_META_PAGES').toEqual([]);
  });

  /**
   * The assertion that would have caught the `our_work` regression: the id a route carries has
   * to be the path that route is served at, not merely *some* valid id.
   *
   * A parameterised child is the one allowed exception. `/our_work/:slug` carries `our_work`
   * because `DOCUMENT_META_PAGES` has one entry per page and cannot hold twenty-seven product
   * titles; the product supplies its own through `DocumentMetaOverride`, while the canonical
   * and the hreflang set are built from the URL and so are already the product's own. The
   * exception is deliberately narrow: only a direct `:param` child of the id it carries.
   */
  it('gives every route the meta id matching its own path', () => {
    const mismatched = realPages
      .filter((page) => {
        if (!isDocumentMetaPage(page.meta)) {
          return true;
        }
        const own = pathForId(page.meta);
        return page.path !== own && !/^:[^/]+$/.test(page.path.slice(own.length + 1));
      })
      .map((page) => `/${page.path} carries '${String(page.meta)}'`);

    expect(mismatched, 'a route is describing itself as a different page').toEqual([]);
  });

  it('allows a parameterised child only directly under the page whose id it carries', () => {
    const parameterised = realPages.filter((page) => page.path.includes('/:'));
    expect(parameterised.map((page) => page.path)).toEqual(['our_work/:slug']);

    for (const page of parameterised) {
      // It must sit under its own id, not borrow an unrelated one.
      expect(page.path.startsWith(`${pathForId(page.meta as DocumentMetaPage)}/`), page.path).toBe(
        true,
      );
    }
  });

  it('has a route for every page in DOCUMENT_META_PAGES', () => {
    const routed = new Set(realPages.map((page) => page.path));
    const orphans = DOCUMENT_META_PAGES.filter((page) => !routed.has(pathForId(page)));

    // An orphan is prerendered from `app.routes.server.ts` and resolves to the 404 component.
    expect(orphans, 'these page ids are prerendered but match no route').toEqual([]);
  });

  it('builds each page path from its id the way the sitemap and canonicals do', () => {
    for (const page of DOCUMENT_META_PAGES) {
      const expected = page === 'home' ? '/' : `/${page}`;
      expect(pagePath(page), page).toBe(expected);
    }
  });

  it('routes the home page at the empty path', () => {
    // `pagePath('home')` is `/`, which is the one id that is not its own route path.
    const home = realPages.find((page) => page.meta === ('home' satisfies DocumentMetaPage));
    expect(home?.path).toBe('');
  });
});
