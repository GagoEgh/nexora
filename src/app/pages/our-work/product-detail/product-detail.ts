import { Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { useDictionary, useLocale } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { Reveal } from '../../../shared/motion/reveal';
import { PageIntro } from '../../../shared/ui/page-intro/page-intro';
import {
  StartConversation,
  type ConversationCopy,
} from '../../../shared/ui/start-conversation/start-conversation';
import { appIcon } from '../../../core/icons/icons';
import { CONTACT_PATH, OUR_WORK_SEGMENT } from '../../../core/routing/paths';
import { DocumentMetaOverride } from '../../../core/seo/document-meta-override';
import { ORGANIZATION } from '../../../core/seo/organization';
import productContent from '../products/product.content';
import ourWorkContent from '../our-work.content';
import { isProductId, type ProductId } from '../products/data/product-ids';
import { nextProductId, toProductView, type ProductView } from '../products/data/product-view';

@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink,
    LocalizedPathPipe,
    MatButton,
    MatIcon,
    Reveal,
    PageIntro,
    StartConversation,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly override = inject(DocumentMetaOverride);

  protected readonly content = useDictionary(productContent);
  protected readonly pageContent = useDictionary(ourWorkContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly externalIcon = appIcon('arrow-up-right');
  protected readonly ourWorkPath = `/${OUR_WORK_SEGMENT}`;
  protected readonly contactPath = CONTACT_PATH;

  private readonly params = toSignal(this.route.paramMap, { initialValue: null });

  protected readonly productId = computed<ProductId | null>(() => {
    const slug = this.params()?.get('slug');
    return isProductId(slug) ? slug : null;
  });

  protected readonly product = computed<ProductView | null>(() => {
    const id = this.productId();
    return id === null ? null : toProductView(id, this.content());
  });

  /**
   * Everything after the first photograph. The first is the hero; the rest are the gallery, and
   * today there is no rest - every product carries exactly one image. The section that reads
   * this renders copy alone when it is empty, so adding originals later is a data edit.
   */
  protected readonly gallery = computed(() => this.product()?.photos.slice(1) ?? []);

  protected readonly next = computed<ProductView | null>(() => {
    const id = this.productId();
    return id === null ? null : toProductView(nextProductId(id), this.content());
  });

  protected readonly crumbs = computed(() => {
    const page = this.pageContent();
    return [
      { label: page.breadcrumbHome.value, path: '/' },
      { label: page.title.value, path: this.ourWorkPath },
      { label: this.product()?.name ?? '' },
    ];
  });

  protected readonly conversationCopy = computed<ConversationCopy>(() => {
    const page = this.pageContent();
    const content = this.content();
    return {
      eyebrow: page.eyebrow.value,
      title: page.heading.value,
      lead: page.lead.value,
      primary: { label: content.cta.value, path: CONTACT_PATH },
      secondary: { label: page.title.value, path: this.ourWorkPath },
    };
  });

  constructor() {
    // `provideDocumentMeta` rewrites title and description on every navigation, so a component
    // that set them directly would be overwritten. It reads this override instead, which keeps
    // one writer for the document head.
    effect(() => {
      const product = this.product();
      this.override.set(
        product
          ? {
              // Several products are brand names that read the same in all three locales, so a
              // bare name would ship fifty-seven pages sharing nineteen titles between their
              // own hreflang alternates. The category is translated and makes each one its own.
              title: `${product.name} — ${product.category} | ${ORGANIZATION.name}`,
              description: product.hook,
              breadcrumb: product.name,
            }
          : undefined,
      );
    });

    // An unknown slug is a 404, not a blank page. Only the known slugs are prerendered, so this
    // is reached by a hand-typed or stale URL.
    effect(() => {
      if (this.params() !== null && this.productId() === null) {
        void this.router.navigate(['/not-found'], { skipLocationChange: true });
      }
    });

    inject(DestroyRef).onDestroy(() => this.override.set(undefined));
  }
}
