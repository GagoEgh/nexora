import { Component } from '@angular/core';
import { StartConversation } from '../../shared/ui/start-conversation/start-conversation';
import { AiAutomation } from './ai-automation/ai-automation';
import { EngagementModels } from './engagement-models/engagement-models';
import { WhatWeBuild } from './what-we-build/what-we-build';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';
import { HowWeWork } from './how-we-work/how-we-work';
import { Why } from './why/why';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    Expertise,
    Why,
    WhatWeBuild,
    AiAutomation,
    HowWeWork,
    EngagementModels,
    StartConversation,
  ],
  template: `
    <app-hero />
    <app-expertise />
    <app-why />
    <app-what-we-build />
    <app-ai-automation />
    <app-how-we-work />
    <app-engagement-models />
    <app-start-conversation />
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
