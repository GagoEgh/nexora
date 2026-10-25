import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import aboutContent from '../about.content';

const toRows = (counts: readonly number[]): readonly (readonly number[])[] =>
  counts.map((count) => Array.from({ length: count }, (_, index) => index));

@Component({
  selector: 'app-senior-model',
  imports: [MatIcon],
  templateUrl: './senior-model.html',
  styleUrl: './senior-model.scss',
})
export class SeniorModel {
  protected readonly content = useDictionary(aboutContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly pyramidRows = toRows([1, 2, 3, 5]);
  protected readonly nexoraRows = toRows([3, 3]);
}
