import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';
import { type Field, FormField } from '@angular/forms/signals';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';

export interface ChipOption {
  readonly value: string;
  readonly label: string;
}

const isActivation = (event: Event): boolean => {
  if (event.type === 'click') {
    return true;
  }
  if (!(event instanceof KeyboardEvent)) {
    return false;
  }

  const code = event.keyCode;
  return event.key === 'Enter' || event.key === ' ' || code === ENTER || code === SPACE;
};

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

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const refuseDeselect = (event: Event): void => {
      if (!isActivation(event)) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[role="option"]')?.getAttribute('aria-selected') === 'true') {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    element.addEventListener('click', refuseDeselect, { capture: true });
    element.addEventListener('keydown', refuseDeselect, { capture: true });
    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('click', refuseDeselect, { capture: true });
      element.removeEventListener('keydown', refuseDeselect, { capture: true });
    });
  }

  focus(): void {
    this.listbox().focus();
  }
}
