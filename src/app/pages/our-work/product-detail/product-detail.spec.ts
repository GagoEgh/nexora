import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlSegment, type Route } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { provideAppRouter } from '../../../app.config';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { OUR_WORK_SEGMENT } from '../../../core/routing/paths';
import { DocumentMetaOverride } from '../../../core/seo/document-meta-override';
import { PRODUCT_IDS, matchProductSlug } from '../products/data/product-ids';
import { PRODUCT_META } from '../products/data/product-meta';
import { ProductDetail } from './product-detail';
const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const FIRST = PRODUCT_IDS[0];
const SECOND = PRODUCT_IDS[1];
const LAST = PRODUCT_IDS[PRODUCT_IDS.length - 1];
/**
 * One parameterised route stands behind fifty-seven prerendered pages, so the things worth
 * pinning are the ones that differ per slug: which product is shown, what the document head is
 * told about it, and what happens to a slug that is not a product at all.
 */
describe('ProductDetail', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, ProductDetail);
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await harness.fixture.whenStable();
    root = harness.routeNativeElement as HTMLElement;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideAppRouter(),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the product named by the slug, under a single h1', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Draculai');
    expect(root.querySelector('.product__meta-value')?.textContent?.trim()).not.toBe('');
  });

  it('finishes the breadcrumb trail with the product itself', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const crumbs = text('.page-intro__crumb');
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0]).toBe('Home');
    expect(crumbs[2]).toBe('Draculai');
    expect(
      root.querySelectorAll('.page-intro__crumb')[2].getAttribute('aria-current'),
      'the current page is not a link',
    ).toBe('page');
  });

  /**
   * `provideDocumentMeta` is the only writer of the document head, and it reads this override.
   * A component that set the title itself would be overwritten on the next navigation.
   */
  it('hands the document head this product title and hook', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const override = TestBed.inject(DocumentMetaOverride).value();
    expect(override?.title).toContain('Draculai');
    // The site suffix every other page carries, so the product pages match them.
    expect(override?.title).toMatch(/ \| Nexora$/);
    expect(override?.description).toBe(
      root.querySelector('.page-intro__lead')?.textContent?.trim(),
    );
    // The structured breadcrumb wants the product, not the document title.
    expect(override?.breadcrumb).toBe('Draculai');
  });

  /**
   * Twenty of these are brand names that read identically in all three locales. A title of
   * the name alone would give each product's own hreflang alternates the same title, which is
   * what `verify-seo` fails the build over.
   */
  it('distinguishes a product title between locales', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    const english = TestBed.inject(DocumentMetaOverride).value()?.title;

    setLocale('ru');
    await go(`/ru/${OUR_WORK_SEGMENT}/${FIRST}`);
    const russian = TestBed.inject(DocumentMetaOverride).value()?.title;

    expect(russian).not.toBe(english);
    expect(russian).toContain('Draculai');
  });

  it('replaces the override when navigating straight to another product', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    await go(`/${OUR_WORK_SEGMENT}/${SECOND}`);

    expect(TestBed.inject(DocumentMetaOverride).value()?.title).toContain(
      root.querySelector('h1')?.textContent?.trim(),
    );
    expect(TestBed.inject(DocumentMetaOverride).value()?.breadcrumb).toBe(
      root.querySelector('h1')?.textContent?.trim(),
    );
  });

  /**
   * The page has no separate hero picture any more: the introduction carries the words and the
   * gallery carries every photograph, the first one included. That first slide is this page's
   * LCP image, which is why it alone is not deferred.
   */
  it('hands the gallery every photograph, the first one eagerly', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const slides = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    expect(slides).toHaveLength(PRODUCT_META[FIRST].photos.length);
    expect(slides[0].getAttribute('src')).toBe('images/medical.webp');
    // A source under `assets/images/products` would be the illustration this page stopped using.
    expect(slides[0].getAttribute('src')).not.toContain('assets/images/products');
    expect(slides[0].getAttribute('fetchpriority')).toBe('high');
    expect(slides[0].hasAttribute('loading'), 'the LCP image must not be deferred').toBe(false);
    expect(Number(slides[0].getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(slides[0].getAttribute('height'))).toBeGreaterThan(0);
    expect(
      root.querySelector('.product__hero-img'),
      'the introduction no longer carries a picture of its own',
    ).toBeNull();
  });

  it('shows every photograph of a product with several, deferring all but the first', async () => {
    await go(`/${OUR_WORK_SEGMENT}/libra-analytics`);

    const photos = PRODUCT_META['libra-analytics'].photos;
    expect(photos, 'libra-analytics is the fixture for this test').toHaveLength(5);

    const slides = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    expect(slides.map((slide) => slide.getAttribute('src'))).toEqual(
      photos.map((photo) => `images/${photo.file}`),
    );
    for (const [index, slide] of slides.entries()) {
      if (index === 0) {
        continue;
      }
      expect(slide.getAttribute('loading'), `slide ${index}`).toBe('lazy');
      expect(slide.getAttribute('fetchpriority'), `slide ${index}`).toBeNull();
    }

    // One thumbnail per photograph, exactly one of them current.
    expect(root.querySelectorAll('.gallery__thumb-button')).toHaveLength(photos.length);
    expect(root.querySelectorAll('.gallery__thumb-button[aria-current="true"]')).toHaveLength(1);
  });

  /*
   * There was a test here for a product with a single photograph. Every product in the registry
   * now carries at least two, so the state it asserted cannot be reached through any route and
   * the test could only have been made to pass by weakening what it claimed. The branch itself
   * is still covered, and more closely than this test managed, by `product-gallery.spec.ts`,
   * which hands the component a one-element array directly instead of hunting the registry for
   * a product that happens to be shaped right.
   */

  /**
   * The `sizes` attribute is per photograph, not per page: the stage contains each picture at
   * its own ratio, so a 454x679 phone screenshot is laid out far narrower than an 860x645
   * desktop one at the same band height. Capping each at its own intrinsic width is what stops
   * the browser reaching for a ladder step that holds no more detail.
   */
  it('sizes every slide by its own shape, and never past the detail it carries', async () => {
    await go(`/${OUR_WORK_SEGMENT}/mezave`);

    const photos = PRODUCT_META.mezave.photos;
    expect(
      new Set(photos.map((photo) => photo.width > photo.height)).size,
      'mezave is the fixture because its photographs are not one shape',
    ).toBe(2);

    const slides = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    const sizes = slides.map((slide) => slide.getAttribute('sizes') ?? '');
    expect(new Set(sizes).size, 'differently shaped pictures ask for different widths').toBe(
      photos.length,
    );
    for (const [index, value] of sizes.entries()) {
      expect(value, `slide ${index}`).toContain(`${photos[index].width}px`);
      expect(value, `slide ${index} starts at no window size class`).toMatch(/^\(min-width/);
    }
  });

  /**
   * Every photograph on the page carries a description, hero included. `photoAlts` being
   * required makes a product with none a compile error, and `product-content.spec.ts` pins the
   * count and the wording - what is left for here is the rendering path, where `toImages()`
   * still falls back to `''` for an index the array does not reach.
   */
  it('describes every photograph it renders, on every product', async () => {
    for (const id of PRODUCT_IDS) {
      await go(`/${OUR_WORK_SEGMENT}/${id}`);

      const alts = Array.from(root.querySelectorAll('.gallery__img')).map(
        (shot) => shot.getAttribute('alt') ?? '',
      );

      expect(alts, `${id} renders no photograph`).not.toHaveLength(0);
      expect(alts.length, `${id} renders fewer images than it has photographs`).toBe(
        PRODUCT_META[id].photos.length,
      );
      for (const [index, alt] of alts.entries()) {
        expect(alt.length, `${id} photograph ${index} renders alt=""`).toBeGreaterThan(0);
      }
      expect(new Set(alts).size, `${id} repeats a description`).toBe(alts.length);
    }
  });

  /**
   * A description that repeats the heading tells a screen reader nothing the `h1` has not
   * already said. `lav` is the fixture because it is the shortest product name in the set, so
   * an accidental `alt="Lav"` would read as plausible.
   */
  it('does not let a description fall back to the product name', async () => {
    await go(`/${OUR_WORK_SEGMENT}/lav`);

    const heading = root.querySelector('h1')?.textContent?.trim().toLowerCase() ?? '';
    const alts = Array.from(root.querySelectorAll('img')).map(
      (image) => image.getAttribute('alt')?.trim().toLowerCase() ?? '',
    );
    expect(heading).toBe('lav');
    for (const alt of alts) {
      expect(alt, 'the description repeats the heading').not.toBe(heading);
    }
  });

  /**
   * The structured data a product page carries beyond the page itself. Deliberately without a
   * creator: `product.content.ts` says why nothing here claims authorship, and a machine-read
   * claim is the last place to start making one.
   */
  it('describes the product as a work, without claiming to have made it', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const work = TestBed.inject(DocumentMetaOverride).value()?.work;
    expect(work, 'the page supplies no work').toBeDefined();
    expect(work?.name).toBe('Draculai');
    expect(work?.description).not.toBe('');
    expect(work?.category).not.toBe('');
    expect(work?.image).toMatch(/^https?:\/\/.+\/images\/medical\.webp$/);
    expect(work?.url).toMatch(/^https:\/\//);

    expect(
      Object.keys(work ?? {}),
      'a work that names a creator would claim authorship',
    ).not.toContain('creator');

    // `connected-car` has no destination that can be opened, so it states none.
    await go(`/${OUR_WORK_SEGMENT}/connected-car`);
    expect(TestBed.inject(DocumentMetaOverride).value()?.work?.url).toBeUndefined();
  });

  /**
   * Category and platform are the product's metadata, read as one block of facts rather than
   * two stray lines. Four of the twenty have no platform on record and state none, which is
   * the alternative to guessing at a stack - so the block is one item there and two here.
   */
  it('states the platform beside the category, and only when one is known', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(text('.product__meta-label').every((label) => label !== '')).toBe(true);
    expect(text('.product__meta-value')).toEqual([
      'Health & substance tracking',
      'iOS · App Store',
    ]);

    await go(`/${OUR_WORK_SEGMENT}/casamance`);
    expect(root.querySelectorAll('.product__meta-item')).toHaveLength(1);
  });

  it('lists the product capabilities as a numbered set', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(text('.product__feature-text')).toHaveLength(4);
    expect(text('.product__feature-index')).toEqual(['1', '2', '3', '4']);
  });

  it('offers the next product, and wraps round at the end of the portfolio', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    expect(root.querySelector('.product-next__link')?.getAttribute('href')).toBe(
      `/${OUR_WORK_SEGMENT}/${SECOND}`,
    );

    await go(`/${OUR_WORK_SEGMENT}/${LAST}`);
    expect(root.querySelector('.product-next__link')?.getAttribute('href')).toBe(
      `/${OUR_WORK_SEGMENT}/${FIRST}`,
    );
  });

  it('marks an outward link as opening a new tab, safely', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const external = root.querySelector('a[target="_blank"]') as HTMLAnchorElement;
    expect(external.getAttribute('rel')).toContain('noopener');
    expect(external.getAttribute('href')).toMatch(/^https:\/\//);
    expect(external.querySelector('.product__sr')?.textContent ?? '').not.toBe('');
  });

  /**
   * Only the twenty known slugs are prerendered, so this is reached by a hand-typed or stale
   * URL. Showing an empty page there would be indexed as a thin page on a real URL.
   *
   * `matchProductSlug` is what decides it: the product route does not match, the router falls
   * through to the wildcard, and the 404 renders at the address the visitor typed. There is no
   * redirect any more, so the router's URL and the browser's address are the same thing -
   * where the component used to navigate to `/not-found` and then mask it with
   * `skipLocationChange`.
   */
  it('leaves an unknown slug to the 404, at the address it was typed at', async () => {
    const url = `/${OUR_WORK_SEGMENT}/not-a-product`;
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe(url);
    expect(TestBed.inject(Location).path()).toBe(url);

    const app = harness.fixture.nativeElement as HTMLElement;
    expect(app.querySelector('app-not-found')).not.toBeNull();
    expect(app.querySelector('.product')).toBeNull();
  });

  /**
   * The guard is a routing concern, so it is pinned on the route table rather than through the
   * component: every known slug matches, and the shapes that are not a product do not.
   */
  it('matches every product slug and nothing else', () => {
    const segments = (path: string) => path.split('/').map((p) => new UrlSegment(p, {}));
    // `CanMatchFn` also receives the route snapshot, which this guard does not read. Narrowing
    // to the two arguments it implements is what lets the test call it without building one.
    const guard = matchProductSlug as (route: Route, segments: UrlSegment[]) => boolean;
    const match = (path: string) =>
      TestBed.runInInjectionContext(() => guard({ path: ':slug' }, segments(path)));

    for (const id of PRODUCT_IDS) {
      expect(match(id), id).toBe(true);
    }
    expect(match('not-a-product'), 'an unknown slug').toBe(false);
    expect(match(''), 'an empty segment').toBe(false);
    expect(match('draculai/extra'), 'a deeper path').toBe(false);
    expect(match('DRACULAI'), 'the wrong case').toBe(false);
  });

  it('translates the page and keeps the locale prefix on its links', async () => {
    setLocale('ru');
    await go(`/ru/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/ru');
    expect(root.querySelector('.product-next__link')?.getAttribute('href')).toBe(
      `/ru/${OUR_WORK_SEGMENT}/${SECOND}`,
    );
    expect(text('.product__section-title')[0]).not.toBe('');
  });

  /**
   * The override outliving the page would leave the next route wearing a product's title.
   */
  it('gives the document head back when the page is left', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    expect(TestBed.inject(DocumentMetaOverride).value()).toBeDefined();

    await harness.navigateByUrl(`/${OUR_WORK_SEGMENT}`);
    await harness.fixture.whenStable();

    expect(TestBed.inject(DocumentMetaOverride).value()).toBeUndefined();
  });
});
