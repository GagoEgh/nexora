import type { AppIconName } from '../../../../core/icons/icons';
import type { ProductId } from './product-ids';

export const PRODUCT_ARCHETYPES = [
  'app',
  'configurator',
  'storefront',
  'trade',
  'lead-generation',
  'corporate',
] as const;

export type ProductArchetype = (typeof PRODUCT_ARCHETYPES)[number];
export const ARCHETYPE_ICONS: Readonly<Record<ProductArchetype, AppIconName>> = {
  app: 'smartphone',
  configurator: 'layers',
  storefront: 'tag',
  trade: 'briefcase',
  'lead-generation': 'target',
  corporate: 'globe',
};

export type ExternalUrl = `https://${string}`;

export type NonEmpty<T> = readonly [T, ...T[]];

export interface ProductPhoto {
  readonly file: string;
  readonly width: number;
  readonly height: number;
}

export interface ProductMeta {
  readonly archetype: ProductArchetype;
  readonly photos: NonEmpty<ProductPhoto>;

  readonly url?: ExternalUrl;
  readonly platform?: string;
}

export const PRODUCT_META: Readonly<Record<ProductId, ProductMeta>> = {
  draculai: {
    archetype: 'app',
    photos: [
      { file: 'medical.webp', width: 800, height: 450 },
      { file: 'draculai-substance.webp', width: 822, height: 618 },
      { file: 'draculai-vitals.webp', width: 1024, height: 1024 },
    ],
    url: 'https://apps.apple.com/us/app/draculai/id6744846504',
    platform: 'iOS · App Store',
  },
  'jdm-west-coast': {
    archetype: 'configurator',
    photos: [
      { file: 'car.webp', width: 800, height: 533 },
      { file: 'jdm-engine.webp', width: 1120, height: 625 },
      { file: 'jdm-catalogue.webp', width: 1000, height: 667 },
    ],
    url: 'https://www.jdmwestcoast.com/',
    platform: 'Shopify',
  },
  hydrant: {
    archetype: 'storefront',
    photos: [
      { file: 'juce.webp', width: 756, height: 600 },
      { file: 'hydrant-flavours.webp', width: 1000, height: 667 },
      { file: 'hydrant-mix.webp', width: 1280, height: 854 },
    ],
    url: 'https://www.drinkhydrant.com/',
    platform: 'Shopify',
  },
  mertel: {
    archetype: 'corporate',
    photos: [
      { file: 'mertal.webp', width: 800, height: 420 },
      { file: 'mertel-pavilion.webp', width: 1280, height: 960 },
      { file: 'mertel-recital.webp', width: 1280, height: 853 },
      { file: 'mertel-soiree.webp', width: 800, height: 999 },
    ],
    url: 'https://mertel.agency/sk/en/',
    platform: 'WordPress',
  },
  skinome: {
    archetype: 'storefront',
    photos: [
      { file: 'skay.webp', width: 800, height: 533 },
      { file: 'skinome-range.webp', width: 1120, height: 1120 },
      { file: 'skinome-formulation.webp', width: 1024, height: 1024 },
    ],
    url: 'https://www.skinome.com/',
    platform: 'Shopify',
  },
  mastercraft: {
    archetype: 'configurator',
    photos: [
      { file: 'master.webp', width: 800, height: 622 },
      { file: 'master-bench.webp', width: 1280, height: 853 },
      { file: 'master-grading.webp', width: 1000, height: 1000 },
    ],
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
    photos: [
      { file: 'interier.webp', width: 800, height: 437 },
      { file: 'casamance-showroom.webp', width: 800, height: 530 },
      { file: 'casamance-swatches.webp', width: 1120, height: 747 },
      { file: 'casamance-moodboard.webp', width: 1000, height: 1000 },
      { file: 'casamance-wallcovering.webp', width: 900, height: 731 },
    ],
    url: 'https://www.casamance.com/en/',
  },
  'sell-me-watch': {
    archetype: 'lead-generation',
    photos: [
      { file: 'watch.webp', width: 800, height: 800 },
      { file: 'watch-appraisal.webp', width: 1280, height: 854 },
      { file: 'watch-two-tone.webp', width: 750, height: 500 },
      { file: 'watch-submariner.webp', width: 960, height: 960 },
    ],
    url: 'https://www.sellmewatch.com/',
    platform: 'Webflow',
  },
  'klinik-europe': {
    archetype: 'lead-generation',
    photos: [
      { file: 'klinik.webp', width: 800, height: 463 },
      { file: 'klinik-europe-hotel.webp', width: 1200, height: 720 },
    ],
    url: 'https://klinikeurope.co.uk/',
  },
  'libra-analytics': {
    archetype: 'corporate',
    photos: [
      { file: 'power.webp', width: 800, height: 569 },
      { file: 'libra-reports.webp', width: 1280, height: 720 },
      { file: 'libra-analyst.webp', width: 1280, height: 717 },
      { file: 'libra-briefing.webp', width: 1280, height: 720 },
      { file: 'libra-dashboard.webp', width: 1280, height: 853 },
    ],
    url: 'https://www.libraanalytics.com/',
    platform: 'Webflow',
  },
  'remake-templates': {
    archetype: 'storefront',
    photos: [
      { file: 'muzic.webp', width: 800, height: 450 },
      { file: 'remake-templates-project.webp', width: 1200, height: 675 },
      { file: 'remake-templates-subscription.webp', width: 986, height: 990 },
    ],
    url: 'https://remaketemplates.com/',
    platform: 'Shopify',
  },
  'got-matcha': {
    archetype: 'storefront',
    photos: [
      { file: 'got.webp', width: 800, height: 600 },
      { file: 'got-field.webp', width: 1120, height: 611 },
      { file: 'got-ritual.webp', width: 980, height: 980 },
    ],
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
    photos: [
      { file: 'roar.webp', width: 1000, height: 896 },
      { file: 'roar-immune.webp', width: 1120, height: 996 },
    ],
    platform: 'Shopify',
  },
  'zadeh-md': {
    archetype: 'storefront',
    photos: [
      { file: 'zadeh.webp', width: 480, height: 334 },
      { file: 'zadeh-cleanse.webp', width: 900, height: 1350 },
      { file: 'zadeh-c-fusion.webp', width: 1280, height: 1281 },
    ],
    url: 'https://shopzadehmdskin.com/',
    platform: 'Shopify',
  },
  'tai-ping': {
    archetype: 'trade',
    photos: [
      { file: 'market.webp', width: 800, height: 453 },
      { file: 'tai-ping-produce.webp', width: 480, height: 360 },
      { file: 'tai-ping-distribution.webp', width: 1000, height: 667 },
    ],
    url: 'https://www.taiping.co.nz/',
  },
  mezave: {
    archetype: 'app',
    photos: [
      { file: 'meal.webp', width: 800, height: 853 },
      { file: 'mezave-home.webp', width: 637, height: 1104 },
      { file: 'mezave-marketplace.webp', width: 454, height: 679 },
      { file: 'mezave-details.webp', width: 860, height: 645 },
    ],
    url: 'https://play.google.com/store/apps/details?id=org.mezave',
    platform: 'Android · Google Play',
  },

  'connected-car': {
    archetype: 'app',
    photos: [
      { file: 'infiniti.webp', width: 800, height: 450 },
      { file: 'infin.webp', width: 1280, height: 640 },
      { file: 'control.webp', width: 1080, height: 1080 },
      { file: 'serv.webp', width: 910, height: 767 },
    ],
  },
};

export function photoSrc(photo: ProductPhoto): string {
  return `images/${photo.file}`;
}

export const IMAGE_LADDER = [200, 400, 640, 960] as const;

export function photoSrcset(photo: ProductPhoto): string {
  const steps = IMAGE_LADDER.filter((step) => step < photo.width).map(
    (step) => `images/${photo.file.replace(/\.webp$/, `-${step}.webp`)} ${step}w`,
  );
  return [...steps, `${photoSrc(photo)} ${photo.width}w`].join(', ');
}
