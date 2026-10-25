import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon, type AppIconName } from '../../../core/icons/icons';
import type aiAgentContent from '../ai-agent.content';

export type BusinessValueContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['businessValue'];

@Component({
  selector: 'app-business-value',
  imports: [MatIcon],
  templateUrl: './business-value.html',
  styleUrl: './business-value.scss',
})
export class BusinessValue {
  readonly content = input.required<BusinessValueContent>();
  protected readonly cardIcon = (icon: AppIconName) => appIcon(icon);
}
