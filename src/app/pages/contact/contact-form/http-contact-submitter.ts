import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ORIGIN } from '../../../core/routing/api-origin';
import {
  ContactSubmitter,
  type ContactInquiry,
  type ContactSubmitResult,
} from './contact-submitter';

const CONTACT_PATH = '/api/contact';

interface ContactApiResponse {
  readonly success: boolean;
  readonly message?: string;
}

@Injectable()
export class HttpContactSubmitter extends ContactSubmitter {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(API_ORIGIN);
  private readonly errorHandler = inject(ErrorHandler);

  private pending: Promise<ContactSubmitResult> | null = null;

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    if (!this.origin) {
      return { status: 'not-configured' };
    }

    this.pending ??= this.send(inquiry).finally(() => {
      this.pending = null;
    });

    return this.pending;
  }

  private async send(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ContactApiResponse>(`${this.origin}${CONTACT_PATH}`, inquiry),
      );
      return { status: response?.success ? 'sent' : 'failed' };
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof HttpErrorResponse
          ? new Error(
              `Contact API ${error.status === 0 ? 'unreachable' : `rejected the inquiry (HTTP ${error.status})`}: ${error.message}`,
              { cause: error },
            )
          : error,
      );
      return { status: 'failed' };
    }
  }
}
