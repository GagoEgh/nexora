import { Component, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import seniorModelContent from './senior-model.content';
import { ModelPanel, type ModelPanelKey } from './model-panel/model-panel';

const toRows = (counts: readonly number[]): readonly (readonly number[])[] =>
  counts.map((count) => Array.from({ length: count }, (_, index) => index));

@Component({
  selector: 'app-senior-model',
  imports: [MatIcon, ModelPanel],
  templateUrl: './senior-model.html',
  styleUrl: './senior-model.scss',
})
export class SeniorModel {
  protected readonly content = useDictionary(seniorModelContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly pyramidRows = toRows([1, 2, 3, 5]);
  protected readonly nexoraRows = toRows([3, 3]);

  protected readonly pyramidKeys = computed<readonly ModelPanelKey[]>(() => {
    const { pyramid } = this.content();
    return [
      { label: pyramid.senior.value, apex: true },
      { label: pyramid.junior.value, apex: false },
    ];
  });

  protected readonly nexoraKeys = computed<readonly ModelPanelKey[]>(() => {
    const { nexora } = this.content();
    return [{ label: nexora.legend.value, apex: false }];
  });
}
