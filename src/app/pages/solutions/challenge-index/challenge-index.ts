import { Component, output } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { ordinal } from '../../../shared/ordinal';
import { challengeSectionId, type ChallengeId } from '../challenge';
import challengesContent from '../challenges.content';

@Component({
  selector: 'app-challenge-index',
  templateUrl: './challenge-index.html',
  styleUrl: './challenge-index.scss',
})
export class ChallengeIndex {
  readonly challengeSelect = output<ChallengeId>();

  protected readonly content = useDictionary(challengesContent);
  protected readonly ordinal = ordinal;
  protected readonly sectionId = challengeSectionId;

  protected onSelect(event: Event, id: ChallengeId): void {
    event.preventDefault();
    this.challengeSelect.emit(id);
  }
}
