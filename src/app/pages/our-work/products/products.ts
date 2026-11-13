import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import { Reveal } from '../../../shared/motion/reveal';
import { useDictionary, useLocale } from 'angular-intlayer';
import productContent from './product.content';
import { appIcon } from '../../../core/icons/icons';
import { SERVICES_PATH } from '../../../core/routing/paths';

@Component({
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  selector: 'app-products',
  styleUrl: './products.scss',
  templateUrl: './products.html',
})
export class Products {
  protected readonly content = useDictionary(productContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly servicesPath = SERVICES_PATH;
}
