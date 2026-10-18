import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-solutions',
  template: `<h1>{{ content().title }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Solutions {
  protected readonly content = useIntlayer('solutions');
}
