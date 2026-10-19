import { ChangeDetectionStrategy, Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';
import {
  WhatWeBuildIllustration,
  type WhatWeBuildIllustrationKind,
  isWhatWeBuildIllustrationKind,
} from './illustration/what-we-build-illustration';

@Component({
  selector: 'app-what-we-build',
  imports: [WhatWeBuildIllustration],
  templateUrl: './what-we-build.html',
  styleUrl: './what-we-build.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatWeBuild {
  protected readonly content = useIntlayer('what-we-build');

  protected illustration(kind: string): WhatWeBuildIllustrationKind {
    if (!isWhatWeBuildIllustrationKind(kind)) {
      throw new Error(`Unknown what-we-build illustration "${kind}"`);
    }
    return kind;
  }
}
