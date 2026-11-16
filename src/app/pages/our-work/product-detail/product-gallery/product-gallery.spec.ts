import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../../core/icons/provide-app-icons';
import type { ProductImage } from '../../products/data/product-view';
import { ProductGallery } from './product-gallery';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const shot = (name: string, width: number, height: number): ProductImage => ({
  src: `images/${name}.webp`,
  srcset: `images/${name}-400.webp 400w, images/${name}.webp ${width}w`,
  width,
  height,
  alt: `${name} described`,
});

/** Three shapes, because the stage has to hold all three without distorting any of them. */
const SHOTS = [shot('upright', 637, 1104), shot('square', 980, 980), shot('wide', 1280, 720)];

/**
 * `<dialog>` is the whole of the lightbox, and jsdom 28 implements none of it - no `showModal`,
 * no top layer, no Escape, no focus restoration. The shim below is the narrowest thing that
 * lets the component's own logic run: it opens, it closes, and closing fires the `close` event
 * the component listens for, which is what the native element does.
 *
 * What it deliberately does not simulate is the behaviour the browser owns - the focus trap,
 * the return of focus to whatever opened the dialog, Escape, and the backdrop as a paint layer.
 * Asserting those here would be asserting this shim. They are covered in
 * `e2e/product-gallery.spec.ts`, in three real browsers.
 */
const shimDialog = (): void => {
  const prototype = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  if (typeof prototype['showModal'] === 'function') {
    return;
  }
  prototype['showModal'] = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  prototype['close'] = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
};

describe('ProductGallery', () => {
  let fixture: ComponentFixture<ProductGallery>;
  let root: HTMLElement;

  const render = async (shots: readonly ProductImage[]) => {
    fixture.componentRef.setInput('shots', shots);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  };

  const slides = () => Array.from(root.querySelectorAll<HTMLImageElement>('.gallery__img'));
  const active = () => slides().findIndex((slide) => slide.closest('.is-active') !== null);
  const thumbs = () =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('.gallery__thumb-button'));
  const nav = (direction: 'previous' | 'next') =>
    root.querySelector<HTMLButtonElement>(`.gallery__nav--${direction}`);
  const lightbox = () => root.querySelector<HTMLDialogElement>('dialog');
  const counter = () => root.querySelector('.gallery__counter')?.textContent?.trim() ?? '';
  const status = () => root.querySelector('.gallery__status')?.textContent?.trim() ?? '';
  const click = async (element: HTMLElement | null | undefined) => {
    element?.click();
    await fixture.whenStable();
  };
  const press = async (key: string) => {
    lightbox()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
  };
  const scrollLock = () => (TestBed.inject(DOCUMENT).documentElement as HTMLElement).style.overflow;

  beforeAll(shimDialog);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
    fixture = TestBed.createComponent(ProductGallery);
  });

  afterEach(() => {
    TestBed.inject(DOCUMENT).documentElement.removeAttribute('style');
  });

  it('renders every photograph, with its own box declared', async () => {
    await render(SHOTS);

    expect(slides()).toHaveLength(SHOTS.length);
    for (const [index, slide] of slides().entries()) {
      expect(slide.getAttribute('src'), `slide ${index}`).toBe(SHOTS[index].src);
      expect(slide.getAttribute('srcset'), `slide ${index}`).toBe(SHOTS[index].srcset);
      expect(slide.getAttribute('alt'), `slide ${index}`).toBe(SHOTS[index].alt);
      expect(Number(slide.getAttribute('width')), `slide ${index}`).toBe(SHOTS[index].width);
      expect(Number(slide.getAttribute('height')), `slide ${index}`).toBe(SHOTS[index].height);
      expect(slide.getAttribute('decoding'), `slide ${index}`).toBe('async');
    }
  });

  /**
   * One slide is up and the rest are not, and the ones that are not are gone from the
   * accessibility tree as well - they share the stage's grid cell, so a screen reader would
   * otherwise read five pictures where a visitor sees one.
   */
  it('starts on the first photograph and hides the others from the reader', async () => {
    await render(SHOTS);

    expect(active()).toBe(0);
    const hidden = Array.from(root.querySelectorAll('.gallery__slide')).map((slide) =>
      slide.getAttribute('aria-hidden'),
    );
    expect(hidden).toEqual([null, 'true', 'true']);
    expect(counter()).toBe('1 / 3');
  });

  it('walks forward and back through the photographs', async () => {
    await render(SHOTS);

    await click(nav('next'));
    expect(active()).toBe(1);
    expect(counter()).toBe('2 / 3');

    await click(nav('next'));
    expect(active()).toBe(2);

    await click(nav('previous'));
    expect(active()).toBe(1);
  });

  /** The last picture's "next" is the first one, in both directions. */
  it('wraps round at either end', async () => {
    await render(SHOTS);

    await click(nav('previous'));
    expect(active(), 'back from the first lands on the last').toBe(SHOTS.length - 1);
    expect(counter()).toBe('3 / 3');

    await click(nav('next'));
    expect(active(), 'forward from the last lands on the first').toBe(0);
  });

  it('picks a photograph from its thumbnail, and marks that thumbnail current', async () => {
    await render(SHOTS);

    expect(thumbs()).toHaveLength(SHOTS.length);
    await click(thumbs()[2]);

    expect(active()).toBe(2);
    expect(thumbs().map((thumb) => thumb.getAttribute('aria-current'))).toEqual([
      null,
      null,
      'true',
    ]);
    expect(thumbs()[2].classList.contains('is-active')).toBe(true);
  });

  /** The strip follows the stage as well as driving it: one index, read in both places. */
  it('moves the current thumbnail when the picture is changed from the arrows', async () => {
    await render(SHOTS);
    await click(nav('next'));

    expect(thumbs().map((thumb) => thumb.getAttribute('aria-current'))).toEqual([
      null,
      'true',
      null,
    ]);
  });

  /**
   * The counter is read twice: "2 / 3" by eye, and a sentence from the dictionary by a screen
   * reader. The glyph version is hidden from the reader so it is not read as "two slash three".
   */
  it('counts the photographs for both kinds of reader', async () => {
    await render(SHOTS);

    expect(root.querySelector('.gallery__counter')?.getAttribute('aria-hidden')).toBe('true');
    expect(status()).toBe('Image 1 of 3');
    expect(root.querySelector('.gallery__status')?.getAttribute('aria-live')).toBe('polite');

    await click(nav('next'));
    expect(status()).toBe('Image 2 of 3');
  });

  /** Eleven of the nineteen products carry one photograph; there is nothing to operate there. */
  it('offers no controls for a single photograph', async () => {
    await render([SHOTS[0]]);

    expect(slides()).toHaveLength(1);
    expect(active()).toBe(0);
    expect(nav('next')).toBeNull();
    expect(nav('previous')).toBeNull();
    expect(root.querySelector('.gallery__thumbs')).toBeNull();
    expect(root.querySelector('.gallery__counter')).toBeNull();
    expect(root.querySelector('.gallery__status')).toBeNull();
    expect(
      root.querySelector('.gallery__viewport'),
      'the picture still opens full size',
    ).not.toBeNull();
  });

  /**
   * The input's type allows an empty array where the product registry's `NonEmpty` does not, so
   * the component is asked for the case the type system cannot rule out: it renders a stage with
   * nothing in it rather than throwing.
   */
  it('renders an empty gallery without failing', async () => {
    await render([]);

    expect(slides()).toHaveLength(0);
    expect(nav('next')).toBeNull();
    expect(root.querySelector('.gallery__viewport')).not.toBeNull();

    // Opening a view of nothing shows nothing rather than throwing on the way.
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));
    expect(lightbox()?.hasAttribute('open')).toBe(true);
    expect(lightbox()?.querySelector('.gallery__full-img')).toBeNull();
  });

  it('opens the full-size view from the picture, and closes it again', async () => {
    await render(SHOTS);
    const dialog = lightbox();
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(
      dialog?.querySelector('.gallery__full-img'),
      'nothing is loaded until it opens',
    ).toBeNull();

    await click(root.querySelector<HTMLElement>('.gallery__viewport'));
    expect(dialog?.hasAttribute('open')).toBe(true);

    const full = dialog?.querySelector<HTMLImageElement>('.gallery__full-img');
    expect(full?.getAttribute('src')).toBe(SHOTS[0].src);
    expect(full?.getAttribute('alt')).toBe(SHOTS[0].alt);
    expect(full?.getAttribute('sizes'), 'the lightbox has its own measurement').not.toBe(
      slides()[0].getAttribute('sizes'),
    );

    await click(dialog?.querySelector<HTMLElement>('.gallery__close'));
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(dialog?.querySelector('.gallery__full-img')).toBeNull();
  });

  it('shows the photograph that was on the stage, and keeps the two in step', async () => {
    await render(SHOTS);
    await click(thumbs()[1]);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));

    const full = () => lightbox()?.querySelector<HTMLImageElement>('.gallery__full-img');
    expect(full()?.getAttribute('src')).toBe(SHOTS[1].src);

    await click(lightbox()?.querySelector<HTMLElement>('.gallery__full-nav'));
    expect(full()?.getAttribute('src'), 'the first control is "previous"').toBe(SHOTS[0].src);
    expect(active(), 'the stage behind it followed').toBe(0);
  });

  it('walks the full-size view with the arrow keys', async () => {
    await render(SHOTS);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));

    await press('ArrowRight');
    expect(active()).toBe(1);

    await press('ArrowLeft');
    expect(active()).toBe(0);

    await press('ArrowLeft');
    expect(active(), 'the keys wrap round like the buttons').toBe(SHOTS.length - 1);

    // Nothing else on the keyboard moves the picture.
    await press('a');
    expect(active()).toBe(SHOTS.length - 1);
  });

  /** A click on the dialog itself is the backdrop; a click on the picture is not. */
  it('closes on the backdrop and stays open on the picture', async () => {
    await render(SHOTS);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));

    await click(lightbox()?.querySelector<HTMLElement>('.gallery__full-img'));
    expect(lightbox()?.hasAttribute('open'), 'the picture is not a way out').toBe(true);

    await click(lightbox());
    expect(lightbox()?.hasAttribute('open')).toBe(false);
  });

  it('takes the page’s scrolling away while the view is open, and gives it back', async () => {
    await render(SHOTS);
    expect(scrollLock()).toBe('');

    await click(root.querySelector<HTMLElement>('.gallery__viewport'));
    expect(scrollLock()).toBe('hidden');

    await click(lightbox()?.querySelector<HTMLElement>('.gallery__close'));
    expect(scrollLock(), 'the page scrolls again').toBe('');
  });

  /**
   * The lock is taken before `showModal()`, so a second open arriving before the dialog has
   * painted reaches it. Unguarded, that second call saves the `hidden` the first call had just
   * written as the value to restore, and the page would never scroll again - the reader would
   * be stranded with no way back short of a reload.
   */
  it('gives the scrolling back after the view is opened twice over', async () => {
    await render(SHOTS);
    const stage = root.querySelector<HTMLElement>('.gallery__viewport');

    await click(stage);
    await click(stage);
    expect(scrollLock()).toBe('hidden');

    await click(lightbox()?.querySelector<HTMLElement>('.gallery__close'));
    expect(scrollLock(), 'the page scrolls again after a doubled open').toBe('');
  });

  /**
   * Every native way out of the dialog ends in a `close` event, which is the one exit the
   * component listens on - so Escape and the browser's own dismissal unlock the page too.
   */
  it('gives the scrolling back however the view was dismissed', async () => {
    await render(SHOTS);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));
    expect(scrollLock()).toBe('hidden');

    lightbox()?.dispatchEvent(new Event('close'));
    await fixture.whenStable();

    expect(scrollLock()).toBe('');
    expect(lightbox()?.querySelector('.gallery__full-img'), 'the picture is released').toBeNull();
  });

  /** Leaving the page with the view open would otherwise strand it unable to scroll. */
  it('gives the scrolling back when the gallery is destroyed', async () => {
    await render(SHOTS);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));
    expect(scrollLock()).toBe('hidden');

    fixture.destroy();

    expect(scrollLock()).toBe('');
  });

  /**
   * A drag across the stage turns the page, and the click that ends that drag is not also a
   * request to open the lightbox. A drag that travelled further down than across is the page
   * being scrolled past and must not turn anything.
   */
  describe('a drag across the stage', () => {
    const drag = async (from: readonly [number, number], to: readonly [number, number]) => {
      const stage = root.querySelector<HTMLElement>('.gallery__viewport');
      const event = (type: string, [x, y]: readonly [number, number]) =>
        new PointerEvent(type, { clientX: x, clientY: y, isPrimary: true, bubbles: true });
      stage?.dispatchEvent(event('pointerdown', from));
      stage?.dispatchEvent(event('pointerup', to));
      stage?.click();
      await fixture.whenStable();
    };

    it('turns to the next photograph when it travels to the left', async () => {
      await render(SHOTS);
      await drag([300, 100], [180, 110]);

      expect(active()).toBe(1);
      expect(lightbox()?.hasAttribute('open'), 'a swipe is not a tap').toBe(false);
    });

    it('turns back when it travels to the right', async () => {
      await render(SHOTS);
      await drag([180, 100], [320, 100]);

      expect(active(), 'back from the first lands on the last').toBe(SHOTS.length - 1);
    });

    it('leaves the picture alone when it is too short to be deliberate', async () => {
      await render(SHOTS);
      await drag([300, 100], [288, 100]);

      expect(active()).toBe(0);
      expect(lightbox()?.hasAttribute('open'), 'a tap still opens the full-size view').toBe(true);
    });

    it('leaves the picture alone when it is mostly downwards', async () => {
      await render(SHOTS);
      await drag([300, 100], [240, 300]);

      expect(active()).toBe(0);
    });

    it('abandons a drag the browser takes over', async () => {
      await render(SHOTS);
      const stage = root.querySelector<HTMLElement>('.gallery__viewport');
      stage?.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 300, clientY: 100, isPrimary: true }),
      );
      stage?.dispatchEvent(new PointerEvent('pointercancel'));
      stage?.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 100, clientY: 100, isPrimary: true }),
      );
      await fixture.whenStable();

      expect(active()).toBe(0);
    });
  });

  /**
   * The router reuses this component across `/our_work/<slug>`, so the index has to belong to
   * the product rather than to the component. Carrying an index of 2 into a product with one
   * photograph would land the stage on nothing.
   */
  it('returns to the first photograph when another product arrives', async () => {
    await render(SHOTS);
    await click(nav('next'));
    await click(nav('next'));
    expect(active()).toBe(2);

    await render([shot('other', 800, 600)]);

    expect(slides()).toHaveLength(1);
    expect(active()).toBe(0);
    expect(slides()[0].getAttribute('src')).toBe('images/other.webp');
  });

  it('announces itself as one group, named', async () => {
    await render(SHOTS);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Product gallery');
  });

  /**
   * Every control the gallery renders has a name of its own, because none of them has a label
   * in the page - they are an icon, a picture, or a thumbnail.
   */
  it('names every control it renders', async () => {
    await render(SHOTS);
    await click(root.querySelector<HTMLElement>('.gallery__viewport'));

    const controls = Array.from(root.querySelectorAll<HTMLElement>('button'));
    expect(controls.length).toBeGreaterThan(SHOTS.length);
    for (const control of controls) {
      const name = control.getAttribute('aria-label') ?? '';
      expect(name.length, control.className).toBeGreaterThan(0);
      expect(control.getAttribute('type'), control.className).toBe('button');
    }
    expect(lightbox()?.getAttribute('aria-label')).toBe('Full-size image');
  });

  it('describes the thumbnails without reading each picture twice', async () => {
    await render(SHOTS);

    for (const [index, thumb] of thumbs().entries()) {
      expect(thumb.getAttribute('aria-label')).toBe(SHOTS[index].alt);
      // The button carries the description, so the picture inside it is decorative.
      expect(thumb.querySelector('img')?.getAttribute('alt')).toBe('');
      expect(thumb.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    }
  });
});
