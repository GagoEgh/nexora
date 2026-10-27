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
      hy: '15 ծառայություն՝ ծրագրային ապահովման ողջ կենսացիկլի համար։',
      ru: '15 услуг на всех этапах жизненного цикла программного обеспечения.',
    }),
    lead: t({
      en: 'From interface design to AI agents and production infrastructure. Use a single service, or combine several within one project and one senior team.',
      hy: 'Ինտերֆեյսների նախագծումից մինչև AI գործակալներ և արտադրական ենթակառուցվածքներ։ Ընտրեք մեկ ծառայություն կամ համադրեք մի քանիսը մեկ նախագծի շրջանակում՝ աշխատելով փորձառու մասնագետներից կազմված միասնական թիմի հետ։',
      ru: 'От проектирования интерфейсов до AI-агентов и производственной инфраструктуры. Выберите одну услугу или объедините несколько в рамках одного проекта, работая с единой командой опытных специалистов.',
    }),
    categoryNavLabel: t({
      en: 'Service categories',
      hy: 'Ծառայությունների կատեգորիաներ',
      ru: 'Категории услуг',
    }),
    filterLabel: t({
      en: 'Filter services by category',
      hy: 'Զտել ծառայություններն ըստ կատեգորիայի',
      ru: 'Фильтровать услуги по категориям',
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
      hy: 'Չգիտե՞ք՝ որ ծառայությունն ընտրել։',
      ru: 'Не знаете, какую услугу выбрать?',
    }),
    ctaText: t({
      en: 'Start from the business problem instead — each solution maps to the services that address it.',
      hy: 'Սկսեք ձեր բիզնես խնդրից․ յուրաքանչյուր լուծում ներառում է այն ծառայությունները, որոնք օգնում են լուծել այդ խնդիրը։',
      ru: 'Начните с бизнес-задачи: для каждого решения подобраны услуги, которые помогают её решить.',
    }),
    ctaLabel: t({
      en: 'Browse solutions',
      hy: 'Դիտել լուծումները',
      ru: 'Посмотреть решения',
    }),
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք քննարկումը',
        ru: 'Начнём обсуждение',
      }),
      title: t({
        en: 'Need several services in one project?',
        hy: 'Մեկ նախագծի համար մի քանի ծառայությո՞ւն է անհրաժեշտ։',
        ru: 'Нужно несколько услуг в рамках одного проекта?',
      }),
      lead: t({
        en: 'Most projects combine disciplines — design, backend, AI and infrastructure. Describe the outcome you need and we’ll suggest the right mix.',
        hy: 'Նախագծերի մեծ մասը համադրում է տարբեր ուղղություններ՝ դիզայն, backend, AI և ենթակառուցվածքներ։ Նկարագրեք ձեզ անհրաժեշտ արդյունքը, և մենք կառաջարկենք ծառայությունների օպտիմալ համադրությունը։',
        ru: 'Большинство проектов объединяют несколько направлений: дизайн, backend, AI и инфраструктуру. Опишите желаемый результат, и мы предложим оптимальное сочетание услуг.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկել ձեր նախագիծը',
        ru: 'Обсудить ваш проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ծանոթանալ մեր ծառայություններին',
        ru: 'Ознакомиться с нашими услугами',
      }),
    },
    categories: {
      'design-product': {
        icon: 'pen-tool' satisfies AppIconName,
        label: t({ en: 'Design & Product', hy: 'Դիզայն և պրոդուկտ', ru: 'Дизайн и продукт' }),
        description: t({
          en: 'Interfaces and product design that make complex software clear and usable.',
          hy: 'Ինտերֆեյսների և պրոդուկտի նախագծում, որը բարդ ծրագրային համակարգերը դարձնում է հասկանալի և հարմար օգտագործման համար։',
          ru: 'Проектирование интерфейсов и продуктов, которое делает сложные программные системы понятными и удобными.',
        }),
      },
      'software-engineering': {
        icon: 'code' satisfies AppIconName,
        label: t({
          en: 'Software Engineering',
          hy: 'Ծրագրային ապահովման մշակում',
          ru: 'Разработка ПО',
        }),
        description: t({
          en: 'Web, mobile, custom and SaaS software — plus the backends and integrations behind them.',
          hy: 'Վեբ և բջջային հավելվածներ, անհատական ծրագրային լուծումներ և SaaS պրոդուկտներ՝ դրանց backend համակարգերի և ինտեգրումների հետ միասին։',
          ru: 'Веб- и мобильные приложения, заказные программные решения и SaaS-продукты вместе с backend-системами и интеграциями.',
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
          hy: 'Գործնական AI գործառույթներ, AI գործակալներ և արհեստական բանականությամբ կատարելագործված ինժեներական գործընթացներ։',
          ru: 'Практические AI-функции, AI-агенты и инженерные процессы с использованием искусственного интеллекта.',
        }),
      },
      'infrastructure-operations': {
        icon: 'server' satisfies AppIconName,
        label: t({
          en: 'Infrastructure & Operations',
          hy: 'Ենթակառուցվածքներ և շահագործում',
          ru: 'Инфраструктура и эксплуатация',
        }),
        description: t({
          en: 'The servers, pipelines and support that keep software reliable after launch.',
          hy: 'Սերվերներ, ավտոմատացված գործընթացներ և տեխնիկական աջակցություն՝ ծրագրային համակարգերի հուսալի աշխատանքն ապահովելու համար նաև գործարկումից հետո։',
          ru: 'Серверы, автоматизированные процессы и техническая поддержка, обеспечивающие надёжную работу ПО после запуска.',
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
          hy: 'Փորձառու մասնագետների ներգրավում ձեր թիմի կամ հաճախորդների նախագծերում՝ ձեր զարգացման պլանի կամ ձեր ապրանքանիշի ներքո։',
          ru: 'Привлечение опытных специалистов для вашей команды или проектов ваших клиентов — по вашему плану развития или под вашим брендом.',
        }),
      },
    },
  },
} as const satisfies Dictionary;

export default servicesContent;
