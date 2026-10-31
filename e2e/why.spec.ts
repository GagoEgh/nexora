import { expect, test, type Page } from '@playwright/test';
import { expectTypeFromRole } from './support/tokens';

/**
 * "Why Nexora" section contract (Why.png at 1440): 480 : 704 columns, the one-team card whose
 * discipline chips (a single-selection Material listbox) drive the hairline-separated reasons.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const boxes = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }),
  );

const ARCHITECTURE_REASONS = [
  'Senior & Senior+ engineers',
  'End-to-end delivery',
  'Business-first approach',
  'Flexible collaboration',
  'Long-term technical partnership',
];

test.describe('why at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-why').scrollIntoViewIfNeeded();
    await expect(page.locator('app-why mat-chip-option')).toHaveCount(9);
  });

  test('follows expertise with the 480 : 704 split, section padding and the copy tokens', async ({
    page,
  }) => {
    await expect(page.locator('app-expertise + app-why')).toHaveCount(1);
    // The shared section rhythm from `styles/mixins/_container.scss` at `large`.
    expect(await style(page, 'app-why', 'padding-top')).toBe('64px');
    const [copy] = await boxes(page, 'app-why .why__copy');
    const [list] = await boxes(page, 'app-why .why__list');
    expect([copy.x, copy.w]).toEqual([80, 480]);
    expect([list.x, list.w]).toEqual([656, 704]);
    expect(Math.abs(copy.y - list.y)).toBeLessThanOrEqual(2);

    await expect(page.locator('app-why .why__eyebrow')).toHaveText('Why Nexora');
    await expectTypeFromRole(page, 'app-why h2', '--nx-sys-display-section');
    await expectTypeFromRole(page, 'app-why .why__lead', '--nx-sys-body-lead');
    expect(await style(page, 'app-why .why__lead', 'color')).toBe('rgb(71, 85, 105)');
  });

  test('one-team card: chrome, mark, nine option chips with one selected, note', async ({
    page,
  }) => {
    expect(await style(page, 'app-why .why__card', 'background-color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, 'app-why .why__card', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, 'app-why .why__card', 'border-top-left-radius')).toBe('16px');
    expect(await style(page, 'app-why .why__card', 'padding-top')).toBe('24px');
    expect((await boxes(page, 'app-why .why__card app-logo'))[0].h).toBe(28);
    await expectTypeFromRole(page, 'app-why .why__card-title', '--mat-sys-label-large');

    const chipBoxes = await boxes(page, 'app-why mat-chip-option');
    expect(chipBoxes.every((c) => c.h === 36)).toBe(true);
    expect(chipBoxes[1].x - (chipBoxes[0].x + chipBoxes[0].w)).toBe(8);
    expect(chipBoxes[3].y - chipBoxes[0].y).toBe(36 + 8);
    expect(
      await style(page, 'app-why mat-chip-option .mdc-evolution-chip__text-label', 'font-size'),
    ).toBe('13px');

    await expect(page.locator('app-why mat-chip-option.mat-mdc-chip-selected')).toHaveText(
      'Solution architecture',
    );
    expect(
      await style(page, 'app-why mat-chip-option.mat-mdc-chip-selected', 'background-color'),
    ).toBe('rgb(238, 244, 255)');
    expect(
      await style(
        page,
        'app-why mat-chip-option.mat-mdc-chip-selected .why__dot',
        'background-color',
      ),
    ).toBe('rgb(15, 85, 232)');
    expect(
      await style(
        page,
        'app-why mat-chip-option:not(.mat-mdc-chip-selected) .why__dot',
        'background-color',
      ),
    ).toBe('rgb(203, 213, 225)');
    expect((await boxes(page, 'app-why .why__dot'))[0].w).toBe(6);
    // No chip avatar is declared, so Material renders no selection checkmark: the selected
    // state is the light-blue chip itself with its primary dot.
    await expect(
      page.locator('app-why mat-chip-option .mdc-evolution-chip__checkmark'),
    ).toHaveCount(0);
    await expect(
      page.locator('app-why mat-chip-option.mat-mdc-chip-selected .why__dot'),
    ).toBeVisible();
    const [chip] = await boxes(page, 'app-why mat-chip-option.mat-mdc-chip-selected');
    const [dot] = await boxes(page, 'app-why mat-chip-option.mat-mdc-chip-selected .why__dot');
    expect(dot.x - chip.x).toBe(12);
    await expectTypeFromRole(page, 'app-why .why__card-note', '--mat-sys-body-small');
  });

  test('only the selected chip renders its touch target', async ({ page }) => {
    const displays = () =>
      page
        .locator('app-why mat-chip-option .mat-mdc-chip-touch-target')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
    expect(await displays()).toEqual(['block', ...Array(8).fill('none')]);

    await page.locator('app-why mat-chip-option', { hasText: 'DevOps' }).click();
    await expect(page.locator('app-why mat-chip-option.mat-mdc-chip-selected')).toHaveText(
      'DevOps',
    );
    expect(await displays()).toEqual([...Array(5).fill('none'), 'block', ...Array(3).fill('none')]);
  });

  test('selecting a discipline swaps the reasons list and keeps a single selection', async ({
    page,
  }) => {
    const titles = page.locator('app-why .why__item-title');
    await expect(titles).toHaveText(ARCHITECTURE_REASONS);

    await page.locator('app-why mat-chip-option', { hasText: 'AI engineering' }).click();
    await expect(page.locator('app-why mat-chip-option.mat-mdc-chip-selected')).toHaveCount(1);
    await expect(page.locator('app-why mat-chip-option.mat-mdc-chip-selected')).toHaveText(
      'AI engineering',
    );
    await expect(page.locator('app-why mat-chip-option button[aria-selected="true"]')).toHaveCount(
      1,
    );
    await expect(titles).toHaveText([
      'Built into real processes',
      'Measurable and controllable',
      'Your data stays yours',
    ]);
    await expect(page.locator('app-why .why__number')).toHaveText(['01', '02', '03']);

    await page.locator('app-why mat-chip-option', { hasText: 'Solution architecture' }).click();
    await expect(titles).toHaveText(ARCHITECTURE_REASONS);
  });

  test('chips are keyboard operable: arrow keys move focus and Space selects', async ({ page }) => {
    await page.locator('app-why mat-chip-option button[role="option"]').first().focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await expect(page.locator('app-why mat-chip-option.mat-mdc-chip-selected')).toHaveText(
      'Backend',
    );
    await expect(page.locator('app-why .why__item-title').first()).toHaveText(
      'Services built to last',
    );
  });

  test('five reasons with hairlines on a 155px pitch, monospace primary ordinals, titles and copy', async ({
    page,
  }) => {
    const items = await boxes(page, 'app-why .why__item');
    expect(items).toHaveLength(5);
    const pitches = items.slice(1).map((it, i) => it.y - items[i].y);
    expect(pitches.every((p) => Math.abs(p - 155) <= 3)).toBe(true);
    expect(await style(page, 'app-why .why__item', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, 'app-why .why__item:last-child', 'border-bottom-width')).toBe('1px');
    expect(await style(page, 'app-why .why__item', 'padding-top')).toBe('32px');

    await expect(page.locator('app-why .why__number')).toHaveText(['01', '02', '03', '04', '05']);
    expect(await style(page, 'app-why .why__number', 'color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, 'app-why .why__number', 'font-size')).toBe('12px');
    const [title] = await boxes(page, 'app-why .why__item-title');
    expect(title.x).toBe(716);
    expect(await style(page, 'app-why .why__item-title', 'font-size')).toBe('24px');
    expect(await style(page, 'app-why .why__item-title', 'font-weight')).toBe('600');
    await expectTypeFromRole(page, 'app-why .why__item-text', '--nx-sys-body-copy');
  });
});

test.describe('why at the mobile width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stacks into one column without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-why mat-chip-option')).toHaveCount(9);
    const [copy] = await boxes(page, 'app-why .why__copy');
    const [list] = await boxes(page, 'app-why .why__list');
    expect([copy.x, copy.w]).toEqual([20, 350]);
    expect([list.x, list.w]).toEqual([20, 350]);
    expect(list.y).toBeGreaterThan(copy.y + copy.h);
    await expectTypeFromRole(page, 'app-why .why__lead', '--nx-sys-body-lead');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
