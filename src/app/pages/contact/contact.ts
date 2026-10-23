import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import contactContent from './contact.content';

@Component({
  selector: 'app-contact',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
})
export class Contact {
  protected readonly content = useDictionary(contactContent);
}
