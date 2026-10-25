import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import { ordinal } from '../../../shared/ordinal';
import aboutContent from '../about.content';

@Component({
  selector: 'app-philosophy',
  imports: [IconTile],
  templateUrl: './philosophy.html',
  styleUrl: './philosophy.scss',
})
export class Philosophy {
  protected readonly content = useDictionary(aboutContent);
  protected readonly ordinal = ordinal;
}
