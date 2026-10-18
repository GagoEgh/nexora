import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';

@Component({
  selector: 'app-terms-of-use',
  template: `<h1>{{ content().title }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfUse {
  protected readonly content = useIntlayer('terms-of-use');
}
