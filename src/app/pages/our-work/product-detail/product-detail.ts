import { Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { SITE_ORIGIN } from '../../../core/seo/site-origin';
import productContent from '../products/product.content';
import ourWorkContent from '../our-work.content';
import { isProductId, type ProductId } from '../products/data/product-ids';
import { nextProductId, toProductView, type ProductView } from '../products/data/product-view';
import { ProductGallery } from './product-gallery/product-gallery';
import { ProductNext } from './product-next/product-next';

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
    ProductGallery,
    ProductNext,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly override = inject(DocumentMetaOverride);
  private readonly origin = inject(SITE_ORIGIN);
  readonly slug = input.required<string>();

  protected readonly content = useDictionary(productContent);
  protected readonly pageContent = useDictionary(ourWorkContent);
  protected readonly locale = useLocale().locale;
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly externalIcon = appIcon('arrow-up-right');
  protected readonly ourWorkPath = `/${OUR_WORK_SEGMENT}`;
  protected readonly contactPath = CONTACT_PATH;

  protected readonly productId = computed<ProductId | null>(() => {
    const slug = this.slug();
    return isProductId(slug) ? slug : null;
  });

  protected readonly product = computed<ProductView | null>(() => {
    const id = this.productId();
    return id === null ? null : toProductView(id, this.content());
  });

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
    effect(() => {
      const product = this.product();
      this.override.set(
        product
          ? {
              title: `${product.name} — ${product.category} | ${ORGANIZATION.name}`,
              description: product.hook,
              breadcrumb: product.name,
              work: {
                name: product.name,
                description: product.hook,
                category: product.category,
                image: `${this.origin}/${product.photos[0].src}`,
                ...(product.url !== undefined ? { url: product.url } : {}),
              },
            }
          : undefined,
      );
    });

    inject(DestroyRef).onDestroy(() => this.override.set(undefined));
  }
}
