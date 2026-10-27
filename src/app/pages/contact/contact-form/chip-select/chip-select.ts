import { Component, input, viewChild } from '@angular/core';
import { type Field, FormField } from '@angular/forms/signals';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';

export interface ChipOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-chip-select',
  imports: [FormField, MatChipListbox, MatChipOption],
  templateUrl: './chip-select.html',
  styleUrl: './chip-select.scss',
})
export class ChipSelect {
  readonly field = input.required<Field<string>>();
  readonly options = input.required<readonly ChipOption[]>();

  readonly labelledBy = input.required<string>();

  private readonly listbox = viewChild.required(MatChipListbox);

  focus(): void {
    this.listbox().focus();
  }
}
