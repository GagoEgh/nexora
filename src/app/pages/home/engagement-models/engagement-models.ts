import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import engagementModelsContent from './engagement-models.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-engagement-models',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  templateUrl: './engagement-models.html',
  styleUrl: './engagement-models.scss',
})
export class EngagementModels {
  protected readonly content = useDictionary(engagementModelsContent);
  protected readonly arrowIcon = appIcon('arrow-right');
}
