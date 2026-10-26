import { Component, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { CONTACT_PATH, ENGAGEMENT_MODELS_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import { PartnerAudience } from './partner-audience/partner-audience';
import { PartnerFlow } from './partner-flow/partner-flow';
import partnershipsContent from './partnerships.content';

@Component({
  selector: 'app-partnerships',
  imports: [
    PageIntro,
    PartnerFlow,
    PartnerAudience,
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
}
