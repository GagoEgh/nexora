import { Component, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { CONTACT_PATH } from '../../../core/routing/paths';
import { Reveal } from '../../../shared/motion/reveal';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import { ordinal } from '../../../shared/ordinal';
import { challengeSectionId, type ChallengeTone } from '../challenge';
import challengesContent from '../challenges.content';

const TILE_TONES: Readonly<Record<ChallengeTone, IconTileTone>> = {
  plain: 'primary',
  accent: 'inverse-container',
};

@Component({
  selector: 'app-challenge-details',
  imports: [IconTile, MatIcon, RouterLink, LocalizedPathPipe, Reveal],
  templateUrl: './challenge-details.html',
  styleUrl: './challenge-details.scss',
})
export class ChallengeDetails {
  protected readonly content = useDictionary(challengesContent);
  protected readonly ordinal = ordinal;
  protected readonly sectionId = challengeSectionId;
  protected readonly total = computed(() => ordinal(this.content().items.length - 1));

  protected readonly contactPath = CONTACT_PATH;
  protected readonly checkIcon = appIcon('check');
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly tileTone = (tone: ChallengeTone): IconTileTone => TILE_TONES[tone];
}
