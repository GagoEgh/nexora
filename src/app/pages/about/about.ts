import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import aboutContent from './about.content';

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
  protected readonly content = useDictionary(aboutContent);
}
