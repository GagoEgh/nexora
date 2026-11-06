import { Injectable } from '@angular/core';

export const INTEREST_VALUES = [
  'new-project',
  'dedicated-team',
  'partnership',
  'something-else',
] as const;

export const SERVICE_VALUES = [
  '',
  'design-product',
  'software-engineering',
  'artificial-intelligence',
  'infrastructure-operations',
  'engineering-partnerships',
] as const;

export const TIMELINE_VALUES = ['', 'asap', '1-3-months', '3-6-months', 'planning'] as const;

export const BUDGET_VALUES = [
  '',
  'under-10k',
  '10-25k',
  '25-50k',
  '50-100k',
  'over-100k',
  'unsure',
] as const;

export const METHOD_VALUES = ['email', 'phone', 'video'] as const;

export type Interest = (typeof INTEREST_VALUES)[number];
export type Service = (typeof SERVICE_VALUES)[number];
export type Timeline = (typeof TIMELINE_VALUES)[number];
export type Budget = (typeof BUDGET_VALUES)[number];
export type ContactMethod = (typeof METHOD_VALUES)[number];

export interface ContactInquiry {
  readonly interest: Interest;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly service: Service;
  readonly description: string;
  readonly timeline: Timeline;
  readonly budget: Budget;
  readonly method: ContactMethod;
  readonly website: string;
}

export type ContactSubmitStatus = 'sent' | 'not-configured' | 'failed';
export type ContactField = 'name' | 'email' | 'company' | 'service' | 'description';

export const CONTACT_FIELDS: readonly ContactField[] = [
  'name',
  'email',
  'company',
  'service',
  'description',
];

export interface ContactSubmitResult {
  readonly status: ContactSubmitStatus;
  readonly rejectedFields?: readonly ContactField[];
}

@Injectable({ providedIn: 'root' })
export class ContactSubmitter {
  async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult> {
    void inquiry;
    return { status: 'not-configured' };
  }
}
