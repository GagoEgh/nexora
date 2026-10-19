import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-home',
  imports: [Hero, Expertise],
  template: `
    <app-hero />
    <app-expertise />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
