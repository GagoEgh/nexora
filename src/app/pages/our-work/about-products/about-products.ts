import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import aboutProductContent from './about-products.content';

@Component({
  imports: [Reveal],
  selector: 'app-about-products',
  styleUrl: './about-products.scss',
  templateUrl: './about-products.html',
})
export class AboutProducts {
  protected readonly content = useDictionary(aboutProductContent);
}
