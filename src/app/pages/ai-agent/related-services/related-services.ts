import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { ServiceCard, type ServiceCardCopy } from '../../../shared/ui/service-card/service-card';
import { EngagementPanel } from './engagement-panel/engagement-panel';
import relatedServicesContent from './related-services.content';

@Component({
  selector: 'app-related-services',
  imports: [ServiceCard, EngagementPanel],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss',
})
export class RelatedServices {
  protected readonly content = useDictionary(relatedServicesContent);

  protected readonly cards = computed<readonly ServiceCardCopy[]>(() =>
    this.content().items.map((item) => ({
      number: item.number.value,
      title: item.title.value,
      summary: item.summary.value,
      tags: item.tags.map((tag) => tag.value),
    })),
  );
}
