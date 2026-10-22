import { Component, computed, signal, viewChild } from '@angular/core';
import { MatChipListbox, type MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { useIntlayer } from 'angular-intlayer';
import { ordinal } from '../../../shared/ordinal';
import { Logo } from '../../../shared/ui/logo/logo';

@Component({
  selector: 'app-why',
  imports: [Logo, MatChipListbox, MatChipOption],
  templateUrl: './why.html',
  styleUrl: './why.scss',
})
export class Why {
  protected readonly content = useIntlayer('why');
  private readonly listbox = viewChild.required(MatChipListbox);
  protected readonly selected = signal(0);

  protected readonly reasons = computed(() => this.content().disciplines[this.selected()].reasons);

  protected onSelection(change: MatChipListboxChange): void {
    if (typeof change.value === 'number') {
      this.selected.set(change.value);
      return;
    }

    this.listbox().value = this.selected();
  }

  protected readonly ordinal = ordinal;
}
