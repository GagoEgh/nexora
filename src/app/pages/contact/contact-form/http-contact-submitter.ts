import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ORIGIN } from '../../../core/routing/api-origin';
import {
  ContactSubmitter,
  type ContactInquiry,
  type ContactSubmitResult,
} from './contact-submitter';

interface ContactApiResponse {
  readonly success: boolean;
  readonly message?: string;
}

@Injectable()
export class HttpContactSubmitter extends ContactSubmitter {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(API_ORIGIN);

  override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    if (!this.origin) {
      return { status: 'not-configured' };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<ContactApiResponse>(`${this.origin}/api/contact`, inquiry),
      );
      return { status: response?.success ? 'sent' : 'failed' };
    } catch {
      return { status: 'failed' };
    }
  }
}
