import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import modelFaqContent from './model-faq.content';

@Component({
  selector: 'app-model-faq',
  imports: [MatIcon],
  templateUrl: './model-faq.html',
  styleUrl: './model-faq.scss',
})
export class ModelFaq {
  protected readonly content = useDictionary(modelFaqContent);
  protected readonly plusIcon = appIcon('plus');
  protected readonly minusIcon = appIcon('minus');
}
