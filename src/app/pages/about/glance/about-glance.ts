import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import aboutContent from '../about.content';

@Component({
  selector: 'app-about-glance',
  templateUrl: './about-glance.html',
  styleUrl: './about-glance.scss',
})
export class AboutGlance {
  protected readonly content = useDictionary(aboutContent);
}
