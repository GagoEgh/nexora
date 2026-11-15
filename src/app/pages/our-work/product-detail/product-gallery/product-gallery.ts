import {
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../../core/icons/icons';
import productContent from '../../products/product.content';
import type { ProductImage } from '../../products/data/product-view';
import { SWIPE_THRESHOLD, THUMB_SIZES, lightboxSizes, toTiles } from '../gallery-layout';

@Component({
  selector: 'app-product-gallery',
  imports: [MatIcon, MatIconButton],
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  host: {
    role: 'group',
    '[attr.aria-label]': 'labels().label.value',
  },
})
export class ProductGallery {
  readonly shots = input.required<readonly ProductImage[]>();

  private readonly document = inject(DOCUMENT);
  private readonly content = useDictionary(productContent);

  protected readonly labels = computed(() => this.content().gallery);

  protected readonly previousIcon = appIcon('chevron-left');
  protected readonly nextIcon = appIcon('chevron-right');
  protected readonly expandIcon = appIcon('maximize');
  protected readonly closeIcon = appIcon('x');
  protected readonly thumbSizes = THUMB_SIZES;

  private readonly current = linkedSignal<readonly ProductImage[], number>({
    source: this.shots,
    computation: () => 0,
  });

  protected readonly index = this.current.asReadonly();
  protected readonly tiles = computed(() => toTiles(this.shots()));
  protected readonly total = computed(() => this.shots().length);
  protected readonly many = computed(() => this.total() > 1);
  protected readonly active = computed(() => this.shots()[this.index()]);
  protected readonly activeSizes = computed(() => lightboxSizes(this.active()));
  protected readonly counter = computed(() => `${this.index() + 1} / ${this.total()}`);

  protected readonly position = computed(() =>
    this.labels()
      .position.value.replace('{current}', String(this.index() + 1))
      .replace('{total}', String(this.total())),
  );

  protected readonly open = signal(false);

  private readonly stage = viewChild.required<ElementRef<HTMLButtonElement>>('stage');
  private readonly lightbox = viewChild.required<ElementRef<HTMLDialogElement>>('lightbox');
  private readonly strip = viewChild<ElementRef<HTMLElement>>('strip');
  private readonly thumbs = viewChildren<ElementRef<HTMLElement>>('thumb');

  private drag: { readonly x: number; readonly y: number } | null = null;
  private swiped = false;
  private locked: { readonly overflow: string; readonly offset: number } | null = null;

  constructor() {
    afterRenderEffect(() => {
      const thumb = this.thumbs()[this.index()]?.nativeElement;
      const strip = this.strip()?.nativeElement;
      if (!thumb || !strip) {
        return;
      }
      strip.scrollLeft = Math.max(
        0,
        thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
      );
    });

    inject(DestroyRef).onDestroy(() => this.unlock());
  }

  protected step(delta: number): void {
    const total = this.total();
    this.current.update((index) => (index + delta + total) % total);
  }

  protected select(index: number): void {
    this.current.set(index);
  }

  protected openLightbox(): void {
    if (this.swiped) {
      this.swiped = false;
      return;
    }
    this.open.set(true);
    this.lock();
    this.lightbox().nativeElement.showModal();
  }

  protected closeLightbox(): void {
    this.lightbox().nativeElement.close();
  }

  protected onLightboxClose(): void {
    this.open.set(false);
    this.unlock();

    const stage = this.stage().nativeElement;
    if (!stage.contains(this.document.activeElement)) {
      stage.focus({ preventScroll: true });
    }
  }

  protected onLightboxClick(event: MouseEvent): void {
    if (event.target === this.lightbox().nativeElement) {
      this.closeLightbox();
    }
  }

  protected onLightboxKeydown(event: KeyboardEvent): void {
    if (!this.many() || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.step(-1);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.drag = event.isPrimary ? { x: event.clientX, y: event.clientY } : null;
  }

  protected onPointerUp(event: PointerEvent): void {
    const from = this.drag;
    this.drag = null;
    if (!from || !this.many()) {
      return;
    }
    const moved = event.clientX - from.x;
    if (Math.abs(moved) < SWIPE_THRESHOLD || Math.abs(moved) < Math.abs(event.clientY - from.y)) {
      return;
    }
    this.swiped = true;
    this.step(moved < 0 ? 1 : -1);
  }

  protected onPointerCancel(): void {
    this.drag = null;
  }

  private lock(): void {
    const root = this.document.documentElement;
    this.locked = {
      overflow: root.style.overflow,
      offset: this.document.defaultView?.scrollY ?? 0,
    };
    root.style.overflow = 'hidden';
  }

  private unlock(): void {
    const locked = this.locked;
    if (!locked) {
      return;
    }
    this.locked = null;

    const root = this.document.documentElement;
    if (locked.overflow) {
      root.style.overflow = locked.overflow;
    } else {
      root.style.removeProperty('overflow');
    }
    const view = this.document.defaultView;
    if (view && typeof view.scrollTo === 'function' && view.scrollY !== locked.offset) {
      view.scrollTo({ top: locked.offset, behavior: 'auto' });
    }
  }
}
