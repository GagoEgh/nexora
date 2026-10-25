import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import aboutContent from './about.content';
import { AboutGlance } from './glance/about-glance';

@Component({
  selector: 'app-about',
  imports: [PageIntro, AboutGlance],
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
}
