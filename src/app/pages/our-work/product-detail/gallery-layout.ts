import type { ProductImage } from '../products/data/product-view';
export const CONTAINER_MAX = 1280;

const MARGIN = { compact: 20, medium: 32, expanded: 40, large: 80 } as const;
const BREAKPOINT = { medium: 600, expanded: 840, large: 1200 } as const;

export const STAGE_HEIGHT = { compact: 320, medium: 420, large: 560 } as const;
export const THUMB_WIDTH = 88;
export const LIGHTBOX_GUTTER = 16;
export const LIGHTBOX_CHROME = 152;
export const SWIPE_THRESHOLD = 40;

export interface GalleryTile {
  readonly shot: ProductImage;
  readonly sizes: string;
}

function narrowest(...candidates: readonly (string | null)[]): string {
  return `min(${candidates.filter((candidate) => candidate !== null).join(', ')})`;
}

function contained(shot: ProductImage, content: string, height: string): string {
  const ratio = (shot.width / shot.height).toFixed(4);
  return narrowest(content, `calc(${height} * ${ratio})`, `${shot.width}px`);
}

function box(margin: number, cap = false): string {
  const width = `100vw - ${margin * 2}px`;
  return cap ? narrowest(width, `${CONTAINER_MAX}px`) : `calc(${width})`;
}

export function stageSizes(shot: ProductImage): string {
  const band = (height: number) => `${height}px`;
  return [
    `(min-width: ${BREAKPOINT.large}px) ${contained(shot, box(MARGIN.large, true), band(STAGE_HEIGHT.large))}`,
    `(min-width: ${BREAKPOINT.expanded}px) ${contained(shot, box(MARGIN.expanded), band(STAGE_HEIGHT.medium))}`,
    `(min-width: ${BREAKPOINT.medium}px) ${contained(shot, box(MARGIN.medium), band(STAGE_HEIGHT.medium))}`,
    contained(shot, box(MARGIN.compact), band(STAGE_HEIGHT.compact)),
  ].join(', ');
}

export const THUMB_SIZES = `${THUMB_WIDTH}px`;

export function lightboxSizes(shot: ProductImage): string {
  return contained(shot, box(LIGHTBOX_GUTTER), `(100vh - ${LIGHTBOX_CHROME}px)`);
}

export function toTiles(shots: readonly ProductImage[]): readonly GalleryTile[] {
  return shots.map((shot) => ({ shot, sizes: stageSizes(shot) }));
}

export const NEXT_COVER_WIDTH = 80;
export const NEXT_COVER_SIZES = `${NEXT_COVER_WIDTH}px`;
