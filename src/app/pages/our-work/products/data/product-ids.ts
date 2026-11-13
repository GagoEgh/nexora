/**
 * Every product in the portfolio, in the order the grid shows them.
 *
 * These slugs are URLs - `/our_work/draculai` - so they are published contracts. Renaming one
 * breaks an indexed page and any link to it; `product-ids.spec.ts` pins the list so a change
 * has to be deliberate.
 *
 * The order is editorial: products whose capabilities can be stated most concretely come first,
 * because the first row is what a visitor judges the portfolio by.
 */
export const PRODUCT_IDS = [
  'draculai',
  'jdm-west-coast',
  'hydrant',
  'mertel',
  'skinome',
  'mastercraft',
  'robert-irwin',
  'casamance',
  'sell-me-watch',
  'klinik-europe',
  'libra-analytics',
  'remake-templates',
  'got-matcha',
  'lav',
  'roar-organic',
  'zadeh-md',
  'tai-ping',
  'mezave',
  'connected-car',
] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

/** Narrows an arbitrary route parameter to a known product. */
export function isProductId(value: unknown): value is ProductId {
  return typeof value === 'string' && (PRODUCT_IDS as readonly string[]).includes(value);
}
