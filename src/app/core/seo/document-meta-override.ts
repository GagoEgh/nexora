import { Injectable, signal } from '@angular/core';

export interface DocumentMetaWork {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly image: string;
  readonly url?: string;
}

export interface DocumentMetaValues {
  readonly title: string;
  readonly description: string;
  readonly breadcrumb?: string;
  readonly work?: DocumentMetaWork;
}

@Injectable({ providedIn: 'root' })
export class DocumentMetaOverride {
  private readonly current = signal<DocumentMetaValues | undefined>(undefined);
  readonly value = this.current.asReadonly();

  set(values: DocumentMetaValues | undefined): void {
    this.current.set(values);
  }
}
