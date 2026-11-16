import type { AppIconName } from '../../../../core/icons/icons';
import type { LocalizedText } from '../../../../core/i18n/localized-text';
import { OUR_WORK_SEGMENT } from '../../../../core/routing/paths';
import { PRODUCT_IDS, type ProductId } from './product-ids';
import {
  ARCHETYPE_ICONS,
  PRODUCT_META,
  photoSrc,
  photoSrcset,
  type ProductArchetype,
  type ProductMeta,
  type ProductPhoto,
  type NonEmpty,
} from './product-meta';

export interface ProductCopy {
  readonly name: LocalizedText;
  readonly category: LocalizedText;
  readonly hook: LocalizedText;
  readonly summary: LocalizedText;
  readonly highlights: readonly LocalizedText[];
  readonly advantage: LocalizedText;
  readonly value: LocalizedText;
  readonly about: LocalizedText;
  readonly photoAlts: readonly LocalizedText[];
}

export interface ProductsCopy {
  readonly archetypes: Readonly<Record<ProductArchetype, LocalizedText>>;
  readonly products: Readonly<Record<ProductId, ProductCopy>>;
}

export interface ProductImage {
  readonly src: string;
  readonly srcset: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface ProductView {
  readonly id: ProductId;
  readonly archetype: ProductArchetype;
  readonly archetypeLabel: string;
  readonly icon: AppIconName;
  readonly name: string;
  readonly category: string;
  readonly hook: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly advantage: string;
  readonly value: string;
  readonly about: string;
  readonly photos: NonEmpty<ProductImage>;
  readonly path: string;
  readonly url?: string;
  readonly platform?: string;
}

export function productPath(id: ProductId): string {
  return `/${OUR_WORK_SEGMENT}/${id}`;
}

function toImage(photo: ProductPhoto, alt: LocalizedText | undefined): ProductImage {
  return {
    src: photoSrc(photo),
    srcset: photoSrcset(photo),
    width: photo.width,
    height: photo.height,
    alt: alt?.value ?? '',
  };
}

function toImages(
  photos: NonEmpty<ProductPhoto>,
  alts: readonly LocalizedText[],
): NonEmpty<ProductImage> {
  const [hero, ...rest] = photos;
  return [toImage(hero, alts[0]), ...rest.map((photo, index) => toImage(photo, alts[index + 1]))];
}

function toView(
  id: ProductId,
  meta: ProductMeta,
  copy: ProductCopy,
  archetype: string,
): ProductView {
  return {
    id,
    archetype: meta.archetype,
    archetypeLabel: archetype,
    icon: ARCHETYPE_ICONS[meta.archetype],
    name: copy.name.value,
    category: copy.category.value,
    hook: copy.hook.value,
    summary: copy.summary.value,
    highlights: copy.highlights.map((highlight) => highlight.value),
    advantage: copy.advantage.value,
    value: copy.value.value,
    about: copy.about.value,
    photos: toImages(meta.photos, copy.photoAlts),
    path: productPath(id),
    ...(meta.url !== undefined ? { url: meta.url } : {}),
    ...(meta.platform !== undefined ? { platform: meta.platform } : {}),
  };
}

export function toProductViews(copy: ProductsCopy): readonly ProductView[] {
  return PRODUCT_IDS.map((id) =>
    toView(
      id,
      PRODUCT_META[id],
      copy.products[id],
      copy.archetypes[PRODUCT_META[id].archetype].value,
    ),
  );
}

export function toProductView(id: ProductId, copy: ProductsCopy): ProductView {
  const meta = PRODUCT_META[id];
  return toView(id, meta, copy.products[id], copy.archetypes[meta.archetype].value);
}

export function nextProductId(id: ProductId): ProductId {
  const index = PRODUCT_IDS.indexOf(id);
  return PRODUCT_IDS[(index + 1) % PRODUCT_IDS.length] ?? PRODUCT_IDS[0];
}
