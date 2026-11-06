import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { COMPANY_MAX, ContactForm, DESCRIPTION_MAX, EMAIL_MAX, NAME_MAX } from './contact-form';
import { BLANK_KIND, EMAIL_TLD_KIND } from './contact-rules';
import {
  CONTACT_FIELDS,
  ContactSubmitter,
  type ContactField,
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
  rejectedFields: readonly ContactField[] | undefined;

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    this.calls.push(inquiry);
    if (this.throws) {
      throw new Error('transport down');
    }
    return this.rejectedFields
      ? { status: this.status, rejectedFields: this.rejectedFields }
      : { status: this.status };
  }
}

/** Minimal view of the signal-forms field state this spec drives. */
interface FieldView<T> {
  value: { set(v: T): void; (): T };
  touched(): boolean;
  invalid(): boolean;
  valid(): boolean;
  getError(kind: string): unknown;
  errors(): readonly { readonly kind: string; readonly message?: string }[];
  readonly(): boolean;
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
  fieldError(state: FieldView<string>): string | undefined;
}

/** The message the API attached to a field, read off the field state rather than the component. */
const serverError = (state: FieldView<string>) =>
  state.errors().find((error) => error.kind === 'server')?.message;

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

  it('caps name, company, description and email at the advertised maximums', async () => {
    expect([NAME_MAX, COMPANY_MAX, DESCRIPTION_MAX, EMAIL_MAX]).toEqual([120, 160, 2000, 254]);

    inner.form.name().value.set('x'.repeat(NAME_MAX + 1));
    inner.form.company().value.set('x'.repeat(COMPANY_MAX + 1));
    inner.form.description().value.set('x'.repeat(DESCRIPTION_MAX + 1));
    // Shaped like an address so `email` passes and `maxLength` is what rejects it.
    inner.form.email().value.set(`${'a'.repeat(EMAIL_MAX)}@example.com`);
    await fixture.whenStable();

    expect(inner.form.name().getError('maxLength')).toBeTruthy();
    expect(inner.form.company().getError('maxLength')).toBeTruthy();
    expect(inner.form.description().getError('maxLength')).toBeTruthy();
    expect(inner.form.email().getError('maxLength')).toBeTruthy();
  });

  // CF-04. The messages live on the schema rules now, so `errors()` carries the copy and the
  // template shows the first one. These pin the order a visitor is told about things in - which
  // is declaration order - because nothing else would catch a reshuffle of the schema.
  //
  // Asserted by relationship rather than by literal copy, so they hold in every locale.
  describe('validator messages', () => {
    it('reports an empty field as required rather than as a bad address', () => {
      // `email` starts empty, so `required` and `email` could both complain. `company` has no
      // address rule, so its message is the required one - and `email` must match it.
      expect(inner.fieldError(inner.form.email())).toBe(inner.fieldError(inner.form.company()));
      expect(inner.fieldError(inner.form.email())).toBeTruthy();
    });

    it('reports a malformed address as a bad address', async () => {
      inner.form.email().value.set('not-an-email');
      await fixture.whenStable();

      expect(inner.fieldError(inner.form.email())).toBeTruthy();
      // No longer the required message, which `company` is still showing.
      expect(inner.fieldError(inner.form.email())).not.toBe(inner.fieldError(inner.form.company()));
    });

    // The old template showed "this field is required" here, because the message was hardcoded
    // beside the field rather than coming from the rule that failed. Not reachable from the UI -
    // `FormField` turns the rule into a native `maxlength`, so the browser caps typing first
    // (pinned in `e2e/contact.spec.ts`) - but it is the message for any value that arrives
    // another way, and the limit has to be the field's own.
    it('reports an over-long value as over-long, naming the limit for that field', async () => {
      inner.form.name().value.set('x'.repeat(NAME_MAX + 1));
      inner.form.company().value.set('y'.repeat(COMPANY_MAX + 1));
      await fixture.whenStable();

      expect(inner.fieldError(inner.form.name())).toContain(String(NAME_MAX));
      expect(inner.fieldError(inner.form.company())).toContain(String(COMPANY_MAX));
      // The placeholder is substituted, not left in the copy.
      expect(inner.fieldError(inner.form.name())).not.toContain('{max}');
    });

    it('leaves no message on a field with nothing wrong with it', async () => {
      inner.form.name().value.set('Ada Lovelace');
      await fixture.whenStable();

      expect(inner.fieldError(inner.form.name())).toBeUndefined();
    });
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

  describe('when the API rejects specific fields', () => {
    beforeEach(async () => {
      submitter.status = 'failed';
      submitter.rejectedFields = ['email'];
      await fillValid();
      await inner.submit();
    });

    it('pins the rejection to that field, with the localized message', () => {
      // The message is the dictionary copy, not the API's own English wording - asserted by kind
      // here, because the resolved string depends on the active locale.
      const errors = inner.form.email().errors();
      expect(errors.map((error) => error.kind)).toContain('server');
      expect(serverError(inner.form.email())).toBeTruthy();
      expect(inner.form.email().invalid()).toBe(true);
    });

    // CF-06. `email` is `readonly` while `submitting()` is true, and a readonly field skips
    // validation entirely - `shouldSkipValidation` is `hidden || disabled || readonly ||
    // isOrphaned`. The framework applies submission errors *before* it clears `submitting` in its
    // `finally`, so for one moment the error is stored on a field whose `errors()` reads empty.
    // This asserts the suppression is transient: the lock lifts, and the error is there.
    it('still shows the error on a field that was locked during the send', () => {
      expect(inner.form.email().readonly()).toBe(false);
      expect(
        inner.form
          .email()
          .errors()
          .map((error) => error.kind),
      ).toContain('server');
    });

    it('leaves the other fields alone', () => {
      expect(serverError(inner.form.name())).toBeUndefined();
      expect(inner.form.name().valid()).toBe(true);
    });

    it('keeps what the visitor typed, so the rejection is correctable', () => {
      expect(inner.form.email().value()).toBe(VALID.email);
      expect(inner.form.description().value()).toBe(VALID.description);
    });

    it('clears the rejection as soon as the visitor edits the field', async () => {
      inner.form.email().value.set('ada@nexora.example');
      await fixture.whenStable();

      expect(serverError(inner.form.email())).toBeUndefined();
      expect(inner.form.email().valid()).toBe(true);
    });

    it('does not clear it when a different field is edited', async () => {
      inner.form.name().value.set('Grace Hopper');
      await fixture.whenStable();

      expect(serverError(inner.form.email())).toBeTruthy();
    });

    it('lets a corrected form be submitted again', async () => {
      submitter.status = 'sent';
      submitter.rejectedFields = undefined;
      inner.form.email().value.set('ada@nexora.example');
      await fixture.whenStable();

      await inner.submit();

      expect(submitter.calls).toHaveLength(2);
      expect(submitter.calls[1].email).toBe('ada@nexora.example');
      // Reset on success, which only happens if the stale server error really was gone.
      expect(inner.form.email().value()).toBe('');
    });
  });

  it('reports a rejection on several fields at once', async () => {
    submitter.status = 'failed';
    submitter.rejectedFields = ['name', 'description'];
    await fillValid();

    await inner.submit();

    expect(serverError(inner.form.name())).toBeDefined();
    expect(serverError(inner.form.description())).toBeDefined();
    expect(serverError(inner.form.company())).toBeUndefined();
  });

  it('shows no field error when the API rejects the send without naming a field', async () => {
    submitter.status = 'failed';
    await fillValid();

    await inner.submit();

    for (const key of ['name', 'email', 'company', 'service', 'description']) {
      expect(serverError(field(key) as FieldView<string>), key).toBeUndefined();
    }
    // Still correctable: a generic failure must not leave the form looking invalid.
    expect(inner.form().invalid()).toBe(false);
  });

  // CT-01 / CT-02. The API validates the same ten fields with its own rules, and two of them are
  // stricter than Angular's built-ins. These assert the client now refuses locally what the
  // server would refuse remotely, so the visitor is not sent on a round trip to learn it.
  describe('validation parity with the API', () => {
    it('refuses a value that is only whitespace, as `@trim() @MinLength(1)` does', async () => {
      // `required()` tests `value === ''` without trimming, so without `notBlank` this passes.
      for (const key of ['name', 'company', 'description'] as const) {
        inner.form[key]().value.set('   ');
      }
      await fixture.whenStable();

      for (const key of ['name', 'company', 'description'] as const) {
        expect(inner.form[key]().getError(BLANK_KIND), key).toBeTruthy();
        expect(inner.form[key]().invalid(), key).toBe(true);
      }
    });

    it('tells a blank field and an empty one apart but says the same thing', async () => {
      // One error at a time: `required` owns empty, `notBlank` owns whitespace. Both carry the
      // required copy, so the visitor reads the same sentence either way.
      expect(inner.form.name().getError(BLANK_KIND)).toBeFalsy();
      const whenEmpty = inner.fieldError(inner.form.name());

      inner.form.name().value.set('  ');
      await fixture.whenStable();

      expect(inner.form.name().getError('required')).toBeFalsy();
      expect(inner.form.name().errors()).toHaveLength(1);
      expect(inner.fieldError(inner.form.name())).toBe(whenEmpty);
    });

    it('refuses an address with no top-level domain, as `@IsEmail()` does', async () => {
      // Angular's `email()` accepts these on purpose, so intranet hosts validate.
      for (const address of ['john@example', 'a@b']) {
        inner.form.email().value.set(address);
        await fixture.whenStable();
        expect(inner.form.email().getError(EMAIL_TLD_KIND), address).toBeTruthy();
        expect(inner.form.email().invalid(), address).toBe(true);
      }
    });

    it('still accepts an ordinary address, and says one thing about a malformed one', async () => {
      inner.form.email().value.set('ada@example.co.uk');
      await fixture.whenStable();
      expect(inner.form.email().valid()).toBe(true);

      // No `@` at all is `email()`'s business, not the TLD rule's.
      inner.form.email().value.set('not-an-email');
      await fixture.whenStable();
      expect(inner.form.email().getError(EMAIL_TLD_KIND)).toBeFalsy();
      expect(inner.form.email().getError('email')).toBeTruthy();
    });
  });

  // CT-03. `ContactField` is the set of fields a server rejection can be pinned to, and pinning
  // one means focusing `#contact-<field>`. Those two facts are only connected by a naming
  // convention, so this is what connects them: widening the union without giving the new field a
  // focusable element of that id fails here instead of silently failing to move focus.
  it('gives every field a server error can name a focusable element of that id', () => {
    const root = fixture.nativeElement as HTMLElement;

    for (const name of CONTACT_FIELDS) {
      const element = root.querySelector<HTMLElement>(`#contact-${name}`);
      expect(element, name).not.toBeNull();

      element!.focus();
      expect(root.ownerDocument.activeElement, name).toBe(element);
    }
  });

  it('defaults to a submitter that refuses to pretend it sent anything', async () => {
    const plain = new ContactSubmitter();
    await expect(plain.submit({ ...VALID } as ContactInquiry)).resolves.toEqual({
      status: 'not-configured',
    });
  });
});
