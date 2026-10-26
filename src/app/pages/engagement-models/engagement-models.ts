import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import { ModelComparison } from './model-comparison/model-comparison';
import { ModelDetails } from './model-details/model-details';
import { ModelFinder } from './model-finder/model-finder';
import engagementModelsPageContent from './engagement-models.content';

@Component({
  selector: 'app-engagement-models-page',
  imports: [PageIntro, ModelFinder, ModelDetails, ModelComparison],
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
}
