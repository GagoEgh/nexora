import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { HeroIllustration } from './illustration/hero-illustration';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, MatButton, MatIcon, HeroIllustration],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly content = useIntlayer('hero');
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly checkIcon = appIcon('check');
}
