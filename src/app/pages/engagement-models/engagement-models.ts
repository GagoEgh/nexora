import { DOCUMENT } from '@angular/common';
import { afterNextRender, ApplicationRef, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, Scroll } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { filter } from 'rxjs';
import { CONTACT_PATH, SERVICES_PATH } from '../../core/routing/paths';
import { scrollToSection } from '../../shared/motion/scroll-to-section';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import { ModelComparison } from './model-comparison/model-comparison';
import { ModelDetails } from './model-details/model-details';
import { ModelFaq } from './model-faq/model-faq';
import { ModelFinder } from './model-finder/model-finder';
import engagementModelsPageContent from './engagement-models.content';
import { isModelId, modelSectionId, type ModelId } from './engagement-model';

const MODEL_PARAM = 'model';

@Component({
  selector: 'app-engagement-models-page',
  imports: [PageIntro, ModelFinder, ModelDetails, ModelComparison, ModelFaq, StartConversation],
  templateUrl: './engagement-models.html',
  styleUrl: './engagement-models.scss',
  host: { 'data-layout': 'immersive' },
})
export class EngagementModelsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly app = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  protected readonly content = useDictionary(engagementModelsPageContent);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly current = computed<ModelId | null>(() => {
    const value = this.params().get(MODEL_PARAM);
    return isModelId(value) ? value : null;
  });

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
    // A deep link needs its own handling: the router's Scroll event covers navigations that
    // happen while the page is open, but on the first navigation this component is still being
    // created, so by the time it subscribes that event has already gone. Measured without
    // this: the card sat 1921px down the page on a direct `?model=` load.
    afterNextRender(() => this.scrollToRequested());

    this.router.events
      .pipe(
        filter((event) => event instanceof Scroll),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.scrollToRequested());
  }

  // `anchorScrolling` is off in app.config.ts, so the scroll is explicit. Waiting for the
  // application to be stable matters: the target card may still be rendering when the
  // navigation settles, and scrolling to an element that is not there yet does nothing.
  private scrollToRequested(): void {
    const requested = this.route.snapshot.queryParamMap.get(MODEL_PARAM);
    if (!isModelId(requested)) {
      return;
    }
    void this.app.whenStable().then(() => {
      scrollToSection(this.document, modelSectionId(requested));
    });
  }
}
