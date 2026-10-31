import { expect, test, type Page } from '@playwright/test';
import { expectTypeFromRole } from './support/tokens';

/**
 * "How we work" section contract (Work.png at 1440): the two-column section header, then five
 * process steps on a 256px pitch, each with a 44px marker, a 2px track, a title, copy and an
 * outcome chip. One column at 390, two at 700.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const pseudo = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el, '::after').getPropertyValue(p), prop);

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

const TITLES = [
  'Discover & Understand',
  'Define the Solution',
  'Design & Architect',
  'Build & Integrate',
  'Deploy & Improve',
];

test.describe('how-we-work at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-how-we-work').scrollIntoViewIfNeeded();
    await expect(page.locator('app-how-we-work .how-we-work__outcome svg')).toHaveCount(5);
  });

  test('follows ai-automation with the two-column header and the copy tokens', async ({ page }) => {
    await expect(page.locator('app-ai-automation + app-how-we-work')).toHaveCount(1);
    // The shared section rhythm from `styles/mixins/_container.scss` at `large`.
    expect(await style(page, 'app-how-we-work', 'padding-top')).toBe('64px');
    expect(
      await style(page, 'app-how-we-work .how-we-work__header', 'grid-template-columns'),
    ).toMatch(/^\d+(\.\d+)?px 440px$/);
    expect(await style(page, 'app-how-we-work .how-we-work__header', 'margin-bottom')).toBe('64px');

    await expect(page.locator('app-how-we-work .how-we-work__eyebrow')).toHaveText('How we work');
    expect(await style(page, 'app-how-we-work .how-we-work__eyebrow', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    await expect(page.locator('app-how-we-work h2')).toHaveText(
      'A clear path from idea to production.',
    );
    await expectTypeFromRole(page, 'app-how-we-work h2', '--nx-sys-display-section');
    const [intro] = await boxes(page, 'app-how-we-work .how-we-work__intro');
    expect(intro.x).toBe(920);
    await expectTypeFromRole(page, 'app-how-we-work .how-we-work__intro', '--nx-sys-body-copy');
    expect(await style(page, 'app-how-we-work .how-we-work__intro', 'color')).toBe(
      'rgb(71, 85, 105)',
    );
  });

  test('five ordered steps on a 256px pitch with markers, tracks, titles and copy', async ({
    page,
  }) => {
    await expect(page.locator('app-how-we-work ol.how-we-work__steps')).toHaveCount(1);
    const steps = await boxes(page, 'app-how-we-work .how-we-work__step');
    expect(steps.map((s) => [s.x, s.w])).toEqual([
      [80, 232],
      [336, 232],
      [592, 232],
      [848, 232],
      [1104, 232],
    ]);

    await expect(page.locator('app-how-we-work .how-we-work__marker')).toHaveText([
      '01',
      '02',
      '03',
      '04',
      '05',
    ]);
    const markers = await boxes(page, 'app-how-we-work .how-we-work__marker');
    expect(markers.every((m) => m.w === 44 && m.h === 44)).toBe(true);
    expect(
      await style(page, 'app-how-we-work .how-we-work__marker', 'border-top-left-radius'),
    ).toBe('9999px');
    expect(await style(page, 'app-how-we-work .how-we-work__marker', 'font-size')).toBe('12px');
    expect(
      await style(
        page,
        'app-how-we-work .how-we-work__step--first .how-we-work__marker',
        'background-color',
      ),
    ).toBe('rgb(15, 85, 232)');
    expect(
      await style(page, 'app-how-we-work .how-we-work__step--first .how-we-work__marker', 'color'),
    ).toBe('rgb(255, 255, 255)');
    expect(
      await style(
        page,
        'app-how-we-work .how-we-work__step:nth-child(2) .how-we-work__marker',
        'background-color',
      ),
    ).toBe('rgb(238, 244, 255)');
    expect(
      await style(
        page,
        'app-how-we-work .how-we-work__step:nth-child(2) .how-we-work__marker',
        'color',
      ),
    ).toBe('rgb(15, 85, 232)');

    const [track] = await boxes(page, 'app-how-we-work .how-we-work__track');
    expect([track.x, track.w]).toEqual([80, 232]);
    expect(await pseudo(page, 'app-how-we-work .how-we-work__track', 'height')).toBe('2px');
    expect(await pseudo(page, 'app-how-we-work .how-we-work__track', 'background-color')).toBe(
      'rgb(226, 232, 240)',
    );
    expect(
      await pseudo(page, 'app-how-we-work .how-we-work__step--last .how-we-work__track', 'opacity'),
    ).toBe('0.25');

    await expect(page.locator('app-how-we-work .how-we-work__step-title')).toHaveText(TITLES);
    const [title] = await boxes(page, 'app-how-we-work .how-we-work__step-title');
    expect(title.y - markers[0].y).toBe(60);
    await expectTypeFromRole(
      page,
      'app-how-we-work .how-we-work__step-title',
      '--nx-sys-title-step',
    );
    expect(await style(page, 'app-how-we-work .how-we-work__step-title', 'line-height')).toBe(
      '26px',
    );
    expect(await style(page, 'app-how-we-work .how-we-work__step-title', 'font-weight')).toBe(
      '600',
    );
    await expectTypeFromRole(
      page,
      'app-how-we-work .how-we-work__step-text',
      '--mat-sys-body-small',
    );
    expect(await style(page, 'app-how-we-work .how-we-work__step-text', 'line-height')).toBe(
      '22px',
    );
    expect(await style(page, 'app-how-we-work .how-we-work__step-text', 'color')).toBe(
      'rgb(71, 85, 105)',
    );
  });

  test('outcome chips: 26px code pills on surface-container-low with a 12px arrow, no links', async ({
    page,
  }) => {
    const chips = await boxes(page, 'app-how-we-work .how-we-work__outcome');
    expect(chips).toHaveLength(5);
    expect(chips.every((c) => c.h === 26)).toBe(true);
    expect(chips.map((c) => c.x)).toEqual([80, 336, 592, 848, 1104]);
    expect(await style(page, 'app-how-we-work .how-we-work__outcome', 'background-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(
      await style(page, 'app-how-we-work .how-we-work__outcome', 'border-top-left-radius'),
    ).toBe('8px');
    expect(await style(page, 'app-how-we-work .how-we-work__outcome', 'font-size')).toBe('12px');
    expect(await style(page, 'app-how-we-work .how-we-work__outcome', 'color')).toBe(
      'rgb(71, 85, 105)',
    );
    const [arrow] = await boxes(page, 'app-how-we-work .how-we-work__arrow');
    expect([arrow.x - chips[0].x, arrow.w]).toEqual([8, 12]);
    await expect(page.locator('app-how-we-work .how-we-work__outcome').first()).toHaveText(
      'Shared problem definition',
    );
    await expect(page.locator('app-how-we-work a, app-how-we-work button')).toHaveCount(0);
  });
});

test.describe('how-we-work at narrower widths', () => {
  test('two columns at 700px', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/');
    await expect(page.locator('app-how-we-work .how-we-work__step')).toHaveCount(5);
    const steps = await boxes(page, 'app-how-we-work .how-we-work__step');
    expect(new Set(steps.map((s) => s.x)).size).toBe(2);
    expect(steps[0].x).toBe(32);
  });

  test('one column at 390px without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('app-how-we-work .how-we-work__step')).toHaveCount(5);
    const steps = await boxes(page, 'app-how-we-work .how-we-work__step');
    expect(steps.every((s) => s.x === 20 && s.w === 350)).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
