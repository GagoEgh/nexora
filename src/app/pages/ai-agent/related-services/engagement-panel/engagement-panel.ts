import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { IconTile } from '../../../../shared/ui/icon-tile/icon-tile';
import type relatedServicesContent from '../related-services.content';

export type EngagementPanelContent = DeepTransformContent<
  (typeof relatedServicesContent)['content']
>['engage'];

@Component({
  selector: 'app-engagement-panel',
  imports: [IconTile],
  templateUrl: './engagement-panel.html',
  styleUrl: './engagement-panel.scss',
})
export class EngagementPanel {
  readonly content = input.required<EngagementPanelContent>();
}
