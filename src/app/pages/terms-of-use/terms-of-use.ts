import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import termsOfUseContent from './terms-of-use.content';

@Component({
  selector: 'app-terms-of-use',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }

    h1 {
      margin: 0;
      overflow-wrap: anywhere;
      font: var(--nx-sys-display-page);
      letter-spacing: var(--nx-sys-display-tracking);
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class TermsOfUse {
  protected readonly content = useDictionary(termsOfUseContent);
}
