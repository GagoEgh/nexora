import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import ourWorkContent from './our-work.content';
import { pageCrumbs, PageIntro } from '../../shared/ui/page-intro/page-intro';
import { Products } from './products/products';
import { AboutProducts } from './about-products/about-products';

@Component({
  imports: [PageIntro, Products, AboutProducts],
  selector: 'app-our-work',
  templateUrl: './our-work.html',
})
export class OurWork {
  protected readonly content = useDictionary(ourWorkContent);
  protected readonly crumbs = computed(() => pageCrumbs(this.content()));
}
