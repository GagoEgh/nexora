import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { AiAgent } from './ai-agent';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const STEP_LABELS = ['TRIGGER', 'AGENT', 'TOOL', 'DECISION', 'HUMAN REVIEW', 'ACTION'];

describe('AiAgent', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, AiAgent);
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

  it('opens with the shared intro: a three-step trail, eyebrow, one h1 and the lead', async () => {
    await go('/services/ai_agent');

    const crumbs = Array.from(root.querySelectorAll('.page-intro__crumb'));
    expect(crumbs.map((li) => li.textContent?.trim())).toEqual([
      'Home',
      'Services',
      'AI Agents & Business Automation',
    ]);
    // Only the trail's own pages are links; the page being read is plain text.
    expect(
      Array.from(root.querySelectorAll('.page-intro__crumb-link')).map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(['/', '/services']);
    expect(crumbs[2].getAttribute('aria-current')).toBe('page');

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe(
      'Artificial Intelligence · Service 09',
    );
    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('AI Agents & Business Automation');
    expect(root.querySelector('.page-intro__lead')?.textContent?.trim()).toContain(
      'Automate the repetitive, multi-step work',
    );
  });

  it('routes the two calls to action to contact and solutions', async () => {
    await go('/services/ai_agent');

    const actions = Array.from(root.querySelectorAll<HTMLAnchorElement>('.ai-agent__actions a'));
    expect(actions.map((a) => a.textContent?.trim())).toEqual([
      'Discuss this service',
      'See related solutions',
    ]);
    expect(actions.map((a) => a.getAttribute('href'))).toEqual(['/contact', '/solutions']);
  });

  it('lists the example flow as six ordered steps with the agent one inverted', async () => {
    await go('/services/ai_agent');

    expect(root.querySelector('.workflow__caption')?.textContent?.trim()).toBe(
      'workflow / inbound-request',
    );
    expect(root.querySelector('.workflow__badge')?.textContent?.trim()).toBe('example flow');

    const steps = Array.from(root.querySelectorAll('.workflow__step'));
    expect(steps).toHaveLength(6);
    // The labels are uppercased by CSS, so compare the authored casing.
    expect(text('.workflow__label')).toEqual(
      STEP_LABELS.map((label) => label.charAt(0) + label.slice(1).toLowerCase()),
    );
    expect(text('.workflow__detail')[0]).toBe('New request arrives by email or form');
    expect(steps.map((li) => li.getAttribute('data-tone'))).toEqual([
      'plain',
      'dark',
      'plain',
      'plain',
      'accent',
      'plain',
    ]);
    // It is an ordered sequence, not a decorative diagram.
    expect(root.querySelector('ol.workflow__steps')).not.toBeNull();
  });

  it('closes the page with the overview band, below the hero', async () => {
    await go('/services/ai_agent');

    const overview = root.querySelector('app-overview');
    expect(overview).not.toBeNull();
    expect(overview?.previousElementSibling?.tagName).toBe('APP-PAGE-INTRO');
    expect(overview?.nextElementSibling?.tagName).toBe('APP-PROBLEMS');

    expect(overview?.querySelector('.overview__eyebrow')?.textContent?.trim()).toBe('Overview');
    expect(overview?.querySelector('.overview__title')?.textContent?.trim()).toBe(
      'Automation that understands context, not just rules.',
    );
    expect(overview?.querySelector('.overview__body')?.textContent?.trim()).toContain(
      'too variable for simple rules',
    );
    expect(overview?.querySelector('.overview__note')?.textContent?.trim()).toContain(
      'engineered systems',
    );

    // It must not introduce a second h1, and its title is the page's second level.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(overview?.querySelector('.overview__title')?.tagName).toBe('H2');
  });

  it('ends the page with four problem cards under a shared header', async () => {
    await go('/services/ai_agent');

    const problems = root.querySelector('app-problems');
    expect(problems).not.toBeNull();
    expect(problems?.previousElementSibling?.tagName).toBe('APP-OVERVIEW');
    expect(problems?.nextElementSibling?.tagName).toBe('APP-CAPABILITIES');

    expect(problems?.querySelector('.problems__eyebrow')?.textContent?.trim()).toBe(
      'Problems we solve',
    );
    expect(problems?.querySelector('h2.problems__title')?.textContent?.trim()).toBe(
      'Where manual work slows the business down.',
    );
    expect(problems?.querySelector('.problems__intro')?.textContent?.trim()).toBe(
      'Typical situations where agents and automation create real leverage.',
    );

    const cards = Array.from(problems?.querySelectorAll('.problems__card') ?? []);
    expect(cards).toHaveLength(4);
    expect(text('.problems__card-title')).toEqual([
      'Data copied by hand',
      'Requests wait in inboxes',
      'Documents in every format',
      'Reporting by hand',
    ]);
    expect(text('.problems__card-text')[0]).toContain('email, CRM and spreadsheets');

    // Every card leads with a neutral-toned tile, decorative by the tile's own host binding.
    const tiles = Array.from(problems?.querySelectorAll('app-icon-tile') ?? []);
    expect(tiles).toHaveLength(4);
    expect(tiles.every((tile) => tile.getAttribute('data-tone') === 'neutral')).toBe(true);
    expect(tiles.every((tile) => tile.getAttribute('aria-hidden') === 'true')).toBe(true);

    // The section must not disturb the page's heading outline.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(cards[0].querySelector('.problems__card-title')?.tagName).toBe('H3');
  });

  it('closes the page with the capabilities and deliverables panels', async () => {
    await go('/services/ai_agent');

    const capabilities = root.querySelector('app-capabilities');
    expect(capabilities).not.toBeNull();
    expect(capabilities?.previousElementSibling?.tagName).toBe('APP-PROBLEMS');
    expect(capabilities?.nextElementSibling?.tagName).toBe('APP-AUDIENCES');

    expect(capabilities?.querySelector('.capabilities__eyebrow')?.textContent?.trim()).toBe(
      'Capabilities & deliverables',
    );
    expect(capabilities?.querySelector('h2.capabilities__title')?.textContent?.trim()).toBe(
      'What we build, and what you receive.',
    );

    const panels = Array.from(capabilities?.querySelectorAll('.capabilities__panel') ?? []);
    expect(panels).toHaveLength(2);
    expect(panels.map((panel) => panel.getAttribute('data-tone'))).toEqual(['neutral', 'accent']);
    expect(text('.capabilities__panel-title')).toEqual(['Capabilities', 'Deliverables']);

    // Seven capabilities on the left, six deliverables on the right.
    expect(panels[0].querySelectorAll('.capabilities__item')).toHaveLength(7);
    expect(panels[1].querySelectorAll('.capabilities__item')).toHaveLength(6);
    expect(text('.capabilities__label')[0]).toBe('Lead handling and qualification');
    expect(text('.capabilities__label').at(-1)).toBe('Monitoring and iteration plan');

    // Every row leads with a decorative check.
    const checks = Array.from(capabilities?.querySelectorAll('.capabilities__check') ?? []);
    expect(checks).toHaveLength(13);
    expect(checks.every((check) => check.getAttribute('aria-hidden') === 'true')).toBe(true);

    // The section must not disturb the page outline.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(panels[0].querySelector('.capabilities__panel-title')?.tagName).toBe('H3');
  });

  it('closes the page with the typical projects and audience fit columns', async () => {
    await go('/services/ai_agent');

    const audiences = root.querySelector('app-audiences');
    expect(audiences).not.toBeNull();
    expect(audiences?.previousElementSibling?.tagName).toBe('APP-CAPABILITIES');
    expect(audiences?.nextElementSibling?.tagName).toBe('APP-BUSINESS-VALUE');

    expect(text('.audiences__eyebrow')).toEqual(['Typical projects', "Who it's for"]);
    expect(text('h2.audiences__title')).toEqual([
      'What these engagements usually look like.',
      'Built for teams that run on repeatable processes.',
    ]);

    // Six numbered projects. The arrows are decoration, so nothing here navigates.
    expect(audiences?.querySelectorAll('.audiences__row')).toHaveLength(6);
    expect(text('.audiences__number')).toEqual(['01', '02', '03', '04', '05', '06']);
    expect(text('.audiences__label')[0]).toBe('Inbound lead triage and enrichment');
    expect(text('.audiences__label').at(-1)).toBe('Internal approval workflows');
    expect(audiences?.querySelectorAll('a, button')).toHaveLength(0);
    const arrows = Array.from(audiences?.querySelectorAll('.audiences__arrow') ?? []);
    expect(arrows).toHaveLength(6);
    expect(arrows.every((arrow) => arrow.getAttribute('aria-hidden') === 'true')).toBe(true);

    // Six chips, the fourth carrying the layers icon supplied with the design.
    const chips = Array.from(audiences?.querySelectorAll('.audiences__chip') ?? []);
    expect(chips).toHaveLength(6);
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual([
      'Operations teams',
      'Sales & customer success',
      'Growing SMEs',
      'Enterprises with CRM/ERP',
      'SaaS companies',
      'Digital agencies',
    ]);
    expect(audiences?.querySelector('.audiences__note')?.textContent?.trim()).toBe(
      'Also relevant for software companies that want to add automation features to their own products.',
    );

    // The section must not disturb the page outline.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
  });

  it('closes the page with the business value cards', async () => {
    await go('/services/ai_agent');

    const business = root.querySelector('app-business-value');
    expect(business).not.toBeNull();
    expect(root.lastElementChild?.tagName).toBe('APP-BUSINESS-VALUE');

    expect(business?.querySelector('.business-value__eyebrow')?.textContent?.trim()).toBe(
      'Business value',
    );
    expect(business?.querySelector('h2.business-value__title')?.textContent?.trim()).toBe(
      'What changes when the routine runs itself.',
    );

    const cards = Array.from(business?.querySelectorAll('.business-value__card') ?? []);
    expect(cards).toHaveLength(4);
    expect(text('.business-value__card-title')).toEqual([
      'Less manual work',
      'Faster response',
      'Consistent processes',
      'Visibility and control',
    ]);
    expect(text('.business-value__card-text')[0]).toBe(
      'People spend time on judgement and relationships instead of copying data.',
    );
    expect(business?.querySelector('.business-value__note')?.textContent?.trim()).toBe(
      "Outcomes depend on each process and are agreed per project \u2014 we don't promise generic percentages.",
    );

    // Bare decorative icons, not tiles.
    const icons = Array.from(business?.querySelectorAll('.business-value__icon') ?? []);
    expect(icons).toHaveLength(4);
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(business?.querySelectorAll('app-icon-tile')).toHaveLength(0);

    // The section must not disturb the page outline.
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(cards[0].querySelector('.business-value__card-title')?.tagName).toBe('H3');
  });

  it('renders every string and both links under a locale prefix', async () => {
    await go('/ru/services/ai_agent');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('AI-агенты и автоматизация бизнеса');
    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe(
      'Искусственный интеллект · Услуга 09',
    );
    expect(text('.workflow__label')[0]).toBe('Триггер');
    expect(text('.capabilities__panel-title')).toEqual(['Возможности', 'Результаты']);
    expect(text('.audiences__eyebrow')).toEqual(['Типичные проекты', 'Для кого это']);
    expect(root.querySelector('.business-value__title')?.textContent?.trim()).toBe(
      'Что меняется, когда рутина выполняется сама.',
    );
    expect(root.querySelector('.problems__card-title')?.textContent?.trim()).toBe(
      'Данные копируются вручную',
    );
    expect(root.querySelector('.overview__title')?.textContent?.trim()).toBe(
      'Автоматизация, которая понимает контекст, а не только правила.',
    );
    expect(
      Array.from(root.querySelectorAll<HTMLAnchorElement>('.ai-agent__actions a')).map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(['/ru/contact', '/ru/solutions']);

    await go('/hy/services/ai_agent');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'AI գործակալներ և բիզնես ավտոմատացում',
    );
    expect(text('.workflow__label')[1]).toBe('Գործակալ');
    expect(root.querySelector('.overview__eyebrow')?.textContent?.trim()).toBe('Ակնարկ');
    expect(root.querySelector('.problems__card-title')?.textContent?.trim()).toBe(
      'Ձեռքով պատճենվող տվյալներ',
    );
    expect(text('.capabilities__panel-title')).toEqual(['Հնարավորություններ', 'Արդյունքներ']);
    expect(text('.audiences__eyebrow')).toEqual(['Բնորոշ նախագծեր', 'Ում համար է']);
    expect(root.querySelector('.business-value__title')?.textContent?.trim()).toBe(
      'Ինչ է փոխվում, երբ առօրյա գործընթացներն ինքնաշխատ են դառնում։',
    );
    expect(
      Array.from(root.querySelectorAll('.page-intro__crumb-link')).map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(['/hy', '/hy/services']);
  });
});
