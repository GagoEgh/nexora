import { expect, test, type Page } from '@playwright/test';

/**
 * Header (Header.jpg / Mobile.png), footer (Desktop.png), routing with lazy loading and
 * language switching. Geometry is asserted at the design widths; colours resolve from the
 * Nexora tokens; lazy routes are observed through their chunk requests.
 */
const HOME_HEADING = 'Engineering Digital Solutions That Move Business Forward.';

const NAV = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/solutions', 'Solutions'],
  ['/about', 'About'],
  ['/partnerships', 'Partnerships'],
  ['/contact', 'Contact'],
] as const;

const box = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });

const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test.describe('header at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('76px bar, 32px logo at the 80px margin, navigation and actions inline', async ({
    page,
  }) => {
    expect((await box(page, 'app-header .header')).h).toBe(76);
    const logo = await box(page, 'app-header app-logo');
    expect(logo.h).toBe(32);
    expect(logo.x).toBe(80);
    await expect(page.locator('app-header button.header__menu')).toBeHidden();
    await expect(page.locator('app-header nav.header__nav')).toBeVisible();
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('0px');
  });

  test('navigation links, chevron on Services, active pill on the current route', async ({
    page,
  }) => {
    const links = page.locator('app-header nav a.header__link');
    await expect(links).toHaveCount(6);
    for (const [index, [href, label]] of NAV.entries()) {
      await expect(links.nth(index)).toHaveAttribute('href', href);
      await expect(links.nth(index)).toHaveText(label);
    }
    await expect(links.nth(1).locator('mat-icon.header__chevron')).toBeVisible();
    expect((await box(page, 'app-header nav a.header__link mat-icon.header__chevron')).w).toBe(20);

    const home = links.first();
    await expect(home).toHaveClass(/header__link--active/);
    await expect(home).toHaveAttribute('aria-current', 'page');
    expect(await style(page, 'app-header a.header__link--active', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    expect(await style(page, 'app-header a.header__link--active', 'color')).toBe(
      'rgb(14, 44, 107)',
    );
    const pill = await box(page, 'app-header a.header__link--active');
    expect(pill.h).toBe(40);
    expect(await style(page, 'app-header a.header__link', 'font-size')).toBe('15px');
    expect(await style(page, 'app-header a.header__link', 'font-weight')).toBe('500');
    expect(await style(page, 'app-header a.header__link', 'border-top-left-radius')).toBe('9999px');
  });

  test('language pill and the filled call to action', async ({ page }) => {
    const lang = await box(page, 'app-header button.header__lang');
    expect(lang.h).toBe(38);
    expect(await style(page, 'app-header button.header__lang', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    await expect(page.locator('app-header .header__lang-code')).toHaveText('EN');

    const cta = page.locator('app-header a.header__cta');
    await expect(cta).toHaveAttribute('href', '/contact');
    await expect(cta).toHaveText("Let's Talk");
    expect((await box(page, 'app-header a.header__cta')).h).toBe(48);
    expect(await style(page, 'app-header a.header__cta', 'background-color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(
      Math.round(
        (await box(page, 'app-header a.header__cta')).x +
          (await box(page, 'app-header a.header__cta')).w,
      ),
    ).toBe(1360);
  });

  test('switching the language from the header menu re-renders the navigation', async ({
    page,
  }) => {
    await page.locator('app-header button.header__lang').click();
    const items = page.locator('.mat-mdc-menu-panel button[mat-menu-item]');
    await expect(items).toHaveText(['English', 'Հայերեն', 'Русский']);
    await expect(items.first()).toHaveAttribute('aria-current', 'true');
    await items.nth(1).click();
    await expect(page.locator('app-header .header__lang-code')).toHaveText('HY');
    await expect(page.locator('app-header nav a.header__link').nth(1)).toHaveText(
      'Ծառայություններ',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'hy');
  });
});

test.describe('header at the mobile design width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('64px bar, 28px logo at the 20px margin, menu button, hairline below', async ({ page }) => {
    expect((await box(page, 'app-header .header')).h).toBe(64);
    const logo = await box(page, 'app-header app-logo');
    expect(logo.h).toBe(28);
    expect(logo.x).toBe(20);
    await expect(page.locator('app-header nav.header__nav')).toBeHidden();
    await expect(page.locator('app-header .header__actions')).toBeHidden();
    const menu = page.locator('app-header button.header__menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect((await box(page, 'app-header button.header__menu mat-icon')).w).toBe(24);
    expect(await style(page, 'app-header button.header__menu mat-icon', 'color')).toBe(
      'rgb(11, 19, 36)',
    );
    // Home runs its hero behind the bar, so the hairline is dropped there and kept elsewhere.
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('0px');
    await page.goto('/about');
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('1px');
    expect(await style(page, 'app-header', 'border-bottom-color')).toBe('rgb(226, 232, 240)');
  });

  test('the menu button discloses the navigation and a link closes it', async ({ page }) => {
    const menu = page.locator('app-header button.header__menu');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('app-header nav.header__nav')).toBeVisible();
    await page.locator('app-header nav a.header__link', { hasText: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('app-header nav.header__nav')).toBeHidden();
  });
});

test.describe('footer at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('surface, columns, headings, links and the pending contact note', async ({ page }) => {
    expect(await style(page, 'app-footer', 'background-color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, 'app-footer', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect((await box(page, 'app-footer app-logo')).h).toBe(32);

    const headings = page.locator('app-footer .footer__heading');
    await expect(headings).toHaveText(['Services', 'Solutions', 'Company', 'Get in touch']);
    const xs = await headings.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)),
    );
    expect(xs).toEqual([488, 718, 948, 1178]);
    expect(await style(page, 'app-footer .footer__heading', 'font-weight')).toBe('600');
    expect(await style(page, 'app-footer .footer__heading', 'font-size')).toBe('15px');
    expect(await style(page, 'app-footer .footer__link', 'font-size')).toBe('14px');
    expect(await style(page, 'app-footer .footer__link', 'line-height')).toBe('20px');
    expect(await style(page, 'app-footer .footer__link', 'color')).toBe('rgb(71, 85, 105)');

    await expect(page.locator('app-footer .footer__column a.footer__link')).toHaveCount(17);
    const pending = page.locator('app-footer .footer__muted');
    await expect(pending).toHaveText('Contact details — pending');
    expect(await style(page, 'app-footer .footer__muted', 'color')).toBe('rgb(100, 116, 139)');
    await expect(pending.locator('a')).toHaveCount(0);
  });

  test('legal row: divider, copyright with the current year, legal links, languages', async ({
    page,
  }) => {
    expect(await style(page, 'app-footer .footer__bottom', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    await expect(page.locator('app-footer .footer__copyright')).toHaveText(
      `© ${new Date().getFullYear()} Nexora. All rights reserved.`,
    );
    const legal = page.locator('app-footer .footer__legal a.footer__link');
    await expect(legal).toHaveCount(2);
    await expect(legal.nth(0)).toHaveAttribute('href', '/privacy-policy');
    await expect(legal.nth(1)).toHaveAttribute('href', '/terms-of-use');
    const languages = page.locator('app-footer .footer__language');
    await expect(languages).toHaveText(['English', 'Հայերեն', 'Русский']);
    await expect(languages.first()).toHaveAttribute('aria-current', 'true');
    expect(
      await style(page, 'app-footer .footer__language[aria-current="true"]', 'font-weight'),
    ).toBe('600');
    expect(await style(page, 'app-footer .footer__copyright', 'font-size')).toBe('14px');
    expect(await style(page, 'app-footer .footer__legal a.footer__link', 'font-size')).toBe('14px');
  });

  test('a footer language button changes the locale and the choice survives a reload', async ({
    page,
  }) => {
    await page.locator('app-footer .footer__language', { hasText: 'Русский' }).click();
    await expect(page.locator('app-footer .footer__heading').first()).toHaveText('Услуги');
    await expect(page.locator('app-header nav a.header__link').nth(1)).toHaveText('Услуги');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    expect((await page.context().cookies()).find((c) => c.name === 'INTLAYER_LOCALE')?.value).toBe(
      'ru',
    );

    await page.reload();
    await expect(page.locator('app-header nav a.header__link').nth(1)).toHaveText('Услуги');
    await expect(
      page.locator('app-footer .footer__language', { hasText: 'Русский' }),
    ).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('routing', () => {
  test('pages are lazy: the chunk is requested on navigation and the active state follows', async ({
    page,
  }) => {
    const requested: string[] = [];
    page.on('request', (req) => {
      if (/chunk-.*\.js$/.test(req.url())) requested.push(req.url());
    });
    await page.goto('/');
    await expect(page.locator('main h1')).toHaveText(HOME_HEADING);
    const before = requested.length;

    await page.locator('app-header nav a.header__link', { hasText: 'Services' }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1')).toHaveText('Services');
    expect(requested.length).toBeGreaterThan(before);
    await expect(page.locator('app-header a.header__link--active')).toHaveText('Services');
  });

  test('every header and footer route resolves to its page', async ({ page }) => {
    for (const [href, label] of NAV) {
      await page.goto(href);
      await expect(page.locator('main h1')).toHaveText(href === '/' ? HOME_HEADING : label);
    }
    await page.goto('/privacy-policy');
    await expect(page.locator('main h1')).toHaveText('Privacy Policy');
    await page.goto('/terms-of-use');
    await expect(page.locator('main h1')).toHaveText('Terms of Use');
  });

  test('unknown URLs redirect to Home', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main h1')).toHaveText(HOME_HEADING);
  });
});
