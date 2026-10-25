import { Component, computed, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { ServiceCard, type ServiceCardCopy } from '../../../shared/ui/service-card/service-card';
import type aiAgentContent from '../ai-agent.content';
import { EngagementPanel } from './engagement-panel/engagement-panel';

export type RelatedServicesContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['relatedServices'];

@Component({
  selector: 'app-related-services',
  imports: [ServiceCard, EngagementPanel],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss',
})
export class RelatedServices {
  readonly content = input.required<RelatedServicesContent>();

  protected readonly cards = computed<readonly ServiceCardCopy[]>(() =>
    this.content().items.map((item) => ({
      number: item.number.value,
      title: item.title.value,
      summary: item.summary.value,
      tags: item.tags.map((tag) => tag.value),
    })),
  );
}
