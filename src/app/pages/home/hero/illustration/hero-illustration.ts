import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { Reveal } from '../../../../shared/motion/reveal';
import type heroContent from '../hero.content';
import { ArtNode } from './node/art-node';
import { ArtPipeline } from './pipeline/art-pipeline';
import { HeroNotes } from './notes/hero-notes';

export type HeroIllustrationContent = DeepTransformContent<
  (typeof heroContent)['content']
>['illustration'];

@Component({
  selector: 'app-hero-illustration',
  imports: [ArtNode, HeroNotes, ArtPipeline, Reveal],
  templateUrl: './hero-illustration.html',
  styleUrl: './hero-illustration.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class HeroIllustration {
  readonly content = input.required<HeroIllustrationContent>();
  protected readonly links = ['M18 0V28H82V0M50 28V56', 'M50 0V28H18V56M82 28V56'] as const;
}
