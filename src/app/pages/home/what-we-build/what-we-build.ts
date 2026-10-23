import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { WhatWeBuildIllustration } from './illustration/what-we-build-illustration';
import whatWeBuildContent from './what-we-build.content';

@Component({
  selector: 'app-what-we-build',
  imports: [WhatWeBuildIllustration],
  templateUrl: './what-we-build.html',
  styleUrl: './what-we-build.scss',
})
export class WhatWeBuild {
  protected readonly content = useDictionary(whatWeBuildContent);
}
