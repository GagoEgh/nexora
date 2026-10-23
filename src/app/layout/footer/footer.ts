import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { useLocaleSwitcher } from '../../core/i18n/locale-switcher';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { Logo } from '../../shared/ui/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LocalizedPathPipe, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly content = useIntlayer('footer');
  protected readonly i18n = useLocaleSwitcher();
  protected readonly year = new Date().getFullYear();
}
