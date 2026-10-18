import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { appIcon, type AppIconName } from '../../../core/icons/icons';

export type IconTileTone = 'primary' | 'secondary' | 'neutral' | 'inverse';

@Component({
  selector: 'app-icon-tile',
  imports: [MatIcon],
  template: `<mat-icon [svgIcon]="svgIcon()" />`,
  styleUrl: './icon-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-tone]': 'tone()',
  },
})
export class IconTile {
  readonly icon = input.required<AppIconName>();
  readonly tone = input.required<IconTileTone>();
  protected readonly svgIcon = computed(() => appIcon(this.icon()));
}
