import {
  Component,
  computed,
  ElementRef,
  ErrorHandler,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  type FieldState,
  type FormFieldBinding,
  provideSignalFormsConfig,
  readonly,
  required,
  submit as submitForm,
  type ValidationError,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatError,
  MatFormField,
  MatHint,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { Reveal } from '../../../shared/motion/reveal';
import {
  SNACK_BAR_CONFIG,
  SnackBar,
  type SnackBarData,
} from '../../../shared/ui/snack-bar/snack-bar';
import { FieldLabel } from '../../../shared/ui/field-label/field-label';
import { ChipSelect, type ChipOption } from './chip-select/chip-select';
import contactFormContent from './contact-form.content';
import { emailTld, notBlank } from './contact-rules';
import {
  CONTACT_FIELDS,
  ContactSubmitter,
  type ContactField,
  type ContactInquiry,
  type ContactSubmitResult,
  type ContactSubmitStatus,
} from './contact-submitter';

const SENT_DURATION_MS = 6000;
const SERVER_ERROR_KIND = 'server';

export const DESCRIPTION_MAX = 2000;
const DESCRIPTION_WARN_AT = Math.floor(DESCRIPTION_MAX * 0.9);
export const NAME_MAX = 120;
export const COMPANY_MAX = 160;
export const EMAIL_MAX = 254;

function chipOptions(
  options: readonly {
    readonly value: { readonly value: string };
    readonly label: { readonly value: string };
  }[],
): readonly ChipOption[] {
  return options.map((option) => ({ value: option.value.value, label: option.label.value }));
}

const DEFAULTS: ContactInquiry = {
  interest: 'new-project',
  name: '',
  email: '',
  company: '',
  service: '',
  description: '',
  timeline: '',
  budget: '',
  method: 'email',
  website: '',
};

const STATUS_CLASSES = {
  'ng-invalid': (binding: FormFieldBinding) => binding.state().invalid(),
};

@Component({
  selector: 'app-contact-form',
  imports: [
    FormField,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    MatHint,
    MatError,
    MatButton,
    MatIcon,
    FieldLabel,
    ChipSelect,
    Reveal,
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    provideSignalFormsConfig({ classes: STATUS_CLASSES }),
  ],
})
export class ContactForm {
  private readonly submitter = inject(ContactSubmitter);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly content = useDictionary(contactFormContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly descriptionMax = DESCRIPTION_MAX;

  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  private readonly model = signal<ContactInquiry>({ ...DEFAULTS });

  protected readonly form = form(this.model, (inquiry) => {
    const isRequired = () => this.content().errorRequired.value;
    const notAnEmail = () => this.content().errorEmail.value;
    const tooLong = (max: number) => () =>
      this.content().errorMaxLength.value.replace('{max}', String(max));

    required(inquiry.interest, { message: isRequired });

    required(inquiry.name, { message: isRequired });
    notBlank(inquiry.name, { message: isRequired });
    maxLength(inquiry.name, NAME_MAX, { message: tooLong(NAME_MAX) });

    required(inquiry.email, { message: isRequired });
    email(inquiry.email, { message: notAnEmail });
    emailTld(inquiry.email, { message: notAnEmail });
    maxLength(inquiry.email, EMAIL_MAX, { message: tooLong(EMAIL_MAX) });

    required(inquiry.company, { message: isRequired });
    notBlank(inquiry.company, { message: isRequired });
    maxLength(inquiry.company, COMPANY_MAX, { message: tooLong(COMPANY_MAX) });

    required(inquiry.service, { message: isRequired });

    required(inquiry.description, { message: isRequired });
    notBlank(inquiry.description, { message: isRequired });
    maxLength(inquiry.description, DESCRIPTION_MAX, { message: tooLong(DESCRIPTION_MAX) });
    const whileSending = () => this.form().submitting();
    readonly(inquiry.name, { when: whileSending });
    readonly(inquiry.email, { when: whileSending });
    readonly(inquiry.company, { when: whileSending });
    readonly(inquiry.description, { when: whileSending });
  });

  protected readonly submitting = computed(() => this.form().submitting());

  protected readonly descriptionLength = computed(() => this.form.description().value().length);

  protected readonly descriptionCount = computed<'ok' | 'near' | 'full'>(() => {
    const length = this.descriptionLength();
    if (length >= DESCRIPTION_MAX) {
      return 'full';
    }
    return length >= DESCRIPTION_WARN_AT ? 'near' : 'ok';
  });

  protected readonly interestOptions = computed<readonly ChipOption[]>(() =>
    chipOptions(this.content().interestOptions),
  );

  protected readonly methodOptions = computed<readonly ChipOption[]>(() =>
    chipOptions(this.content().methodOptions),
  );

  protected showError(state: FieldState<string>): boolean {
    return state.touched() && state.invalid();
  }

  protected fieldError(state: FieldState<string>): string | undefined {
    return state.errors()[0]?.message;
  }

  protected async submit(event?: Event): Promise<void> {
    event?.preventDefault();

    let rejected: readonly ContactField[] | undefined;
    await submitForm(this.form, {
      action: async () => {
        let result: ContactSubmitResult;
        try {
          result = await this.submitter.submit(this.model());
        } catch (error) {
          this.errorHandler.handleError(error);
          this.notify('failed');
          return undefined;
        }

        if (result.status === 'sent') {
          this.form().reset({ ...DEFAULTS });
          this.heading().nativeElement.focus();
        }
        this.notify(result.status);
        rejected = result.rejectedFields;
        return this.toFieldErrors(rejected);
      },
      onInvalid: () => this.focusFirstInvalid(),
    });

    if (rejected?.length) {
      this.focusField(rejected[0]);
    }
  }

  private toFieldErrors(
    rejected: readonly ContactField[] | undefined,
  ): ValidationError.WithOptionalFieldTree[] | undefined {
    if (!rejected?.length) {
      return undefined;
    }

    const message = this.content().errorServer.value;
    return rejected.map((field) => ({
      kind: SERVER_ERROR_KIND,
      message,
      fieldTree: this.form[field],
    }));
  }

  private focusField(field: ContactField): void {
    this.card().nativeElement.querySelector<HTMLElement>(`#contact-${field}`)?.focus();
  }

  private focusFirstInvalid(): void {
    const first = CONTACT_FIELDS.find((field) => this.form[field]().invalid());
    if (first) {
      this.focusField(first);
    }
  }

  private notify(status: ContactSubmitStatus): void {
    const copy = this.content();
    const tone: SnackBarData = {
      sent: { message: copy.sentMessage.value, icon: 'check', tone: 'success' } as const,
      'not-configured': {
        message: copy.notConfiguredMessage.value,
        icon: 'mail',
        tone: 'error',
      } as const,
      failed: { message: copy.failedMessage.value, icon: 'x', tone: 'error' } as const,
    }[status];

    this.snackBar.openFromComponent(SnackBar, {
      ...SNACK_BAR_CONFIG,
      ...(status === 'sent' ? { duration: SENT_DURATION_MS } : {}),
      data: tone,
    });
  }
}
