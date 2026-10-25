import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { IconTile } from '../../../../shared/ui/icon-tile/icon-tile';
import type aiAgentContent from '../../ai-agent.content';

export type EngagementPanelContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['relatedServices']['engage'];

@Component({
  selector: 'app-engagement-panel',
  imports: [IconTile],
  templateUrl: './engagement-panel.html',
  styleUrl: './engagement-panel.scss',
})
export class EngagementPanel {
  readonly content = input.required<EngagementPanelContent>();
}
