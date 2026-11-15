import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { useLocale } from 'angular-intlayer';
import { appIcon } from '../../../../core/icons/icons';
import { LocalizedPathPipe } from '../../../../core/i18n/localized-path.pipe';
import type { ProductView } from '../../products/data/product-view';
import { NEXT_COVER_SIZES } from '../gallery-layout';

@Component({
  selector: 'app-product-next',
  imports: [RouterLink, LocalizedPathPipe, MatIcon],
  templateUrl: './product-next.html',
  styleUrl: './product-next.scss',
})
export class ProductNext {
  readonly product = input.required<ProductView>();
  readonly label = input.required<string>();

  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly coverSizes = NEXT_COVER_SIZES;
}
