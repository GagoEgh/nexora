import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../../../core/icons/provide-app-icons';
import { HeroNotes } from './hero-notes';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="#0B1324"/></svg>';

/**
 * `hero-illustration.spec.ts` asserts this component's output through its parent. These specs
 * pin its own input contract instead, so the annotation cards keep working if the illustration
 * around them is restructured.
 */
describe('HeroNotes', () => {
  let fixture: ComponentFixture<HeroNotes>;
  let root: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroNotes],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeroNotes);
    fixture.componentRef.setInput('content', getIntlayer('hero').illustration);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  it('renders the workflow card from the content it is given', () => {
    expect(root.querySelector('.notes__title')?.textContent?.trim()).toBe('Agent workflow');

    const steps = Array.from(root.querySelectorAll('.notes__step'));
    expect(steps.map((step) => step.textContent?.trim())).toEqual([
      'Classify inbound request',
      'Retrieve context from CRM',
      'Draft reply for review',
    ]);
  });

  /** The tick is the only thing distinguishing a finished step, so both halves are asserted. */
  it('marks only the finished steps, and draws the tick only there', () => {
    const steps = Array.from(root.querySelectorAll('.notes__step'));

    expect(steps.map((step) => step.classList.contains('notes__step--done'))).toEqual([
      true,
      true,
      false,
    ]);
    expect(steps.map((step) => step.querySelectorAll('mat-icon').length)).toEqual([1, 1, 0]);
  });

  it('renders the request card as one preformatted block', () => {
    const request = root.querySelector('.notes__request');

    expect(request?.querySelector('.notes__method')?.textContent?.trim()).toBe('POST');
    expect(request?.textContent).toContain('/v1/automations/route');
    expect(request?.querySelector('.notes__status')?.textContent?.trim()).toBe('200');
    expect(request?.textContent).toContain('{ owner: "sales-eu" }');
  });
});
