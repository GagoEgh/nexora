import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-field-label',
  template: `<label [attr.for]="for()" [attr.id]="labelId()"><ng-content /></label>`,
  styleUrl: './field-label.scss',
  host: {
    '(click)': 'onClick()',
    '[class.field-label--invalid]': 'invalid()',
  },
})
export class FieldLabel {
  readonly for = input<string>();
  readonly labelId = input<string>();
  readonly invalid = input(false);
  readonly activate = output<void>();

  protected onClick(): void {
    if (!this.for()) {
      this.activate.emit();
    }
  }
}
