import { Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

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
  protected readonly content = useIntlayer('privacy-policy');
}
