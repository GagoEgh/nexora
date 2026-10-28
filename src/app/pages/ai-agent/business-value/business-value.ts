import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { appIcon } from '../../../core/icons/icons';
import businessValueContent from './business-value.content';

@Component({
  selector: 'app-business-value',
  imports: [MatIcon, Reveal],
  templateUrl: './business-value.html',
  styleUrl: './business-value.scss',
})
export class BusinessValue {
  protected readonly content = useDictionary(businessValueContent);
  protected readonly cardIcon = appIcon;
}
