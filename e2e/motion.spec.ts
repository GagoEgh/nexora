import { expect, test, type Page } from '@playwright/test';

/**
 * The home page reveal animations.
 *
 * The rest of the suite runs with `reducedMotion: 'reduce'` (see playwright.config.ts), which
 * is what keeps its geometry assertions stable. These specs opt back in, so the animation is
 * actually exercised somewhere, and then assert the reduced-motion path separately.
 */
const SECTIONS = [
  ['app-expertise', '.expertise'],
  ['app-why', '.why'],
  ['app-what-we-build', '.what-we-build'],
  ['app-ai-automation', '.ai'],
  ['app-how-we-work', '.how-we-work'],
  ['app-engagement-models', '.engagement-models'],
] as const;

/**
 * Card geometry depends on web-font metrics and on the stylesheet having been applied, so these
 * measurements wait for both. Without it the suite's parallel workers can measure a page whose
 * fonts are still swapping, and the card's height - which is what the anchor is computed from -
 * is not final.
 */
const ready = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);
};

/** The card's height is locale-driven, which is what the overlap guard below exists for. */
const LOCALES = [
  ['en', '/'],
  ['hy', '/hy'],
  ['ru', '/ru'],
] as const;

const revealState = (page: Page, selector: string) =>
  page.locator(selector).getAttribute('data-reveal');

const settle = (page: Page) => page.waitForTimeout(700);

test.describe('home page reveals, with motion enabled', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('the hero reveals itself on load and ends with no transform', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => revealState(page, '.hero'), { timeout: 5000 }).toBe('in');
    await settle(page);

    const title = page.locator('.hero__title');
    await expect(title).toHaveCSS('opacity', '1');
    await expect(title).toHaveCSS('transform', 'none');
    // The compositor hint belongs to the hidden state only; leaving it set would keep a layer
    // alive for the life of the page.
    await expect(title).toHaveCSS('will-change', 'auto');
  });

  test('sections below the fold wait for the viewport, then reveal', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => revealState(page, '.hero'), { timeout: 5000 }).toBe('in');

    // Nothing further down has been reached yet.
    for (const [, root] of SECTIONS) {
      expect(await revealState(page, root), root).toBe('out');
    }

    for (const [host, root] of SECTIONS) {
      await page.locator(host).scrollIntoViewIfNeeded();
      await expect.poll(() => revealState(page, root), { timeout: 5000 }).toBe('in');
    }
  });

  test('a reveal does not move anything once settled', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-expertise').scrollIntoViewIfNeeded();
    await expect.poll(() => revealState(page, '.expertise'), { timeout: 5000 }).toBe('in');
    await settle(page);

    const card = page.locator('.expertise__card').first();
    await expect(card).toHaveCSS('transform', 'none');
    await expect(card).toHaveCSS('opacity', '1');
  });

  /**
   * An element that is already on screen when the observer starts must reveal without any
   * scrolling - otherwise a tall window, or a page loaded already scrolled, would leave
   * content permanently invisible. A 2000px-tall viewport puts the next section in view at
   * load, which exercises the observer's initial callback rather than a scroll event.
   *
   * (A reload does not test this: the browser does not restore scroll for this client-rendered
   * page - measured at scrollY=0 with the section at top=5111 - so the section is legitimately
   * out of view and correctly stays hidden.)
   */
  test('reveals a section that is already in view when the observer starts', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 2000 });
    await page.goto('/');

    await expect.poll(() => revealState(page, '.expertise'), { timeout: 5000 }).toBe('in');
    await expect(page.locator('.expertise__card').first()).toHaveCSS('opacity', '1');
  });

  test('scrolling back up does not replay a reveal', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-expertise').scrollIntoViewIfNeeded();
    await expect.poll(() => revealState(page, '.expertise'), { timeout: 5000 }).toBe('in');

    await page.locator('app-engagement-models').scrollIntoViewIfNeeded();
    await page.locator('app-expertise').scrollIntoViewIfNeeded();

    expect(await revealState(page, '.expertise')).toBe('in');
  });
});

test.describe('home page with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  /**
   * The hidden state is wrapped in `prefers-reduced-motion: no-preference`, so a visitor who
   * asked for less motion is never shown a hidden element at all - the content is simply
   * there, rather than popping in with a zero-length transition.
   */
  test('never hides or displaces content', async ({ page }) => {
    await page.goto('/');

    for (const selector of ['.hero__title', '.hero__lead', '.hero__art']) {
      await expect(page.locator(selector)).toHaveCSS('opacity', '1');
      await expect(page.locator(selector)).toHaveCSS('transform', 'none');
    }

    await page.locator('app-expertise').scrollIntoViewIfNeeded();
    const card = page.locator('.expertise__card').first();
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('transform', 'none');
  });

  test('the step connector is drawn at full width', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-how-we-work').scrollIntoViewIfNeeded();

    const scaled = await page.evaluate(() => {
      const track = document.querySelector('.how-we-work__track');
      return track ? getComputedStyle(track, '::after').transform : null;
    });
    expect(scaled === 'none' || scaled === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  });
});

test.describe('hero illustration entrance', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  /**
   * Asserts the styling contract rather than racing the directive: in `load` mode the reveal
   * lands about two frames after the attribute appears, so polling for the transient `out`
   * state is inherently flaky. Setting the attribute directly checks the thing that matters -
   * that the hidden state and the undrawn connectors are what `out` actually produces. The
   * directive's own sequencing is covered by `shared/motion/reveal.spec.ts`.
   */
  test('the pre-reveal state hides the diagram and leaves both connectors undrawn', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('.art__link-line').first()).toBeAttached();

    const hidden = await page.evaluate(() => {
      document.querySelector('.art')?.setAttribute('data-reveal', 'out');
      return {
        node: getComputedStyle(document.querySelector('.art__node') as Element).opacity,
        chip: getComputedStyle(document.querySelector('.art__chip') as Element).opacity,
        workflow: getComputedStyle(document.querySelector('.notes__workflow') as Element).opacity,
        offsets: Array.from(document.querySelectorAll('.art__link-line')).map(
          (path) => getComputedStyle(path).strokeDashoffset,
        ),
      };
    });

    expect(hidden.node).toBe('0');
    expect(hidden.chip).toBe('0');
    expect(hidden.workflow).toBe('0');
    // `pathLength="1"` means one full dash unit of offset, so the line is not drawn yet.
    expect(hidden.offsets).toEqual(['1px', '1px']);
  });

  test('assembles the diagram and draws both connectors', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => revealState(page, '.art'), { timeout: 5000 }).toBe('in');
    await page.waitForTimeout(1600);

    for (const node of await page.locator('.art__node').all()) {
      await expect(node).toHaveCSS('opacity', '1');
      await expect(node).toHaveCSS('transform', 'none');
    }
    await expect(page.locator('.art__window')).toHaveCSS('transform', 'none');
    for (const chip of await page.locator('.art__chip').all()) {
      await expect(chip).toHaveCSS('opacity', '1');
    }

    const offsets = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.art__link-line')).map(
        (path) => getComputedStyle(path).strokeDashoffset,
      ),
    );
    expect(offsets).toEqual(['0px', '0px']);
  });

  /**
   * The card's `translateY(-115%)` is its positioning anchor. If the entrance overwrote
   * `transform` instead of composing with it, the card would settle in the wrong place and stop
   * overlapping the CRM / ERP node it annotates.
   */
  test('the workflow card keeps its positioning anchor after revealing', async ({ page }) => {
    await page.goto('/');
    await ready(page);

    const card = page.locator('.notes__workflow');
    await expect(card).toHaveCSS('opacity', '1');

    const { height, translateY } = await page.evaluate(() => {
      const el = document.querySelector('.notes__workflow') as HTMLElement;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { height: el.getBoundingClientRect().height, translateY: matrix.f };
    });
    // Exactly -100%: the card's bottom edge anchors at a fixed offset, independent of its
    // height. -115% made the position height-dependent again and opened a gap between the card
    // and the node it is meant to overlap, so the multiplier is asserted rather than assumed.
    expect(Math.abs(translateY + height)).toBeLessThan(1.5);
  });

  /** The regression this guards: a positive, height-independent overlap in every locale. */
  test.describe('the workflow card overlaps the CRM / ERP node in every locale', () => {
    for (const [locale, path] of LOCALES) {
      test(`${locale}`, async ({ page }) => {
        await page.goto(path);
        await ready(page);

        const overlap = await page.evaluate(() => {
          const card = document.querySelector('.notes__workflow') as HTMLElement;
          const tier = document.querySelectorAll('.art__tier')[0];
          const crm = Array.from(tier.querySelectorAll('.art__node')).find((node) =>
            (node.textContent ?? '').includes('CRM'),
          ) as HTMLElement;
          return Math.round(card.getBoundingClientRect().bottom - crm.getBoundingClientRect().top);
        });

        expect(overlap).toBeGreaterThan(0);
        expect(overlap).toBeLessThan(40);
      });
    }
  });

  test('leaves the annotation cards alone below the large breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(1200);

    await expect(page.locator('.notes__workflow')).toHaveCSS('display', 'none');
    // The diagram itself still arrives.
    await expect(page.locator('.art__node').first()).toHaveCSS('opacity', '1');
  });
});

test.describe('hero illustration with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('draws the connectors and hides nothing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.art__link-line').first()).toBeAttached();

    const offsets = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.art__link-line')).map(
        (path) => getComputedStyle(path).strokeDashoffset,
      ),
    );
    expect(offsets).toEqual(['0px', '0px']);

    await expect(page.locator('.art__node').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.art__window')).toHaveCSS('transform', 'none');
    await expect(page.locator('.notes__workflow')).toHaveCSS('opacity', '1');
  });
});
