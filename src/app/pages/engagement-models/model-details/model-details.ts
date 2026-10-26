import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import modelDetailsContent from './model-details.content';

@Component({
  selector: 'app-model-details',
  imports: [IconTile, MatIcon],
  templateUrl: './model-details.html',
  styleUrl: './model-details.scss',
})
export class ModelDetails {
  protected readonly content = useDictionary(modelDetailsContent);
  protected readonly ordinal = ordinal;
  protected readonly checkIcon = appIcon('check');
}
