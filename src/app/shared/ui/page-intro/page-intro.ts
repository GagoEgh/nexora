import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { Reveal } from '../../motion/reveal';

export interface PageIntroCrumb {
  readonly label: string;
  readonly path?: string;
}

@Component({
  selector: 'app-page-intro',
  imports: [RouterLink, LocalizedPathPipe, Reveal],
  templateUrl: './page-intro.html',
  styleUrl: './page-intro.scss',
})
export class PageIntro {
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
