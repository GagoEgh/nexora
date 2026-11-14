import { Component, computed, input } from '@angular/core';
import type { ProductImage } from '../../products/data/product-view';
import { SHOT_MAX_HEIGHT, toGalleryRows, type GalleryRow } from '../gallery-layout';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  host: {
    '[style.--nx-shot-max-height]': 'shotMaxHeight',
  },
})
export class ProductGallery {
  readonly shots = input.required<readonly ProductImage[]>();

  protected readonly shotMaxHeight = `${SHOT_MAX_HEIGHT}px`;

  protected readonly rows = computed<readonly GalleryRow[]>(() => toGalleryRows(this.shots()));
}
