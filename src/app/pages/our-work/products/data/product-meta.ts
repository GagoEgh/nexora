import type { AppIconName } from '../../../../core/icons/icons';
import type { ProductId } from './product-ids';

/**
 * What kind of problem a product solves. This is the portfolio's organising idea: eleven of
 * nineteen products are storefronts, so without a second axis the grid reads as one project
 * repeated. The archetype gives each card a claim its neighbours cannot make, and gives the
 * grid a filter vocabulary.
 */
export const PRODUCT_ARCHETYPES = [
  'app',
  'configurator',
  'storefront',
  'trade',
  'lead-generation',
  'corporate',
] as const;

export type ProductArchetype = (typeof PRODUCT_ARCHETYPES)[number];

/** Each archetype's icon, from the project's own set. */
export const ARCHETYPE_ICONS: Readonly<Record<ProductArchetype, AppIconName>> = {
  app: 'smartphone',
  configurator: 'layers',
  storefront: 'tag',
  trade: 'briefcase',
  'lead-generation': 'target',
  corporate: 'globe',
};

/**
 * An absolute, secure destination. Typing it this way makes a relative route - which would be
 * written into `[href]`, bypassing the router and the locale prefix - a compile error.
 */
export type ExternalUrl = `https://${string}`;

/**
 * One product photograph, with the size it actually is.
 *
 * The dimensions are carried rather than assumed because this set ranges from 480x334 to
 * 800x853 - portrait, square and three different landscapes. The card crops them all to one
 * ratio with `object-fit: cover`, but the intrinsic size still has to be declared truthfully so
 * the browser reserves the right box.
 */
export interface ProductPhoto {
  /** File name under `public/images`. */
  readonly file: string;
  readonly width: number;
  readonly height: number;
}

export interface ProductMeta {
  readonly archetype: ProductArchetype;
  /**
   * The product's own photographs, in the order they should be shown. The first is the card's
   * picture and the detail page's hero; any after it are gallery material.
   *
   * These are the project's own images, committed in `f766248` and served from `public/images`.
   * Today every product has exactly one, which is why the detail page shows a gallery only when
   * a second exists - adding originals later is an edit to this array and nothing else.
   *
   * Generated illustrations are deliberately not referenced here. The set under
   * `src/assets/images/products` is no longer read by any component.
   */
  readonly photos: readonly ProductPhoto[];
  /**
   * The live destination, when the product has one that can be opened and checked today.
   *
   * Deliberately optional. Two products have no honest destination: the connected-car app has
   * no public listing, and the organic beverage store resolves to a platform default host where
   * every item reads "sold out". A card with no outbound link is better than one that sends a
   * prospect somewhere that undermines the work.
   */
  readonly url?: ExternalUrl;
  /**
   * The delivery platform, recorded only where the published product states or plainly shows
   * it. An absent value means "not established", never "none" - it is left out of the UI
   * rather than guessed at.
   */
  readonly platform?: string;
}

export const PRODUCT_META: Readonly<Record<ProductId, ProductMeta>> = {
  draculai: {
    archetype: 'app',
    photos: [{ file: 'medical.webp', width: 800, height: 450 }],
    url: 'https://apps.apple.com/us/app/draculai/id6744846504',
    platform: 'iOS · App Store',
  },
  'jdm-west-coast': {
    archetype: 'configurator',
    photos: [{ file: 'car.webp', width: 800, height: 533 }],
    url: 'https://www.jdmwestcoast.com/',
    platform: 'Shopify',
  },
  hydrant: {
    archetype: 'storefront',
    photos: [{ file: 'juce.webp', width: 756, height: 600 }],
    url: 'https://www.drinkhydrant.com/',
    platform: 'Shopify',
  },
  mertel: {
    archetype: 'corporate',
    photos: [{ file: 'mertal.webp', width: 800, height: 420 }],
    url: 'https://mertel.agency/sk/en/',
    platform: 'WordPress',
  },
  skinome: {
    archetype: 'storefront',
    photos: [{ file: 'skay.webp', width: 800, height: 533 }],
    url: 'https://www.skinome.com/',
    platform: 'Shopify',
  },
  mastercraft: {
    archetype: 'configurator',
    photos: [{ file: 'master.webp', width: 800, height: 622 }],
    url: 'https://www.mastercraftjewelers.com/',
    platform: 'Shopify',
  },
  'robert-irwin': {
    archetype: 'configurator',
    photos: [
      { file: 'je.webp', width: 640, height: 524 },
      { file: 'rings.webp', width: 890, height: 350 },
    ],
    url: 'https://www.rijewelers.com/',
    platform: 'Shopify',
  },
  casamance: {
    archetype: 'trade',
    photos: [{ file: 'interier.webp', width: 800, height: 437 }],
    url: 'https://www.casamance.com/en/',
  },
  'sell-me-watch': {
    archetype: 'lead-generation',
    photos: [{ file: 'watch.webp', width: 800, height: 800 }],
    url: 'https://www.sellmewatch.com/',
    platform: 'Webflow',
  },
  'klinik-europe': {
    archetype: 'lead-generation',
    photos: [{ file: 'klinik.webp', width: 800, height: 463 }],
    url: 'https://klinikeurope.co.uk/',
  },
  'libra-analytics': {
    archetype: 'corporate',
    photos: [{ file: 'power.webp', width: 800, height: 569 }],
    url: 'https://www.libraanalytics.com/',
    platform: 'Webflow',
  },
  // The card used to point at `abletonremakes.com`, which now answers 301 and redirects here.
  'remake-templates': {
    archetype: 'storefront',
    photos: [{ file: 'muzic.webp', width: 800, height: 450 }],
    url: 'https://remaketemplates.com/',
    platform: 'Shopify',
  },
  'got-matcha': {
    archetype: 'storefront',
    photos: [{ file: 'got.webp', width: 800, height: 600 }],
    url: 'https://www.gotmatcha.com/',
    platform: 'Shopify',
  },
  lav: {
    archetype: 'storefront',
    photos: [
      { file: 'lave.webp', width: 800, height: 450 },
      { file: 'lav-pack.webp', width: 1280, height: 1280 },
      { file: 'lav-pour.webp', width: 1000, height: 1000 },
    ],
    url: 'https://dresslav.com/',
    platform: 'Shopify',
  },
  'roar-organic': {
    archetype: 'storefront',
    photos: [{ file: 'organic.webp', width: 800, height: 717 }],
    platform: 'Shopify',
  },
  'zadeh-md': {
    archetype: 'storefront',
    photos: [{ file: 'zadeh.webp', width: 480, height: 334 }],
    url: 'https://shopzadehmdskin.com/',
    platform: 'Shopify',
  },
  'tai-ping': {
    archetype: 'trade',
    photos: [{ file: 'market.webp', width: 800, height: 453 }],
    url: 'https://www.taiping.co.nz/',
  },
  mezave: {
    archetype: 'app',
    photos: [{ file: 'meal.webp', width: 800, height: 853 }],
    url: 'https://play.google.com/store/apps/details?id=org.mezave',
    platform: 'Android · Google Play',
  },

  'connected-car': {
    archetype: 'app',
    photos: [{ file: 'infiniti.webp', width: 800, height: 450 }],
  },
};

export function photoSrc(photo: ProductPhoto): string {
  return `images/${photo.file}`;
}
