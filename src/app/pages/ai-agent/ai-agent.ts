import { Component, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH, SERVICES_PATH, SOLUTIONS_PATH } from '../../core/routing/paths';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { Reveal } from '../../shared/motion/reveal';
import { PageIntro, pageCrumbs } from '../../shared/ui/page-intro/page-intro';
import {
  StartConversation,
  toConversationCopy,
} from '../../shared/ui/start-conversation/start-conversation';
import aiAgentContent from './ai-agent.content';
import { Audiences } from './audiences/audiences';
import { BusinessValue } from './business-value/business-value';
import { Capabilities } from './capabilities/capabilities';
import { Overview } from './overview/overview';
import { Problems } from './problems/problems';
import { RelatedServices } from './related-services/related-services';
import { Workflow } from './workflow/workflow';

@Component({
  selector: 'app-ai-agent',
  imports: [
    RouterLink,
    LocalizedPathPipe,
    PageIntro,
    StartConversation,
    Audiences,
    BusinessValue,
    Capabilities,
    Overview,
    Problems,
    RelatedServices,
    Workflow,
    MatButton,
    MatIcon,
    Reveal,
  ],
  templateUrl: './ai-agent.html',
  styleUrl: './ai-agent.scss',
  host: { 'data-layout': 'immersive' },
})
export class AiAgent {
  protected readonly content = useDictionary(aiAgentContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly contactPath = CONTACT_PATH;
  protected readonly solutionsPath = SOLUTIONS_PATH;

  protected readonly conversationCopy = computed(() =>
    toConversationCopy(this.content().conversation, CONTACT_PATH, SERVICES_PATH),
  );

  protected readonly crumbs = computed(() => {
    const copy = this.content();
    return pageCrumbs(copy, { label: copy.breadcrumbServices.value, path: SERVICES_PATH });
  });
}
