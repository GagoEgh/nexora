import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import aboutContent from '../about.content';

@Component({
  selector: 'app-long-term',
  templateUrl: './long-term.html',
  styleUrl: './long-term.scss',
})
export class LongTerm {
  protected readonly content = useDictionary(aboutContent);
}
