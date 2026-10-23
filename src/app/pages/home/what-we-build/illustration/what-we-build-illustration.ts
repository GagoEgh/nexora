import { Component, input } from '@angular/core';

export const WHAT_WE_BUILD_ILLUSTRATION_KINDS = [
  'saas',
  'crm-erp',
  'web',
  'mobile',
  'ai',
  'automation',
  'portal',
  'internal-tools',
  'api',
] as const;

export type WhatWeBuildIllustrationKind = (typeof WHAT_WE_BUILD_ILLUSTRATION_KINDS)[number];

@Component({
  selector: 'app-what-we-build-illustration',
  templateUrl: './what-we-build-illustration.html',
  styleUrl: './what-we-build-illustration.scss',
  host: {
    'aria-hidden': 'true',
    '[attr.data-kind]': 'kind()',
  },
})
export class WhatWeBuildIllustration {
  readonly kind = input.required<WhatWeBuildIllustrationKind>();
}
