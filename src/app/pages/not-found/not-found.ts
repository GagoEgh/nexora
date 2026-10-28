import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { SERVICES_PATH } from '../../core/routing/paths';
import { IconTile } from '../../shared/ui/icon-tile/icon-tile';
import notFoundContent from './not-found.content';
import { Reveal } from '../../shared/motion/reveal';

@Component({
  selector: 'app-not-found',
  imports: [IconTile, MatIcon, MatButton, RouterLink, LocalizedPathPipe, Reveal],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  protected readonly content = useDictionary(notFoundContent);
  protected readonly crossIcon = appIcon('x');
  protected readonly homePath = '/';
  protected readonly servicesPath = SERVICES_PATH;
}
