import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { getIntlayer } from 'angular-intlayer';
import { appIcon } from '../../../../core/icons/icons';
import { IconTile } from '../../../../shared/ui/icon-tile/icon-tile';
import { HeroNotes } from './notes/hero-notes';

export type HeroIllustrationContent = ReturnType<typeof getIntlayer<'hero'>>['illustration'];

@Component({
  selector: 'app-hero-illustration',
  imports: [MatIcon, IconTile, HeroNotes],
  templateUrl: './hero-illustration.html',
  styleUrl: './hero-illustration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
  },
})
export class HeroIllustration {
  readonly content = input.required<HeroIllustrationContent>();
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly links = ['M18 0V28H82V0M50 28V56', 'M50 0V28H18V56M82 28V56'] as const;
}
