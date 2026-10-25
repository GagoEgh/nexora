import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { ordinal } from '../../../shared/ordinal';
import audiencesContent from './audiences.content';

@Component({
  selector: 'app-audiences',
  imports: [MatIcon],
  templateUrl: './audiences.html',
  styleUrl: './audiences.scss',
})
export class Audiences {
  protected readonly content = useDictionary(audiencesContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly ordinal = ordinal;
  protected readonly chipIcon = appIcon;
}
