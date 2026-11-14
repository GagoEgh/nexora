import type { ProductImage } from '../products/data/product-view';

export const CONTAINER_MAX = 1280;
export const GALLERY_ASIDE = 420;
export const GALLERY_COLUMN_GAP = 64;
export const SHOT_MAX_HEIGHT = 440;
export const GALLERY_ROW_MAX = 3;
export const GALLERY_COLUMN_MAX = CONTAINER_MAX - GALLERY_ASIDE - GALLERY_COLUMN_GAP;

const COPY_BESIDE_GALLERY = `minmax(0, ${GALLERY_ASIDE}px) minmax(0, 1fr)`;
const MARGIN = { medium: 32, expanded: 40, large: 80 } as const;
const PAGE_INTRO_ASIDE = 520;
const ROW_GAP = 16;

export interface GalleryTile {
  readonly shot: ProductImage;
  readonly sizes: string;
}

export interface GalleryRow {
  readonly tiles: readonly GalleryTile[];
  readonly columns: string | null;
}

export function galleryRowSizes(count: number): readonly number[] {
  const rows = Math.ceil(count / GALLERY_ROW_MAX);
  if (rows === 0) {
    return [];
  }
  const base = Math.floor(count / rows);
  const longer = count % rows;
  return Array.from({ length: rows }, (_, index) => base + (index < longer ? 1 : 0));
}

export function proportionalColumns(shots: readonly ProductImage[]): string | null {
  if (shots.length < 2) {
    return null;
  }
  return shots.map((shot) => `minmax(0, ${(shot.width / shot.height).toFixed(4)}fr)`).join(' ');
}

function rowShare(row: readonly ProductImage[], index: number): number {
  const ratio = (image: ProductImage) => image.width / image.height;
  const total = row.reduce((sum, image) => sum + ratio(image), 0);
  return ratio(row[index]) / total;
}

function tileSizes(row: readonly ProductImage[], index: number, galleryShots: number): string {
  const content = (margin: number) => `100vw - ${margin * 2}px`;
  const gaps = (row.length - 1) * ROW_GAP;
  const share = rowShare(row, index).toFixed(4);
  const aside = galleryShots > 2 ? 0 : GALLERY_ASIDE + GALLERY_COLUMN_GAP;
  const of = (width: string) => `calc((${width} - ${gaps + aside}px) * ${share})`;

  if (row.length === 1) {
    return `calc(${content(MARGIN.medium)})`;
  }
  return [
    `(min-width: ${1200}px) ${of(`min(${content(MARGIN.large)}, ${CONTAINER_MAX}px)`)}`,
    `(min-width: ${840}px) ${of(content(MARGIN.expanded))}`,
    `(min-width: ${600}px) ${of(content(MARGIN.medium))}`,
    `calc(${content(MARGIN.medium)})`,
  ].join(', ');
}

export function toGalleryRows(shots: readonly ProductImage[]): readonly GalleryRow[] {
  const rows: GalleryRow[] = [];
  let taken = 0;
  for (const size of galleryRowSizes(shots.length)) {
    const row = shots.slice(taken, taken + size);
    rows.push({
      tiles: row.map((shot, index) => ({ shot, sizes: tileSizes(row, index, shots.length) })),
      columns: proportionalColumns(row),
    });
    taken += size;
  }
  return rows;
}

export function experienceColumns(shots: readonly ProductImage[]): string | null {
  if (shots.length === 0) {
    return null;
  }
  if (shots.length > 2) {
    return 'minmax(0, 1fr)';
  }
  if (shots.length === 2) {
    return COPY_BESIDE_GALLERY;
  }

  const shot = shots[0];
  const bounded = Math.min(Math.round((shot.width / shot.height) * SHOT_MAX_HEIGHT), shot.width);
  return bounded < GALLERY_COLUMN_MAX
    ? `minmax(0, 1fr) minmax(0, ${bounded}px)`
    : COPY_BESIDE_GALLERY;
}

export const HERO_SIZES = [
  `(min-width: 1200px) ${PAGE_INTRO_ASIDE}px`,
  `(min-width: 840px) calc(100vw - ${MARGIN.expanded * 2}px)`,
  `calc(100vw - ${MARGIN.medium * 2}px)`,
].join(', ');
