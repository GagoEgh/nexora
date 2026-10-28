import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import modelFinderContent from './model-finder.content';
import { Reveal } from '../../../shared/motion/reveal';
import { MODEL_IDS, type ModelId } from '../engagement-model';

@Component({
  selector: 'app-model-finder',
  imports: [MatIcon, Reveal, RouterLink],
  templateUrl: './model-finder.html',
  styleUrl: './model-finder.scss',
})
export class ModelFinder {
  readonly current = input<ModelId | null>(null);

  protected readonly content = useDictionary(modelFinderContent);
  protected readonly arrowIcon = appIcon('arrow-right');

  protected readonly rows = computed(() =>
    this.content().rows.map((row, index) => ({ row, id: MODEL_IDS[index] })),
  );
}
