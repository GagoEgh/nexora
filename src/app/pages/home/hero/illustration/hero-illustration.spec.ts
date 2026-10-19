import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../../core/icons/provide-app-icons';
import { HeroIllustration } from './hero-illustration';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="#0B1324"/></svg>';

describe('HeroIllustration', () => {
  let fixture: ComponentFixture<HeroIllustration>;
  let root: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroIllustration],
      providers: [
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeroIllustration);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  it('is decorative and draws the five nodes in three tiers with catalogue icons', () => {
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('.art__path')?.textContent?.trim()).toBe(
      'nexora / system-architecture',
    );

    const tiers = Array.from(root.querySelectorAll('.art__tier'));
    expect(tiers.map((tier) => tier.querySelectorAll('.art__node').length)).toEqual([2, 1, 2]);
    expect(root.querySelectorAll('.art__link')).toHaveLength(2);

    const labels = Array.from(root.querySelectorAll('.art__node-label--full')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual([
      'Web App',
      'CRM / ERP',
      'AI Orchestrator',
      'Mobile App',
      'Knowledge Base',
    ]);
    const shortLabels = Array.from(root.querySelectorAll('.art__node-label--short')).map((el) =>
      el.textContent?.trim(),
    );
    expect(shortLabels).toEqual(['Web App', 'CRM / ERP', 'AI Orchestrator', 'Mobile', 'Knowledge']);

    const tiles = Array.from(root.querySelectorAll('app-icon-tile'));
    expect(tiles.map((t) => t.getAttribute('data-size'))).toEqual(Array(5).fill('small'));
    expect(tiles.map((t) => t.getAttribute('data-tone'))).toEqual([
      'primary',
      'primary',
      'inverse-container',
      'primary',
      'primary',
    ]);
    expect(root.querySelector('.art__node--dark .art__node-label--full')?.textContent?.trim()).toBe(
      'AI Orchestrator',
    );
  });

  it('renders the pipeline steps and the annotation cards', () => {
    const chips = Array.from(root.querySelectorAll('.art__chip')).map((c) => c.textContent?.trim());
    expect(chips).toEqual(['build', 'test', 'deploy', 'monitor']);
    expect(root.querySelector('.art__chip--idle')?.textContent?.trim()).toBe('monitor');

    expect(root.querySelector('.notes__title')?.textContent?.trim()).toBe('Agent workflow');
    const steps = Array.from(root.querySelectorAll('.notes__step'));
    expect(steps.map((s) => s.textContent?.trim())).toEqual([
      'Classify inbound request',
      'Retrieve context from CRM',
      'Draft reply for review',
    ]);
    expect(steps.map((s) => s.classList.contains('notes__step--done'))).toEqual([
      true,
      true,
      false,
    ]);
    expect(root.querySelector('.notes__request')?.textContent).toContain(
      'POST /v1/automations/route',
    );
    expect(root.querySelector('.notes__request')?.textContent).toContain(
      '200 { owner: "sales-eu" }',
    );
  });
});
