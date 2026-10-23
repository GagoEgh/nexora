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
  `,
})
export class PrivacyPolicy {
  protected readonly content = useDictionary(privacyPolicyContent);
}
