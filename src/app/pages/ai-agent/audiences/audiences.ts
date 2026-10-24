import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon, type AppIconName } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';
import type aiAgentContent from '../ai-agent.content';

export type AudiencesContent = DeepTransformContent<
  (typeof aiAgentContent)['content']
>['audiences'];

@Component({
  selector: 'app-audiences',
  imports: [MatIcon],
  templateUrl: './audiences.html',
  styleUrl: './audiences.scss',
})
export class Audiences {
  readonly content = input.required<AudiencesContent>();
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly ordinal = ordinal;
  protected readonly chipIcon = (icon: AppIconName) => appIcon(icon);
}
