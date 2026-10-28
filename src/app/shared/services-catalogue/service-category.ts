import type { AppIconName } from '../../core/icons/icons';

export const SERVICE_CATEGORY_IDS = [
  'design-product',
  'software-engineering',
  'artificial-intelligence',
  'infrastructure-operations',
  'engineering-partnerships',
] as const;

export const ALL_SERVICES = 'all';
export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];
export type ServiceFilter = ServiceCategoryId | typeof ALL_SERVICES;

export interface ServiceCategorySummary {
  readonly id: ServiceCategoryId;
  readonly icon: AppIconName;
  readonly label: string;
  readonly count: number;
}

export function isServiceCategoryId(value: unknown): value is ServiceCategoryId {
  return typeof value === 'string' && (SERVICE_CATEGORY_IDS as readonly string[]).includes(value);
}

export function isServiceFilter(value: unknown): value is ServiceFilter {
  return value === ALL_SERVICES || isServiceCategoryId(value);
}

export function serviceSectionId(category: ServiceCategoryId): string {
  return `services-${category}`;
}
