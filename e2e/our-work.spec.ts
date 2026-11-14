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
    for (const path of ['/our_work', '/hy/our_work/draculai', '/our_work/lav']) {
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
 * The gallery, on the one product that has original photographs. The thing a stylesheet cannot
 * promise and only a browser can show: that each picture is laid out at its own ratio, so
 * nothing is stretched and nothing is cropped away.
 */
interface ShotMeasurement {
  readonly src: string;
  /** The ratio of the file itself, read from the decoded image. */
  readonly natural: number;
  /** The ratio of the box the page gave it. */
  readonly laid: number;
  readonly width: number;
  readonly complete: boolean;
  readonly alt: string;
}

test.describe('a product page with photographs', () => {
  const SHOT = '.product__shot-img';

  for (const viewport of VIEWPORTS) {
    test(`shows both photographs whole at ${viewport.width}px (${viewport.label})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/our_work/lav');
      await ready(page);
      await page.locator(SHOT).first().scrollIntoViewIfNeeded();
      // The gallery is lazy by design, so a measurement taken the instant the tile is scrolled
      // into view reads a box that has no picture in it yet. Wait for the bytes, then measure.
      await expect
        .poll(() =>
          page
            .locator(SHOT)
            .evaluateAll((elements) =>
              (elements as HTMLImageElement[]).every(
                (image) => image.complete && image.naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);

      // `evaluateAll` hands the callback `HTMLElement[]`; the selector is an `img`, so the
      // narrowing is what lets the measurement read `naturalWidth` rather than guess a ratio.
      const shots: ShotMeasurement[] = await page.locator(SHOT).evaluateAll((elements) =>
        (elements as HTMLImageElement[]).map((image) => {
          const box = image.getBoundingClientRect();
          return {
            src: image.getAttribute('src') ?? '',
            natural: image.naturalWidth / image.naturalHeight,
            laid: box.width / box.height,
            width: Math.round(box.width),
            complete: image.complete && image.naturalWidth > 0,
            alt: image.getAttribute('alt') ?? '',
          };
        }),
      );

      expect(shots).toHaveLength(2);
      for (const [index, shot] of shots.entries()) {
        expect(shot.complete, `${shot.src} did not load`).toBe(true);
        expect(shot.alt.length, `shot ${index} has no description`).toBeGreaterThan(0);
        // Laid out at its own ratio, to within a rounded pixel: not stretched, not cropped.
        expect(
          Math.abs(shot.laid - shot.natural),
          `${shot.src} is laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
        ).toBeLessThan(0.02);
        expect(shot.width, `${shot.src} collapsed at ${viewport.width}px`).toBeGreaterThan(100);
      }
    });
  }

  test('puts the two photographs side by side once there is room for them', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/our_work/lav');
    await ready(page);

    const tops = await page
      .locator(SHOT)
      .evaluateAll((images) =>
        images.map((image) => Math.round(image.getBoundingClientRect().top)),
      );
    expect(new Set(tops).size, 'the two photographs should share a row').toBe(1);
  });

  test('stacks them in one column on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/our_work/lav');
    await ready(page);

    const lefts = await page
      .locator(SHOT)
      .evaluateAll((images) => images.map((image) => Math.round(image.getBoundingClientRect().x)));
    expect(new Set(lefts).size, 'the photographs should share one column').toBe(1);
  });

  /** The hero is the one image that is cropped, and the one that must not be deferred. */
  test('loads the hero eagerly and the gallery lazily', async ({ page }) => {
    await page.goto('/our_work/lav');
    await ready(page);

    const hero = page.locator('.product__hero-img');
    await expect(hero).toHaveAttribute('fetchpriority', 'high');
    expect(await hero.getAttribute('loading'), 'the LCP image must not be deferred').toBeNull();

    for (const shot of await page.locator(SHOT).all()) {
      await expect(shot).toHaveAttribute('loading', 'lazy');
    }
  });
});
