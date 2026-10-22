import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';

@Component({
  selector: 'app-engagement-models',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile],
  templateUrl: './engagement-models.html',
  styleUrl: './engagement-models.scss',
})
export class EngagementModels {
  protected readonly content = useIntlayer('engagement-models');
  protected readonly arrowIcon = appIcon('arrow-right');
}
