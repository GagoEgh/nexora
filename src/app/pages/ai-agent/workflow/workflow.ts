import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import type aiAgentContent from '../ai-agent.content';
import type { WorkflowTone } from '../ai-agent.content';
export type WorkflowContent = DeepTransformContent<(typeof aiAgentContent)['content']>['workflow'];

const TILE_TONES: Readonly<Record<WorkflowTone, IconTileTone>> = {
  plain: 'primary',
  dark: 'inverse-container',
  accent: 'primary',
};

@Component({
  selector: 'app-workflow',
  imports: [IconTile],
  templateUrl: './workflow.html',
  styleUrl: './workflow.scss',
})
export class Workflow {
  readonly content = input.required<WorkflowContent>();
  protected readonly tileTone = (tone: WorkflowTone): IconTileTone => TILE_TONES[tone];
}
