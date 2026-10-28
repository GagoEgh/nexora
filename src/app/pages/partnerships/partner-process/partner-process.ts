import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { ordinal } from '../../../shared/ordinal';
import partnerProcessContent from './partner-process.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-partner-process',
  imports: [Reveal],
  templateUrl: './partner-process.html',
  styleUrl: './partner-process.scss',
})
export class PartnerProcess {
  protected readonly content = useDictionary(partnerProcessContent);
  protected readonly ordinal = ordinal;
}
