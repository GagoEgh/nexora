import { Component } from '@angular/core';
import { AiAutomation } from './ai-automation/ai-automation';
import { WhatWeBuild } from './what-we-build/what-we-build';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';
import { HowWeWork } from './how-we-work/how-we-work';
import { Why } from './why/why';

@Component({
  selector: 'app-home',
  imports: [Hero, Expertise, Why, WhatWeBuild, AiAutomation, HowWeWork],
  template: `
    <app-hero />
    <app-expertise />
    <app-why />
    <app-what-we-build />
    <app-ai-automation />
    <app-how-we-work />
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
