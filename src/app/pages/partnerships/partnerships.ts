import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-partnerships',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Partnerships {
  protected readonly content = useIntlayer('partnerships');
}
