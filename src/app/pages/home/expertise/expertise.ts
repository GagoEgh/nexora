import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import expertiseContent from './expertise.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-expertise',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  templateUrl: './expertise.html',
  styleUrl: './expertise.scss',
})
export class Expertise {
  protected readonly content = useDictionary(expertiseContent);
  protected readonly arrowIcon = appIcon('arrow-right');
}
