import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { COMPANY_MAX, ContactForm, DESCRIPTION_MAX, NAME_MAX } from './contact-form';
import {
  ContactSubmitter,
  type ContactInquiry,
  type ContactSubmitResult,
  type ContactSubmitStatus,
} from './contact-submitter';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Nexora',
  service: 'software-engineering',
  description: 'We need to modernize a legacy ordering platform.',
} as const;

class FakeSubmitter extends ContactSubmitter {
  readonly calls: ContactInquiry[] = [];
  status: ContactSubmitStatus = 'sent';
  throws = false;

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    this.calls.push(inquiry);
    if (this.throws) {
      throw new Error('transport down');
    }
    return { status: this.status };
  }
}

/** Minimal view of the signal-forms field state this spec drives. */
interface FieldView<T> {
  value: { set(v: T): void; (): T };
  touched(): boolean;
  invalid(): boolean;
  valid(): boolean;
  getError(kind: string): unknown;
}

type FieldAccessor<T> = () => FieldView<T>;

/** The template-facing members are protected, so the spec reaches them through this view. */
interface FormInternals {
  readonly form: FieldAccessor<ContactInquiry> & {
    interest: FieldAccessor<string>;
    name: FieldAccessor<string>;
    email: FieldAccessor<string>;
    company: FieldAccessor<string>;
    service: FieldAccessor<string>;
    description: FieldAccessor<string>;
    timeline: FieldAccessor<string>;
    budget: FieldAccessor<string>;
    method: FieldAccessor<string>;
  };
  submit(): Promise<void>;
  descriptionLength(): number;
  submitting(): boolean;
}

describe('ContactForm', () => {
  let fixture: ComponentFixture<ContactForm>;
  let inner: FormInternals;
  let submitter: FakeSubmitter;

  beforeEach(async () => {
    submitter = new FakeSubmitter();
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

    fixture = TestBed.createComponent(ContactForm);
    inner = fixture.componentInstance as unknown as FormInternals;
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await fixture.whenStable();
  });

  const field = (name: string) =>
    (inner.form as unknown as Record<string, FieldAccessor<unknown>>)[name]();

  const fillValid = async () => {
    inner.form.name().value.set(VALID.name);
    inner.form.email().value.set(VALID.email);
    inner.form.company().value.set(VALID.company);
    inner.form.service().value.set(VALID.service);
    inner.form.description().value.set(VALID.description);
    await fixture.whenStable();
  };

  it('starts invalid, with the first interest and email method preselected', () => {
    expect(inner.form().invalid()).toBe(true);
    expect(inner.form.interest().value()).toBe('new-project');
    expect(inner.form.method().value()).toBe('email');
  });

  it('requires name, email, company, service and description', () => {
    for (const key of ['name', 'email', 'company', 'service', 'description']) {
      expect(field(key).invalid(), key).toBe(true);
    }
    for (const key of ['timeline', 'budget']) {
      expect(field(key).valid(), key).toBe(true);
    }
  });

  it('rejects a malformed email and accepts a valid one', async () => {
    inner.form.email().value.set('not-an-email');
    await fixture.whenStable();
    expect(inner.form.email().getError('email')).toBeTruthy();

    inner.form.email().value.set('ada@example.com');
    await fixture.whenStable();
    expect(inner.form.email().valid()).toBe(true);
  });

  it('caps name, company and description at the advertised maximums', async () => {
    expect([NAME_MAX, COMPANY_MAX, DESCRIPTION_MAX]).toEqual([120, 160, 2000]);

    inner.form.name().value.set('x'.repeat(NAME_MAX + 1));
    inner.form.company().value.set('x'.repeat(COMPANY_MAX + 1));
    inner.form.description().value.set('x'.repeat(DESCRIPTION_MAX + 1));
    await fixture.whenStable();

    expect(inner.form.name().getError('maxLength')).toBeTruthy();
    expect(inner.form.company().getError('maxLength')).toBeTruthy();
    expect(inner.form.description().getError('maxLength')).toBeTruthy();
  });

  it('tracks the description length for the counter', async () => {
    expect(inner.descriptionLength()).toBe(0);

    inner.form.description().value.set('hello');
    await fixture.whenStable();
    expect(inner.descriptionLength()).toBe(5);
  });

  it('does not submit an invalid form and marks it touched instead', async () => {
    await inner.submit();

    expect(submitter.calls).toHaveLength(0);
    expect(inner.form.name().touched()).toBe(true);
    expect(inner.form.description().touched()).toBe(true);
  });

  it('submits a valid form once with the entered values and resets on success', async () => {
    await fillValid();
    expect(inner.form().invalid()).toBe(false);

    await inner.submit();

    expect(submitter.calls).toHaveLength(1);
    expect(submitter.calls[0]).toMatchObject({
      name: VALID.name,
      email: VALID.email,
      company: VALID.company,
      service: VALID.service,
      description: VALID.description,
      interest: 'new-project',
      method: 'email',
    });

    expect(inner.form.name().value()).toBe('');
    expect(inner.form.email().value()).toBe('');
    expect(inner.form.interest().value()).toBe('new-project');
  });

  it('keeps what the visitor typed when the transport is not configured', async () => {
    submitter.status = 'not-configured';
    await fillValid();

    await inner.submit();

    expect(submitter.calls).toHaveLength(1);
    expect(inner.form.name().value()).toBe(VALID.name);
    expect(inner.form.description().value()).toBe(VALID.description);
  });

  it('keeps the form usable when the transport throws', async () => {
    submitter.throws = true;
    await fillValid();

    await inner.submit();

    expect(inner.form.name().value()).toBe(VALID.name);
    expect(inner.submitting()).toBe(false);
  });

  it('defaults to a submitter that refuses to pretend it sent anything', async () => {
    const plain = new ContactSubmitter();
    await expect(plain.submit({ ...VALID } as ContactInquiry)).resolves.toEqual({
      status: 'not-configured',
    });
  });
});
