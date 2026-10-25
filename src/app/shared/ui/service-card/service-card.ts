import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { appIcon } from '../../../core/icons/icons';

export interface ServiceCardCopy {
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
}

@Component({
  selector: 'app-service-card',
  imports: [MatIcon],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss',
})
export class ServiceCard {
  readonly copy = input.required<ServiceCardCopy>();
  protected readonly arrowIcon = appIcon('arrow-up-right');
}
