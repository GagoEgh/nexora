import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { COMPANY_MAX, ContactForm, DESCRIPTION_MAX, EMAIL_MAX, NAME_MAX } from './contact-form';
import contactFormContent from './contact-form.content';
import { isMissingEmailTld, isOnlyWhitespace } from './contact-rules';
import {
  BUDGET_VALUES,
  ContactSubmitter,
  INTEREST_VALUES,
  METHOD_VALUES,
  SERVICE_VALUES,
  TIMELINE_VALUES,
  type ContactInquiry,
  type ContactSubmitResult,
} from './contact-submitter';

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
  limits: { name: 120, company: 160, description: 2000, email: 254 },
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

  // The option values now exist as unions on `ContactInquiry`, so a typo is a compile error. That
  // only helps if the unions match the API; these assertions are what keep the three copies -
  // the content dictionary, these types, and the backend DTO - in step. A union that drifted
  // *wider* than the backend would otherwise compile cleanly and fail in production.
  it('derives the interest and method unions from exactly the API values', () => {
    expect([...INTEREST_VALUES]).toEqual(CONTRACT.interest);
    expect([...METHOD_VALUES]).toEqual(CONTRACT.method);
  });

  it('allows the empty pre-selection value only where the model needs it', () => {
    // `''` is the form model's value before the visitor chooses. The API accepts it for the two
    // optional selects; for `service` it does not, and `required(inquiry.service)` is the guard.
    expect([...SERVICE_VALUES]).toEqual(['', ...CONTRACT.service]);
    expect([...TIMELINE_VALUES]).toEqual(['', ...CONTRACT.timeline]);
    expect([...BUDGET_VALUES]).toEqual(['', ...CONTRACT.budget]);
  });

  it('enforces the same maximum lengths the API does', () => {
    // Longer here than there would mean the visitor types text the API silently refuses.
    expect(NAME_MAX).toBe(CONTRACT.limits.name);
    expect(COMPANY_MAX).toBe(CONTRACT.limits.company);
    expect(DESCRIPTION_MAX).toBe(CONTRACT.limits.description);
    expect(EMAIL_MAX).toBe(CONTRACT.limits.email);
  });
});

/**
 * CT-10. `CONTRACT` above pins the parts of the agreement that are *data* - the accepted values
 * and the numeric limits. These pin the parts that are *behaviour*, which is where the two
 * stacks had actually drifted: `required()` does not trim and `@trim() @MinLength(1)` does, and
 * `email()` allows a domain with no TLD while `@IsEmail()` defaults to `require_tld: true`.
 *
 * The backend lives in another repository and cannot be imported, so its verdicts are written
 * out here the same way its accepted values are. Each table entry is a claim about the API that
 * can be checked by hand against `create-contact.dto.ts`.
 */
describe('validation parity with the API', () => {
  /** What the API does with `@trim() @MinLength(1)` on name, company and description. */
  const serverAcceptsPresence = (value: string) => value.trim().length >= 1;

  /** What the form does: `required()` owns empty, `notBlank` owns whitespace-only. */
  const clientAcceptsPresence = (value: string) => value !== '' && !isOnlyWhitespace(value);

  const PRESENCE_CASES = ['', ' ', '   ', '\t', '\n', ' \t\n ', 'x', ' x ', 'Ada', '  Ada  '];

  it('agrees with the API on every presence case, trimming included', () => {
    for (const value of PRESENCE_CASES) {
      expect(clientAcceptsPresence(value), JSON.stringify(value)).toBe(
        serverAcceptsPresence(value),
      );
    }
  });

  it('includes the case that used to differ', () => {
    // Without `notBlank` this was the gap: accepted here, 400 there.
    expect(serverAcceptsPresence('   ')).toBe(false);
    expect(clientAcceptsPresence('   ')).toBe(false);
    expect(isOnlyWhitespace('   ')).toBe(true);
  });

  // Verdicts measured against the backend's own installed `validator` package, which is what
  // `@IsEmail()` calls: `isEmail('john@example') === false`, `isEmail('ada@example.com') === true`.
  const EMAIL_CASES = [
    { address: 'ada@example.com', serverAccepts: true },
    { address: 'ada@example.co.uk', serverAccepts: true },
    { address: 'ada@sub.example.com', serverAccepts: true },
    { address: 'john@example', serverAccepts: false },
    { address: 'a@b', serverAccepts: false },
    { address: 'ada@localhost', serverAccepts: false },
  ] as const;

  it('agrees with the API on whether a domain needs a top-level domain', () => {
    for (const { address, serverAccepts } of EMAIL_CASES) {
      expect(!isMissingEmailTld(address), address).toBe(serverAccepts);
    }
  });

  it('leaves the shape of an address to `email()` and only judges the domain', () => {
    // No `@` means there is no domain to judge, so this rule stays quiet and `email()` complains.
    expect(isMissingEmailTld('not-an-email')).toBe(false);
    expect(isMissingEmailTld('')).toBe(false);
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

  it('leaves the honeypot empty, as a real visitor does', () => {
    // The API accepts any string here and does not reject a filled one - it answers an
    // ordinary success and discards the submission - so sending it blank is what distinguishes
    // this client from the senders the trap is for.
    expect(submitter.calls[0].website).toBe('');
  });
});
