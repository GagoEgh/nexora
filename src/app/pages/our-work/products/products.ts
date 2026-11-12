import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import { Reveal } from '../../../shared/motion/reveal';
import { useDictionary, useLocale } from 'angular-intlayer';
import productContent from './product.content';
import { appIcon } from '../../../core/icons/icons';
import { SERVICES_PATH } from '../../../core/routing/paths';
import { ordinal } from '../../../shared/ordinal';
import { getLocalizedUrl } from 'intlayer';

@Component({
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  selector: 'app-products',
  styleUrl: './products.scss',
  templateUrl: './products.html',
})
export class Products {
  private readonly router = inject(Router);

  protected readonly content = useDictionary(productContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly servicesPath = SERVICES_PATH;
  protected readonly ordinal = ordinal;

  protected readonly serviceLinks = computed<readonly UrlTree[]>(() => {
    const locale = this.locale();
    return this.content().services.map((service) =>
      this.router.parseUrl(getLocalizedUrl(service.path.value, locale)),
    );
  });
}
