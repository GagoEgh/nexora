import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon } from '../../../../core/icons/icons';
import type aiAutomationContent from '../ai-automation.content';

type AiAutomation = DeepTransformContent<(typeof aiAutomationContent)['content']>;

export type AiPipelineSteps = AiAutomation['pipeline'];

@Component({
  selector: 'app-ai-pipeline',
  imports: [MatIcon],
  templateUrl: './ai-pipeline.html',
  styleUrl: './ai-pipeline.scss',
})
export class AiPipeline {
  readonly steps = input.required<AiPipelineSteps>();
  readonly label = input.required<string>();
  readonly note = input.required<AiAutomation['note']>();
  protected readonly arrowIcon = appIcon('arrow-right');
}
