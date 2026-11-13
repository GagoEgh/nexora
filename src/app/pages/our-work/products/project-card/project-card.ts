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

  /**
   * Held low while Escape puts the caret back on the card. Returning focus raises `focusin`,
   * and without this the card would turn straight back to the face the visitor just dismissed.
   */
  private openOnFocus = true;

  /** The card's own picture. `photos` is never empty; anything after the first is gallery. */
  protected readonly cover = computed(() => this.product().photos[0]);

  /**
   * The host's accessible name. Nineteen cards sit in one list, so the name has to say which
   * product this is before a screen-reader user decides whether to walk into it.
   */
  protected readonly cardLabel = computed(
    () => `${this.product().name} — ${this.product().category}`,
  );

  /**
   * The outward link's accessible name, with the new-tab notice folded in.
   *
   * It has to be part of the name rather than a visually-hidden span beside an `aria-label`:
   * `aria-label` replaces an element's contents in name computation, so a sibling span is
   * computed away and the warning is silently lost.
   */
  protected readonly visitLabel = computed(
    () => `${this.labels().visitSite}: ${this.product().name} (${this.labels().newTab})`,
  );

  protected show(): void {
    this.flipped.set(true);
  }

  /** The keyboard trigger: the caret arriving anywhere in the card turns it. */
  protected focusEnter(): void {
    if (!this.openOnFocus) return;
    this.show();
  }

  /** Hover is the pointer trigger only. On touch a tap often raises `mouseenter` first. */
  protected pointerEnter(): void {
    if (this.coarsePointer()) return;
    this.show();
  }

  /** Leaving with the caret still inside would pull the back out from under the keyboard. */
  protected pointerLeave(): void {
    if (this.coarsePointer() || this.containsFocus()) return;
    this.flipped.set(false);
  }

  /** The touch trigger. A tap on either link is navigation, not a toggle. */
  protected onClick(event: MouseEvent): void {
    if (!this.coarsePointer()) return;
    if ((event.target as HTMLElement | null)?.closest('a')) return;
    this.flipped.update((showing) => !showing);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) return;
    this.flipped.set(false);
  }

  /**
   * Escape returns the card and leaves the caret on it, so the visitor's place in a grid of
   * nineteen is not lost. The caret may be on one of the back face's links, which is about to
   * become unfocusable, so it is moved to the card itself - with `focusin` suppressed for the
   * duration, because that move would otherwise re-open what was just dismissed.
   */
  protected dismiss(): void {
    if (!this.flipped()) return;
    this.flipped.set(false);
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

  /**
   * Checked per call rather than cached: this runs on the server during prerender, where there
   * is no `matchMedia`, and a visitor can switch input device without reloading.
   */
  private coarsePointer(): boolean {
    const view = this.document.defaultView;
    return typeof view?.matchMedia === 'function' && view.matchMedia('(hover: none)').matches;
  }
}
