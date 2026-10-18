import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-services',
  template: `<h1>{{ content().title }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  protected readonly content = useIntlayer('services');
}
