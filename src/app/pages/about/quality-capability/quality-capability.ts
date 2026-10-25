import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import aboutContent from '../about.content';

@Component({
  selector: 'app-quality-capability',
  imports: [MatIcon],
  templateUrl: './quality-capability.html',
  styleUrl: './quality-capability.scss',
})
export class QualityCapability {
  protected readonly content = useDictionary(aboutContent);
  protected readonly icon = appIcon;
}
