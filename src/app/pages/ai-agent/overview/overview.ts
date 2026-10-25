import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import overviewContent from './overview.content';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly content = useDictionary(overviewContent);
}
