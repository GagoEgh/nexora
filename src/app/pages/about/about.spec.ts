import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { About } from './about';
import aboutContent from './about.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const HEADING = 'A senior engineering partner for businesses that build with technology.';

const LABELS = ['Focus', 'Team', 'Markets', 'Clients', 'Engagement'];

const STEPS = ['Business goal', 'Constraints', 'Architecture', 'Delivery', 'Evolution'];

const PRINCIPLES = [
  'Understand before building',
  'Architecture is a business decision',
  'Quality is designed in',
  'Leave systems better',
];

const VALUES = [
  'Software engineering & AI solutions',
  'Senior and Senior+ engineers only',
  'Armenia & international',
  'Startups, SMEs, enterprises, software companies, agencies',
  'Projects, dedicated teams, partnership, white-label, support',
];

describe('About', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, About);
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

  it('opens with the shared intro: breadcrumb, eyebrow, one h1 and the lead', async () => {
    await go('/about');

    expect(text('.page-intro__crumb')).toEqual(['Home', 'About']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.page-intro__crumb')[1].getAttribute('aria-current')).toBe(
      'page',
    );

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe('About Nexora');

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(HEADING);

    expect(root.querySelector('.page-intro__lead')?.textContent?.trim()).toContain(
      'Nexora is a technology development and AI solutions company.',
    );
  });

  it('renders the glance card with its mark, title and five rows in order', async () => {
    await go('/about');

    const card = root.querySelector('app-about-glance .glance');
    expect(card).not.toBeNull();

    // The mark repeats the brand next to the title, so it is decorative.
    const mark = card?.querySelector('.glance__mark');
    expect(mark?.getAttribute('src')).toBe('brand/mark.svg');
    expect(mark?.getAttribute('alt')).toBe('');

    const title = card?.querySelector('.glance__title');
    expect(title?.tagName).toBe('H2');
    expect(title?.textContent?.trim()).toBe('Nexora at a glance');
    expect(card?.getAttribute('aria-labelledby')).toBe(title?.id);

    expect(text('.glance__label')).toEqual(LABELS);
    expect(text('.glance__value')).toEqual(VALUES);
  });

  it('pairs every label with a value as a description list', async () => {
    await go('/about');

    const rows = root.querySelectorAll('.glance__row');
    expect(rows).toHaveLength(5);
    rows.forEach((row) => {
      expect(row.querySelectorAll('dt')).toHaveLength(1);
      expect(row.querySelectorAll('dd')).toHaveLength(1);
    });
    expect(root.querySelector('.glance__rows')?.tagName).toBe('DL');
  });

  it('translates the page and the card, and keeps the locale prefix on the crumb', async () => {
    setLocale('hy');
    await go('/hy/about');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Senior ինժեներական գործընկեր այն բիզնեսների համար, որոնք կառուցում են տեխնոլոգիայով։',
    );
    expect(root.querySelector('.glance__title')?.textContent?.trim()).toBe('Nexora-ն համառոտ');
    expect(text('.glance__label')[0]).toBe('Ուղղություն');
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/hy');

    setLocale('ru');
    await go('/ru/about');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Senior-инженерный партнёр для компаний, которые строят на технологиях.',
    );
    expect(root.querySelector('.glance__title')?.textContent?.trim()).toBe('Nexora вкратце');
    expect(text('.glance__label')).toEqual([
      'Фокус',
      'Команда',
      'Рынки',
      'Клиенты',
      'Форматы работы',
    ]);
  });

  it('closes the page with the philosophy section: eyebrow, heading and two paragraphs', async () => {
    await go('/about');

    const section = root.querySelector('app-philosophy .philosophy');
    expect(section).not.toBeNull();

    expect(section?.querySelector('.philosophy__eyebrow')?.textContent?.trim()).toBe(
      'Engineering philosophy',
    );

    const title = section?.querySelector('.philosophy__title');
    expect(title?.tagName).toBe('H2');
    expect(title?.textContent?.trim()).toBe('Good software is mostly good decisions.');
    expect(section?.getAttribute('aria-labelledby')).toBe(title?.id);

    const paragraphs = text('.philosophy__text');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toContain('Frameworks change every year.');
    expect(paragraphs[1]).toBe('These principles guide every project, whatever the stack.');
  });

  it('renders four principle cards with ordinals, icon tiles and copy', async () => {
    await go('/about');

    expect(root.querySelectorAll('.philosophy__card')).toHaveLength(4);
    expect(text('.philosophy__number')).toEqual(['01', '02', '03', '04']);

    // The section h2 precedes them, so the cards are h3.
    root.querySelectorAll('.philosophy__card-title').forEach((el) => expect(el.tagName).toBe('H3'));
    expect(text('.philosophy__card-title')).toEqual(PRINCIPLES);
    expect(text('.philosophy__card-text')[0]).toBe(
      'We clarify the problem, users and constraints before committing to an approach.',
    );

    // Tiles come from the shared component and stay decorative.
    const tiles = Array.from(root.querySelectorAll('.philosophy__card app-icon-tile'));
    expect(tiles).toHaveLength(4);
    tiles.forEach((tile) => {
      expect(tile.getAttribute('tone') ?? tile.getAttribute('data-tone')).toBe('primary');
      expect(tile.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('translates the philosophy section into Armenian and Russian', async () => {
    setLocale('hy');
    await go('/hy/about');
    expect(root.querySelector('.philosophy__title')?.textContent?.trim()).toBe(
      'Լավ ծրագրակազմը հիմնականում լավ որոշումներ են։',
    );
    expect(text('.philosophy__card-title')[0]).toBe('Հասկանալ նախքան կառուցելը');
    expect(text('.philosophy__number')).toEqual(['01', '02', '03', '04']);

    setLocale('ru');
    await go('/ru/about');
    expect(root.querySelector('.philosophy__title')?.textContent?.trim()).toBe(
      'Хорошее ПО — это прежде всего хорошие решения.',
    );
    expect(text('.philosophy__card-title')[0]).toBe('Понять до того, как строить');
  });

  it('closes the page with the senior model section and its three points', async () => {
    await go('/about');

    const section = root.querySelector('app-senior-model .senior');
    expect(section).not.toBeNull();

    expect(section?.querySelector('.senior__eyebrow')?.textContent?.trim()).toBe(
      'Senior & Senior+ only',
    );

    const title = section?.querySelector('.senior__title');
    expect(title?.tagName).toBe('H2');
    expect(title?.textContent?.trim()).toBe('Experience where the decisions are made.');
    expect(section?.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(section?.querySelector('.senior__lead')?.textContent?.trim()).toContain(
      'Many delivery models put a few senior people on top of a large junior team.',
    );

    expect(text('.senior__point-text')).toEqual([
      'Fewer hand-offs between planning and implementation',
      'Architecture decisions made by people who build',
      'Smaller teams, clearer ownership',
    ]);

    // Badges repeat the same arrow, so they stay out of the accessibility tree.
    const badges = Array.from(root.querySelectorAll('.senior__badge'));
    expect(badges).toHaveLength(3);
    badges.forEach((badge) => expect(badge.getAttribute('aria-hidden')).toBe('true'));
  });

  it('compares the two staffing models as labelled figures', async () => {
    await go('/about');

    const panels = Array.from(root.querySelectorAll('.senior__panel'));
    expect(panels).toHaveLength(2);
    panels.forEach((panel) => expect(panel.tagName).toBe('FIGURE'));
    expect(panels.map((panel) => panel.getAttribute('data-tone'))).toEqual(['plain', 'inverse']);

    expect(text('.senior__panel-label')).toEqual(['Common pyramid', 'Nexora model']);
    root
      .querySelectorAll('.senior__panel-label')
      .forEach((el) => expect(el.tagName).toBe('FIGCAPTION'));

    // The diagrams are decorative; the legends carry the meaning in text.
    root
      .querySelectorAll('.senior__diagram')
      .forEach((el) => expect(el.getAttribute('aria-hidden')).toBe('true'));
    expect(text('.senior__key')).toEqual(['Senior', 'Junior / mid', 'Senior & Senior+']);
  });

  it('draws the pyramid as 1/2/3/5 with a single apex, and the Nexora grid as 3x2', async () => {
    await go('/about');

    const [pyramid, nexora] = Array.from(root.querySelectorAll('.senior__diagram'));

    expect(
      Array.from(pyramid.querySelectorAll('.senior__row')).map(
        (row) => row.querySelectorAll('.senior__block').length,
      ),
    ).toEqual([1, 2, 3, 5]);
    expect(pyramid.querySelectorAll('.senior__block--apex')).toHaveLength(1);

    expect(
      Array.from(nexora.querySelectorAll('.senior__row')).map(
        (row) => row.querySelectorAll('.senior__block').length,
      ),
    ).toEqual([3, 3]);
    expect(nexora.querySelectorAll('.senior__block--apex')).toHaveLength(0);
  });

  it('translates the senior model section into Armenian and Russian', async () => {
    setLocale('hy');
    await go('/hy/about');
    expect(root.querySelector('.senior__title')?.textContent?.trim()).toBe(
      'Փորձառություն այնտեղ, որտեղ կայացվում են որոշումները։',
    );
    expect(text('.senior__panel-label')).toEqual(['Սովորական բուրգ', 'Nexora-ի մոդել']);

    setLocale('ru');
    await go('/ru/about');
    expect(root.querySelector('.senior__title')?.textContent?.trim()).toBe(
      'Опыт там, где принимаются решения.',
    );
    expect(text('.senior__panel-label')).toEqual(['Обычная пирамида', 'Модель Nexora']);
    expect(text('.senior__point-text')[2]).toBe('Меньше команды, яснее зона ответственности');
  });

  it('closes the page with the business flow header', async () => {
    await go('/about');

    const section = root.querySelector('app-business-flow .flow');
    expect(section).not.toBeNull();

    expect(section?.querySelector('.flow__eyebrow')?.textContent?.trim()).toBe(
      'Business-first approach',
    );

    const title = section?.querySelector('.flow__title');
    expect(title?.tagName).toBe('H2');
    expect(title?.textContent?.trim()).toBe(
      'We start with the outcome, then choose the technology.',
    );
    expect(section?.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(section?.querySelector('.flow__intro')?.textContent?.trim()).toContain(
      'A business goal and its constraints shape the architecture',
    );
  });

  it('renders the five steps as an ordered list, the first one accented', async () => {
    await go('/about');

    // The arrows are decorative, so the sequence has to come from the markup.
    expect(root.querySelector('.flow__steps')?.tagName).toBe('OL');

    const steps = Array.from(root.querySelectorAll('.flow__step'));
    expect(steps).toHaveLength(5);
    steps.forEach((step) => expect(step.tagName).toBe('LI'));
    expect(steps.map((step) => step.getAttribute('data-tone'))).toEqual([
      'accent',
      'plain',
      'plain',
      'plain',
      'plain',
    ]);

    expect(text('.flow__step-title')).toEqual(STEPS);
    root.querySelectorAll('.flow__step-title').forEach((el) => expect(el.tagName).toBe('H3'));
    expect(text('.flow__step-text')[0]).toBe('What must change, for whom');
    expect(text('.flow__step-text')[4]).toBe('Support, measure, improve');
  });

  it('places a decorative connector before every step but the first', async () => {
    await go('/about');

    const arrows = Array.from(root.querySelectorAll('.flow__arrow'));
    expect(arrows).toHaveLength(4);
    arrows.forEach((arrow) => expect(arrow.getAttribute('aria-hidden')).toBe('true'));

    // The first step carries no connector.
    expect(root.querySelectorAll('.flow__step')[0].querySelector('.flow__arrow')).toBeNull();

    const icons = Array.from(root.querySelectorAll('.flow__icon'));
    expect(icons).toHaveLength(5);
    icons.forEach((icon) => expect(icon.getAttribute('aria-hidden')).toBe('true'));
  });

  it('translates the business flow into Armenian and Russian', async () => {
    setLocale('hy');
    await go('/hy/about');
    expect(root.querySelector('.flow__title')?.textContent?.trim()).toBe(
      'Մենք սկսում ենք արդյունքից, հետո ընտրում տեխնոլոգիան։',
    );
    expect(text('.flow__step-title')[0]).toBe('Բիզնես նպատակ');

    setLocale('ru');
    await go('/ru/about');
    expect(root.querySelector('.flow__title')?.textContent?.trim()).toBe(
      'Мы начинаем с результата, а технологию выбираем потом.',
    );
    expect(text('.flow__step-title')).toEqual([
      'Бизнес-цель',
      'Ограничения',
      'Архитектура',
      'Поставка',
      'Развитие',
    ]);
  });

  it('keeps the business flow dictionary complete: five steps with known icons', () => {
    const { steps } = aboutContent.content.businessFlow;
    expect(steps).toHaveLength(5);
    expect(steps.map((step) => step.icon)).toEqual([
      'target',
      'compass',
      'git-branch',
      'code',
      'refresh-cw',
    ]);
  });

  it('keeps the philosophy dictionary complete: four cards, two paragraphs', () => {
    const { cards, intro } = aboutContent.content.philosophy;
    expect(cards).toHaveLength(4);
    expect(intro).toHaveLength(2);
    expect(cards.map((card) => card.icon)).toEqual([
      'search',
      'layers',
      'shield-check',
      'refresh-cw',
    ]);
  });

  it('keeps the dictionary complete: five rows, every field populated', () => {
    const { rows } = aboutContent.content.glance;
    expect(rows).toHaveLength(5);
    rows.forEach((row) => {
      expect(row.label).toBeDefined();
      expect(row.value).toBeDefined();
    });
  });
});
