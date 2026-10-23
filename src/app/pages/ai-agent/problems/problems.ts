import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import type aiAgentContent from '../ai-agent.content';

export type ProblemsContent = DeepTransformContent<(typeof aiAgentContent)['content']>['problems'];

@Component({
  selector: 'app-problems',
  imports: [IconTile],
  templateUrl: './problems.html',
  styleUrl: './problems.scss',
})
export class Problems {
  readonly content = input.required<ProblemsContent>();
}
