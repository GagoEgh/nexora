import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import { ordinal } from '../../../shared/ordinal';
import philosophyContent from './philosophy.content';

@Component({
  selector: 'app-philosophy',
  imports: [IconTile],
  templateUrl: './philosophy.html',
  styleUrl: './philosophy.scss',
})
export class Philosophy {
  protected readonly content = useDictionary(philosophyContent);
  protected readonly ordinal = ordinal;
}
