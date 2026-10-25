import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import type aiAgentContent from '../ai-agent.content';

export type RelatedServicesContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['relatedServices'];

@Component({
  selector: 'app-related-services',
  imports: [MatIcon, IconTile],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss',
})
export class RelatedServices {
  readonly content = input.required<RelatedServicesContent>();
  protected readonly arrowIcon = appIcon('arrow-up-right');
}
