import { Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-about',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
})
export class About {
  protected readonly content = useIntlayer('about');
}
