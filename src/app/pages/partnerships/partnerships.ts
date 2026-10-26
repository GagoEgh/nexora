import { Component, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { CONTACT_PATH, ENGAGEMENT_MODELS_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import { PartnerAudience } from './partner-audience/partner-audience';
import { PartnerFlow } from './partner-flow/partner-flow';
import { PartnerModel } from './partner-model/partner-model';
import { PartnerProcess } from './partner-process/partner-process';
import { PartnerTerms } from './partner-terms/partner-terms';
import partnershipsContent from './partnerships.content';

@Component({
  selector: 'app-partnerships',
  imports: [
    PageIntro,
    PartnerFlow,
    PartnerAudience,
    PartnerModel,
    PartnerProcess,
    PartnerTerms,
    StartConversation,
    RouterLink,
    LocalizedPathPipe,
    MatButton,
    MatIcon,
  ],
  templateUrl: './partnerships.html',
  styleUrl: './partnerships.scss',
  host: { 'data-layout': 'immersive' },
})
export class Partnerships {
  protected readonly content = useDictionary(partnershipsContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly contactPath = CONTACT_PATH;
  protected readonly engagementPath = ENGAGEMENT_MODELS_PATH;

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
      secondary: { label: copy.secondaryCta.value, path: ENGAGEMENT_MODELS_PATH },
    };
  });
}
