import { describe, expect, it } from 'vitest';
import {
  ALL_PRODUCTS,
  filterProducts,
  isOfferedValue,
  toArchetypeOptions,
  toPlatformOptions,
} from './product-filter';
import type { ProductArchetype } from './product-meta';
import type { ProductId } from './product-ids';
import type { ProductView } from './product-view';

/**
 * The filter reads four fields off a product. Building the rest by hand would pin this spec to
 * the shape of `ProductView` rather than to the behaviour under test, so the factory fills them
 * once and the tests say only what they care about.
 */
function product(
  id: string,
  archetype: ProductArchetype,
  archetypeLabel: string,
  platform?: string,
): ProductView {
  return {
    id: id as ProductId,
    archetype,
    archetypeLabel,
    icon: 'tag',
    name: id,
    category: `${id} category`,
    hook: '',
    summary: '',
    highlights: [],
    advantage: '',
    value: '',
    about: '',
    photos: [{ src: 'images/a.webp', srcset: '', width: 1, height: 1, alt: '' }],
    path: `/our_work/${id}`,
    ...(platform !== undefined ? { platform } : {}),
  };
}

const GRID: readonly ProductView[] = [
  product('a', 'storefront', 'Storefront', 'Shopify'),
  product('b', 'storefront', 'Storefront', 'Shopify'),
  product('c', 'app', 'Mobile app', 'iOS · App Store'),
  product('d', 'corporate', 'Corporate site', 'WordPress'),
  product('e', 'corporate', 'Corporate site'),
];

describe('toArchetypeOptions', () => {
  it('offers only the archetypes the grid actually uses', () => {
    expect(toArchetypeOptions(GRID).map((option) => option.value)).toEqual([
      'app',
      'storefront',
      'corporate',
    ]);
  });

  it('counts the products behind each option', () => {
    const counts = Object.fromEntries(
      toArchetypeOptions(GRID).map((option) => [option.value, option.count]),
    );
    expect(counts).toEqual({ app: 1, storefront: 2, corporate: 2 });
  });

  /**
   * The order comes from the registry, not from the counts and not from the labels. Sorting by
   * a translated label would deal the chips in a different order to Armenian and Russian
   * readers, for whom the row would then not match any screenshot or any instruction.
   */
  it('keeps registry order, which is the same in every locale', () => {
    const translated = GRID.map((item) => ({ ...item, archetypeLabel: 'Ֆ' + item.archetypeLabel }));
    expect(toArchetypeOptions(translated).map((option) => option.value)).toEqual(
      toArchetypeOptions(GRID).map((option) => option.value),
    );
  });

  it('takes the label from the card rather than from a second table', () => {
    const [first] = toArchetypeOptions(GRID);
    expect(first?.label).toBe('Mobile app');
  });

  it('offers nothing for an empty grid', () => {
    expect(toArchetypeOptions([])).toEqual([]);
  });
});

describe('toPlatformOptions', () => {
  it('counts each platform and puts the most used first', () => {
    expect(toPlatformOptions(GRID)).toEqual([
      { value: 'Shopify', label: 'Shopify', count: 2 },
      { value: 'iOS · App Store', label: 'iOS · App Store', count: 1 },
      { value: 'WordPress', label: 'WordPress', count: 1 },
    ]);
  });

  /** A product with no platform is not a platform called "undefined". */
  it('ignores products that declare no platform', () => {
    expect(toPlatformOptions(GRID).some((option) => option.value === undefined)).toBe(false);
    expect(toPlatformOptions([product('x', 'app', 'App')])).toEqual([]);
  });
});

describe('filterProducts', () => {
  it('returns the grid untouched when neither axis is set', () => {
    expect(filterProducts(GRID, ALL_PRODUCTS, ALL_PRODUCTS)).toBe(GRID);
  });

  it('narrows by archetype alone', () => {
    expect(filterProducts(GRID, 'corporate', ALL_PRODUCTS).map((item) => item.id)).toEqual([
      'd',
      'e',
    ]);
  });

  it('narrows by platform alone', () => {
    expect(filterProducts(GRID, ALL_PRODUCTS, 'Shopify').map((item) => item.id)).toEqual([
      'a',
      'b',
    ]);
  });

  /** The two axes intersect; this is the case a single-axis filter cannot express. */
  it('applies both axes at once', () => {
    expect(filterProducts(GRID, 'corporate', 'WordPress').map((item) => item.id)).toEqual(['d']);
  });

  it('can intersect to nothing, and says so rather than falling back to everything', () => {
    expect(filterProducts(GRID, 'app', 'WordPress')).toEqual([]);
  });

  /**
   * A product with no platform has no value to match, so it appears only while the platform
   * axis is open. Including it under a named platform would label it with something it does
   * not carry.
   */
  it('hides a product without a platform once a platform is chosen', () => {
    expect(filterProducts(GRID, 'corporate', 'WordPress').map((item) => item.id)).not.toContain(
      'e',
    );
    expect(filterProducts(GRID, 'corporate', ALL_PRODUCTS).map((item) => item.id)).toContain('e');
  });

  it('preserves registry order', () => {
    expect(filterProducts(GRID, 'storefront', ALL_PRODUCTS).map((item) => item.id)).toEqual([
      'a',
      'b',
    ]);
  });
});

describe('isOfferedValue', () => {
  const options = toPlatformOptions(GRID);

  it('accepts the sentinel and any offered value', () => {
    expect(isOfferedValue(ALL_PRODUCTS, options)).toBe(true);
    expect(isOfferedValue('Shopify', options)).toBe(true);
  });

  /**
   * A control can hand back `null` on deselection and arbitrary strings after a locale change
   * reshuffles the options. Either one reaching the filter would empty the grid with no way
   * back short of a reload.
   */
  it('rejects anything the grid does not offer', () => {
    for (const value of [null, undefined, '', 'Squarespace', 0, {}]) {
      expect(isOfferedValue(value, options), String(value)).toBe(false);
    }
  });
});
