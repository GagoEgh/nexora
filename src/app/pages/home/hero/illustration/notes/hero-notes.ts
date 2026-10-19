import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { appIcon } from '../../../../../core/icons/icons';
import type { HeroIllustrationContent } from '../hero-illustration';

export type HeroNotesContent = Pick<HeroIllustrationContent, 'workflow' | 'request'>;

@Component({
  selector: 'app-hero-notes',
  imports: [MatIcon],
  templateUrl: './hero-notes.html',
  styleUrl: './hero-notes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroNotes {
  readonly content = input.required<HeroNotesContent>();
  protected readonly botIcon = appIcon('bot');
  protected readonly checkIcon = appIcon('check');
}
