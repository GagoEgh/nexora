import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH, PARTNERSHIPS_PATH } from '../../core/routing/paths';
import { PageIntro, pageCrumbs } from '../../shared/ui/page-intro/page-intro';
import {
  StartConversation,
  toConversationCopy,
} from '../../shared/ui/start-conversation/start-conversation';
import aboutContent from './about.content';
import { AboutGlance } from './glance/about-glance';
import { Philosophy } from './philosophy/philosophy';
import { SeniorModel } from './senior-model/senior-model';
import { BusinessFlow } from './business-flow/business-flow';
import { QualityCapability } from './quality-capability/quality-capability';
import { LongTerm } from './long-term/long-term';
import { Markets } from './markets/markets';

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

  protected readonly crumbs = computed(() => pageCrumbs(this.content()));

  protected readonly conversationCopy = computed(() =>
    toConversationCopy(this.content().conversation, CONTACT_PATH, PARTNERSHIPS_PATH),
  );
}
