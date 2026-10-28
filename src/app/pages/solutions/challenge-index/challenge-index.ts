import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { ordinal } from '../../../shared/ordinal';
import type { ChallengeId } from '../challenge';
import challengesContent from '../challenges.content';

@Component({
  selector: 'app-challenge-index',
  imports: [RouterLink, Reveal],
  templateUrl: './challenge-index.html',
  styleUrl: './challenge-index.scss',
})
export class ChallengeIndex {
  readonly current = input<ChallengeId | null>(null);

  protected readonly content = useDictionary(challengesContent);
  protected readonly ordinal = ordinal;
}
