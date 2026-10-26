import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import businessFlowContent from './business-flow.content';

@Component({
  selector: 'app-business-flow',
  imports: [MatIcon],
  templateUrl: './business-flow.html',
  styleUrl: './business-flow.scss',
})
export class BusinessFlow {
  protected readonly content = useDictionary(businessFlowContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly icon = appIcon;
}
