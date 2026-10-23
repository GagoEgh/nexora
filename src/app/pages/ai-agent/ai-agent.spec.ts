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
    expect(root.lastElementChild?.tagName).toBe('APP-OVERVIEW');

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

  it('renders every string and both links under a locale prefix', async () => {
    await go('/ru/services/ai_agent');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('AI-агенты и автоматизация бизнеса');
    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe(
      'Искусственный интеллект · Услуга 09',
    );
    expect(text('.workflow__label')[0]).toBe('Триггер');
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
    expect(
      Array.from(root.querySelectorAll('.page-intro__crumb-link')).map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(['/hy', '/hy/services']);
  });
});
