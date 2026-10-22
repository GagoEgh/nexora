import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useIntlayer } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';

@Component({
  selector: 'app-how-we-work',
  imports: [MatIcon],
  templateUrl: './how-we-work.html',
  styleUrl: './how-we-work.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowWeWork {
  protected readonly content = useIntlayer('how-we-work');
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly ordinal = ordinal;
}
