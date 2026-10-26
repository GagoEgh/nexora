import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import marketsContent from './markets.content';

@Component({
  selector: 'app-markets',
  imports: [IconTile],
  templateUrl: './markets.html',
  styleUrl: './markets.scss',
})
export class Markets {
  private readonly tones: readonly IconTileTone[] = ['primary', 'secondary'];
  protected readonly content = useDictionary(marketsContent);

  protected readonly markets = computed(() =>
    this.content().map((market, index) => ({ market, tone: this.tones[index] ?? 'primary' })),
  );
}
