import { Component } from '@angular/core';
import { AiAutomation } from './ai-automation/ai-automation';
import { WhatWeBuild } from './what-we-build/what-we-build';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';
import { Why } from './why/why';

@Component({
  selector: 'app-home',
  imports: [Hero, Expertise, Why, WhatWeBuild, AiAutomation],
  template: `
    <app-hero />
    <app-expertise />
    <app-why />
    <app-what-we-build />
    <app-ai-automation />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  host: {
    'data-layout': 'immersive',
  },
})
export class Home {}
