import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import modelComparisonContent from './model-comparison.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-model-comparison',
  imports: [Reveal],
  templateUrl: './model-comparison.html',
  styleUrl: './model-comparison.scss',
})
export class ModelComparison {
  protected readonly content = useDictionary(modelComparisonContent);
}
