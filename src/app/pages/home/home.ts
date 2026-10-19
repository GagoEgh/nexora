import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WhatWeBuild } from './what-we-build/what-we-build';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';
import { Why } from './why/why';

@Component({
  selector: 'app-home',
  imports: [Hero, Expertise, Why, WhatWeBuild],
  template: `
    <app-hero />
    <app-expertise />
    <app-why />
    <app-what-we-build />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
