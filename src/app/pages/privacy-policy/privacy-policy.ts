import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-privacy-policy',
  template: `<h1>{{ content().title }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicy {
  protected readonly content = useIntlayer('privacy-policy');
}
