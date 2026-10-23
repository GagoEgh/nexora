import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { filter } from 'rxjs';
import { useLocaleSwitcher } from '../../core/i18n/locale-switcher';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { Logo } from '../../shared/ui/logo/logo';
import headerContent from './header.content';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    LocalizedPathPipe,
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
  host: {
    '[attr.data-open]': 'menuOpen() ? "" : null',
    '(keydown.escape)': 'onEscape()',
  },
})
export class Header {
  protected readonly content = useDictionary(headerContent);
  protected readonly i18n = useLocaleSwitcher();
  private readonly menuButton = viewChild.required('menuButton', { read: ElementRef });

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
}
