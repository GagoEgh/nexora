import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { ordinal } from '../../../shared/ordinal';
import servicesCatalogueContent from '../../../shared/services-catalogue/services-catalogue.content';
import { ServiceCard, type ServiceCardCopy } from '../../../shared/ui/service-card/service-card';
import { EngagementPanel } from './engagement-panel/engagement-panel';
import relatedServicesContent from './related-services.content';

const FEATURED = [7, 5, 9] as const;

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
    return FEATURED.map((index) => ({
      number: ordinal(index),
      title: items[index].title.value,
      summary: items[index].summary.value,
      tags: items[index].tags.map((tag) => tag.value),
    }));
  });
}
