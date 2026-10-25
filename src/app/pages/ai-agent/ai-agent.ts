import { Component, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { SERVICES_PATH } from '../../app.routes';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import aiAgentContent from './ai-agent.content';
import { Audiences } from './audiences/audiences';
import { BusinessValue } from './business-value/business-value';
import { Capabilities } from './capabilities/capabilities';
import { Overview } from './overview/overview';
import { Problems } from './problems/problems';
import { Workflow } from './workflow/workflow';

@Component({
  selector: 'app-ai-agent',
  imports: [
    RouterLink,
    LocalizedPathPipe,
    PageIntro,
    Audiences,
    BusinessValue,
    Capabilities,
    Overview,
    Problems,
    Workflow,
    MatButton,
    MatIcon,
  ],
  templateUrl: './ai-agent.html',
  styleUrl: './ai-agent.scss',
  host: { 'data-layout': 'immersive' },
})
export class AiAgent {
  protected readonly content = useDictionary(aiAgentContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly servicesPath = SERVICES_PATH;

  protected readonly crumbs = computed<readonly PageIntroCrumb[]>(() => {
    const copy = this.content();
    return [
      { label: copy.breadcrumbHome.value, path: '/' },
      { label: copy.breadcrumbServices.value, path: SERVICES_PATH },
      { label: copy.title.value },
    ];
  });
}
