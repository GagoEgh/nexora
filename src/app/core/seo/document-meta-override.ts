import { Injectable, signal } from '@angular/core';

export interface DocumentMetaValues {
  /** The full document title, including whatever site suffix the rest of the pages use. */
  readonly title: string;
  readonly description: string;
  /**
   * The record's own name, for the structured breadcrumb, where the site suffix would read as
   * part of the product's name. Falls back to `title` when the two are the same thing.
   */
  readonly breadcrumb?: string;
}

/**
 * Lets a parameterised route supply its own title and description.
 *
 * `DOCUMENT_META_PAGES` is a fixed tuple with one dictionary entry per page, which cannot
 * express nineteen product titles, and `provideDocumentMeta` rewrites the head on every
 * navigation, so a component setting `Title` directly would simply be overwritten. A single
 * signal read by the provider keeps one writer for the document head without generalising the
 * whole meta system for one dynamic route.
 *
 * The route that sets it is responsible for clearing it on destroy.
 */
@Injectable({ providedIn: 'root' })
export class DocumentMetaOverride {
  private readonly current = signal<DocumentMetaValues | undefined>(undefined);
  readonly value = this.current.asReadonly();

  set(values: DocumentMetaValues | undefined): void {
    this.current.set(values);
  }
}
