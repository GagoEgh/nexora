import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import { ChallengeDetails } from './challenge-details/challenge-details';
import { ChallengeIndex } from './challenge-index/challenge-index';
import solutionsContent from './solutions.content';

@Component({
  selector: 'app-solutions',
  imports: [PageIntro, ChallengeIndex, ChallengeDetails],
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
}
