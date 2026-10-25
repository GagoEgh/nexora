import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import aboutContent from '../about.content';

@Component({
  selector: 'app-business-flow',
  imports: [MatIcon],
  templateUrl: './business-flow.html',
  styleUrl: './business-flow.scss',
})
export class BusinessFlow {
  protected readonly content = useDictionary(aboutContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly icon = appIcon;
}
