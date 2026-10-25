import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import workflowContent, { type WorkflowTone } from './workflow.content';

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
  protected readonly content = useDictionary(workflowContent);
  protected readonly tileTone = (tone: WorkflowTone): IconTileTone => TILE_TONES[tone];
}
