import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, Scroll } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { filter } from 'rxjs';
import { CONTACT_PATH, SERVICES_PATH } from '../../core/routing/paths';
import { scrollToSection } from '../../shared/motion/scroll-to-section';
import { PageIntro, pageCrumbs } from '../../shared/ui/page-intro/page-intro';
import {
  StartConversation,
  toConversationCopy,
} from '../../shared/ui/start-conversation/start-conversation';
import { challengeSectionId, isChallengeId, type ChallengeId } from './challenge';
import { ChallengeDetails } from './challenge-details/challenge-details';
import { ChallengeIndex } from './challenge-index/challenge-index';
import solutionsContent from './solutions.content';

const CHALLENGE_PARAM = 'challenge';

@Component({
  selector: 'app-solutions',
  imports: [PageIntro, ChallengeIndex, ChallengeDetails, StartConversation],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  host: { 'data-layout': 'immersive' },
})
export class Solutions {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly app = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  protected readonly content = useDictionary(solutionsContent);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly current = computed<ChallengeId | null>(() => {
    const value = this.params().get(CHALLENGE_PARAM);
    return isChallengeId(value) ? value : null;
  });

  protected readonly crumbs = computed(() => pageCrumbs(this.content()));

  protected readonly conversationCopy = computed(() =>
    toConversationCopy(this.content().conversation, CONTACT_PATH, SERVICES_PATH),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof Scroll),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const requested = this.route.snapshot.queryParamMap.get(CHALLENGE_PARAM);
        if (isChallengeId(requested)) {
          void this.app.whenStable().then(() => this.scrollTo(requested));
        }
      });
  }

  private scrollTo(challenge: ChallengeId): void {
    scrollToSection(this.document, challengeSectionId(challenge));
  }
}
