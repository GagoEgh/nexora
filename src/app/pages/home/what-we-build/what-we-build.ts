import { Component } from '@angular/core';
import { useIntlayer } from 'angular-intlayer';
import { WhatWeBuildIllustration } from './illustration/what-we-build-illustration';

@Component({
  selector: 'app-what-we-build',
  imports: [WhatWeBuildIllustration],
  templateUrl: './what-we-build.html',
  styleUrl: './what-we-build.scss',
})
export class WhatWeBuild {
  protected readonly content = useIntlayer('what-we-build');
}
