import { Component, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { appIcon } from '../../../../core/icons/icons';
import {
  ALL_PRODUCTS,
  type ArchetypeFilter,
  type FilterOption,
  type PlatformFilter,
  isOfferedValue,
} from '../data/product-filter';
import type { ProductArchetype } from '../data/product-meta';

export interface ProductFilterLabels {
  readonly category: string;
  readonly platform: string;
  readonly all: string;
  readonly reset: string;
  readonly shown: string;
}

@Component({
  selector: 'app-product-filters',
  imports: [MatButton, MatIcon],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
})
export class ProductFilters {
  readonly archetypes = input.required<readonly FilterOption<ProductArchetype>[]>();
  readonly platforms = input.required<readonly FilterOption<string>[]>();
  readonly archetype = input.required<ArchetypeFilter>();
  readonly platform = input.required<PlatformFilter>();
  readonly total = input.required<number>();
  readonly shown = input.required<number>();
  readonly labels = input.required<ProductFilterLabels>();

  readonly archetypeChange = output<ArchetypeFilter>();
  readonly platformChange = output<PlatformFilter>();
  readonly resetFilters = output<void>();

  protected readonly all = ALL_PRODUCTS;
  protected readonly closeIcon = appIcon('x');
  protected readonly chevronIcon = appIcon('chevron-down');

  protected readonly isFiltered = computed(
    () => this.archetype() !== ALL_PRODUCTS || this.platform() !== ALL_PRODUCTS,
  );

  protected onArchetype(value: ArchetypeFilter): void {
    this.archetypeChange.emit(value);
  }

  protected onPlatform(value: PlatformFilter): void {
    this.platformChange.emit(value);
  }

  protected onArchetypeSelect(event: Event): void {
    const value = selectedValue(event);
    if (isOfferedValue(value, this.archetypes())) this.archetypeChange.emit(value);
  }

  protected onPlatformSelect(event: Event): void {
    const value = selectedValue(event);
    if (isOfferedValue(value, this.platforms())) this.platformChange.emit(value);
  }

  protected onReset(): void {
    this.resetFilters.emit();
  }
}

function selectedValue(event: Event): string | undefined {
  const target = event.target;
  return target instanceof HTMLSelectElement ? target.value : undefined;
}
