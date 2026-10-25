import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { DeepTransformContent } from 'angular-intlayer';
import { appIcon } from '../../../../../core/icons/icons';
import type heroContent from '../../hero.content';

export type HeroNotesContent = Pick<
  DeepTransformContent<(typeof heroContent)['content']>['illustration'],
  'workflow' | 'request'
>;

@Component({
  selector: 'app-hero-notes',
  imports: [MatIcon],
  templateUrl: './hero-notes.html',
  styleUrl: './hero-notes.scss',
})
export class HeroNotes {
  readonly content = input.required<HeroNotesContent>();
  protected readonly botIcon = appIcon('bot');
  protected readonly checkIcon = appIcon('check');
}
