import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ORIGIN } from '../../../core/routing/api-origin';
import {
  CONTACT_FIELDS,
  ContactSubmitter,
  type ContactField,
  type ContactInquiry,
  type ContactSubmitResult,
} from './contact-submitter';

const CONTACT_PATH = '/api/contact';

interface ContactApiResponse {
  readonly success: boolean;
  readonly message?: string;
}
interface ContactApiErrorBody {
  readonly success?: false;
  readonly statusCode?: number;
  readonly message?: string | readonly string[];
  readonly error?: string;
  readonly requestId?: string;
}

const isFieldName = (value: string): value is ContactField =>
  (CONTACT_FIELDS as readonly string[]).includes(value);

export function rejectedFieldsOf(message: string | readonly string[] | undefined): ContactField[] {
  if (!Array.isArray(message)) {
    return [];
  }

  const fields = new Set<ContactField>();
  for (const line of message) {
    const leading = String(line).trim().split(/\s+/, 1)[0] ?? '';
    if (isFieldName(leading)) {
      fields.add(leading);
    }
  }
  return CONTACT_FIELDS.filter((field) => fields.has(field));
}

@Injectable()
export class HttpContactSubmitter extends ContactSubmitter {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(API_ORIGIN);
  private readonly errorHandler = inject(ErrorHandler);
  private pending: { readonly key: string; readonly result: Promise<ContactSubmitResult> } | null =
    null;

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    if (!this.origin) {
      return { status: 'not-configured' };
    }

    const key = JSON.stringify(inquiry);
    if (this.pending?.key === key) {
      return this.pending.result;
    }

    const entry: NonNullable<typeof this.pending> = {
      key,
      result: this.send(inquiry).finally(() => {
        if (this.pending === entry) {
          this.pending = null;
        }
      }),
    };
    this.pending = entry;

    return entry.result;
  }

  private async send(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ContactApiResponse>(`${this.origin}${CONTACT_PATH}`, inquiry),
      );
      return { status: response?.success ? 'sent' : 'failed' };
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const body = (error.error ?? {}) as ContactApiErrorBody;
        const rejectedFields = rejectedFieldsOf(body.message);

        this.errorHandler.handleError(
          new Error(
            `Contact API ${
              error.status === 0 ? 'unreachable' : `rejected the inquiry (HTTP ${error.status})`
            }: ${error.message}${describe(body)}`,
            { cause: error },
          ),
        );
        return rejectedFields.length > 0
          ? { status: 'failed', rejectedFields }
          : { status: 'failed' };
      }

      this.errorHandler.handleError(error);
      return { status: 'failed' };
    }
  }
}

function describe(body: ContactApiErrorBody): string {
  const detail = Array.isArray(body.message) ? body.message.join('; ') : body.message;
  const parts = [detail, body.requestId && `requestId ${body.requestId}`].filter(Boolean);
  return parts.length > 0 ? ` - ${parts.join(', ')}` : '';
}
