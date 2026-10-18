import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useIntlayer } from 'angular-intlayer';
import { appIcon } from '../../../../../core/icons/icons';

@Component({
  selector: 'app-hero-notes',
  imports: [MatIcon],
  templateUrl: './hero-notes.html',
  styleUrl: './hero-notes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroNotes {
  protected readonly content = useIntlayer('hero');
  protected readonly botIcon = appIcon('bot');
  protected readonly checkIcon = appIcon('check');
}
