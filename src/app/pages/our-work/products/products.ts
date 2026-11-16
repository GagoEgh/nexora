import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { useDictionary, useLocale } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { Reveal } from '../../../shared/motion/reveal';
import { appIcon } from '../../../core/icons/icons';
import { CONTACT_PATH } from '../../../core/routing/paths';
import productContent from './product.content';
import { toProductViews } from './data/product-view';
import { ProjectCard, type ProjectCardLabels } from './project-card/project-card';

@Component({
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, Reveal, ProjectCard],
  selector: 'app-products',
  styleUrl: './products.scss',
  templateUrl: './products.html',
})
export class Products {
  protected readonly content = useDictionary(productContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly contactPath = CONTACT_PATH;

  protected readonly products = computed(() => toProductViews(this.content()));

  protected readonly labels = computed<ProjectCardLabels>(() => {
    const copy = this.content();
    return {
      viewProject: copy.viewProject.value,
      visitSite: copy.visitSite.value,
      newTab: copy.newTab.value,
    };
  });
}
