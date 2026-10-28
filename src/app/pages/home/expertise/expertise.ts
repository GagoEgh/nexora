import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { SERVICES_PATH } from '../../../core/routing/paths';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import expertiseContent from './expertise.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-expertise',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  templateUrl: './expertise.html',
  styleUrl: './expertise.scss',
})
export class Expertise {
  private readonly router = inject(Router);

  protected readonly content = useDictionary(expertiseContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly servicesPath = SERVICES_PATH;

  protected toUrl(path: string): UrlTree {
    return this.router.parseUrl(path);
  }
}
