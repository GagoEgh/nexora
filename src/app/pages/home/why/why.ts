import { Component, computed, signal, viewChild } from '@angular/core';
import { MatChipListbox, type MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { useDictionary } from 'angular-intlayer';
import { ordinal } from '../../../shared/ordinal';
import { Logo } from '../../../shared/ui/logo/logo';
import whyDisciplinesContent from './why-disciplines.content';
import whyContent from './why.content';

@Component({
  selector: 'app-why',
  imports: [Logo, MatChipListbox, MatChipOption],
  templateUrl: './why.html',
  styleUrl: './why.scss',
})
export class Why {
  protected readonly content = useDictionary(whyContent);
  protected readonly disciplines = useDictionary(whyDisciplinesContent);
  private readonly listbox = viewChild.required(MatChipListbox);
  protected readonly selected = signal(0);

  protected readonly ordinal = ordinal;

  protected readonly reasons = computed(() => {
    const items = this.disciplines().items;
    // Clamped: a content edit that shortens the list must not throw on a stale selection.
    return items[Math.min(this.selected(), items.length - 1)]?.reasons ?? [];
  });

  /**
   * Chips here are a filter, so there is always exactly one selection. Clicking the selected
   * chip makes MatChipListbox emit `undefined`, and because the signal has not changed Angular
   * will not re-run `[value]`, leaving the listbox visually blank. Writing the value back is
   * what resyncs it - it looks redundant but removing it reintroduces the deselection bug.
   */
  protected onSelection(change: MatChipListboxChange): void {
    if (typeof change.value === 'number') {
      this.selected.set(change.value);
      return;
    }

    this.listbox().value = this.selected();
  }
}
