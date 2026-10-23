import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-label',
  template: `<label [attr.for]="for()"><ng-content /></label>`,
  styleUrl: './field-label.scss',
})
export class FieldLabel {
  readonly for = input.required<string>();
}
