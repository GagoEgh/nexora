import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon } from '../../../../../core/icons/icons';
import type heroContent from '../../hero.content';

export type ArtPipelineSteps = DeepTransformContent<
  (typeof heroContent)['content']
>['illustration']['pipeline'];

@Component({
  selector: 'app-art-pipeline',
  imports: [MatIcon],
  templateUrl: './art-pipeline.html',
  styleUrl: './art-pipeline.scss',
})
export class ArtPipeline {
  readonly steps = input.required<ArtPipelineSteps>();
  protected readonly arrowIcon = appIcon('arrow-right');
}
