import { expect, test, type Page } from '@playwright/test';

/**
 * Header (Header.jpg / Mobile.png), footer (Desktop.png), routing with lazy loading and
 * language switching. Geometry is asserted at the design widths; colours resolve from the
 * Nexora tokens; lazy routes are observed through their chunk requests.
 */
const HOME_HEADING = 'Engineering Digital Solutions That Move Business Forward.';
const SERVICES_HEADING = 'Fifteen services across the full software lifecycle.';
const SOLUTIONS_HEADING = 'Start from the problem, not the technology.';
const ABOUT_HEADING = 'A senior engineering partner for businesses that build with technology.';

/** Pages whose h1 is not simply their nav label. */
const PAGE_HEADING: Record<string, string> = {
  '/': HOME_HEADING,
  '/services': SERVICES_HEADING,
  '/solutions': SOLUTIONS_HEADING,
  '/about': ABOUT_HEADING,
};

const NAV = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/solutions', 'Solutions'],
  ['/about', 'About'],
  ['/partnerships', 'Partnerships'],
  ['/contact', 'Contact'],
] as const;

/** Services opens a menu, so its pages are reached through the trigger. */
const SERVICES_TRIGGER = 'app-header nav button.header__link';
const SERVICES_MENU_ITEM = '.mat-mdc-menu-panel a[mat-menu-item]';
/** The nav entries that are still plain links. */
const NAV_ANCHORS = NAV.filter(([href]) => href !== '/services');

const openServicesMenu = async (page: Page) => {
  await page.locator(SERVICES_TRIGGER).click();
  return page.locator(SERVICES_MENU_ITEM);
};

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
    await expect(links).toHaveCount(5);
    for (const [index, [href, label]] of NAV_ANCHORS.entries()) {
      await expect(links.nth(index)).toHaveAttribute('href', href);
      await expect(links.nth(index)).toHaveText(label);
    }
    // Services is a menu trigger carrying the chevron, closed until it is used.
    const trigger = page.locator(SERVICES_TRIGGER);
    await expect(trigger).toHaveCount(1);
    await expect(trigger).toHaveText('Services');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger.locator('mat-icon.header__chevron')).toBeVisible();
    expect((await box(page, SERVICES_TRIGGER + ' mat-icon.header__chevron')).w).toBe(20);
    await expect(page.locator('.mat-mdc-menu-panel')).toHaveCount(0);

    const home = links.first();
    await expect(home).toHaveClass(/header__link--active/);
    await expect(home).toHaveAttribute('aria-current', 'page');
    // The active route reads as plain primary-coloured text, with no pill behind it.
    expect(await style(page, 'app-header a.header__link--active', 'background-color')).toBe(
      'rgba(0, 0, 0, 0)',
    );
    expect(await style(page, 'app-header a.header__link--active', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect((await box(page, 'app-header a.header__link--active')).h).toBe(40);
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
    await expect(page).toHaveURL(/\/hy$/);
    await expect(page.locator('app-header .header__lang-code')).toHaveText('HY');
    await expect(page.locator(SERVICES_TRIGGER)).toHaveText('Ծառայություններ');
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
    // Pages with an immersive intro run it behind the bar, so the hairline is dropped there
    // and kept on the ordinary pages.
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('0px');
    await page.goto('/contact');
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
    await expect(page).toHaveURL(/\/ru$/);
    await expect(page.locator('app-footer .footer__heading').first()).toHaveText('Услуги');
    await expect(page.locator(SERVICES_TRIGGER)).toHaveText('Услуги');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    expect((await page.context().cookies()).find((c) => c.name === 'INTLAYER_LOCALE')?.value).toBe(
      'ru',
    );

    await page.reload();
    await expect(page.locator(SERVICES_TRIGGER)).toHaveText('Услуги');
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

    await (await openServicesMenu(page)).first().click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1')).toHaveText(SERVICES_HEADING);
    expect(requested.length).toBeGreaterThan(before);
    // The trigger is a button, so the active pill lands on it rather than on an anchor.
    await expect(page.locator('app-header button.header__link--active')).toHaveText('Services');
  });

  test('the Services entry opens a menu that routes to both of its pages', async ({ page }) => {
    await page.goto('/');
    const items = await openServicesMenu(page);

    await expect(items).toHaveCount(2);
    await expect(items).toHaveText(['Services', 'AI Agents & Business Automation']);
    await expect(items.nth(0)).toHaveAttribute('href', '/services');
    await expect(items.nth(1)).toHaveAttribute('href', '/services/ai_agent');

    await items.nth(1).click();
    await expect(page).toHaveURL(/\/services\/ai_agent$/);
    await expect(page.locator('main h1')).toHaveText('AI Agents & Business Automation');

    // The first item reaches the catalogue itself.
    await (await openServicesMenu(page)).first().click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1')).toHaveText(SERVICES_HEADING);
  });

  test('the services menu keeps the locale prefix on both items', async ({ page }) => {
    await page.goto('/ru');
    const items = await openServicesMenu(page);
    await expect(items.nth(0)).toHaveAttribute('href', '/ru/services');
    await expect(items.nth(1)).toHaveAttribute('href', '/ru/services/ai_agent');

    await items.nth(1).click();
    await expect(page).toHaveURL(/\/ru\/services\/ai_agent$/);
    await expect(page.locator('main h1')).toHaveText('AI-агенты и автоматизация бизнеса');
  });

  test('every header and footer route resolves to its page', async ({ page }) => {
    for (const [href, label] of NAV) {
      await page.goto(href);
      await expect(page.locator('main h1')).toHaveText(PAGE_HEADING[href] ?? label);
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

  test('localized pages have their own URLs with localized links and alternates', async ({
    page,
  }) => {
    await page.goto('/ru/services');
    await expect(page.locator('main h1')).toHaveText(
      'Пятнадцать услуг на всём жизненном цикле программного обеспечения.',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page).toHaveTitle('Услуги | Nexora');
    await expect((await openServicesMenu(page)).first()).toHaveAttribute('href', '/ru/services');
    await page.keyboard.press('Escape');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ru\/services$/);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      /\/services$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="hy"]')).toHaveAttribute(
      'href',
      /\/hy\/services$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      /\/services$/,
    );

    // Switching keeps the route and moves it under the new prefix.
    await page.locator('app-footer .footer__language', { hasText: 'Հայերեն' }).click();
    await expect(page).toHaveURL(/\/hy\/services$/);
    await expect(page.locator('main h1')).toHaveText(
      'Տասնհինգ ծառայություն՝ ծրագրային ապահովման ողջ կենսափուլի ընթացքում։',
    );

    // Unknown paths fall back to the root of their locale; a bare entry honours the last choice.
    await page.goto('/hy/does-not-exist');
    await expect(page).toHaveURL(/\/hy$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/hy$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hy');
  });

  test('scrolling: new pages open at the top, Back restores the position, a language switch keeps it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const scrollY = () => page.evaluate(() => Math.round(window.scrollY));
    await page.goto('/');
    await expect(page.locator('app-what-we-build .what-we-build__card').first()).toBeAttached();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bottom = await scrollY();
    expect(bottom).toBeGreaterThan(5000);

    await page
      .locator('app-footer .footer__column a.footer__link', { hasText: 'Software Engineering' })
      .click();
    await expect(page).toHaveURL(/\/services\?category=software-engineering$/);
    await expect.poll(scrollY).toBe(0);

    // The router restores the stored position as soon as the view exists; late layout of the long
    // home page can leave it within the last screen of the exact offset.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(scrollY, { timeout: 10000 }).toBeGreaterThan(bottom - 844);

    await page.evaluate(() => window.scrollTo(0, 1500));
    // dispatchEvent: a plain click would first scroll the footer button into view.
    await page
      .locator('app-footer .footer__language', { hasText: 'Русский' })
      .dispatchEvent('click');
    await expect(page).toHaveURL(/\/ru$/);
    await expect(page.locator('app-footer .footer__heading').first()).toHaveText('Услуги');
    await expect.poll(scrollY).toBe(1500);
  });

  test('document metadata follows the route and the locale', async ({ page }) => {
    const HOME_TITLE = 'Nexora | Technology development and AI solutions partner';
    await page.goto('/');
    await expect(page).toHaveTitle(HOME_TITLE);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Senior and Senior\+ engineering expertise/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', HOME_TITLE);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');

    await (await openServicesMenu(page)).first().click();
    await expect(page).toHaveTitle('Services | Nexora');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Services | Nexora',
    );

    await page.locator('app-footer .footer__language', { hasText: 'Русский' }).click();
    await expect(page).toHaveTitle('Услуги | Nexora');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'ru_RU');
  });
});
