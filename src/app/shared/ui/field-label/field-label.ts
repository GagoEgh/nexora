import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-field-label',
  template: `<label [attr.for]="for()" [attr.id]="labelId()"><ng-content /></label>`,
  styleUrl: './field-label.scss',
  host: { '(click)': 'onClick()' },
})
export class FieldLabel {
  readonly for = input<string>();
  readonly labelId = input<string>();
  readonly activate = output<void>();

  protected onClick(): void {
    if (!this.for()) {
      this.activate.emit();
    }
  }
}
