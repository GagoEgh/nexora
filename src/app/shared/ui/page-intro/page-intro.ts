import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { useLocale } from 'angular-intlayer';
import type { LocalizedText } from '../../../core/i18n/localized-text';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { Reveal } from '../../motion/reveal';

export interface PageIntroCrumb {
  readonly label: string;
  readonly path?: string;
}

export interface PageCrumbCopy {
  readonly breadcrumbHome: LocalizedText;
  readonly title: LocalizedText;
}

export function pageCrumbs(
  copy: PageCrumbCopy,
  ...between: readonly PageIntroCrumb[]
): readonly PageIntroCrumb[] {
  return [{ label: copy.breadcrumbHome.value, path: '/' }, ...between, { label: copy.title.value }];
}

@Component({
  selector: 'app-page-intro',
  imports: [RouterLink, LocalizedPathPipe, Reveal],
  templateUrl: './page-intro.html',
  styleUrl: './page-intro.scss',
})
export class PageIntro {
  protected readonly locale = useLocale().locale;
  readonly crumbs = input.required<readonly PageIntroCrumb[]>();
  readonly breadcrumbLabel = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly heading = input.required<string>();
  readonly lead = input<string>();
  readonly leadPlacement = input<'copy' | 'aside'>('copy');

  protected readonly copyLead = computed(() =>
    this.leadPlacement() === 'copy' ? this.lead() : undefined,
  );
  protected readonly asideLead = computed(() =>
    this.leadPlacement() === 'aside' ? this.lead() : undefined,
  );
}
