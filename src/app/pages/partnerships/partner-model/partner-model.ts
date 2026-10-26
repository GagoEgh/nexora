import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { IconTile, type IconTileTone } from '../../../shared/ui/icon-tile/icon-tile';
import partnerModelContent from './partner-model.content';

@Component({
  selector: 'app-partner-model',
  imports: [IconTile],
  templateUrl: './partner-model.html',
  styleUrl: './partner-model.scss',
})
export class PartnerModel {
  protected readonly content = useDictionary(partnerModelContent);

  protected readonly tileTone = (first: boolean): IconTileTone =>
    first ? 'inverse-accent' : 'primary';
}
