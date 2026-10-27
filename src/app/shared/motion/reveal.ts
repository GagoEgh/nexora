import { DOCUMENT } from '@angular/common';
import { afterNextRender, Directive, DestroyRef, ElementRef, inject, input } from '@angular/core';

const THRESHOLD = 0.15;
const ROOT_MARGIN = '0px 0px -10% 0px';

@Directive({
  selector: '[appReveal]',
})
export class Reveal {
  readonly appReveal = input<'scroll' | 'load' | ''>('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.host.nativeElement;
      const view = this.document.defaultView;

      if (!view || !('IntersectionObserver' in view)) {
        return;
      }

      element.setAttribute('data-reveal', 'out');

      if (this.appReveal() === 'load') {
        view.requestAnimationFrame(() => {
          view.requestAnimationFrame(() => this.reveal());
        });
        return;
      }

      const observer = new view.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.reveal();
            observer.disconnect();
          }
        },
        { threshold: THRESHOLD, rootMargin: ROOT_MARGIN },
      );

      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private reveal(): void {
    this.host.nativeElement.setAttribute('data-reveal', 'in');
  }
}
