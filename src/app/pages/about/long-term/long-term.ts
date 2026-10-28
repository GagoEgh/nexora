import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import longTermContent from './long-term.content';

@Component({
  selector: 'app-long-term',
  imports: [Reveal],
  templateUrl: './long-term.html',
  styleUrl: './long-term.scss',
})
export class LongTerm {
  protected readonly content = useDictionary(longTermContent);
}
