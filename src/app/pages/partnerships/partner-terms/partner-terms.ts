import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import partnerTermsContent from './partner-terms.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-partner-terms',
  imports: [IconTile, MatIcon, Reveal],
  templateUrl: './partner-terms.html',
  styleUrl: './partner-terms.scss',
})
export class PartnerTerms {
  protected readonly content = useDictionary(partnerTermsContent);
  protected readonly itemIcon = appIcon('file-text');
}
