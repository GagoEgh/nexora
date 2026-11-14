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
  const SHOT = '.gallery__img';

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

/**
 * The panoramic original on the jeweller's page, which is the shape the gallery did not have a
 * layout for. `rings.webp` is 2.54:1; left in the two-column grid that suits `lav`'s square
 * photographs it was laid out in one of those columns, a strip beside an empty cell.
 *
 * Two things only a browser can confirm: that it now takes the whole gallery, and that taking
 * it does not mean being blown up - the file carries 890px of detail, and a box wider than that
 * would be upscale, which on jewellery is exactly where it would show.
 */
test.describe('a product page with a panoramic photograph', () => {
  const SHOT = '.gallery__img';

  for (const viewport of VIEWPORTS) {
    test(`lays the panorama out whole at ${viewport.width}px (${viewport.label})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/our_work/robert-irwin');
      await ready(page);
      await page.locator(SHOT).scrollIntoViewIfNeeded();
      // Deferred by design, so wait for the bytes before measuring the box.
      await expect
        .poll(() =>
          page.locator(SHOT).evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
        )
        .toBe(true);

      const shot = await page.locator(SHOT).evaluate((element) => {
        const image = element as HTMLImageElement;
        const box = image.getBoundingClientRect();
        return {
          natural: image.naturalWidth / image.naturalHeight,
          intrinsic: image.naturalWidth,
          laid: box.width / box.height,
          width: Math.round(box.width),
          alt: image.getAttribute('alt') ?? '',
        };
      });

      expect(
        Math.abs(shot.laid - shot.natural),
        `the panorama is laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
      ).toBeLessThan(0.02);
      expect(shot.alt.length, 'the panorama has no description').toBeGreaterThan(0);
      expect(shot.width, `the panorama collapsed at ${viewport.width}px`).toBeGreaterThan(100);
      expect(
        shot.width,
        `the panorama is scaled past the ${shot.intrinsic}px of detail it carries`,
      ).toBeLessThanOrEqual(shot.intrinsic + 1);
    });
  }

  test('gives the lone photograph the whole gallery rather than half of it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/our_work/robert-irwin');
    await ready(page);
    await page.locator(SHOT).scrollIntoViewIfNeeded();
    // The tile is sized to the picture inside it, so measuring before the deferred bytes land
    // reads the 1px borders and nothing else. Wait for the image, as the tests above do.
    await expect
      .poll(() =>
        page.locator(SHOT).evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);

    const widths = await page.evaluate(() => {
      const shot = document.querySelector('.gallery__shot');
      const gallery = document.querySelector('.gallery__row');
      return {
        shot: Math.round(shot?.getBoundingClientRect().width ?? 0),
        gallery: Math.round(gallery?.getBoundingClientRect().width ?? 0),
      };
    });

    expect(widths.gallery, 'no gallery was rendered').toBeGreaterThan(0);
    expect(widths.shot, 'the photograph is sharing the row with an empty column').toBe(
      widths.gallery,
    );
  });
});

/**
 * Four photographs, which is more than one grid can justify: column widths come from a row's own
 * ratios, and `grid-template-columns` applies to every row at once. The gallery is rows instead,
 * each sized by its own pair, and the section hands the gallery the whole width rather than an
 * aside once there are more than two.
 *
 * What the browser has to settle is the arithmetic: that each row lands on one baseline, that
 * the rows together fill the width they are given, and that neither happens by cropping or by
 * blowing a picture up past the detail it carries.
 */
test.describe('a gallery of more than two photographs', () => {
  const SHOT = '.gallery__img';

  /** Each product with such a gallery, and how many photographs each of its rows should hold. */
  const GALLERIES = [
    { slug: 'libra-analytics', rows: [2, 2] },
    { slug: 'sell-me-watch', rows: [3] },
    { slug: 'mezave', rows: [3] },
  ] as const;

  for (const { slug, rows: expected } of GALLERIES) {
    for (const width of [1440, 1280, 1024, 768]) {
      test(`justifies every ${slug} row at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/our_work/${slug}`);
        await ready(page);
        await page.locator(SHOT).last().scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            page
              .locator(SHOT)
              .last()
              .evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
          )
          .toBe(true);

        const rows = await page.locator('.gallery__row').evaluateAll((elements) =>
          elements.map((row) => {
            const box = row.getBoundingClientRect();
            const shots = [...row.querySelectorAll('img')].map((image) => {
              const shot = image.getBoundingClientRect();
              return {
                natural: image.naturalWidth / image.naturalHeight,
                intrinsic: image.naturalWidth,
                laid: shot.width / shot.height,
                width: Math.round(shot.width),
                height: Math.round(shot.height),
              };
            });
            return { width: Math.round(box.width), shots };
          }),
        );

        expect(
          rows.map((row) => row.shots.length),
          'the rows the gallery falls into',
        ).toEqual([...expected]);

        for (const [index, row] of rows.entries()) {
          const heights = row.shots.map((shot) => shot.height);
          expect(
            Math.max(...heights) - Math.min(...heights),
            `row ${index} is ragged: ${heights.join(', ')}`,
          ).toBeLessThanOrEqual(1);

          // The row is filled, so the widths are doing the levelling rather than a gap. The
          // slack allowed is the 16px gap between tiles plus a pixel of rounding each.
          const used = row.shots.reduce((total, shot) => total + shot.width, 0);
          const gaps = (row.shots.length - 1) * 16;
          expect(
            row.width - used,
            `row ${index} leaves ${row.width - used}px unused for ${gaps}px of gaps`,
          ).toBeLessThanOrEqual(gaps + row.shots.length);

          for (const shot of row.shots) {
            expect(
              Math.abs(shot.laid - shot.natural),
              `laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
            ).toBeLessThan(0.02);
            expect(shot.width, 'scaled past the detail it carries').toBeLessThanOrEqual(
              shot.intrinsic + 1,
            );
          }
        }

        // Rows of the same gallery share the width they are laid out in.
        const widths = rows.map((row) => row.width);
        expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      });
    }
  }
});

/**
 * The single-column stack, which every product falls into below 600px. There a photograph has
 * the whole content width, and the taller the shape the further it runs: `zadeh-cleanse.webp`
 * is 2:3 and came out 348x522 at 390px - taller than the hero and than anything else on the
 * page. The stylesheet bounds the laid-out height there.
 *
 * Three things only a browser settles: that the bound is reached by scaling the picture rather
 * than by cropping the tile it sits in, that a bounded picture is centred rather than left
 * hanging at one edge of a full-width column, and that the bound lifts again once the gallery
 * stops being a stack.
 */
test.describe('a photograph in the single-column stack', () => {
  const SHOT = '.gallery__img';

  /** `$shot-stacked-max-height` in `product-detail.scss`, plus a pixel for the tile's borders. */
  const BOUND = 440;

  const STACKED = [320, 375, 390, 430, 599];

  for (const width of STACKED) {
    test(`bounds and centres the tall photograph at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/our_work/zadeh-md');
      await ready(page);
      await page.locator(SHOT).first().scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .locator(SHOT)
            .first()
            .evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
        )
        .toBe(true);

      const shots = await page.locator(SHOT).evaluateAll((elements) =>
        elements.map((element) => {
          const image = element as HTMLImageElement;
          const box = image.getBoundingClientRect();
          const tile = (image.closest('.gallery__shot') as HTMLElement).getBoundingClientRect();
          const gallery = (image.closest('.gallery__row') as HTMLElement).getBoundingClientRect();
          return {
            natural: image.naturalWidth / image.naturalHeight,
            intrinsic: image.naturalWidth,
            laid: box.width / box.height,
            width: Math.round(box.width),
            height: Math.round(box.height),
            // How far the tile sits from each edge of the column it is laid out in.
            left: Math.round(tile.left - gallery.left),
            right: Math.round(gallery.right - tile.right),
          };
        }),
      );

      expect(shots.length, 'this page has two gallery photographs').toBe(2);
      for (const shot of shots) {
        expect(shot.height, `laid out ${shot.width}x${shot.height}`).toBeLessThanOrEqual(BOUND + 1);
        expect(
          Math.abs(shot.laid - shot.natural),
          `laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
        ).toBeLessThan(0.02);
        expect(shot.width, 'scaled past the detail the file carries').toBeLessThanOrEqual(
          shot.intrinsic + 1,
        );
        // Centred: equal gutters either side, whether or not the bound narrowed it.
        expect(
          Math.abs(shot.left - shot.right),
          `gutters ${shot.left} and ${shot.right}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test('lets the photographs grow again once the stack ends', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/our_work/zadeh-md');
    await ready(page);
    await page.locator(SHOT).first().scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(SHOT)
          .first()
          .evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);

    const tops = await page
      .locator(SHOT)
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
    expect(Math.abs(tops[0] - tops[1]), 'the pair is side by side here, not stacked').toBeLessThan(
      2,
    );
  });
});

/**
 * The other lone photograph, and the opposite shape. `roar-immune.webp` is 1.12:1, and the rule
 * that gives a single picture the whole gallery - right for the panorama above - laid it out
 * 794x706 beside a three-line paragraph: taller than the hero, and the loudest thing on the
 * page. The component now bounds the column to the width a 440px-tall photograph needs.
 *
 * What a browser is needed for: that the bound is reached by narrowing the column rather than
 * by squashing the picture, that the copy rather than a gap takes what the column gives up, and
 * that the bound stays out of the way at widths where the layout is a single column.
 */
test.describe('a product page with a lone near-square photograph', () => {
  const SHOT = '.gallery__img';

  /** The height bound in `product-detail.ts`, which this page is the reason for. */
  const MAX_HEIGHT = 440;

  const measure = async (page: Page) => {
    await page.locator(SHOT).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator(SHOT).evaluate((image) => (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    return page.locator(SHOT).evaluate((element) => {
      const image = element as HTMLImageElement;
      const box = image.getBoundingClientRect();
      const copy = document.querySelector('.product__experience-copy')?.getBoundingClientRect();
      return {
        natural: image.naturalWidth / image.naturalHeight,
        intrinsic: image.naturalWidth,
        laid: box.width / box.height,
        width: Math.round(box.width),
        height: Math.round(box.height),
        copyWidth: Math.round(copy?.width ?? 0),
        stacked: (copy?.bottom ?? 0) <= box.top + 1,
      };
    });
  };

  for (const viewport of VIEWPORTS) {
    test(`keeps the near-square in proportion at ${viewport.width}px (${viewport.label})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/our_work/roar-organic');
      await ready(page);
      const shot = await measure(page);

      expect(
        Math.abs(shot.laid - shot.natural),
        `laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
      ).toBeLessThan(0.02);
      expect(
        shot.width,
        `scaled past the ${shot.intrinsic}px of detail it carries`,
      ).toBeLessThanOrEqual(shot.intrinsic + 1);
      expect(shot.width, `collapsed at ${viewport.width}px`).toBeGreaterThan(100);

      // The bound belongs to the two-column layout. Stacked under the copy, a full-width
      // photograph is what every other section does and what the panorama does too.
      if (!shot.stacked) {
        expect(shot.height, 'towers over the paragraph beside it').toBeLessThanOrEqual(
          MAX_HEIGHT + 2,
        );
        expect(
          shot.copyWidth,
          'the copy did not take the width the column released',
        ).toBeGreaterThan(shot.width);
      }
    });
  }
});

/**
 * Two photographs of different shapes, which is what Mastercraft's gallery is: a 3:2 bench shot
 * beside a 1:1 grading shot. In equal columns the square comes out half as tall again as its
 * neighbour and the row is ragged along the bottom, so the component sizes the columns in
 * proportion to each picture's ratio instead.
 *
 * The point of that is a shared baseline, and a shared baseline is the one thing a stylesheet
 * cannot promise on its own - it falls out of the arithmetic between the column widths, the
 * gap and the intrinsic ratios, and only a browser does that arithmetic. Cropping would square
 * the row up just as well, which is why the ratios are asserted alongside the heights: neither
 * picture is trimmed to fit.
 */
/** Every product whose gallery is a pair of photographs that are not the same shape. */
const MISMATCHED_PAIRS = ['mastercraft', 'got-matcha', 'jdm-west-coast', 'zadeh-md'] as const;

test.describe('a product page with two differently shaped photographs', () => {
  const SHOT = '.gallery__img';

  for (const slug of MISMATCHED_PAIRS) {
    for (const viewport of VIEWPORTS) {
      test(`${slug} levels the pair without cropping either at ${viewport.width}px (${viewport.label})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`/our_work/${slug}`);
        await ready(page);
        await page.locator(SHOT).first().scrollIntoViewIfNeeded();
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

        const shots = await page.locator(SHOT).evaluateAll((elements) =>
          (elements as HTMLImageElement[]).map((image) => {
            const box = image.getBoundingClientRect();
            return {
              src: image.getAttribute('src') ?? '',
              natural: image.naturalWidth / image.naturalHeight,
              intrinsic: image.naturalWidth,
              laid: box.width / box.height,
              width: Math.round(box.width),
              height: Math.round(box.height),
              top: Math.round(box.top),
              alt: image.getAttribute('alt') ?? '',
            };
          }),
        );

        expect(shots).toHaveLength(2);
        expect(
          new Set(shots.map((shot) => shot.natural.toFixed(2))).size,
          'this fixture is only meaningful while the two shapes differ',
        ).toBe(2);

        for (const shot of shots) {
          expect(
            Math.abs(shot.laid - shot.natural),
            `${shot.src} is laid out at ${shot.laid.toFixed(3)} but is ${shot.natural.toFixed(3)}`,
          ).toBeLessThan(0.02);
          expect(shot.alt.length, `${shot.src} has no description`).toBeGreaterThan(0);
          expect(shot.width, `${shot.src} collapsed at ${viewport.width}px`).toBeGreaterThan(100);
          expect(
            shot.width,
            `${shot.src} is scaled past the ${shot.intrinsic}px of detail it carries`,
          ).toBeLessThanOrEqual(shot.intrinsic + 1);
        }

        // Side by side they level off; stacked in one column they simply follow each other.
        const sideBySide = new Set(shots.map((shot) => shot.top)).size === 1;
        if (sideBySide) {
          const [first, second] = shots;
          expect(
            Math.abs(first.height - second.height),
            `the row is ragged: ${first.height}px beside ${second.height}px`,
          ).toBeLessThanOrEqual(1);
        }
      });
    }
  }
});
