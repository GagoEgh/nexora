import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-home',
  imports: [Hero],
  template: `<app-hero />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
