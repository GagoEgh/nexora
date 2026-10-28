import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { appIcon } from '../../../core/icons/icons';
import capabilitiesContent from './capabilities.content';

@Component({
  selector: 'app-capabilities',
  imports: [MatIcon, Reveal],
  templateUrl: './capabilities.html',
  styleUrl: './capabilities.scss',
})
export class Capabilities {
  protected readonly content = useDictionary(capabilitiesContent);
  protected readonly checkIcon = appIcon('check');
}
