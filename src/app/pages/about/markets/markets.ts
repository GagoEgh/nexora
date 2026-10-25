import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import aboutContent from '../about.content';

const TONES: readonly IconTileTone[] = ['primary', 'secondary'];

@Component({
  selector: 'app-markets',
  imports: [IconTile],
  templateUrl: './markets.html',
  styleUrl: './markets.scss',
})
export class Markets {
  protected readonly content = useDictionary(aboutContent);
  protected readonly tones = TONES;
}
