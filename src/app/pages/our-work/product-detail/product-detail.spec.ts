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
import { GALLERY_ASIDE, GALLERY_COLUMN_MAX, SHOT_MAX_HEIGHT } from './gallery-layout';

/** The shape the section falls back to: copy in a fixed column, gallery in the rest. */
const COPY_BESIDE_GALLERY = `minmax(0, ${GALLERY_ASIDE}px) minmax(0, 1fr)`;

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
    expect(root.querySelectorAll('.gallery__img')).toHaveLength(0);
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

    const shots = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
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
   * A pair of photographs that are not the same shape. Equal columns would leave the row ragged
   * - the square runs half as tall again as a 3:2 beside it - so the component hands the grid
   * column widths in proportion to the ratios, and the heights come out level. What that looks
   * like is measured in a browser; what belongs here is that the proportions are actually
   * published to the stylesheet, and that they follow the registry rather than a literal.
   */
  it('sizes a mismatched pair of photographs in proportion to their ratios', async () => {
    await go(`/${OUR_WORK_SEGMENT}/mastercraft`);

    const gallery = PRODUCT_META['mastercraft'].photos.slice(1);
    expect(gallery, 'mastercraft is the fixture for this test').toHaveLength(2);
    expect(
      new Set(gallery.map((photo) => (photo.width / photo.height).toFixed(2))).size,
      'the fixture is only meaningful while the two shapes differ',
    ).toBe(2);

    const list = root.querySelector('.gallery__row') as HTMLElement;
    expect(list.style.getPropertyValue('--nx-gallery-columns')).toBe(
      gallery.map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`).join(' '),
    );

    const shots = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    expect(shots.map((shot) => shot.getAttribute('src'))).toEqual(
      gallery.map((photo) => `images/${photo.file}`),
    );
    // The hero is the storefront; `master-grading.webp` is deliberately not `master.webp`,
    // which would have collided with it in `public/images`.
    expect(root.querySelector('.product__hero-img')?.getAttribute('src')).toBe(
      'images/master.webp',
    );
    expect(
      [
        root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
        ...shots.map((shot) => shot.getAttribute('alt') ?? ''),
      ].every((alt) => alt.length > 0),
      'all three photographs are described',
    ).toBe(true);
  });

  /**
   * The same contract on the second product to carry a mismatched pair, so the proportional
   * sizing is read off the registry rather than fitted to one set of numbers. Got Matcha's
   * shapes are 1.83:1 and 1:1, against Mastercraft's 1.5:1 and 1:1.
   */
  it('reads the gallery proportions from each product, not from a fixed pair', async () => {
    await go(`/${OUR_WORK_SEGMENT}/got-matcha`);

    const gallery = PRODUCT_META['got-matcha'].photos.slice(1);
    expect(gallery).toHaveLength(2);

    const columns = (root.querySelector('.gallery__row') as HTMLElement).style.getPropertyValue(
      '--nx-gallery-columns',
    );
    expect(columns).toBe(
      gallery.map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`).join(' '),
    );
    expect(columns, 'these are not Mastercraft’s proportions').not.toBe(
      PRODUCT_META['mastercraft'].photos
        .slice(1)
        .map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`)
        .join(' '),
    );

    // The hero keeps `got.webp`; the new pair is named around it rather than over it.
    expect(root.querySelector('.product__hero-img')?.getAttribute('src')).toBe('images/got.webp');
    expect(
      Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img')).map((shot) =>
        shot.getAttribute('src'),
      ),
    ).toEqual(gallery.map((photo) => `images/${photo.file}`));
    expect(
      [
        root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
        ...Array.from(root.querySelectorAll('.gallery__img')).map(
          (shot) => shot.getAttribute('alt') ?? '',
        ),
      ].every((alt) => alt.length > 0),
      'all three photographs are described',
    ).toBe(true);
  });

  /**
   * The importer's page, where the pair is a 16:9 inspection shot beside a 3:2 catalogue shot
   * and the hero stays the client's own warehouse floor. Nothing here is new behaviour - the
   * point of the test is that nothing had to be: a third product with a mismatched pair is a
   * registry entry and three descriptions.
   */
  it('gives the importer its pair in proportion, behind the warehouse hero', async () => {
    await go(`/${OUR_WORK_SEGMENT}/jdm-west-coast`);

    const photos = PRODUCT_META['jdm-west-coast'].photos;
    expect(photos, 'hero plus a pair').toHaveLength(3);

    expect(root.querySelector('.product__hero-img')?.getAttribute('src')).toBe('images/car.webp');
    const shots = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    expect(shots.map((shot) => shot.getAttribute('src'))).toEqual(
      photos.slice(1).map((photo) => `images/${photo.file}`),
    );
    for (const [index, shot] of shots.entries()) {
      expect(Number(shot.getAttribute('width')), `shot ${index}`).toBe(photos[index + 1].width);
      expect(Number(shot.getAttribute('height')), `shot ${index}`).toBe(photos[index + 1].height);
      expect(shot.getAttribute('loading'), `shot ${index}`).toBe('lazy');
    }

    expect(
      (root.querySelector('.gallery__row') as HTMLElement).style.getPropertyValue(
        '--nx-gallery-columns',
      ),
    ).toBe(
      photos
        .slice(1)
        .map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`)
        .join(' '),
    );

    const alts = [
      root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
      ...shots.map((shot) => shot.getAttribute('alt') ?? ''),
    ];
    expect(
      alts.every((alt) => alt.length > 0),
      'all three photographs are described',
    ).toBe(true);
    expect(new Set(alts).size, 'each photograph has its own description').toBe(3);
  });

  /**
   * The degenerate case of the same rule. Hydrant's two photographs are both 3:2, so sizing the
   * columns in proportion to their ratios has to come out as the even split the stylesheet would
   * have given anyway - no special branch for it, and no rounding drift between two shapes that
   * are the same shape.
   */
  it('gives a pair of matching shape an even split', () => {
    const gallery = PRODUCT_META['hydrant'].photos.slice(1);
    expect(gallery, 'hydrant is the fixture for this test').toHaveLength(2);

    const ratios = gallery.map((photo) => photo.width / photo.height);
    expect(Math.abs(ratios[0] - ratios[1]), 'the fixture is the matched case').toBeLessThan(0.01);
  });

  it('lays a matched pair out as two even columns', async () => {
    await go(`/${OUR_WORK_SEGMENT}/hydrant`);

    const gallery = PRODUCT_META['hydrant'].photos.slice(1);
    const columns = (root.querySelector('.gallery__row') as HTMLElement).style.getPropertyValue(
      '--nx-gallery-columns',
    );
    expect(columns).toBe(
      gallery.map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`).join(' '),
    );

    const [first, second] = columns
      .split(' ')
      .filter((part) => part.endsWith('fr)'))
      .map((part) => Number.parseFloat(part));
    expect(Math.abs(first - second), `columns ${columns}`).toBeLessThan(0.01);

    // A pair is one row, which is what it was before rows existed.
    expect(root.querySelectorAll('.gallery__row')).toHaveLength(1);
    expect(
      (root.querySelector('.product__experience') as HTMLElement).style.getPropertyValue(
        '--nx-experience-columns',
      ),
      'a pair still sits beside its copy',
    ).toBe(COPY_BESIDE_GALLERY);
  });

  /**
   * Four photographs, which one grid cannot justify: a row's column widths come from that row's
   * own ratios, and a single `grid-template-columns` applies to every row at once. So the gallery
   * is rows, each sized by its own pair, and past a pair the section gives the gallery the whole
   * width instead of an aside - four dashboards at 390px are not worth showing.
   */
  it('breaks a gallery of four into two rows, each justified on its own pair', async () => {
    await go(`/${OUR_WORK_SEGMENT}/libra-analytics`);

    const gallery = PRODUCT_META['libra-analytics'].photos.slice(1);
    expect(gallery, 'libra-analytics is the fixture for this test').toHaveLength(4);

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.gallery__row'));
    expect(rows).toHaveLength(2);

    for (const [index, row] of rows.entries()) {
      const pair = gallery.slice(index * 2, index * 2 + 2);
      expect(row.style.getPropertyValue('--nx-gallery-columns'), `row ${index}`).toBe(
        pair.map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`).join(' '),
      );
      expect(
        Array.from(row.querySelectorAll<HTMLImageElement>('.gallery__img')).map((shot) =>
          shot.getAttribute('src'),
        ),
        `row ${index}`,
      ).toEqual(pair.map((photo) => `images/${photo.file}`));
    }

    expect(
      rows[0].style.getPropertyValue('--nx-gallery-columns'),
      'each row is sized by its own photographs',
    ).not.toBe(rows[1].style.getPropertyValue('--nx-gallery-columns'));

    expect(
      (root.querySelector('.product__experience') as HTMLElement).style.getPropertyValue(
        '--nx-experience-columns',
      ),
      'past a pair the copy sits above the gallery, not beside it',
    ).toBe('minmax(0, 1fr)');

    const alts = [
      root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
      ...Array.from(root.querySelectorAll('.gallery__img')).map(
        (shot) => shot.getAttribute('alt') ?? '',
      ),
    ];
    expect(alts, 'the hero and all four gallery photographs').toHaveLength(5);
    expect(
      alts.every((alt) => alt.length > 0),
      'every photograph is described',
    ).toBe(true);
    expect(new Set(alts).size, 'each description is its own').toBe(5);
  });

  /**
   * Three photographs, which is the case that decides whether rows are chunks or are balanced.
   * Two and one would leave a single picture under a pair, and a row of one takes the whole
   * width - a wide orphan under a tidy pair. Three go in one row instead, which across the
   * container lays them out between 310 and 470 wide.
   */
  it('puts three photographs in one row rather than a pair and an orphan', async () => {
    await go(`/${OUR_WORK_SEGMENT}/sell-me-watch`);

    const gallery = PRODUCT_META['sell-me-watch'].photos.slice(1);
    expect(gallery, 'sell-me-watch is the fixture for this test').toHaveLength(3);

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.gallery__row'));
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelectorAll('.gallery__img')).toHaveLength(3);
    expect(rows[0].style.getPropertyValue('--nx-gallery-columns')).toBe(
      gallery.map((photo) => `minmax(0, ${(photo.width / photo.height).toFixed(4)}fr)`).join(' '),
    );
    expect(
      (root.querySelector('.product__experience') as HTMLElement).style.getPropertyValue(
        '--nx-experience-columns',
      ),
      'three photographs take the whole width, like four',
    ).toBe('minmax(0, 1fr)');
  });

  /**
   * The first row that mixes orientations: two upright phone screens beside a landscape
   * photograph. Equal columns would have left the landscape short and the portraits towering
   * over it; columns proportional to each ratio give all three the same laid-out height, which
   * is the whole reason the component publishes ratios rather than `repeat(n, 1fr)`. The unit
   * under test is that arithmetic - `our-work.spec.ts` measures the rendered heights.
   */
  it('gives a row of mixed orientations one shared height', async () => {
    await go(`/${OUR_WORK_SEGMENT}/mezave`);

    const gallery = PRODUCT_META.mezave.photos.slice(1);
    expect(gallery, 'mezave is the fixture for this test').toHaveLength(3);
    expect(
      new Set(gallery.map((photo) => photo.width > photo.height)).size,
      'the row mixes upright and landscape photographs',
    ).toBe(2);

    const row = root.querySelector('.gallery__row') as HTMLElement;
    const shares = [
      ...row.style.getPropertyValue('--nx-gallery-columns').matchAll(/minmax\(0,\s*([\d.]+)fr\)/g),
    ].map((column) => Number(column[1]));
    expect(shares).toHaveLength(3);

    const total = shares.reduce((sum, share) => sum + share, 0);
    const heights = gallery.map(
      (photo, index) => ((shares[index] / total) * photo.height) / photo.width,
    );
    for (const height of heights) {
      expect(height).toBeCloseTo(heights[0], 4);
    }
  });

  /**
   * A gallery that is not a pair keeps the stylesheet's own columns, so the proportional sizing
   * cannot leak into the single-photograph layout or into a row of three.
   */
  it('leaves the gallery columns to the stylesheet unless there are exactly two', async () => {
    await go(`/${OUR_WORK_SEGMENT}/robert-irwin`);
    expect(
      (root.querySelector('.gallery__row') as HTMLElement).style.getPropertyValue(
        '--nx-gallery-columns',
      ),
    ).toBe('');
  });

  /**
   * The single-photograph case, which is the one the two-column gallery got wrong: a lone
   * picture was laid out in the first of two columns, at half the width it had been given, and
   * `rings.webp` is 2.54:1 - a strip beside an empty cell. The layout itself is a stylesheet
   * matter that `our-work.spec.ts` measures in a browser; what belongs here is the registry
   * contract under it, which is that one photograph past the hero still makes a gallery.
   */
  it('renders a lone second photograph as the whole gallery, described', async () => {
    await go(`/${OUR_WORK_SEGMENT}/robert-irwin`);

    const gallery = PRODUCT_META['robert-irwin'].photos.slice(1);
    expect(gallery, 'robert-irwin is the fixture for this test').toHaveLength(1);

    const shots = Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
    expect(shots).toHaveLength(1);
    expect(shots[0].getAttribute('src')).toBe(`images/${gallery[0].file}`);
    expect(shots[0].getAttribute('loading')).toBe('lazy');
    expect(shots[0].getAttribute('decoding')).toBe('async');
    expect(Number(shots[0].getAttribute('width'))).toBe(gallery[0].width);
    expect(Number(shots[0].getAttribute('height'))).toBe(gallery[0].height);
    expect(
      root
        .querySelector('.product__experience')
        ?.classList.contains('product__experience--gallery'),
    ).toBe(true);

    // Both of this product's photographs are originals of the work, so both are described.
    const alts = [
      root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
      shots[0].getAttribute('alt') ?? '',
    ];
    expect(
      alts.every((alt) => alt.length > 0),
      'both photographs are described',
    ).toBe(true);
    expect(new Set(alts).size, 'the two photographs share one description').toBe(2);
  });

  /**
   * The other half of the lone-photograph case. Giving the whole column to one picture suits a
   * panorama and overwhelms a near-square: `roar-immune.webp` is 1.12:1 and was laid out 794x706
   * next to its paragraph. The component bounds the column to the width a 440px-tall photograph
   * needs, and the copy takes what is released - 440 * 1120 / 996 is 495.
   */
  it('bounds the column of a lone photograph that would be laid out too tall', async () => {
    await go(`/${OUR_WORK_SEGMENT}/roar-organic`);

    const gallery = PRODUCT_META['roar-organic'].photos.slice(1);
    expect(gallery, 'roar-organic is the fixture for this test').toHaveLength(1);
    expect(
      gallery[0].width / gallery[0].height,
      'the fixture is the near-square case',
    ).toBeLessThan(1.5);

    const experience = root.querySelector('.product__experience') as HTMLElement;
    expect(experience.style.getPropertyValue('--nx-experience-columns')).toBe(
      `minmax(0, 1fr) minmax(0, ${Math.round((gallery[0].width / gallery[0].height) * 440)}px)`,
    );
  });

  /**
   * The same rule, inert. A panorama's bound is wider than the column is ever laid out, and a
   * pair is not its business at all, so both fall back to copy beside gallery. They are
   * published rather than left to the stylesheet: the component is the only author of this
   * property, which is what lets `product-detail.scss` carry no literal of its own.
   */
  it('falls a panorama and a pair back to copy beside gallery', async () => {
    await go(`/${OUR_WORK_SEGMENT}/robert-irwin`);
    const panorama = PRODUCT_META['robert-irwin'].photos[1];
    expect(
      (panorama.width / panorama.height) * SHOT_MAX_HEIGHT,
      'wider than the column ever is',
    ).toBeGreaterThan(GALLERY_COLUMN_MAX);
    expect(
      (root.querySelector('.product__experience') as HTMLElement).style.getPropertyValue(
        '--nx-experience-columns',
      ),
    ).toBe(COPY_BESIDE_GALLERY);

    await go(`/${OUR_WORK_SEGMENT}/mastercraft`);
    expect(
      (root.querySelector('.product__experience') as HTMLElement).style.getPropertyValue(
        '--nx-experience-columns',
      ),
    ).toBe(COPY_BESIDE_GALLERY);
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

      const alts = [
        root.querySelector('.product__hero-img')?.getAttribute('alt') ?? '',
        ...Array.from(root.querySelectorAll('.gallery__img')).map(
          (shot) => shot.getAttribute('alt') ?? '',
        ),
      ];

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
