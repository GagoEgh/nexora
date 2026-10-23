import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import partnershipsContent from './partnerships.content';

@Component({
  selector: 'app-partnerships',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
})
export class Partnerships {
  protected readonly content = useDictionary(partnershipsContent);
}
