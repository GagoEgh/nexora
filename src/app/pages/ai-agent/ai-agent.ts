import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import aiAgentContent from './ai-agent.content';

@Component({
  selector: 'app-ai-agent',
  template: `<h1>{{ content().title }}</h1>`,
  styles: `
    @use 'mixins/container';

    :host {
      @include container.page();
    }
  `,
})
export class AiAgent {
  protected readonly content = useDictionary(aiAgentContent);
}
