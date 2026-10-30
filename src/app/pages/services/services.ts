import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { useDictionary, useLocale } from 'angular-intlayer';
import { AI_AGENT_PATH, CONTACT_PATH, SOLUTIONS_PATH } from '../../core/routing/paths';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { Reveal } from '../../shared/motion/reveal';
import { scrollToSection } from '../../shared/motion/scroll-to-section';
import { ordinal } from '../../shared/ordinal';
import { IconTile, type IconTileTone } from '../../shared/ui/icon-tile/icon-tile';
import { PageIntro, pageCrumbs } from '../../shared/ui/page-intro/page-intro';
import { ServiceCard, type ServiceCardCopy } from '../../shared/ui/service-card/service-card';
import {
  StartConversation,
  toConversationCopy,
} from '../../shared/ui/start-conversation/start-conversation';
import {
  ALL_SERVICES,
  SERVICE_CATEGORY_IDS,
  type ServiceCategoryId,
  type ServiceCategorySummary,
  type ServiceFilter,
  isServiceCategoryId,
  isServiceFilter,
  serviceSectionId,
} from '../../shared/services-catalogue/service-category';
import { CategoryNav } from './category-nav/category-nav';
import { FilterBar } from './filter-bar/filter-bar';
import servicesCatalogueContent from '../../shared/services-catalogue/services-catalogue.content';
import servicesContent from './services.content';

const CATEGORY_PARAM = 'category';
const ALL = ALL_SERVICES;
const ACCENT_CATEGORY: ServiceCategoryId = 'artificial-intelligence';
const READING_BAND = '-30% 0px -69% 0px';

function categoryTone(category: ServiceCategoryId): IconTileTone {
  return category === ACCENT_CATEGORY ? 'inverse-accent' : 'primary';
}

@Component({
  selector: 'app-services',
  imports: [
    RouterLink,
    LocalizedPathPipe,
    IconTile,
    PageIntro,
    ServiceCard,
    StartConversation,
    CategoryNav,
    FilterBar,
    MatButton,
    MatIcon,
    Reveal,
  ],
  templateUrl: './services.html',
  styleUrl: './services.scss',
  host: { 'data-layout': 'immersive' },
})
export class Services {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly app = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  protected readonly content = useDictionary(servicesContent);
  protected readonly locale = useLocale().locale;
  protected readonly catalogue = useDictionary(servicesCatalogueContent);
  protected readonly sectionId = serviceSectionId;

  private readonly sections = viewChildren<ElementRef<HTMLElement>>('sectionRef');
  private readonly scrolled = signal<ServiceCategoryId>(SERVICE_CATEGORY_IDS[0]);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly filter = computed<ServiceFilter>(() => {
    const value = this.params().get(CATEGORY_PARAM);
    return isServiceFilter(value) ? value : ALL;
  });

  private readonly groups = computed(() => {
    const { categories } = this.content();
    const { items } = this.catalogue();
    return SERVICE_CATEGORY_IDS.map((id, index) => ({
      id,
      icon: categories[id].icon.value,
      label: categories[id].label,
      description: categories[id].description,
      tone: categoryTone(id),
      position: ordinal(index),
      services: items.flatMap((item, order) =>
        item.category.value === id
          ? [
              {
                number: ordinal(order),
                title: item.title.value,
                summary: item.summary.value,
                tags: item.tags.map((tag) => tag.value),
              } satisfies ServiceCardCopy,
            ]
          : [],
      ),
    }));
  });

  protected readonly crumbs = computed(() => pageCrumbs(this.content()));

  protected readonly categoryTotal = ordinal(SERVICE_CATEGORY_IDS.length - 1);

  protected readonly categories = computed<readonly ServiceCategorySummary[]>(() =>
    this.groups().map(({ id, icon, label, services }) => ({
      id,
      icon,
      label: label.value,
      count: services.length,
    })),
  );

  protected readonly ctaArrowIcon = appIcon('arrow-right');
  protected readonly solutionsPath = SOLUTIONS_PATH;

  protected readonly total = computed(() => this.catalogue().items.length);

  protected readonly conversationCopy = computed(() =>
    toConversationCopy(this.content().conversation, CONTACT_PATH, AI_AGENT_PATH),
  );

  protected readonly visibleGroups = computed(() => {
    const filter = this.filter();
    return filter === ALL ? this.groups() : this.groups().filter((group) => group.id === filter);
  });

  protected readonly visibleCount = computed(() =>
    this.visibleGroups().reduce((count, group) => count + group.services.length, 0),
  );

  protected readonly active = computed<ServiceCategoryId>(() => {
    const filter = this.filter();
    return filter === ALL ? this.scrolled() : filter;
  });

  constructor() {
    const view = this.document.defaultView;
    if (!view || !('IntersectionObserver' in view)) {
      return;
    }

    effect((onCleanup) => {
      const elements = this.sections().map((section) => section.nativeElement);
      if (elements.length === 0) {
        return;
      }

      const observer = new view.IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset['category'];
            if (entry.isIntersecting && isServiceCategoryId(id)) {
              this.scrolled.set(id);
            }
          }
        },
        { rootMargin: READING_BAND, threshold: 0 },
      );

      for (const element of elements) {
        observer.observe(element);
      }

      onCleanup(() => observer.disconnect());
    });
  }

  protected onFilterChange(value: ServiceFilter): void {
    void this.applyFilter(value);
  }

  protected async onCategorySelect(category: ServiceCategoryId): Promise<void> {
    if (this.filter() !== ALL && this.filter() !== category) {
      await this.applyFilter(ALL);
      await this.app.whenStable();
    }
    scrollToSection(this.document, serviceSectionId(category));
  }

  private applyFilter(value: ServiceFilter): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CATEGORY_PARAM]: value === ALL ? null : value },
      queryParamsHandling: 'merge',
      scroll: 'manual',
    });
  }
}
