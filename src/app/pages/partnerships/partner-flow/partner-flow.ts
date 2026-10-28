import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import partnerFlowContent from './partner-flow.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-partner-flow',
  imports: [MatIcon, Reveal],
  templateUrl: './partner-flow.html',
  styleUrl: './partner-flow.scss',
})
export class PartnerFlow {
  protected readonly content = useDictionary(partnerFlowContent);
  protected readonly partnerIcon = appIcon('briefcase');
  protected readonly badgeIcon = appIcon('handshake');
}
