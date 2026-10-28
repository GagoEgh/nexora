import { Component, input } from '@angular/core';
import type { DeepTransformContent } from 'angular-intlayer';
import { IconTile } from '../../../../../shared/ui/icon-tile/icon-tile';
import type heroContent from '../../hero.content';

export type ArtNodeContent = DeepTransformContent<
  (typeof heroContent)['content']
>['illustration']['tiers'][number][number];

@Component({
  selector: 'app-art-node',
  imports: [IconTile],
  templateUrl: './art-node.html',
  styleUrl: './art-node.scss',
})
export class ArtNode {
  readonly node = input.required<ArtNodeContent>();
}
