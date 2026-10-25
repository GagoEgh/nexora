import { Component, input, output, viewChild } from '@angular/core';
import { MatChipListbox, type MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { appIcon } from '../../../core/icons/icons';
import {
  ALL_SERVICES,
  type ServiceCategorySummary,
  type ServiceFilter,
  isServiceFilter,
} from '../service-category';

@Component({
  selector: 'app-filter-bar',
  imports: [MatChipListbox, MatChipOption, MatIcon],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  readonly categories = input.required<readonly ServiceCategorySummary[]>();
  readonly total = input.required<number>();
  readonly value = input.required<ServiceFilter>();
  readonly label = input.required<string>();
  readonly allLabel = input.required<string>();
  readonly filterChange = output<ServiceFilter>();

  protected readonly all = ALL_SERVICES;
  protected readonly chevronIcon = appIcon('chevron-down');
  private readonly chipListbox = viewChild(MatChipListbox);

  protected onChipChange(change: MatChipListboxChange): void {
    if (isServiceFilter(change.value)) {
      this.filterChange.emit(change.value);
      return;
    }

    const listbox = this.chipListbox();
    if (listbox) {
      listbox.value = this.value();
    }
  }

  protected onSelectChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement && isServiceFilter(target.value)) {
      this.filterChange.emit(target.value);
    }
  }
}
