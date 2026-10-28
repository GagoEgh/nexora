import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import modelDetailsContent from './model-details.content';
import { Reveal } from '../../../shared/motion/reveal';
import { MODEL_IDS, modelSectionId, type ModelId } from '../engagement-model';

@Component({
  selector: 'app-model-details',
  imports: [IconTile, MatIcon, Reveal],
  templateUrl: './model-details.html',
  styleUrl: './model-details.scss',
})
export class ModelDetails {
  readonly current = input<ModelId | null>(null);

  protected readonly content = useDictionary(modelDetailsContent);
  protected readonly ordinal = ordinal;
  protected readonly checkIcon = appIcon('check');
  protected readonly sectionId = modelSectionId;

  protected readonly models = computed(() =>
    this.content().models.map((model, index) => ({ model, id: MODEL_IDS[index] })),
  );
}
