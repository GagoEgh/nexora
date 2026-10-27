import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';
import howWeWorkContent from './how-we-work.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-how-we-work',
  imports: [MatIcon, Reveal],
  templateUrl: './how-we-work.html',
  styleUrl: './how-we-work.scss',
})
export class HowWeWork {
  protected readonly content = useDictionary(howWeWorkContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly ordinal = ordinal;
}
