import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import overviewContent from './overview.content';

@Component({
  selector: 'app-overview',
  imports: [Reveal],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly content = useDictionary(overviewContent);
}
