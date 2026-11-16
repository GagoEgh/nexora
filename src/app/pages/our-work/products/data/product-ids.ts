import type { CanMatchFn } from '@angular/router';

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
  'fairwell',
  'grishaev-architects',
  'kgtex',
] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];
export function isProductId(value: unknown): value is ProductId {
  return typeof value === 'string' && (PRODUCT_IDS as readonly string[]).includes(value);
}

export const matchProductSlug: CanMatchFn = (_route, segments) =>
  segments.length === 1 && isProductId(segments[0]?.path);
