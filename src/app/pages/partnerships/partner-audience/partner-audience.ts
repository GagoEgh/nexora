import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import partnerAudienceContent from './partner-audience.content';

@Component({
  selector: 'app-partner-audience',
  imports: [IconTile],
  templateUrl: './partner-audience.html',
  styleUrl: './partner-audience.scss',
})
export class PartnerAudience {
  protected readonly content = useDictionary(partnerAudienceContent);
}
