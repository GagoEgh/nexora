import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import aboutProductContent from './about-products.content';

@Component({
  imports: [],
  selector: 'app-about-products',
  styleUrl: './about-products.scss',
  templateUrl: './about-products.html',
})
export class AboutProducts {
  protected readonly content = useDictionary(aboutProductContent);
}
