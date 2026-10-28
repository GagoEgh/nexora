import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import aboutGlanceContent from './about-glance.content';

@Component({
  selector: 'app-about-glance',
  imports: [Reveal],
  templateUrl: './about-glance.html',
  styleUrl: './about-glance.scss',
})
export class AboutGlance {
  protected readonly content = useDictionary(aboutGlanceContent);
}
