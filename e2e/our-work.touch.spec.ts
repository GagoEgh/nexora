import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * The portfolio card on a device with no pointer.
 *
 * The desktop projects match `hover: hover` whatever viewport a test sets, so without this
 * project nothing ever executes the card on a real touch device - and the card's second face
 * is reached by hover everywhere else. A phone cannot hover, so the tap is its own trigger,
 * and this file is what proves the back face is reachable there at all.
 *
 * It also pins the other half of that claim: the tap must *toggle*, so a visitor can get back
 * to the picture, and the face that is turned away must be out of the tab order and out of the
 * accessibility tree while it is off screen. An earlier version of this card shipped its
 * collapsed panel still focusable and still being read out.
 *
 * Runs on the `mobile-chrome` project only (`playwright.config.ts`).
 */

const CARD = 'app-project-card';

const ready = async (page: Page) => {
  await page.locator('main h1').waitFor();
  await page.locator(CARD).first().waitFor();
};

test.describe('the portfolio card without a pointer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/our_work');
    await ready(page);
  });

  /**
   * The premise every other test here rests on. If this fails, the project is not emulating a
   * touch device and the assertions below would pass for the wrong reason.
   */
  test('runs on a device where the no-hover branch is the one that applies', async ({ page }) => {
    const media = await page.evaluate(() => ({
      hover: matchMedia('(hover: none)').matches,
      pointer: matchMedia('(pointer: coarse)').matches,
    }));
    expect(media).toEqual({ hover: true, pointer: true });
  });

  test('renders every card, in one column', async ({ page }) => {
    await expect(page.locator(CARD)).toHaveCount(19);

    const lefts = await page
      .locator('.projects__card')
      .evaluateAll((items) => [
        ...new Set(items.map((i) => Math.round(i.getBoundingClientRect().x))),
      ]);
    expect(lefts, 'cards should stack in a single column at phone width').toHaveLength(1);
  });

  /**
   * The gesture a phone actually has. Both sides have to be reachable with it, in both
   * directions, or half the card's content would be desktop-only.
   */
  test('turns on tap and turns back on a second tap', async ({ page }) => {
    const card = page.locator(CARD).first();
    const front = card.locator('.project-card__face--front');
    const back = card.locator('.project-card__face--back');

    await expect(front).toBeVisible();
    await expect(back).toBeHidden();

    await card.tap();
    await expect(card).toHaveClass(/is-flipped/);
    await expect(back).toBeVisible();
    await expect(front).toBeHidden();

    await card.tap();
    await expect(card).not.toHaveClass(/is-flipped/);
    await expect(back).toBeHidden();
    await expect(front).toBeVisible();
  });

  /**
   * The regression this project was added to catch: whatever is turned away must be gone from
   * the tab order and the accessibility tree, not just painted over. Every card is unturned
   * here, so every control the back faces carry should be unreachable.
   */
  test('hides nothing from view that the keyboard can still reach', async ({ page }) => {
    const hidden = await page
      .locator(CARD + ' a, ' + CARD + ' button')
      .evaluateAll((controls) =>
        controls
          .filter((control) => !control.checkVisibility({ visibilityProperty: true }))
          .map((control) => control.getAttribute('class') ?? control.tagName),
      );

    expect(hidden, 'these controls are reachable but not visible').toHaveLength(36);
    // 19 detail links plus 17 outbound ones: the whole back-face surface, all of it turned away.
    const reachable = await page
      .locator(CARD + ' a')
      .evaluateAll(
        (links) =>
          links.filter((link) => link.checkVisibility({ visibilityProperty: true })).length,
      );
    expect(reachable, 'no link is on screen while every card shows its front').toBe(0);
  });

  test('opens a product page on tap, one level deeper', async ({ page }) => {
    const first = page.locator(CARD).first();
    const name = (await first.locator('.project-card__title').innerText()).trim();

    await first.tap();
    await first.locator('.project-card__link').tap();

    await expect(page).toHaveURL(/\/our_work\/[a-z0-9-]+$/);
    await expect(page.locator('main h1')).toHaveText(name);
  });

  /**
   * The live product is one tap away once the card is turned, and the link that gets there has
   * to survive the toggle: a tap on it is navigation, never a second flip.
   */
  test('reaches the live product from the turned card', async ({ page }) => {
    const card = page.locator(CARD).first();
    await card.tap();

    const outbound = card.locator('.project-card__visit');
    await expect(outbound).toBeVisible();
    await expect(outbound).toHaveAttribute('href', /^https:\/\//);
    await expect(outbound).toHaveAttribute('rel', /noopener/);
    await expect(outbound).toHaveAttribute('target', '_blank');
  });

  /**
   * `a11y.spec.ts` sweeps this page at a phone *width*, which is not the same device: it never
   * reaches this branch of the stylesheet.
   */
  test('has no WCAG 2.2 AA violations', async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const summary = violations
      .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
      .join('\n    ');
    expect(violations, `\n    ${summary}\n`).toEqual([]);
  });

  /** The same sweep with a card turned, which is a different tree from the one above. */
  test('has no WCAG 2.2 AA violations with a card turned', async ({ page }) => {
    await page.locator(CARD).first().tap();
    await expect(page.locator(CARD).first()).toHaveClass(/is-flipped/);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const summary = violations
      .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
      .join('\n    ');
    expect(violations, `\n    ${summary}\n`).toEqual([]);
  });
});
