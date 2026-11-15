import { expect, test, type Page } from '@playwright/test';

/**
 * The portfolio grid, in a real browser.
 *
 * The unit specs already pin the card's state machine. What they cannot see is the part that
 * only exists once CSS is applied: that the two faces share one grid cell, that a card is
 * therefore as tall as its longer face rather than a fixed height, that this still holds when
 * the copy grows - Armenian and Russian both run materially longer than English - and, above
 * all, that the turned-away face is genuinely gone rather than merely rotated out of sight.
 * `visibility` is what makes that true, and only a browser can confirm it.
 */

const CARD = 'app-project-card';

/** The route has rendered, not merely the shell. */
const ready = async (page: Page) => {
  await page.locator('main h1').waitFor();
};

/** The grid has rendered; only the portfolio page has one. */
const cardsReady = async (page: Page) => {
  await ready(page);
  await page.locator(CARD).first().waitFor();
};

/** Every width the portfolio claims to support, from the narrowest phone to a wide desktop. */
const VIEWPORTS = [
  { label: 'small phone', width: 320, height: 568 },
  { label: 'phone', width: 375, height: 812 },
  { label: 'phone', width: 390, height: 844 },
  { label: 'large phone', width: 430, height: 932 },
  { label: 'tablet portrait', width: 768, height: 1024 },
  { label: 'tablet landscape', width: 1024, height: 768 },
  { label: 'laptop', width: 1280, height: 800 },
  { label: 'laptop large', width: 1440, height: 900 },
  { label: 'desktop', width: 1920, height: 1080 },
] as const;

const LOCALES = ['', 'hy', 'ru'] as const;

test.describe('the portfolio grid', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('renders every product as a card', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    await expect(page.locator(CARD)).toHaveCount(19);
    await expect(page.locator('.project-card__title')).toHaveCount(19);
  });

  test('opens a product page from its card', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const first = page.locator(CARD).first();
    const name = (await first.locator('.project-card__title').innerText()).trim();
    // The link lives on the back face, so the card has to be turned before it can be clicked.
    await first.hover();
    await first.locator('.project-card__link').click();

    await expect(page).toHaveURL(/\/our_work\/[a-z0-9-]+$/);
    await expect(page.locator('main h1')).toHaveText(name);
  });

  /**
   * The flip, which is the behaviour this component exists for and which regressed once by
   * being deleted along with the "Details" button that used to trigger it. There is no button:
   * the pointer entering the card is the whole gesture, and leaving it is the whole undo.
   */
  test('turns on hover and returns when the pointer leaves', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const card = page.locator(CARD).first();
    const front = card.locator('.project-card__face--front');
    const back = card.locator('.project-card__face--back');
    const box = await card.boundingBox();

    await expect(front).toBeVisible();
    await expect(back).toBeHidden();

    await card.hover();
    await expect(card).toHaveClass(/is-flipped/);
    await expect(back).toBeVisible();
    await expect(front).toBeHidden();

    // Away from the grid entirely, rather than onto a neighbour, so only one card is involved.
    await page.mouse.move(0, 0);
    await expect(card).not.toHaveClass(/is-flipped/);
    await expect(back).toBeHidden();
    await expect(front).toBeVisible();

    // Turning does not resize the card: both faces share one grid cell, so the box is fixed.
    expect(await card.boundingBox()).toMatchObject({
      width: box?.width,
      height: box?.height,
    });
  });

  /**
   * The regression that `visibility` is in the stylesheet to prevent. `backface-visibility` and
   * a rotation hide a face from view and leave its links clickable, focusable and announced -
   * nineteen cards' worth of controls that are nowhere on screen (WCAG 2.4.3, 4.1.2).
   */
  test('puts the turned-away face out of reach, not merely out of sight', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const reachable = await page
      .locator(CARD + ' .project-card__face--back a')
      .evaluateAll((links) =>
        links
          .filter((link) => link.checkVisibility({ visibilityProperty: true }))
          .map((link) => link.getAttribute('aria-label') ?? ''),
      );

    expect(reachable, 'these links are reachable while their card is turned away').toEqual([]);
  });

  /**
   * The keyboard path, in the part that is the same in every browser: the card itself is the tab
   * stop - nothing on the front face is focusable - so focus is what opens it, and both links on
   * the back can then take the caret without the card closing under them.
   */
  test('opens on focus, and holds while the caret moves between its links', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const first = page.locator(CARD).first();
    await first.focus();
    await expect(first).toHaveClass(/is-flipped/);

    await first.locator('.project-card__link').focus();
    await expect(first.locator('.project-card__link')).toBeFocused();
    await expect(first).toHaveClass(/is-flipped/);

    await first.locator('.project-card__visit').focus();
    await expect(first.locator('.project-card__visit')).toBeFocused();
    await expect(first).toHaveClass(/is-flipped/);

    // Leaving the card for the next one returns it, so the grid is not a trail of open cards.
    await page.locator(CARD).nth(1).focus();
    await expect(first).not.toHaveClass(/is-flipped/);
    await expect(page.locator(CARD).nth(1)).toHaveClass(/is-flipped/);
  });

  /**
   * The Tab order itself, which is Chromium-only **by browser policy, not by defect**: WebKit
   * leaves links out of the Tab sequence altogether unless Full Keyboard Access is on, so there
   * Tab goes card → card and the links are reached with Option+Tab. Verified directly: from a
   * focused `div[tabindex="0"]` holding two links, Chromium walks `a1, a2, next` and WebKit
   * walks `next, body, …`. The test above covers what every browser must do.
   */
  test('walks card → detail link → live link → next card', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit omits links from the Tab sequence by default');

    await page.goto('/our_work');
    await cardsReady(page);

    const first = page.locator(CARD).first();
    await first.focus();

    await page.keyboard.press('Tab');
    await expect(first.locator('.project-card__link')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(first.locator('.project-card__visit')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator(CARD).nth(1)).toBeFocused();
    await expect(first).not.toHaveClass(/is-flipped/);
  });

  test('returns the card on Escape and leaves the caret on it', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const first = page.locator(CARD).first();
    await first.focus();
    await page.keyboard.press('Escape');

    await expect(first).not.toHaveClass(/is-flipped/);
    await expect(first).toBeFocused();
  });

  /**
   * Nineteen detail links, seventeen outbound ones - two products have no destination worth
   * sending anyone to - and no buttons at all, because the card is its own control.
   */
  test('offers a detail link per card and leaves the site only safely', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    await expect(page.locator(CARD + ' .project-card__link')).toHaveCount(19);
    await expect(page.locator(CARD + ' .project-card__visit')).toHaveCount(17);
    await expect(page.locator(CARD + ' button')).toHaveCount(0);
    await expect(page.locator(CARD + ' a[target="_blank"]')).toHaveCount(17);
    await expect(page.locator(CARD + ' a[target="_blank"]:not([rel~="noopener"])')).toHaveCount(0);
  });
});

/**
 * The turn itself, which no other test here sees: every project in this suite runs with
 * `reducedMotion: 'reduce'`, where the token layer zeroes every duration. That is the right
 * default - it makes the suite fast and deterministic - but it means the animated path, the one
 * a visitor actually gets, would otherwise never be executed.
 *
 * What matters is that the two timings stay in step. The faces swap with `visibility`, which
 * cannot be interpolated, so it is delayed by exactly the length of the turn; if the two ever
 * disagree, the outgoing face either vanishes mid-rotation or lingers after it.
 */
test.describe('the turn, with motion enabled', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });

  test('rotates over the flip duration, and swaps the faces in step with it', async ({ page }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const timings = await page
      .locator(CARD)
      .first()
      .evaluate((card) => {
        const read = (selector: string, property: string) => {
          const element = selector ? card.querySelector(selector) : card;
          return element instanceof HTMLElement
            ? getComputedStyle(element).getPropertyValue(property).trim()
            : '';
        };
        return {
          flip: getComputedStyle(card).getPropertyValue('--nx-motion-duration-flip').trim(),
          innerProperty: read('.project-card__inner', 'transition-property'),
          innerDuration: read('.project-card__inner', 'transition-duration'),
          faceProperty: read('.project-card__face--front', 'transition-property'),
          faceDelay: read('.project-card__face--front', 'transition-delay'),
        };
      });

    expect(timings.flip).toBe('520ms');
    expect(timings.innerProperty).toBe('transform');
    expect(timings.innerDuration).toBe('0.52s');
    // The hidden face leaves only once the card has finished turning.
    expect(timings.faceProperty).toBe('visibility');
    expect(timings.faceDelay).toBe('0.52s');
  });

  test('completes the turn and leaves the back face settled, not mid-rotation', async ({
    page,
  }) => {
    await page.goto('/our_work');
    await cardsReady(page);

    const card = page.locator(CARD).first();
    await card.hover();
    await expect(card).toHaveClass(/is-flipped/);
    await expect(card.locator('.project-card__face--back')).toBeVisible();

    // Half a turn in, the card is somewhere between its two faces; a quarter of a second after
    // the duration has elapsed it has to be exactly on the back one.
    await page.waitForTimeout(800);
    const settled = await card.locator('.project-card__inner').evaluate((inner) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(inner).transform);
      // rotateY(180deg) is m11 = -1; anything in between is still turning.
      return Math.abs(matrix.m11 + 1) < 0.01;
    });
    expect(settled, 'the card did not come to rest on its back face').toBe(true);
  });
});

/**
 * The card has no fixed height, so the row it sits in is as tall as the tallest card in it.
 * These are the assertions that would fail if a face were positioned absolutely - the usual
 * recipe for a flip card - which collapses the parent and forces a hard-coded height.
 */
test.describe('card height adapts to its content', () => {
  for (const locale of LOCALES) {
    const url = `/${[locale, 'our_work'].filter(Boolean).join('/')}`;

    test(`${url}: no card is clipped by its own box`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url);
      await cardsReady(page);

      const clipped = await page.locator(CARD).evaluateAll((cards) =>
        cards
          .map((card, index) => {
            const body = card.querySelector('.project-card__body');
            if (!(body instanceof HTMLElement)) {
              return null;
            }
            // The front face must contain its own copy: a card whose text is taller than the
            // box it was given is a card with a height that does not follow its content.
            const overflow = body.scrollHeight - body.clientHeight;
            return overflow > 1 ? `card ${index} overflows its body by ${overflow}px` : null;
          })
          .filter(Boolean),
      );

      expect(clipped, 'these cards clip their own copy').toEqual([]);
    });

    /**
     * The back face carries more copy than the front in every locale, and it is the one that
     * has to fit: a card sized to its front would clip the summary the moment it turned.
     */
    test(`${url}: no card clips the face it turns to`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url);
      await cardsReady(page);

      const clipped = await page.locator(CARD).evaluateAll((cards) =>
        cards
          .map((card, index) => {
            const back = card.querySelector('.project-card__face--back');
            if (!(back instanceof HTMLElement)) {
              return `card ${index} has no back face`;
            }
            const overflow = back.scrollHeight - card.clientHeight;
            return overflow > 1 ? `card ${index} clips its back face by ${overflow}px` : null;
          })
          .filter(Boolean),
      );

      expect(clipped, 'these cards clip the face they turn to').toEqual([]);
    });

    test(`${url}: every card in a row is the same height`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url);
      await cardsReady(page);

      const rows = await page.locator('.projects__card').evaluateAll((items) => {
        const byTop = new Map<number, number[]>();
        for (const item of items) {
          const box = item.getBoundingClientRect();
          const top = Math.round(box.top);
          byTop.set(top, [...(byTop.get(top) ?? []), Math.round(box.height)]);
        }
        return [...byTop.values()];
      });

      expect(rows.length, 'the grid produced no rows to compare').toBeGreaterThan(0);
      for (const heights of rows) {
        expect(new Set(heights).size, `heights in one row: ${heights.join(', ')}`).toBe(1);
      }
    });
  }
});

/**
 * `overflow.spec.ts` already sweeps every sitemap URL for sideways scroll at three widths.
 * This covers the six widths it does not, on the two pages this work changed, so the full set
 * the brief names is actually exercised rather than inspected in CSS.
 */
test.describe('the portfolio at every supported width', () => {
  for (const viewport of VIEWPORTS) {
    for (const path of [
      '/our_work',
      '/hy/our_work/draculai',
      '/our_work/lav',
      '/our_work/robert-irwin',
      '/our_work/mastercraft',
      '/our_work/got-matcha',
      '/our_work/roar-organic',
      '/our_work/jdm-west-coast',
      '/our_work/zadeh-md',
      '/our_work/hydrant',
      '/our_work/libra-analytics',
      '/our_work/sell-me-watch',
      '/our_work/mezave',
    ]) {
      test(`${path} fits ${viewport.width}px (${viewport.label})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(path);
        await ready(page);

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth - doc.clientWidth;
        });
        expect(overflow, `${path} scrolls sideways at ${viewport.width}px`).toBeLessThanOrEqual(0);

        // Every card still shows its own front at this width.
        await expect(page.locator('.project-card__title, main h1').first()).toBeVisible();
      });
    }
  }
});

/**
 * The product gallery, in a real browser.
 *
 * The unit spec already pins the state machine: which slide is up, what the counter reads, what
 * the lightbox shows. What it cannot see is everything the platform owns. `<dialog>` is the
 * clearest case - jsdom implements none of `showModal()`, so the focus trap, the return of
 * focus, Escape and the backdrop are only ever executed here. The rest is geometry: that one
 * picture is up at a time, that each is laid out at its own ratio inside the band rather than
 * stretched to fill it, that the strip scrolls instead of the page, and that none of it leaks
 * sideways at 320px.
 */

const STAGE = '.gallery__viewport';
const SLIDE = '.gallery__slide';
const ACTIVE = '.gallery__slide.is-active .gallery__img';
const THUMB = '.gallery__thumb-button';
const STRIP = '.gallery__thumbs';
const COUNTER = '.gallery__counter';
const LIGHTBOX = 'dialog.gallery__lightbox';

/** Five photographs: the longest strip in the portfolio. */
const MANY = '/our_work/libra-analytics';
/** Upright, square and landscape in one gallery: the shapes the band has to hold. */
const SHAPES = '/our_work/mezave';
/** One photograph, which is eleven of the nineteen. */
const ONE = '/our_work/draculai';

/** The route has rendered and the picture on the stage has actually arrived. */
const galleryReady = async (page: Page, path: string) => {
  await page.goto(path);
  await ready(page);
  await page.locator(STAGE).waitFor();
  await expect
    .poll(() =>
      page
        .locator(ACTIVE)
        .evaluate(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
    )
    .toBe(true);
};

const opacities = (page: Page): Promise<number[]> =>
  page
    .locator(SLIDE)
    .evaluateAll((slides) => slides.map((slide) => Number(getComputedStyle(slide).opacity)));

const horizontalOverflow = (page: Page): Promise<number> =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('the product gallery at every supported width', () => {
  for (const viewport of VIEWPORTS) {
    test(`shows one photograph whole at ${viewport.width}px (${viewport.label})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await galleryReady(page, SHAPES);

      const showing = (await opacities(page)).filter((opacity) => opacity > 0);
      expect(showing, 'one picture is up at a time').toHaveLength(1);

      const shot = await page.locator(ACTIVE).evaluate((element) => {
        const image = element as HTMLImageElement;
        const box = image.getBoundingClientRect();
        const band = (image.closest('.gallery__viewport') as HTMLElement).getBoundingClientRect();
        return {
          src: image.getAttribute('src') ?? '',
          natural: image.naturalWidth / image.naturalHeight,
          laid: box.width / box.height,
          width: box.width,
          height: box.height,
          intrinsic: image.naturalWidth,
          band: { width: band.width, height: band.height },
        };
      });

      // Laid out at its own ratio, to within a rounded pixel: not stretched, not cropped.
      expect(
        Math.abs(shot.laid - shot.natural),
        `${shot.src} is laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
      ).toBeLessThan(0.02);
      expect(shot.width, `${shot.src} is wider than the band`).toBeLessThanOrEqual(
        shot.band.width + 1,
      );
      expect(shot.height, `${shot.src} is taller than the band`).toBeLessThanOrEqual(
        shot.band.height + 1,
      );
      expect(shot.width, `${shot.src} collapsed at ${viewport.width}px`).toBeGreaterThan(100);
      expect(
        shot.width,
        `${shot.src} is scaled past the ${shot.intrinsic}px of detail it carries`,
      ).toBeLessThanOrEqual(shot.intrinsic + 1);

      expect(
        await horizontalOverflow(page),
        `the gallery scrolls the page sideways at ${viewport.width}px`,
      ).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('walking through the photographs', () => {
  test('walks forward and back with the arrows, and wraps round at either end', async ({
    page,
  }) => {
    await galleryReady(page, MANY);
    const counter = page.locator(COUNTER);

    await expect(counter).toHaveText('1 / 5');
    await page.locator('.gallery__nav--next').click();
    await expect(counter).toHaveText('2 / 5');

    await page.locator('.gallery__nav--previous').click();
    await expect(counter).toHaveText('1 / 5');
    await page.locator('.gallery__nav--previous').click();
    await expect(counter, 'back from the first lands on the last').toHaveText('5 / 5');
    await page.locator('.gallery__nav--next').click();
    await expect(counter, 'forward from the last lands on the first').toHaveText('1 / 5');
  });

  test('picks a photograph from the strip, and scrolls the strip rather than the page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await galleryReady(page, MANY);

    const strip = page.locator(STRIP);
    expect(
      await strip.evaluate((element) => element.scrollWidth > element.clientWidth),
      'five thumbnails should not fit a phone, or this proves nothing',
    ).toBe(true);
    expect(await strip.evaluate((element) => element.scrollLeft)).toBe(0);

    const last = page.locator(THUMB).last();
    await last.click();
    await expect(page.locator(COUNTER)).toHaveText('5 / 5');
    await expect(last).toHaveAttribute('aria-current', 'true');

    // The strip caught up with the picture, and did it inside its own box.
    expect(
      await strip.evaluate((element) => element.scrollLeft),
      'the current thumbnail was not brought into view',
    ).toBeGreaterThan(0);
    const inView = await strip.evaluate((element) => {
      const current = element.querySelector('[aria-current="true"]') as HTMLElement;
      const box = element.getBoundingClientRect();
      const thumb = current.getBoundingClientRect();
      return thumb.left >= box.left - 1 && thumb.right <= box.right + 1;
    });
    expect(inView, 'the current thumbnail is outside the strip').toBe(true);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test('moves the current thumbnail when the picture is changed from the arrows', async ({
    page,
  }) => {
    await galleryReady(page, MANY);

    await page.locator('.gallery__nav--next').click();
    await expect(page.locator(THUMB).nth(1)).toHaveAttribute('aria-current', 'true');
    expect(await page.locator(`${THUMB}[aria-current="true"]`).count()).toBe(1);
  });

  /** Eleven of the nineteen products carry one photograph; there is nothing to operate there. */
  test('offers no controls for a product with one photograph', async ({ page }) => {
    await galleryReady(page, ONE);

    await expect(page.locator(SLIDE)).toHaveCount(1);
    await expect(page.locator('.gallery__nav')).toHaveCount(0);
    await expect(page.locator(STRIP)).toHaveCount(0);
    await expect(page.locator(COUNTER)).toHaveCount(0);
    await expect(page.locator(STAGE), 'the picture still opens full size').toBeVisible();
  });

  /** The first slide is this page's LCP image; the rest are a click away at most. */
  test('loads the first photograph eagerly and defers the others', async ({ page }) => {
    await galleryReady(page, MANY);

    const first = page.locator('.gallery__img').first();
    await expect(first).toHaveAttribute('fetchpriority', 'high');
    expect(await first.getAttribute('loading'), 'the LCP image must not be deferred').toBeNull();

    for (const slide of (await page.locator('.gallery__img').all()).slice(1)) {
      await expect(slide).toHaveAttribute('loading', 'lazy');
    }
    for (const thumb of await page.locator('.gallery__thumb-img').all()) {
      await expect(thumb).toHaveAttribute('loading', 'lazy');
    }
  });
});

/**
 * The crossfade, which no other test here sees: every project in this suite runs with
 * `reducedMotion: 'reduce'`, where the token layer zeroes every duration. That is the right
 * default, but it means the transition a visitor actually gets would never be executed.
 */
test.describe('the crossfade, with motion enabled', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });

  test('fades between the photographs over the duration the tokens declare', async ({ page }) => {
    await galleryReady(page, MANY);

    const timing = await page
      .locator(SLIDE)
      .first()
      .evaluate((slide) => ({
        property: getComputedStyle(slide).transitionProperty,
        duration: getComputedStyle(slide).transitionDuration,
      }));
    expect(timing.property).toBe('opacity');
    // The band the brief asks for, and the project's own `base` duration.
    expect(Number.parseFloat(timing.duration)).toBeGreaterThanOrEqual(0.2);
    expect(Number.parseFloat(timing.duration)).toBeLessThanOrEqual(0.3);

    // Both the outgoing and the incoming picture have to run a transition; a cut would run
    // none. Read from the transitions themselves rather than by sampling opacity at a moment,
    // which is a race against a 220ms window under a loaded test runner.
    const faded = await page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const running: string[] = [];
          for (const slide of document.querySelectorAll('.gallery__slide')) {
            slide.addEventListener('transitionrun', (event) =>
              running.push((event as TransitionEvent).propertyName),
            );
          }
          (document.querySelector('.gallery__nav--next') as HTMLElement).click();
          setTimeout(() => resolve(running), 400);
        }),
    );
    expect(
      faded.filter((property) => property === 'opacity').length,
      `the picture was cut, not faded: ${faded.join(', ') || 'no transition ran'}`,
    ).toBeGreaterThanOrEqual(2);

    await expect
      .poll(async () => (await opacities(page)).map((opacity) => Math.round(opacity)))
      .toEqual([0, 1, 0, 0, 0]);
  });
});

/**
 * The full-size view. Everything here is the platform's: the top layer, the focus trap, Escape,
 * the backdrop, and the return of focus to whatever opened the dialog. The component writes
 * none of it, which is exactly why it has to be executed in a browser.
 */
test.describe('the full-size view', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('opens from the picture and closes on Escape, leaving the caret where it was', async ({
    page,
  }) => {
    await galleryReady(page, MANY);
    const dialog = page.locator(LIGHTBOX);

    await expect(dialog).toBeHidden();
    await page.locator(STAGE).click();
    await expect(dialog).toBeVisible();

    const full = dialog.locator('.gallery__full-img');
    await expect(full).toBeVisible();
    await expect(full).toHaveAttribute('alt', /\S/);
    // `showModal()` moves the caret inside; the close button is the dialog's `autofocus`.
    await expect(dialog.locator('.gallery__close')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator(STAGE), 'focus did not come back to the picture').toBeFocused();
  });

  test('walks the photographs with the arrow keys and keeps the page behind it in step', async ({
    page,
  }) => {
    await galleryReady(page, MANY);
    await page.locator(STAGE).click();

    const shown = () => page.locator('.gallery__full-img').getAttribute('src');
    const first = await shown();

    await page.keyboard.press('ArrowRight');
    await expect.poll(shown).not.toBe(first);
    const second = await shown();

    await page.keyboard.press('ArrowLeft');
    await expect.poll(shown).toBe(first);

    await page.locator('.gallery__bar--controls .gallery__full-nav').last().click();
    await expect.poll(shown).toBe(second);

    await page.keyboard.press('Escape');
    await expect(page.locator(COUNTER), 'the stage followed the full-size view').toHaveText(
      '2 / 5',
    );
  });

  test('closes on the backdrop and stays open on the picture', async ({ page }) => {
    await galleryReady(page, MANY);
    const dialog = page.locator(LIGHTBOX);
    await page.locator(STAGE).click();
    await expect(dialog).toBeVisible();

    await dialog.locator('.gallery__full-img').click();
    await expect(dialog, 'the picture is not a way out').toBeVisible();

    // The gutter: inside the dialog's box, outside everything in it.
    await dialog.click({ position: { x: 4, y: 4 } });
    await expect(dialog).toBeHidden();
  });

  test('holds the page still while it is open, and leaves the visitor where they were', async ({
    page,
  }) => {
    await galleryReady(page, MANY);
    await page.locator(STAGE).scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before, 'the page should be scrolled, or this proves nothing').toBeGreaterThan(0);

    await page.locator(STAGE).click();
    await expect(page.locator(LIGHTBOX)).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
    ).toContain('hidden');

    // A real wheel gesture, not `window.scrollBy`: `overflow: hidden` stops the visitor from
    // scrolling but leaves the box programmatically scrollable, so a scripted scroll would
    // succeed here and prove nothing about what a visitor can do.
    await page.mouse.wheel(0, 400);
    expect(
      await page.evaluate(() => window.scrollY),
      'the page scrolled behind the full-size view',
    ).toBe(before);

    await page.keyboard.press('Escape');
    await expect(page.locator(LIGHTBOX)).toBeHidden();
    // `close()` removes the `open` attribute and only then queues the `close` event, so the
    // dialog reads as hidden a turn before the handler that gives the scrolling back has run.
    // Focus returning to the stage happens in that same handler, after the unlock, which makes
    // it the signal to wait on rather than polling the style.
    await expect(page.locator(STAGE)).toBeFocused();
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
      'the page was left unable to scroll',
    ).not.toContain('hidden');
    expect(await page.evaluate(() => window.scrollY), 'the visitor was moved').toBe(before);

    await page.evaluate(() => window.scrollBy(0, 200));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });

  test('fits the narrowest phone without leaking sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await galleryReady(page, SHAPES);
    await page.locator(STAGE).click();
    await expect(page.locator(LIGHTBOX)).toBeVisible();

    const shot = await page.locator('.gallery__full-img').evaluate((element) => {
      const image = element as HTMLImageElement;
      const box = image.getBoundingClientRect();
      return {
        natural: image.naturalWidth / image.naturalHeight,
        laid: box.width / box.height,
        right: box.right,
        bottom: box.bottom,
      };
    });

    expect(Math.abs(shot.laid - shot.natural), 'the full-size picture is distorted').toBeLessThan(
      0.02,
    );
    expect(shot.right).toBeLessThanOrEqual(320);
    expect(shot.bottom).toBeLessThanOrEqual(568);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
