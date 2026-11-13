import type { AppIconName } from '../../../../core/icons/icons';
import type { LocalizedText } from '../../../../core/i18n/localized-text';
import { OUR_WORK_SEGMENT } from '../../../../core/routing/paths';
import { PRODUCT_IDS, type ProductId } from './product-ids';
import {
  ARCHETYPE_ICONS,
  PRODUCT_META,
  photoSrc,
  type ProductArchetype,
  type ProductMeta,
} from './product-meta';

/** The per-product copy held in the dictionary, as the template consumes it. */
export interface ProductCopy {
  readonly name: LocalizedText;
  readonly category: LocalizedText;
  readonly hook: LocalizedText;
  readonly summary: LocalizedText;
  readonly highlights: readonly LocalizedText[];
  readonly advantage: LocalizedText;
  readonly value: LocalizedText;
  readonly about: LocalizedText;
}

export interface ProductsCopy {
  readonly archetypes: Readonly<Record<ProductArchetype, LocalizedText>>;
  readonly products: Readonly<Record<ProductId, ProductCopy>>;
}

/** A renderable image: where it is, and the size it really is. */
export interface ProductImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

/**
 * One product, with its structural facts and its translated copy already joined.
 *
 * The grid and the detail page both render from this, so a product reads the same in both
 * places by construction rather than by two templates agreeing with each other.
 */
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
  /**
   * The product's photographs, in display order and never empty. The first is the card's
   * picture and the detail page's hero; anything after it is gallery material the detail page
   * renders only when it is there.
   *
   * `width` and `height` are each file's real dimensions, which differ per product, so every
   * `<img>` can declare them truthfully. Adding originals later means extending
   * `ProductMeta.photos` - no template or component changes.
   */
  readonly photos: readonly ProductImage[];
  /** Unlocalised route; pass through `localizedPath` before binding it. */
  readonly path: string;
  /** Absent when the product has no destination worth sending a visitor to. */
  readonly url?: string;
  readonly platform?: string;
}

export function productPath(id: ProductId): string {
  return `/${OUR_WORK_SEGMENT}/${id}`;
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
    photos: meta.photos.map((photo) => ({
      src: photoSrc(photo),
      width: photo.width,
      height: photo.height,
    })),
    path: productPath(id),
    url: meta.url,
    platform: meta.platform,
  };
}

/** Every product, in `PRODUCT_IDS` order. */
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

/** The product after this one, wrapping at the end, for "next project" navigation. */
export function nextProductId(id: ProductId): ProductId {
  const index = PRODUCT_IDS.indexOf(id);
  return PRODUCT_IDS[(index + 1) % PRODUCT_IDS.length];
}
