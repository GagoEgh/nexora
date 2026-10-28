import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import problemsContent from './problems.content';

@Component({
  selector: 'app-problems',
  imports: [IconTile, Reveal],
  templateUrl: './problems.html',
  styleUrl: './problems.scss',
})
export class Problems {
  protected readonly content = useDictionary(problemsContent);
}
