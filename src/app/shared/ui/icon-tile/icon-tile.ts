import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { appIcon, type AppIconName } from '../../../core/icons/icons';

export type IconTileTone =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'inverse'
  | 'inverse-accent'
  | 'inverse-container'
  | 'filled';

export type IconTileSize = 'medium' | 'compact' | 'dense' | 'small';

@Component({
  selector: 'app-icon-tile',
  imports: [MatIcon],
  template: `<mat-icon [svgIcon]="svgIcon()" />`,
  styleUrl: './icon-tile.scss',
  host: {
    'aria-hidden': 'true',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
  },
})
export class IconTile {
  readonly icon = input.required<AppIconName>();
  readonly tone = input.required<IconTileTone>();
  readonly size = input<IconTileSize>('medium');
  protected readonly svgIcon = computed(() => appIcon(this.icon()));
}
