import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH, SERVICES_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import { ModelComparison } from './model-comparison/model-comparison';
import { ModelDetails } from './model-details/model-details';
import { ModelFaq } from './model-faq/model-faq';
import { ModelFinder } from './model-finder/model-finder';
import engagementModelsPageContent from './engagement-models.content';

@Component({
  selector: 'app-engagement-models-page',
  imports: [PageIntro, ModelFinder, ModelDetails, ModelComparison, ModelFaq, StartConversation],
  templateUrl: './engagement-models.html',
  styleUrl: './engagement-models.scss',
  host: { 'data-layout': 'immersive' },
})
export class EngagementModelsPage {
  protected readonly content = useDictionary(engagementModelsPageContent);

  protected readonly crumbs = computed<readonly PageIntroCrumb[]>(() => {
    const copy = this.content();
    return [{ label: copy.breadcrumbHome.value, path: '/' }, { label: copy.title.value }];
  });

  protected readonly conversationCopy = computed<ConversationCopy>(() => {
    const copy = this.content().conversation;
    return {
      eyebrow: copy.eyebrow.value,
      title: copy.title.value,
      lead: copy.lead.value,
      primary: { label: copy.primaryCta.value, path: CONTACT_PATH },
      secondary: { label: copy.secondaryCta.value, path: SERVICES_PATH },
    };
  });
}
