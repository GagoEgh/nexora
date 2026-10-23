import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import solutionsContent from './solutions.content';

@Component({
  selector: 'app-solutions',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
})
export class Solutions {
  protected readonly content = useDictionary(solutionsContent);
}
