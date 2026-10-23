import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import type aiAgentContent from '../ai-agent.content';

export type OverviewContent = DeepTransformContent<(typeof aiAgentContent)['content']>['overview'];

@Component({
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  readonly content = input.required<OverviewContent>();
}
