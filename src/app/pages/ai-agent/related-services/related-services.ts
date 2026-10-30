import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { ordinal } from '../../../shared/ordinal';
import servicesCatalogueContent from '../../../shared/services-catalogue/services-catalogue.content';
import type { ServiceId } from '../../../shared/services-catalogue/service-category';
import { ServiceCard, type ServiceCardCopy } from '../../../shared/ui/service-card/service-card';
import { EngagementPanel } from './engagement-panel/engagement-panel';
import relatedServicesContent from './related-services.content';

const FEATURED: readonly ServiceId[] = [
  'ai-development-integration',
  'backend-api-integration',
  'ai-workflow-engineering',
];

@Component({
  selector: 'app-related-services',
  imports: [ServiceCard, EngagementPanel, Reveal],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss',
})
export class RelatedServices {
  protected readonly content = useDictionary(relatedServicesContent);
  private readonly catalogue = useDictionary(servicesCatalogueContent);

  protected readonly cards = computed<readonly ServiceCardCopy[]>(() => {
    const { items } = this.catalogue();
    return FEATURED.flatMap((id) => {
      const position = items.findIndex((item) => item.id.value === id);
      const item = items[position];
      return item
        ? [
            {
              number: ordinal(position),
              title: item.title.value,
              summary: item.summary.value,
              tags: item.tags.map((tag) => tag.value),
            } satisfies ServiceCardCopy,
          ]
        : [];
    });
  });
}
