import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { useLocale } from 'angular-intlayer';
import { appIcon } from '../../../../core/icons/icons';
import { LocalizedPathPipe } from '../../../../core/i18n/localized-path.pipe';
import { IconTile } from '../../../../shared/ui/icon-tile/icon-tile';
import type { ProductView } from '../data/product-view';

/** The band-level strings every card needs, resolved once and shared. */
export interface ProjectCardLabels {
  readonly viewProject: string;
  readonly visitSite: string;
  readonly newTab: string;
}

/**
 * One product in the portfolio grid, with a second face behind it.
 *
 * The front is the picture, the kind of product it is, and the line that earns a click. The back
 * carries the summary, the four capabilities, what sets the product apart, and the two links -
 * the detail page, and the live product where one exists.
 *
 * **Three triggers, and why there are three.** A pointer flips the card by hovering it. A touch
 * device flips it by tapping, because `mouseenter` either never fires there or fires once and
 * sticks. A keyboard flips it by focusing the card, which is why the host itself is a tab stop:
 * nothing on the front face is focusable, so without that there would be no way in, and every
 * word on the back would be pointer-only - the WCAG 2.1.1 failure that cost this component its
 * first flip. There is deliberately no "Details" button; the card is its own control.
 *
 * **Why the host, and not a button.** A button cannot contain links, and the back face has two.
 * A focusable `role="group"` carrying the product's name announces the card as one thing and
 * lets the caret walk into it, which is what a disclosure needs here.
 *
 * The turned-away face is hidden with `visibility`, not with geometry or `backface-visibility`:
 * those hide a face visually and leave its links focusable and announced. See the stylesheet.
 */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, LocalizedPathPipe, IconTile, MatIcon],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  host: {
    tabindex: '0',
    role: 'group',
    '[attr.aria-label]': 'cardLabel()',
    '[class.is-flipped]': 'flipped()',
    '(mouseenter)': 'pointerEnter()',
    '(mouseleave)': 'pointerLeave()',
    '(focusin)': 'focusEnter()',
    '(focusout)': 'onFocusOut($event)',
    '(click)': 'onClick($event)',
    '(keydown.escape)': 'dismiss()',
  },
})
export class ProjectCard {
  readonly product = input.required<ProductView>();
  readonly labels = input.required<ProjectCardLabels>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly externalIcon = appIcon('arrow-up-right');

  protected readonly flipped = signal(false);

  private openOnFocus = true;

  private openedByFocus = false;

  protected readonly cover = computed(() => this.product().photos[0]);

  protected readonly cardLabel = computed(
    () => `${this.product().name} — ${this.product().category}`,
  );

  protected readonly visitLabel = computed(
    () => `${this.labels().visitSite}: ${this.product().name} (${this.labels().newTab})`,
  );

  protected show(): void {
    this.flipped.set(true);
  }

  protected focusEnter(): void {
    if (!this.openOnFocus) return;
    this.openedByFocus = !this.flipped();
    this.show();
  }

  protected pointerEnter(): void {
    if (this.coarsePointer()) return;
    this.show();
  }

  protected pointerLeave(): void {
    if (this.coarsePointer() || this.containsFocus()) return;
    this.openedByFocus = false;
    this.flipped.set(false);
  }

  protected onClick(event: MouseEvent): void {
    const alreadyOpenedByThisGesture = this.openedByFocus;
    this.openedByFocus = false;

    if (!this.coarsePointer()) return;
    if ((event.target as HTMLElement | null)?.closest('a')) return;
    if (alreadyOpenedByThisGesture) return;

    this.flipped.update((showing) => !showing);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) return;
    this.openedByFocus = false;
    this.flipped.set(false);
  }

  protected dismiss(): void {
    if (!this.flipped()) return;
    this.flipped.set(false);
    this.openedByFocus = false;
    this.openOnFocus = false;
    try {
      (this.host.nativeElement as HTMLElement).focus();
    } finally {
      this.openOnFocus = true;
    }
  }

  private containsFocus(): boolean {
    const active = this.document.activeElement;
    return active !== null && this.host.nativeElement.contains(active);
  }

  private coarsePointer(): boolean {
    const view = this.document.defaultView;
    return typeof view?.matchMedia === 'function' && view.matchMedia('(hover: none)').matches;
  }
}
