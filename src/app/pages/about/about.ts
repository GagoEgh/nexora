import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import aboutContent from './about.content';
import { AboutGlance } from './glance/about-glance';
import { Philosophy } from './philosophy/philosophy';
import { BusinessFlow } from './business-flow/business-flow';
import { SeniorModel } from './senior-model/senior-model';
import { LongTerm } from './long-term/long-term';
import { Markets } from './markets/markets';
import { QualityCapability } from './quality-capability/quality-capability';

@Component({
  selector: 'app-about',
  imports: [
    PageIntro,
    AboutGlance,
    Philosophy,
    SeniorModel,
    BusinessFlow,
    QualityCapability,
    LongTerm,
    Markets,
    StartConversation,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  host: { 'data-layout': 'immersive' },
})
export class About {
  protected readonly content = useDictionary(aboutContent);

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
      secondary: { label: copy.secondaryCta.value, path: '/partnerships' },
    };
  });
}
