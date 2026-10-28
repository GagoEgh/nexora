import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import modelFinderContent from './model-finder.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-model-finder',
  imports: [MatIcon, Reveal],
  templateUrl: './model-finder.html',
  styleUrl: './model-finder.scss',
})
export class ModelFinder {
  protected readonly content = useDictionary(modelFinderContent);
  protected readonly arrowIcon = appIcon('arrow-right');
}
