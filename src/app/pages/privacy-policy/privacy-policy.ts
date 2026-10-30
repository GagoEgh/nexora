import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import privacyPolicyContent from './privacy-policy.content';

@Component({
  selector: 'app-privacy-policy',
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
export class PrivacyPolicy {
  protected readonly content = useDictionary(privacyPolicyContent);
}
