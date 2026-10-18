import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { useIntlayer, useLocale } from 'angular-intlayer';
import { filter } from 'rxjs';
import { appIcon } from '../../core/icons/icons';
import { type AppLocale, LOCALE_NAMES } from '../../core/i18n/locale-labels';
import { Logo } from '../../shared/ui/logo/logo';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    Logo,
    MatIcon,
    MatButton,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-open]': 'menuOpen() ? "" : null',
    '(keydown.escape)': 'onEscape()',
  },
})
export class Header {
  protected readonly content = useIntlayer('header');
  private readonly i18n = useLocale();
  private readonly menuButton = viewChild.required('menuButton', { read: ElementRef });

  protected readonly locale = this.i18n.locale;
  protected readonly locales = this.i18n.availableLocales;
  protected readonly localeNames = LOCALE_NAMES;

  protected readonly menuOpen = signal(false);
  protected readonly exact = { exact: true } as const;
  protected readonly chevronIcon = appIcon('chevron-down');
  protected readonly globeIcon = appIcon('globe');
  protected readonly menuIcon = appIcon('menu');
  protected readonly closeIcon = appIcon('x');

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onEscape(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.closeMenu();
    (this.menuButton().nativeElement as HTMLButtonElement).focus();
  }

  protected setLocale(locale: AppLocale): void {
    this.i18n.setLocale(locale);
  }
}
