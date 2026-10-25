import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon, type AppIconName } from '../../../core/icons/icons';
import businessValueContent from './business-value.content';

@Component({
  selector: 'app-business-value',
  imports: [MatIcon],
  templateUrl: './business-value.html',
  styleUrl: './business-value.scss',
})
export class BusinessValue {
  protected readonly content = useDictionary(businessValueContent);
  protected readonly cardIcon = (icon: AppIconName) => appIcon(icon);
}
