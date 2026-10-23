import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatChipListbox, type MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { AI_AGENT_PATH } from '../../app.routes';
import { LocalizedPathPipe } from '../../core/i18n/localized-path.pipe';
import { appIcon } from '../../core/icons/icons';
import { ordinal } from '../../shared/ordinal';
import { IconTile, type IconTileTone } from '../../shared/ui/icon-tile/icon-tile';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import {
  type ConversationCopy,
  StartConversation,
} from '../../shared/ui/start-conversation/start-conversation';
import servicesContent from './services.content';

export const SERVICE_CATEGORY_IDS = [
  'design-product',
  'software-engineering',
  'artificial-intelligence',
  'infrastructure-operations',
  'engineering-partnerships',
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];
export type ServiceFilter = ServiceCategoryId | 'all';

const CATEGORY_PARAM = 'category';
const ALL = 'all';
const ACTIVE_LINE = 0.3;
const ACCENT_CATEGORY: ServiceCategoryId = 'artificial-intelligence';

function categoryTone(category: ServiceCategoryId): IconTileTone {
  return category === ACCENT_CATEGORY ? 'inverse-accent' : 'primary';
}

export function isServiceCategoryId(value: unknown): value is ServiceCategoryId {
  return typeof value === 'string' && (SERVICE_CATEGORY_IDS as readonly string[]).includes(value);
}

export function isServiceFilter(value: unknown): value is ServiceFilter {
  return value === ALL || isServiceCategoryId(value);
}

export function serviceSectionId(category: ServiceCategoryId): string {
  return `services-${category}`;
}

function sectionInView(elements: readonly HTMLElement[], line: number): string | undefined {
  let current = elements[0];
  for (const element of elements) {
    if (element.getBoundingClientRect().top <= line) {
      current = element;
    }
  }
  return current?.dataset['category'];
}

@Component({
  selector: 'app-services',
  imports: [
    RouterLink,
    LocalizedPathPipe,
    IconTile,
    PageIntro,
    StartConversation,
    MatButton,
    MatChipListbox,
    MatChipOption,
    MatIcon,
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
  protected readonly all = ALL;
  protected readonly sectionId = serviceSectionId;
  protected readonly chevronIcon = appIcon('chevron-down');

  private readonly sections = viewChildren<ElementRef<HTMLElement>>('sectionRef');
  private readonly chipListbox = viewChild(MatChipListbox);
  private readonly scrolled = signal<ServiceCategoryId>(SERVICE_CATEGORY_IDS[0]);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly filter = computed<ServiceFilter>(() => {
    const value = this.params().get(CATEGORY_PARAM);
    return isServiceFilter(value) ? value : ALL;
  });

  private readonly groups = computed(() => {
    const { categories, items } = this.content();
    return SERVICE_CATEGORY_IDS.map((id, index) => ({
      id,
      icon: categories[id].icon.value,
      label: categories[id].label,
      description: categories[id].description,
      tone: categoryTone(id),
      position: ordinal(index),
      services: items.flatMap((item, order) =>
        item.category.value === id ? [{ ...item, number: ordinal(order) }] : [],
      ),
    }));
  });

  protected readonly crumbs = computed<readonly PageIntroCrumb[]>(() => {
    const copy = this.content();
    return [{ label: copy.breadcrumbHome.value, path: '/' }, { label: copy.title.value }];
  });

  protected readonly categoryTotal = ordinal(SERVICE_CATEGORY_IDS.length - 1);

  protected readonly categories = computed(() =>
    this.groups().map(({ id, icon, label, services }) => ({
      id,
      icon,
      label,
      count: services.length,
    })),
  );

  protected readonly arrowIcon = appIcon('arrow-up-right');
  protected readonly ctaArrowIcon = appIcon('arrow-right');

  protected readonly total = computed(() => this.content().items.length);

  protected readonly conversationCopy = computed<ConversationCopy>(() => {
    const copy = this.content().conversation;
    return {
      eyebrow: copy.eyebrow.value,
      title: copy.title.value,
      lead: copy.lead.value,
      primary: { label: copy.primaryCta.value, path: '/contact' },
      secondary: { label: copy.secondaryCta.value, path: AI_AGENT_PATH },
    };
  });

  protected readonly visibleGroups = computed(() => {
    const filter = this.filter();
    return filter === ALL ? this.groups() : this.groups().filter((group) => group.id === filter);
  });

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

      const sync = (): void => {
        const id = sectionInView(elements, view.innerHeight * ACTIVE_LINE);
        if (isServiceCategoryId(id)) {
          this.scrolled.set(id);
        }
      };

      const observer = new view.IntersectionObserver(sync, { threshold: [0, 0.5, 1] });
      for (const element of elements) {
        observer.observe(element);
      }
      view.addEventListener('resize', sync, { passive: true });
      sync();

      onCleanup(() => {
        observer.disconnect();
        view.removeEventListener('resize', sync);
      });
    });
  }

  protected onChipChange(change: MatChipListboxChange): void {
    if (isServiceFilter(change.value)) {
      void this.applyFilter(change.value);
      return;
    }

    const listbox = this.chipListbox();
    if (listbox) {
      listbox.value = this.filter();
    }
  }

  protected onSelectChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement && isServiceFilter(target.value)) {
      void this.applyFilter(target.value);
    }
  }

  protected async onCategoryClick(event: Event, category: ServiceCategoryId): Promise<void> {
    event.preventDefault();
    if (this.filter() !== ALL && this.filter() !== category) {
      await this.applyFilter(ALL);
      await this.app.whenStable();
    }
    this.document
      .getElementById(serviceSectionId(category))
      ?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
  }

  private applyFilter(value: ServiceFilter): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CATEGORY_PARAM]: value === ALL ? null : value },
      queryParamsHandling: 'merge',
      scroll: 'manual',
    });
  }

  private scrollBehavior(): ScrollBehavior {
    return this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
  }
}
