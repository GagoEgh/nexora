import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { COMPANY_MAX, ContactForm, DESCRIPTION_MAX, NAME_MAX } from './contact-form';
import contactFormContent from './contact-form.content';
import {
  ContactSubmitter,
  type ContactInquiry,
  type ContactSubmitResult,
} from './contact-submitter';

/**
 * The wire contract with `Nexora-back`, asserted from this side.
 *
 * The API validates with `whitelist: true` and `forbidNonWhitelisted: true`, so a field this
 * application adds, renames or drops does not degrade - it makes the API answer `400 property
 * <x> should not exist` for *every* submission. The same is true of an option value the API's
 * `IsIn` list does not contain. Nothing in either repository catches that today: the contract
 * is duplicated in prose, and it has already drifted once (the API's README still documents a
 * `consent` field that its own DTO rejects).
 *
 * `Nexora-back/src/modules/contact/dto/create-contact.dto.ts` is the authority. These values
 * are copied from it deliberately: duplicating ten field names in a test is cheaper than a
 * shared package, and it fails a build the moment either side moves. The matching assertions
 * live in that repository's `create-contact.dto.spec.ts`.
 */
const CONTRACT = {
  fields: [
    'budget',
    'company',
    'description',
    'email',
    'interest',
    'method',
    'name',
    'service',
    'timeline',
    'website',
  ],
  interest: ['new-project', 'dedicated-team', 'partnership', 'something-else'],
  service: [
    'design-product',
    'software-engineering',
    'artificial-intelligence',
    'infrastructure-operations',
    'engineering-partnerships',
  ],
  timeline: ['asap', '1-3-months', '3-6-months', 'planning'],
  budget: ['under-10k', '10-25k', '25-50k', '50-100k', 'over-100k', 'unsure'],
  method: ['email', 'phone', 'video'],
  limits: { name: 120, company: 160, description: 2000 },
} as const;

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

class CapturingSubmitter extends ContactSubmitter {
  readonly calls: ContactInquiry[] = [];

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    this.calls.push(inquiry);
    return { status: 'sent' };
  }
}

interface FormInternals {
  readonly form: {
    name: () => { value: { set(v: string): void } };
    email: () => { value: { set(v: string): void } };
    company: () => { value: { set(v: string): void } };
    service: () => { value: { set(v: string): void } };
    description: () => { value: { set(v: string): void } };
  };
  submit(): Promise<void>;
}

/** Option `value`s are plain strings in the dictionary; only the labels are translated. */
const values = (options: readonly { readonly value: string }[]) => options.map((o) => o.value);

describe('the contact API contract', () => {
  const copy = contactFormContent.content;

  it('offers exactly the interest values the API accepts', () => {
    expect(values(copy.interestOptions)).toEqual(CONTRACT.interest);
  });

  it('offers exactly the service values the API accepts', () => {
    expect(values(copy.serviceOptions)).toEqual(CONTRACT.service);
  });

  it('offers exactly the timeline values the API accepts', () => {
    // The API additionally accepts `''`, which is the default rather than a selectable option.
    expect(values(copy.timelineOptions)).toEqual(CONTRACT.timeline);
  });

  it('offers exactly the budget values the API accepts', () => {
    expect(values(copy.budgetOptions)).toEqual(CONTRACT.budget);
  });

  it('offers exactly the contact-method values the API accepts', () => {
    expect(values(copy.methodOptions)).toEqual(CONTRACT.method);
  });

  it('enforces the same maximum lengths the API does', () => {
    // Longer here than there would mean the visitor types text the API silently refuses.
    expect(NAME_MAX).toBe(CONTRACT.limits.name);
    expect(COMPANY_MAX).toBe(CONTRACT.limits.company);
    expect(DESCRIPTION_MAX).toBe(CONTRACT.limits.description);
  });
});

describe('the submitted payload', () => {
  let submitter: CapturingSubmitter;
  let inner: FormInternals;

  beforeEach(async () => {
    submitter = new CapturingSubmitter();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
        { provide: ContactSubmitter, useValue: submitter },
      ],
    });

    const fixture = TestBed.createComponent(ContactForm);
    inner = fixture.componentInstance as unknown as FormInternals;
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await fixture.whenStable();

    inner.form.name().value.set('Ada Lovelace');
    inner.form.email().value.set('ada@example.com');
    inner.form.company().value.set('Nexora');
    inner.form.service().value.set('software-engineering');
    inner.form.description().value.set('Modernising a legacy ordering platform.');
    await fixture.whenStable();
    await inner.submit();
  });

  it('carries exactly the ten fields the API whitelists, and no others', () => {
    // This is the assertion that matters: `forbidNonWhitelisted` rejects the whole request over
    // one unexpected key, so an extra field here breaks every inquiry rather than being ignored.
    expect(submitter.calls).toHaveLength(1);
    expect(Object.keys(submitter.calls[0]).sort()).toEqual([...CONTRACT.fields]);
  });

  it('sends the optional selects as empty strings rather than omitting them', () => {
    // The API declares them `@IsString() @IsIn(['', ...])`, so `undefined` would be a 400.
    const sent = submitter.calls[0];
    expect(sent.timeline).toBe('');
    expect(sent.budget).toBe('');
  });

  it('leaves the honeypot empty, which the API requires of a real visitor', () => {
    expect(submitter.calls[0].website).toBe('');
  });
});
