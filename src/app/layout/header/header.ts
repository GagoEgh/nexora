import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { getPathWithoutLocale } from 'intlayer';
import { filter } from 'rxjs';
import { AI_AGENT_PATH, SERVICES_PATH } from '../../app.routes';
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
  private readonly router = inject(Router);

  protected readonly content = useDictionary(headerContent);
  protected readonly i18n = useLocaleSwitcher();
  private readonly menuButton = viewChild.required('menuButton', { read: ElementRef });

  protected readonly menuOpen = signal(false);
  protected readonly exact = { exact: true } as const;
  protected readonly chevronIcon = appIcon('chevron-down');
  protected readonly aiAgentPath = AI_AGENT_PATH;
  protected readonly globeIcon = appIcon('globe');
  protected readonly menuIcon = appIcon('menu');
  protected readonly closeIcon = appIcon('x');

  private readonly navigated = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );

  protected readonly servicesActive = computed(() => {
    this.navigated();
    const path = getPathWithoutLocale(this.router.url.split(/[?#]/)[0]);
    return path === SERVICES_PATH || path.startsWith(`${SERVICES_PATH}/`);
  });

  constructor() {
    this.router.events
      .pipe(
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
