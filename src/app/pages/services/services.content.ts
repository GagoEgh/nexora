import { plural, t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';

const servicesContent = {
  key: 'services',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    eyebrow: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    heading: t({
      en: 'Fifteen services across the full software lifecycle.',
      hy: 'Տասնհինգ ծառայություն՝ ծրագրային ապահովման ողջ կենսափուլի ընթացքում։',
      ru: 'Пятнадцать услуг на всём жизненном цикле программного обеспечения.',
    }),
    lead: t({
      en: 'From interface design to AI agents and production infrastructure. Use a single service, or combine several within one project and one senior team.',
      hy: 'Ինտերֆեյսի դիզայնից մինչև AI գործակալներ և արտադրական ենթակառուցվածք։ Օգտագործեք մեկ ծառայություն կամ համատեղեք մի քանիսը մեկ նախագծի և մեկ senior թիմի շրջանակում։',
      ru: 'От дизайна интерфейсов до AI-агентов и production-инфраструктуры. Используйте одну услугу или объедините несколько в рамках одного проекта и одной senior-команды.',
    }),
    categoryNavLabel: t({
      en: 'Service categories',
      hy: 'Ծառայությունների կատեգորիաներ',
      ru: 'Категории услуг',
    }),
    filterLabel: t({
      en: 'Filter services by category',
      hy: 'Զտել ծառայությունները ըստ կատեգորիայի',
      ru: 'Фильтровать услуги по категории',
    }),
    allServices: t({ en: 'All services', hy: 'Բոլոր ծառայությունները', ru: 'Все услуги' }),
    resultsLabel: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    serviceCount: t({
      en: plural({ one: '{{count}} service', other: '{{count}} services' }),
      hy: plural({ one: '{{count}} ծառայություն', other: '{{count}} ծառայություն' }),
      ru: plural({
        one: '{{count}} услуга',
        few: '{{count}} услуги',
        many: '{{count}} услуг',
        other: '{{count}} услуги',
      }),
    }),
    ctaTitle: t({
      en: 'Not sure which service fits?',
      hy: 'Վստահ չե՞ք, թե որ ծառայությունն է հարմար։',
      ru: 'Не уверены, какая услуга подойдёт?',
    }),
    ctaText: t({
      en: 'Start from the business problem instead — each solution maps to the services that address it.',
      hy: 'Փոխարենը սկսեք բիզնես խնդրից՝ յուրաքանչյուր լուծում կապված է այն ծառայությունների հետ, որոնք անդրադառնում են դրան։',
      ru: 'Начните с бизнес-задачи — каждое решение связано с услугами, которые её закрывают.',
    }),
    ctaLabel: t({
      en: 'Browse solutions',
      hy: 'Դիտել լուծումները',
      ru: 'Смотреть решения',
    }),
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք զրույցը',
        ru: 'Начнём разговор',
      }),
      title: t({
        en: 'Need several services in one project?',
        hy: 'Մեկ նախագծում մի քանի ծառայությո՞ւն է անհրաժեշտ։',
        ru: 'Нужно несколько услуг в одном проекте?',
      }),
      lead: t({
        en: 'Most projects combine disciplines — design, backend, AI and infrastructure. Describe the outcome you need and we’ll suggest the right mix.',
        hy: 'Նախագծերի մեծ մասը համատեղում է ուղղությունները՝ դիզայն, բեքենդ, AI և ենթակառուցվածք։ Նկարագրեք ձեզ անհրաժեշտ արդյունքը, և մենք կառաջարկենք ճիշտ համադրությունը։',
        ru: 'Большинство проектов объединяют дисциплины — дизайн, бэкенд, AI и инфраструктуру. Опишите нужный результат, и мы предложим подходящее сочетание.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ուսումնասիրել մեր ծառայությունները',
        ru: 'Изучить наши услуги',
      }),
    },
    categories: {
      'design-product': {
        icon: 'pen-tool' satisfies AppIconName,
        label: t({ en: 'Design & Product', hy: 'Դիզայն և պրոդուկտ', ru: 'Дизайн и продукт' }),
        description: t({
          en: 'Interfaces and product design that make complex software clear and usable.',
          hy: 'Ինտերֆեյսներ և պրոդուկտի դիզայն, որոնք բարդ ծրագրերը դարձնում են պարզ և հարմար։',
          ru: 'Интерфейсы и продуктовый дизайн, которые делают сложное ПО понятным и удобным.',
        }),
      },
      'software-engineering': {
        icon: 'code' satisfies AppIconName,
        label: t({ en: 'Software Engineering', hy: 'Ծրագրային ինժեներիա', ru: 'Разработка ПО' }),
        description: t({
          en: 'Web, mobile, custom and SaaS software — plus the backends and integrations behind them.',
          hy: 'Վեբ, մոբայլ, անհատական և SaaS ծրագրեր՝ դրանց հետևում կանգնած backend-ների և ինտեգրումների հետ միասին։',
          ru: 'Веб, мобильные, заказные и SaaS-решения — вместе с backend и интеграциями за ними.',
        }),
      },
      'artificial-intelligence': {
        icon: 'sparkle' satisfies AppIconName,
        label: t({
          en: 'Artificial Intelligence',
          hy: 'Արհեստական բանականություն',
          ru: 'Искусственный интеллект',
        }),
        description: t({
          en: 'Practical AI features, agents and AI-assisted engineering workflows.',
          hy: 'Գործնական AI հնարավորություններ, գործակալներ և AI-ով աջակցվող ինժեներական հոսքեր։',
          ru: 'Практичные AI-возможности, агенты и инженерные процессы с поддержкой AI.',
        }),
      },
      'infrastructure-operations': {
        icon: 'server' satisfies AppIconName,
        label: t({
          en: 'Infrastructure & Operations',
          hy: 'Ենթակառուցվածք և շահագործում',
          ru: 'Инфраструктура и эксплуатация',
        }),
        description: t({
          en: 'The servers, pipelines and support that keep software reliable after launch.',
          hy: 'Սերվերներ, pipeline-ներ և աջակցություն, որոնք ծրագիրը պահում են հուսալի թողարկումից հետո։',
          ru: 'Серверы, пайплайны и поддержка, которые держат ПО надёжным после запуска.',
        }),
      },
      'engineering-partnerships': {
        icon: 'users' satisfies AppIconName,
        label: t({
          en: 'Engineering Partnerships',
          hy: 'Ինժեներական գործընկերություն',
          ru: 'Инженерное партнёрство',
        }),
        description: t({
          en: 'Senior capacity for your team or your clients — under your roadmap or your brand.',
          hy: 'Senior հզորություն ձեր թիմի կամ ձեր հաճախորդների համար՝ ձեր ճանապարհային քարտեզով կամ ձեր բրենդով։',
          ru: 'Senior-ресурсы для вашей команды или ваших клиентов — по вашему роадмапу или под вашим брендом.',
        }),
      },
    },
  },
} as const satisfies Dictionary;

export default servicesContent;
