import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  type FormFieldBinding,
  provideSignalFormsConfig,
  required,
  submit as submitForm,
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
import { PRIVACY_POLICY_PATH } from '../../../core/routing/paths';
import {
  SNACK_BAR_CONFIG,
  SnackBar,
  type SnackBarData,
} from '../../../shared/ui/snack-bar/snack-bar';
import { FieldLabel } from '../../../shared/ui/field-label/field-label';
import { ChipSelect, type ChipOption } from './chip-select/chip-select';
import contactFormContent from './contact-form.content';
import {
  ContactSubmitter,
  type ContactInquiry,
  type ContactSubmitStatus,
} from './contact-submitter';

export const DESCRIPTION_MAX = 2000;
export const NAME_MAX = 120;
export const COMPANY_MAX = 160;

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
  'ng-valid': (binding: FormFieldBinding) => !binding.state().invalid(),
  'ng-touched': (binding: FormFieldBinding) => binding.state().touched(),
  'ng-untouched': (binding: FormFieldBinding) => !binding.state().touched(),
  'ng-dirty': (binding: FormFieldBinding) => binding.state().dirty(),
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
  private readonly snackBar = inject(MatSnackBar);

  protected readonly content = useDictionary(contactFormContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly privacyPath = PRIVACY_POLICY_PATH;
  protected readonly descriptionMax = DESCRIPTION_MAX;

  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');

  private readonly model = signal<ContactInquiry>({ ...DEFAULTS });

  protected readonly form = form(this.model, (inquiry) => {
    required(inquiry.interest);

    required(inquiry.name);
    maxLength(inquiry.name, NAME_MAX);

    required(inquiry.email);
    email(inquiry.email);

    required(inquiry.company);
    maxLength(inquiry.company, COMPANY_MAX);

    required(inquiry.service);

    required(inquiry.description);
    maxLength(inquiry.description, DESCRIPTION_MAX);
  });

  protected readonly submitting = computed(() => this.form().submitting());

  protected readonly descriptionLength = computed(() => this.form.description().value().length);

  protected readonly interestOptions = computed<readonly ChipOption[]>(() =>
    this.content().interestOptions.map((option) => ({
      value: option.value.value,
      label: option.label.value,
    })),
  );

  protected readonly methodOptions = computed<readonly ChipOption[]>(() =>
    this.content().methodOptions.map((option) => ({
      value: option.value.value,
      label: option.label.value,
    })),
  );

  protected async submit(event?: Event): Promise<void> {
    event?.preventDefault();

    await submitForm(this.form, {
      action: async () => {
        try {
          const { status } = await this.submitter.submit(this.model());
          if (status === 'sent') {
            this.form().reset({ ...DEFAULTS });
          }
          this.notify(status);
        } catch {
          this.notify('failed');
        }
        return undefined;
      },
    });

    if (this.form().invalid()) {
      this.focusFirstInvalid();
    }
  }

  private focusFirstInvalid(): void {
    const invalid = this.card().nativeElement.querySelector<HTMLElement>(
      'input.ng-invalid, textarea.ng-invalid, .mat-mdc-select.ng-invalid',
    );
    invalid?.focus();
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

    this.snackBar.openFromComponent(SnackBar, { ...SNACK_BAR_CONFIG, data: tone });
  }
}
