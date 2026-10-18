import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useIntlayer, useLocale } from 'angular-intlayer';
import { type AppLocale, LOCALE_NAMES } from '../../core/i18n/locale-labels';
import { Logo } from '../../shared/ui/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly content = useIntlayer('footer');
  private readonly i18n = useLocale();

  protected readonly locale = this.i18n.locale;
  protected readonly locales = this.i18n.availableLocales;
  protected readonly localeNames = LOCALE_NAMES;
  protected readonly year = new Date().getFullYear();

  protected setLocale(locale: AppLocale): void {
    this.i18n.setLocale(locale);
  }
}
