import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { useDictionary, useLocale } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { Reveal } from '../../../shared/motion/reveal';
import { appIcon } from '../../../core/icons/icons';
import { CONTACT_PATH } from '../../../core/routing/paths';
import productContent from './product.content';
import { toProductViews } from './data/product-view';
import {
  ALL_PRODUCTS,
  type ArchetypeFilter,
  type PlatformFilter,
  filterProducts,
  toArchetypeOptions,
  toPlatformOptions,
} from './data/product-filter';
import { ProductFilters, type ProductFilterLabels } from './product-filters/product-filters';
import { ProjectCard, type ProjectCardLabels } from './project-card/project-card';

@Component({
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, Reveal, ProductFilters, ProjectCard],
  selector: 'app-products',
  styleUrl: './products.scss',
  templateUrl: './products.html',
})
export class Products {
  protected readonly content = useDictionary(productContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly contactPath = CONTACT_PATH;

  protected readonly products = computed(() => toProductViews(this.content()));
  protected readonly archetypeFilter = signal<ArchetypeFilter>(ALL_PRODUCTS);
  protected readonly platformFilter = signal<PlatformFilter>(ALL_PRODUCTS);

  protected readonly archetypeOptions = computed(() => toArchetypeOptions(this.products()));
  protected readonly platformOptions = computed(() => toPlatformOptions(this.products()));

  protected readonly visibleProducts = computed(() =>
    filterProducts(this.products(), this.archetypeFilter(), this.platformFilter()),
  );

  protected readonly labels = computed<ProjectCardLabels>(() => {
    const copy = this.content();
    return {
      viewProject: copy.viewProject.value,
      visitSite: copy.visitSite.value,
      newTab: copy.newTab.value,
    };
  });

  protected readonly filterLabels = computed<ProductFilterLabels>(() => {
    const copy = this.content().filters;
    return {
      category: copy.category.value,
      platform: copy.platform.value,
      all: copy.all.value,
      reset: copy.reset.value,
      shown: copy.shown.value,
    };
  });

  protected onArchetypeChange(value: ArchetypeFilter): void {
    this.archetypeFilter.set(value);
  }

  protected onPlatformChange(value: PlatformFilter): void {
    this.platformFilter.set(value);
  }

  protected onResetFilters(): void {
    this.archetypeFilter.set(ALL_PRODUCTS);
    this.platformFilter.set(ALL_PRODUCTS);
  }
}
