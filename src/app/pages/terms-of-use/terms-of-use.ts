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
  `,
})
export class TermsOfUse {
  protected readonly content = useDictionary(termsOfUseContent);
}
