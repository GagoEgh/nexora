import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';
import aiAutomationContent from './ai-automation.content';
import { Reveal } from '../../../shared/motion/reveal';

@Component({
  selector: 'app-ai-automation',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile, Reveal],
  templateUrl: './ai-automation.html',
  styleUrl: './ai-automation.scss',
})
export class AiAutomation {
  protected readonly content = useDictionary(aiAutomationContent);
  protected readonly arrowIcon = appIcon('arrow-right');
}
