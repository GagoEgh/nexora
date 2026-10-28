import { Component, input, output } from '@angular/core';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import {
  type ServiceCategoryId,
  type ServiceCategorySummary,
  serviceSectionId,
} from '../../../shared/services-catalogue/service-category';

@Component({
  selector: 'app-category-nav',
  imports: [IconTile],
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.scss',
})
export class CategoryNav {
  readonly categories = input.required<readonly ServiceCategorySummary[]>();
  readonly active = input.required<ServiceCategoryId>();
  readonly label = input.required<string>();
  readonly categorySelect = output<ServiceCategoryId>();

  protected readonly sectionId = serviceSectionId;

  protected onSelect(event: Event, id: ServiceCategoryId): void {
    event.preventDefault();
    this.categorySelect.emit(id);
  }
}
