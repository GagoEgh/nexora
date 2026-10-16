import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LogoVariant = 'mark' | 'lockup';

export type LogoTone = 'auto' | 'light' | 'dark';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    'aria-label': 'Nexora',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'tone()',
  },
})
export class Logo {
  readonly variant = input<LogoVariant>('lockup');
  readonly tone = input<LogoTone>('auto');
}
