import { Component, input } from '@angular/core';

export type ModelPanelTone = 'plain' | 'inverse';

export interface ModelPanelKey {
  readonly label: string;
  readonly apex: boolean;
}

@Component({
  selector: 'app-model-panel',
  templateUrl: './model-panel.html',
  styleUrl: './model-panel.scss',
  host: { '[attr.data-tone]': 'tone()' },
})
export class ModelPanel {
  readonly label = input.required<string>();
  readonly rows = input.required<readonly (readonly number[])[]>();
  readonly keys = input.required<readonly ModelPanelKey[]>();
  readonly tone = input<ModelPanelTone>('plain');
  readonly highlightApex = input(false);
}
