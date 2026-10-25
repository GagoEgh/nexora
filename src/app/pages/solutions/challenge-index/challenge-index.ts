import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { ordinal } from '../../../shared/ordinal';
import challengesContent from '../challenges.content';

@Component({
  selector: 'app-challenge-index',
  templateUrl: './challenge-index.html',
  styleUrl: './challenge-index.scss',
})
export class ChallengeIndex {
  protected readonly content = useDictionary(challengesContent);
  protected readonly ordinal = ordinal;
}
