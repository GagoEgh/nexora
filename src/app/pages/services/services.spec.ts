import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { SERVICE_CATEGORY_IDS, Services, isServiceCategoryId, serviceSectionId } from './services';
import servicesContent from './services.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const CATEGORY_LABELS = [
  'Design & Product',
  'Software Engineering',
  'Artificial Intelligence',
  'Infrastructure & Operations',
  'Engineering Partnerships',
];
const COUNTS = [1, 6, 3, 3, 2];
const TOTAL = 15;

describe('Services', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, Services);
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await harness.fixture.whenStable();
    root = harness.routeNativeElement as HTMLElement;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the breadcrumb, eyebrow, a single h1 and the lead copy', async () => {
    await go('/services');

    expect(text('.services__crumb')).toEqual(['Home', 'Services']);
    expect(root.querySelector('.services__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.services__crumb')[1].getAttribute('aria-current')).toBe('page');

    expect(root.querySelector('.services__eyebrow')?.textContent?.trim()).toBe('Services');
    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(
      'Fifteen services across the full software lifecycle.',
    );
    expect(root.querySelector('.services__lead')?.textContent?.trim()).toContain(
      'From interface design to AI agents and production infrastructure.',
    );
  });

  it('lists the five categories with counts derived from the catalogue', async () => {
    await go('/services');

    expect(text('.services__category-label')).toEqual(CATEGORY_LABELS);
    expect(text('.services__category-count').map(Number)).toEqual(COUNTS);
    expect(COUNTS.reduce((sum, count) => sum + count, 0)).toBe(TOTAL);
    expect(root.querySelectorAll('.services__group')).toHaveLength(5);
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);
  });

  it('declares every service against a category the page actually groups by', () => {
    const items = servicesContent.content.items;
    expect(items).toHaveLength(TOTAL);

    // `satisfies ServiceCategoryId` guards this at compile time; assert it at runtime too,
    // because an unknown category silently drops the service out of every group.
    for (const item of items) {
      expect(isServiceCategoryId(item.category)).toBe(true);
    }

    const grouped = SERVICE_CATEGORY_IDS.map(
      (id) => items.filter((item) => item.category === id).length,
    );
    expect(grouped).toEqual(COUNTS);
    // No service may be stranded outside the five rendered groups.
    expect(grouped.reduce((sum, count) => sum + count, 0)).toBe(items.length);
  });

  it('numbers every service once across the whole catalogue', async () => {
    await go('/services');

    const numbers = text('.services__number');
    expect(numbers).toHaveLength(TOTAL);
    expect(numbers).toEqual(
      Array.from({ length: TOTAL }, (_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it('gives each category section the id its card row points at', async () => {
    await go('/services');

    const ids = Array.from(root.querySelectorAll('.services__group')).map((el) => el.id);
    expect(ids).toEqual(SERVICE_CATEGORY_IDS.map(serviceSectionId));

    const hrefs = Array.from(root.querySelectorAll('.services__category')).map((el) =>
      el.getAttribute('href'),
    );
    expect(hrefs).toEqual(ids.map((id) => `#${id}`));
  });

  it('shows only the category named by the URL', async () => {
    await go('/services?category=software-engineering');

    expect(root.querySelectorAll('.services__group')).toHaveLength(1);
    expect(root.querySelector('.services__group')?.id).toBe('services-software-engineering');
    expect(root.querySelectorAll('.services__card')).toHaveLength(6);
    expect(root.querySelector('.services__group-title')?.textContent?.trim()).toBe(
      'Software Engineering',
    );
  });

  it('falls back to the whole catalogue for a missing or unknown category', async () => {
    await go('/services');
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);

    await go('/services?category=not-a-category');
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);
    expect(root.querySelectorAll('.services__group')).toHaveLength(5);
  });

  it('marks the filtered category as current in the card', async () => {
    await go('/services?category=artificial-intelligence');

    const current = Array.from(root.querySelectorAll('.services__category')).map((el) =>
      el.getAttribute('aria-current'),
    );
    expect(current).toEqual([null, null, 'true', null, null]);
    expect(root.querySelectorAll('.services__category--active')).toHaveLength(1);
  });

  it('writes the selected category into the URL and clears it for all services', async () => {
    await go('/services');
    const router = TestBed.inject(Router);
    const select = root.querySelector('select.services__select');
    expect(select).not.toBeNull();

    (select as HTMLSelectElement).value = 'engineering-partnerships';
    select?.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(router.url).toBe('/services?category=engineering-partnerships');
    expect(root.querySelectorAll('.services__card')).toHaveLength(2);

    (select as HTMLSelectElement).value = 'all';
    select?.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(router.url).toBe('/services');
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);
  });

  it('offers one filter option per category plus all services', async () => {
    await go('/services');

    expect(root.querySelectorAll('mat-chip-option')).toHaveLength(6);
    expect(text('select.services__select option')).toEqual([
      `All services (${TOTAL})`,
      ...CATEGORY_LABELS.map((label, i) => `${label} (${COUNTS[i]})`),
    ]);
    expect(root.querySelector('mat-chip-listbox')?.getAttribute('aria-label')).toBe(
      'Filter services by category',
    );
    expect(root.querySelector('.services__categories')?.getAttribute('aria-label')).toBe(
      'Service categories',
    );
    expect(root.querySelector('.services__results')?.getAttribute('aria-live')).toBe('polite');
  });

  it('hides the decorative category icons from assistive technology', async () => {
    await go('/services');

    // 5 in the category nav, 5 heading the catalogue groups, 1 in the closing CTA band.
    const tiles = Array.from(root.querySelectorAll('app-icon-tile'));
    expect(tiles).toHaveLength(11);
    expect(tiles.every((tile) => tile.getAttribute('aria-hidden') === 'true')).toBe(true);
    // The header card uses the 36px tile; the catalogue uses the default 48px one.
    const card = Array.from(root.querySelectorAll('.services__category app-icon-tile'));
    expect(card.every((tile) => tile.getAttribute('data-size') === 'dense')).toBe(true);
    const catalogue = Array.from(root.querySelectorAll('.services__group-head app-icon-tile'));
    expect(catalogue.every((tile) => tile.getAttribute('data-size') === 'medium')).toBe(true);
  });

  it('closes the page with a solutions CTA that survives category filtering', async () => {
    await go('/services');

    const cta = root.querySelector('.services__cta');
    expect(cta).not.toBeNull();
    // It still follows the catalogue, and the conversation band now closes the page.
    expect(cta?.previousElementSibling?.classList.contains('services__results')).toBe(true);
    expect(cta?.nextElementSibling?.tagName).toBe('APP-START-CONVERSATION');
    expect(root.lastElementChild?.tagName).toBe('APP-START-CONVERSATION');
    expect(root.querySelector('.services__cta-title')?.textContent?.trim()).toBe(
      'Not sure which service fits?',
    );
    expect(root.querySelector('.services__cta-text')?.textContent?.trim()).toBe(
      'Start from the business problem instead — each solution maps to the services that address it.',
    );

    const action = root.querySelector('a.services__cta-action');
    expect(action?.textContent?.trim()).toContain('Browse solutions');
    expect(action?.getAttribute('href')).toBe('/solutions');
    // The heading hierarchy must stay intact: the band adds an h2, never a second h1.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('.services__cta-title')?.tagName).toBe('H2');

    // Filtering hides four of the five groups; the band is outside that loop and stays.
    await go('/services?category=software-engineering');
    expect(root.querySelectorAll('.services__group')).toHaveLength(1);
    expect(root.querySelector('.services__cta')).not.toBeNull();
  });

  it('localizes the CTA copy and its link under a locale prefix', async () => {
    await go('/ru/services');

    expect(root.querySelector('.services__cta-title')?.textContent?.trim()).toBe(
      'Не уверены, какая услуга подойдёт?',
    );
    expect(root.querySelector('a.services__cta-action')?.textContent?.trim()).toContain(
      'Смотреть решения',
    );
    expect(root.querySelector('a.services__cta-action')?.getAttribute('href')).toBe(
      '/ru/solutions',
    );

    await go('/hy/services');
    expect(root.querySelector('.services__cta-title')?.textContent?.trim()).toBe(
      'Վստահ չե՞ք, թե որ ծառայությունն է հարմար։',
    );
    expect(root.querySelector('a.services__cta-action')?.getAttribute('href')).toBe(
      '/hy/solutions',
    );
  });

  it('closes the page with the conversation band, without the home page steps', async () => {
    await go('/services');

    const band = root.querySelector('app-start-conversation');
    expect(band).not.toBeNull();
    expect(band?.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Need several services in one project?',
    );
    expect(band?.querySelector('.start-conversation__eyebrow')?.textContent?.trim()).toBe(
      'Start a conversation',
    );
    // The numbered list belongs to the home page placement only.
    expect(band?.querySelector('.start-conversation__steps')).toBeNull();

    const links = Array.from(band?.querySelectorAll('a') ?? []);
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Discuss Your Project',
      'Explore Our Services',
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/contact', '/services/ai_agent']);

    // The band must not disturb the page's heading structure or catalogue.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.services__group')).toHaveLength(5);
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);

    // Filtering narrows the catalogue; both closing blocks stay.
    await go('/services?category=software-engineering');
    expect(root.querySelectorAll('.services__group')).toHaveLength(1);
    expect(root.querySelector('.services__cta')).not.toBeNull();
    expect(root.querySelector('app-start-conversation')).not.toBeNull();
  });

  it('localizes the conversation band and keeps the prefix on both of its links', async () => {
    await go('/ru/services');

    const band = () => root.querySelector('app-start-conversation');
    expect(band()?.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Нужно несколько услуг в одном проекте?',
    );
    expect(
      Array.from(band()?.querySelectorAll('a') ?? []).map((a) => a.getAttribute('href')),
    ).toEqual(['/ru/contact', '/ru/services/ai_agent']);

    await go('/hy/services');
    expect(band()?.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Մեկ նախագծում մի քանի ծառայությո՞ւն է անհրաժեշտ։',
    );
    expect(
      Array.from(band()?.querySelectorAll('a') ?? []).map((a) => a.getAttribute('href')),
    ).toEqual(['/hy/contact', '/hy/services/ai_agent']);
  });

  it('gives Artificial Intelligence the dark accent tile and the others the primary one', async () => {
    await go('/services');

    expect(
      Array.from(root.querySelectorAll('.services__group-head app-icon-tile')).map((tile) =>
        tile.getAttribute('data-tone'),
      ),
    ).toEqual(['primary', 'primary', 'inverse-accent', 'primary', 'primary']);
  });

  it('heads each catalogue section with a position, title, description and count', async () => {
    await go('/services');

    expect(text('.services__group-position')).toEqual([
      '01 / 05',
      '02 / 05',
      '03 / 05',
      '04 / 05',
      '05 / 05',
    ]);
    expect(text('.services__group-title')).toEqual(CATEGORY_LABELS);
    expect(root.querySelector('.services__group-text')?.textContent?.trim()).toBe(
      'Interfaces and product design that make complex software clear and usable.',
    );
    // Pluralised through Intlayer, so "1 service" and "6 services" come from one entry.
    expect(text('.services__group-count')).toEqual([
      '1 service',
      '6 services',
      '3 services',
      '3 services',
      '2 services',
    ]);
  });

  it('renders every service card with a number, title, summary and three tags', async () => {
    await go('/services');

    const cards = Array.from(root.querySelectorAll('.services__card'));
    expect(cards).toHaveLength(TOTAL);
    expect(cards.every((card) => card.querySelectorAll('.services__tag').length === 3)).toBe(true);

    const first = cards[0];
    expect(first.querySelector('.services__number')?.textContent?.trim()).toBe('01');
    expect(first.querySelector('.services__card-title')?.textContent?.trim()).toBe(
      'Web Design & UI/UX Design',
    );
    expect(first.querySelector('.services__card-summary')?.textContent?.trim()).toBe(
      'Research-led interfaces, prototypes and design systems for websites, SaaS products and ' +
        'dashboards.',
    );
    expect(
      Array.from(first.querySelectorAll('.services__tag')).map((tag) => tag.textContent?.trim()),
    ).toEqual(['Wireframes', 'Prototypes', 'Design systems']);
    expect(root.querySelectorAll('.services__tag')).toHaveLength(TOTAL * 3);
  });

  it('keeps the card arrow decorative, since no per-service page exists yet', async () => {
    await go('/services');

    const arrows = Array.from(root.querySelectorAll('.services__card-arrow'));
    expect(arrows).toHaveLength(TOTAL);
    expect(arrows.every((arrow) => arrow.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(root.querySelectorAll('.services__card a, .services__card button')).toHaveLength(0);
  });

  it('renders localized copy and keeps the locale prefix on the breadcrumb', async () => {
    setLocale('ru');
    await go('/ru/services');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Пятнадцать услуг на всём жизненном цикле программного обеспечения.',
    );
    expect(text('.services__crumb')).toEqual(['Главная', 'Услуги']);
    expect(root.querySelector('.services__crumb-link')?.getAttribute('href')).toBe('/ru');
    expect(text('.services__category-label')).toEqual([
      'Дизайн и продукт',
      'Разработка ПО',
      'Искусственный интеллект',
      'Инфраструктура и эксплуатация',
      'Инженерное партнёрство',
    ]);
    expect(root.querySelectorAll('.services__card')).toHaveLength(TOTAL);
  });

  it('keeps the filter through a locale-prefixed URL', async () => {
    setLocale('hy');
    await go('/hy/services?category=design-product');

    expect(root.querySelectorAll('.services__card')).toHaveLength(1);
    expect(root.querySelector('.services__card-title')?.textContent?.trim()).toBe(
      'Վեբ դիզայն և UI/UX դիզայն',
    );
    expect(
      Array.from(root.querySelectorAll('.services__tag')).map((tag) => tag.textContent?.trim()),
    ).toEqual(['Վայրֆրեյմներ', 'Նախատիպեր', 'Դիզայն համակարգեր']);
  });
});
