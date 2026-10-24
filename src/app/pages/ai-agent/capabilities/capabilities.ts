import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import type aiAgentContent from '../ai-agent.content';

export type CapabilitiesTone = 'neutral' | 'accent';

export type CapabilitiesContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['capabilities'];

@Component({
  selector: 'app-capabilities',
  imports: [MatIcon],
  templateUrl: './capabilities.html',
  styleUrl: './capabilities.scss',
})
export class Capabilities {
  readonly content = input.required<CapabilitiesContent>();
  protected readonly checkIcon = appIcon('check');
}
