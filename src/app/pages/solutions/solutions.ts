import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { CONTACT_PATH, SERVICES_PATH } from '../../core/routing/paths';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
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
  private readonly app = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  protected readonly content = useDictionary(solutionsContent);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly crumbs = computed<readonly PageIntroCrumb[]>(() => {
    const copy = this.content();
    return [{ label: copy.breadcrumbHome.value, path: '/' }, { label: copy.title.value }];
  });

  protected readonly conversationCopy = computed<ConversationCopy>(() => {
    const copy = this.content().conversation;
    return {
      eyebrow: copy.eyebrow.value,
      title: copy.title.value,
      lead: copy.lead.value,
      primary: { label: copy.primaryCta.value, path: CONTACT_PATH },
      secondary: { label: copy.secondaryCta.value, path: SERVICES_PATH },
    };
  });

  constructor() {
    /*
     * `?challenge=` is how the footer deep-links a single challenge. The panels only exist once
     * the page has rendered, so the scroll waits for the application to settle.
     */
    effect(() => {
      const requested = this.params().get(CHALLENGE_PARAM);
      if (!isChallengeId(requested)) {
        return;
      }
      void this.app.whenStable().then(() => this.scrollTo(requested));
    });
  }

  protected onChallengeSelect(challenge: ChallengeId): void {
    this.scrollTo(challenge);
  }

  private scrollTo(challenge: ChallengeId): void {
    this.document
      .getElementById(challengeSectionId(challenge))
      ?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
  }

  private scrollBehavior(): ScrollBehavior {
    return this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
  }
}
