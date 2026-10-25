import { Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { CONTACT_PATH } from '../../../core/routing/paths';
import { appIcon } from '../../../core/icons/icons';
import startConversationContent from './start-conversation.content';

export interface ConversationAction {
  readonly label: string;
  readonly path: string;
}

export type ConversationVariant = 'wide' | 'compact';

export interface ConversationCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  /** Omit to hide the numbered list entirely. */
  readonly steps?: readonly string[];
  readonly primary: ConversationAction;
  readonly secondary: ConversationAction;
}

type ConversationBand = Omit<ConversationCopy, 'steps'> & { readonly steps: readonly string[] };

@Component({
  selector: 'app-start-conversation',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon],
  templateUrl: './start-conversation.html',
  styleUrl: './start-conversation.scss',
  host: { '[attr.data-variant]': 'variant()' },
})
export class StartConversation {
  private readonly content = useDictionary(startConversationContent);
  protected readonly arrowIcon = appIcon('arrow-right');

  readonly copy = input<ConversationCopy>();
  readonly variant = input<ConversationVariant>('wide');

  protected readonly band = computed<ConversationBand>(() => {
    const override = this.copy();
    if (override) {
      return { ...override, steps: override.steps ?? [] };
    }

    const content = this.content();
    return {
      eyebrow: content.eyebrow.value,
      title: content.title.value,
      lead: content.lead.value,
      steps: content.steps.map((step) => step.value),
      primary: { label: content.primaryCta.value, path: CONTACT_PATH },
      secondary: { label: content.secondaryCta.value, path: '/partnerships' },
    };
  });
}
