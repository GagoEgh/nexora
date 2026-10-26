import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import modelFinderContent from './model-finder.content';

@Component({
  selector: 'app-model-finder',
  imports: [MatIcon],
  templateUrl: './model-finder.html',
  styleUrl: './model-finder.scss',
})
export class ModelFinder {
  protected readonly content = useDictionary(modelFinderContent);
  protected readonly arrowIcon = appIcon('arrow-right');
}
