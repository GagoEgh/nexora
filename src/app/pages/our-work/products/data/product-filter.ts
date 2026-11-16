import { PRODUCT_ARCHETYPES, type ProductArchetype } from './product-meta';
import type { ProductView } from './product-view';

export const ALL_PRODUCTS = 'all';
export type AllProducts = typeof ALL_PRODUCTS;
export type ArchetypeFilter = ProductArchetype | AllProducts;
export type PlatformFilter = string | AllProducts;

export interface FilterOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count: number;
}

export function toArchetypeOptions(
  products: readonly ProductView[],
): readonly FilterOption<ProductArchetype>[] {
  const options: FilterOption<ProductArchetype>[] = [];
  for (const archetype of PRODUCT_ARCHETYPES) {
    const matching = products.filter((product) => product.archetype === archetype);
    const first = matching[0];
    if (first !== undefined) {
      options.push({ value: archetype, label: first.archetypeLabel, count: matching.length });
    }
  }
  return options;
}

export function toPlatformOptions(
  products: readonly ProductView[],
): readonly FilterOption<string>[] {
  const counts = new Map<string, number>();
  for (const { platform } of products) {
    if (platform !== undefined) {
      counts.set(platform, (counts.get(platform) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function filterProducts(
  products: readonly ProductView[],
  archetype: ArchetypeFilter,
  platform: PlatformFilter,
): readonly ProductView[] {
  if (archetype === ALL_PRODUCTS && platform === ALL_PRODUCTS) return products;
  return products.filter(
    (product) =>
      (archetype === ALL_PRODUCTS || product.archetype === archetype) &&
      (platform === ALL_PRODUCTS || product.platform === platform),
  );
}

export function isOfferedValue<T extends string>(
  value: unknown,
  options: readonly FilterOption<T>[],
): value is T | AllProducts {
  return value === ALL_PRODUCTS || options.some((option) => (option.value as string) === value);
}
