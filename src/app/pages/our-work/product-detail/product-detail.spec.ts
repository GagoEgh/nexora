import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { OUR_WORK_SEGMENT } from '../../../core/routing/paths';
import { DocumentMetaOverride } from '../../../core/seo/document-meta-override';
import { PRODUCT_IDS } from '../products/data/product-ids';
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
        provideRouter(routes),
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
    expect(root.querySelector('.product__category')?.textContent?.trim()).not.toBe('');
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
   * Nineteen of these are brand names that read identically in all three locales. A title of
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
   * The hero is the product's own photograph, the same file the card shows, and it is the LCP
   * image on this page. Nothing on it is generated: a source under `assets/images/products`
   * would be the illustration this page stopped using.
   */
  it('renders the product photograph as the hero, loaded eagerly', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    const hero = root.querySelector('.product__hero-img') as HTMLImageElement;
    expect(hero.getAttribute('src')).toBe('images/medical.webp');
    expect(hero.getAttribute('src')).not.toContain('assets/images/products');
    expect(hero.getAttribute('fetchpriority')).toBe('high');
    expect(hero.hasAttribute('loading'), 'the LCP image must not be deferred').toBe(false);
    expect(Number(hero.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(hero.getAttribute('height'))).toBeGreaterThan(0);
  });

  /**
   * The gallery is `photos` past the first, so a product with one photograph has none - which
   * is most of them. Nothing is invented to fill it: the experience section runs as copy alone
   * rather than holding an empty column open beside it.
   */
  it('shows no gallery while a product has only its one photograph', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(root.querySelector('.product__gallery')).toBeNull();
    expect(root.querySelectorAll('.product__shot-img')).toHaveLength(0);
    expect(
      root
        .querySelector('.product__experience')
        ?.classList.contains('product__experience--gallery'),
    ).toBe(false);
    // No caption either: a caption exists to say what a picture is, and there is no longer a
    // generated composition here to disclaim.
    expect(root.querySelectorAll('.product__caption')).toHaveLength(0);
  });

  /**
   * The other half of that claim, on the one product that has original photographs today. The
   * figures come from the registry, in order, and each is deferred - they are below the fold -
   * and declared at its own size, so the page does not shift as they arrive.
   */
  it('renders every photograph past the first as the gallery', async () => {
    await go(`/${OUR_WORK_SEGMENT}/lav`);

    const gallery = PRODUCT_META['lav'].photos.slice(1);
    expect(gallery.length, 'lav is the fixture for this test').toBeGreaterThan(1);

    const shots = Array.from(root.querySelectorAll<HTMLImageElement>('.product__shot-img'));
    expect(shots).toHaveLength(gallery.length);
    expect(shots.map((shot) => shot.getAttribute('src'))).toEqual(
      gallery.map((photo) => `images/${photo.file}`),
    );

    for (const [index, shot] of shots.entries()) {
      expect(shot.getAttribute('loading'), `shot ${index}`).toBe('lazy');
      expect(shot.getAttribute('decoding'), `shot ${index}`).toBe('async');
      expect(shot.getAttribute('width'), `shot ${index}`).toBe(String(gallery[index].width));
      expect(shot.getAttribute('height'), `shot ${index}`).toBe(String(gallery[index].height));
    }

    expect(
      root
        .querySelector('.product__experience')
        ?.classList.contains('product__experience--gallery'),
    ).toBe(true);
  });

  /**
   * A photograph that shows something the page does not say in words carries a description of
   * it. The heading is not repeated there, and a product with no description keeps `alt=""`,
   * which is what marks an image decorative rather than unlabelled.
   */
  it('describes the photographs that have a description, and no others', async () => {
    await go(`/${OUR_WORK_SEGMENT}/lav`);

    const alts = [
      root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
      ...Array.from(root.querySelectorAll('.product__shot-img')).map(
        (shot) => shot.getAttribute('alt') ?? '',
      ),
    ];
    expect(
      alts.every((alt) => alt.length > 0),
      'every lav photograph is described',
    ).toBe(true);
    expect(new Set(alts).size, 'two photographs share one description').toBe(alts.length);
    for (const alt of alts) {
      expect(alt.toLowerCase(), 'the description repeats the heading').not.toBe('lav');
    }

    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    expect(root.querySelector('.product__hero-img')?.getAttribute('alt')).toBe('');
  });

  /**
   * Technology is one chip, carrying the only technical fact on record. Four of the nineteen
   * have no platform and render no chip, which is the alternative to guessing at a stack.
   */
  it('states the platform in a single chip, and only when one is known', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(root.querySelector('.product__tech-value')?.textContent?.trim()).toBe('iOS · App Store');
    expect(root.querySelector('.product__tech-label')?.textContent?.trim()).not.toBe('');
    expect(root.querySelectorAll('.product__tech-chip')).toHaveLength(1);

    await go(`/${OUR_WORK_SEGMENT}/casamance`);
    expect(root.querySelector('.product__tech-chip')).toBeNull();
  });

  it('lists the product capabilities as a numbered set', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(text('.product__feature-text')).toHaveLength(4);
    expect(text('.product__feature-index')).toEqual(['1', '2', '3', '4']);
  });

  it('offers the next product, and wraps round at the end of the portfolio', async () => {
    await go(`/${OUR_WORK_SEGMENT}/${FIRST}`);
    expect(root.querySelector('.product__next-link')?.getAttribute('href')).toBe(
      `/${OUR_WORK_SEGMENT}/${SECOND}`,
    );

    await go(`/${OUR_WORK_SEGMENT}/${LAST}`);
    expect(root.querySelector('.product__next-link')?.getAttribute('href')).toBe(
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
   * Only the nineteen known slugs are prerendered, so this is reached by a hand-typed or stale
   * URL. Showing an empty page there would be indexed as a thin page on a real URL.
   */
  it('sends an unknown slug to the 404 without changing the address', async () => {
    await harness.navigateByUrl(`/${OUR_WORK_SEGMENT}/not-a-product`);
    await harness.fixture.whenStable();

    // The router ends up on the 404, but `skipLocationChange` leaves the address the visitor
    // typed, so a reload retries the real URL rather than silently becoming /not-found.
    expect(TestBed.inject(Router).url).toBe('/not-found');
    expect(TestBed.inject(Location).path()).toBe(`/${OUR_WORK_SEGMENT}/not-a-product`);

    const app = harness.fixture.nativeElement as HTMLElement;
    expect(app.querySelector('app-not-found')).not.toBeNull();
    expect(app.querySelector('.product')).toBeNull();
  });

  it('translates the page and keeps the locale prefix on its links', async () => {
    setLocale('ru');
    await go(`/ru/${OUR_WORK_SEGMENT}/${FIRST}`);

    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/ru');
    expect(root.querySelector('.product__next-link')?.getAttribute('href')).toBe(
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
