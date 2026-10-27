import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { Reveal } from '../../../shared/motion/reveal';
import heroContent from './hero.content';
import { HeroIllustration } from './illustration/hero-illustration';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, HeroIllustration, Reveal],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly content = useDictionary(heroContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly checkIcon = appIcon('check');
}
