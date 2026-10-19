import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Expertise } from './expertise/expertise';
import { Hero } from './hero/hero';
import { Why } from './why/why';

@Component({
  selector: 'app-home',
  imports: [Hero, Expertise, Why],
  template: `
    <app-hero />
    <app-expertise />
    <app-why />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
