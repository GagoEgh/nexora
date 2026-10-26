import { Injectable } from '@angular/core';

export interface ContactInquiry {
  readonly interest: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly service: string;
  readonly description: string;
  readonly timeline: string;
  readonly budget: string;
  readonly method: string;
  readonly consent: boolean;
}

export type ContactSubmitStatus = 'sent' | 'not-configured' | 'failed';

export interface ContactSubmitResult {
  readonly status: ContactSubmitStatus;
}

@Injectable({ providedIn: 'root' })
export class ContactSubmitter {
  async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    void inquiry;
    return { status: 'not-configured' };
  }
}
