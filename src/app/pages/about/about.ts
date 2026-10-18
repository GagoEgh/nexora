import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-about',
  template: `<h1>{{ content().title }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly content = useIntlayer('about');
}
