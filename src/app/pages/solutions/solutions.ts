import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH, SERVICES_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import { ChallengeDetails } from './challenge-details/challenge-details';
import { ChallengeIndex } from './challenge-index/challenge-index';
import solutionsContent from './solutions.content';

@Component({
  selector: 'app-solutions',
  imports: [PageIntro, ChallengeIndex, ChallengeDetails, StartConversation],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  host: { 'data-layout': 'immersive' },
})
export class Solutions {
  protected readonly content = useDictionary(solutionsContent);

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
