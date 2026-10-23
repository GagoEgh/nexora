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
    items: [
      {
        category: 'design-product',
        title: t({
          en: 'Web Design & UI/UX Design',
          hy: 'Վեբ դիզայն և UI/UX դիզայն',
          ru: 'Веб-дизайн и UI/UX-дизайн',
        }),
        summary: t({
          en: 'Research-led interfaces, prototypes and design systems for websites, SaaS products and dashboards.',
          hy: 'Հետազոտության վրա հիմնված ինտերֆեյսներ, նախատիպեր և դիզայն համակարգեր՝ կայքերի, SaaS պրոդուկտների և վահանակների համար։',
          ru: 'Интерфейсы, прототипы и дизайн-системы на основе исследований — для сайтов, SaaS-продуктов и дашбордов.',
        }),
        tags: [
          t({ en: 'Wireframes', hy: 'Վայրֆրեյմներ', ru: 'Вайрфреймы' }),
          t({ en: 'Prototypes', hy: 'Նախատիպեր', ru: 'Прототипы' }),
          t({ en: 'Design systems', hy: 'Դիզայն համակարգեր', ru: 'Дизайн-системы' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({ en: 'Web Development', hy: 'Վեբ մշակում', ru: 'Веб-разработка' }),
        summary: t({
          en: 'Corporate sites, e-commerce, portals and custom dashboards built for performance and integration.',
          hy: 'Կորպորատիվ կայքեր, e-commerce, պորտալներ և անհատական վահանակներ՝ կառուցված արագագործության և ինտեգրման համար։',
          ru: 'Корпоративные сайты, e-commerce, порталы и заказные дашборды, построенные ради производительности и интеграции.',
        }),
        tags: [
          t({ en: 'Corporate sites', hy: 'Կորպորատիվ կայքեր', ru: 'Корпоративные сайты' }),
          t({ en: 'E-commerce', hy: 'E-commerce', ru: 'E-commerce' }),
          t({ en: 'Client portals', hy: 'Հաճախորդային պորտալներ', ru: 'Клиентские порталы' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({
          en: 'Mobile App Development',
          hy: 'Մոբայլ հավելվածների մշակում',
          ru: 'Разработка мобильных приложений',
        }),
        summary: t({
          en: 'iOS, Android and cross-platform apps for customers and internal teams.',
          hy: 'iOS, Android և կրոսպլատֆորմ հավելվածներ հաճախորդների և ներքին թիմերի համար։',
          ru: 'iOS-, Android- и кроссплатформенные приложения для клиентов и внутренних команд.',
        }),
        tags: [
          t({ en: 'iOS', hy: 'iOS', ru: 'iOS' }),
          t({ en: 'Android', hy: 'Android', ru: 'Android' }),
          t({ en: 'Cross-platform', hy: 'Կրոսպլատֆորմ', ru: 'Кроссплатформа' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({
          en: 'Custom Software Development',
          hy: 'Անհատական ծրագրերի մշակում',
          ru: 'Заказная разработка ПО',
        }),
        summary: t({
          en: 'Business applications, MVPs and internal tools designed around your processes.',
          hy: 'Բիզնես հավելվածներ, MVP-ներ և ներքին գործիքներ՝ նախագծված ձեր գործընթացների շուրջ։',
          ru: 'Бизнес-приложения, MVP и внутренние инструменты, спроектированные вокруг ваших процессов.',
        }),
        tags: [
          t({ en: 'MVPs', hy: 'MVP-ներ', ru: 'MVP' }),
          t({ en: 'Internal tools', hy: 'Ներքին գործիքներ', ru: 'Внутренние инструменты' }),
          t({ en: 'B2B platforms', hy: 'B2B հարթակներ', ru: 'B2B-платформы' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({ en: 'SaaS Development', hy: 'SaaS մշակում', ru: 'SaaS-разработка' }),
        summary: t({
          en: 'Multi-tenant products with authentication, subscriptions, payments and admin panels.',
          hy: 'Բազմավարձակալ պրոդուկտներ՝ նույնականացմամբ, բաժանորդագրություններով, վճարումներով և ադմին վահանակներով։',
          ru: 'Мультитенантные продукты с аутентификацией, подписками, платежами и админ-панелями.',
        }),
        tags: [
          t({ en: 'Multi-tenant', hy: 'Բազմավարձակալ', ru: 'Мультитенантность' }),
          t({ en: 'Subscriptions', hy: 'Բաժանորդագրություններ', ru: 'Подписки' }),
          t({ en: 'Analytics', hy: 'Անալիտիկա', ru: 'Аналитика' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({
          en: 'Backend Development & API Integration',
          hy: 'Backend մշակում և API ինտեգրում',
          ru: 'Backend-разработка и интеграция API',
        }),
        summary: t({
          en: 'Server architecture, databases and APIs that connect CRMs, ERPs and payment providers.',
          hy: 'Սերվերային ճարտարապետություն, տվյալների բազաներ և API-ներ, որոնք միացնում են CRM-ները, ERP-ները և վճարային մատակարարներին։',
          ru: 'Серверная архитектура, базы данных и API, связывающие CRM, ERP и платёжных провайдеров.',
        }),
        tags: [
          t({ en: 'REST APIs', hy: 'REST API-ներ', ru: 'REST API' }),
          t({ en: 'Databases', hy: 'Տվյալների բազաներ', ru: 'Базы данных' }),
          t({ en: 'Integrations', hy: 'Ինտեգրումներ', ru: 'Интеграции' }),
        ],
      },
      {
        category: 'software-engineering',
        title: t({
          en: 'Legacy System Modernization',
          hy: 'Հին համակարգերի արդիականացում',
          ru: 'Модернизация legacy-систем',
        }),
        summary: t({
          en: 'Assess, refactor and incrementally evolve older systems without stopping the business.',
          hy: 'Գնահատել, վերակառուցել և աստիճանաբար զարգացնել հին համակարգերը՝ առանց բիզնեսը կանգնեցնելու։',
          ru: 'Оценка, рефакторинг и постепенное развитие старых систем без остановки бизнеса.',
        }),
        tags: [
          t({ en: 'Assessment', hy: 'Գնահատում', ru: 'Аудит' }),
          t({ en: 'Refactoring', hy: 'Ռեֆակտորինգ', ru: 'Рефакторинг' }),
          t({ en: 'API modernization', hy: 'API արդիականացում', ru: 'Модернизация API' }),
        ],
      },
      {
        category: 'artificial-intelligence',
        title: t({
          en: 'AI Development & Integration',
          hy: 'AI մշակում և ինտեգրում',
          ru: 'AI-разработка и интеграция',
        }),
        summary: t({
          en: 'Model API integrations, assistants, RAG and document intelligence inside your software.',
          hy: 'Մոդելների API ինտեգրումներ, օգնականներ, RAG և փաստաթղթերի ինտելեկտ՝ ձեր ծրագրի ներսում։',
          ru: 'Интеграции API моделей, ассистенты, RAG и интеллектуальная обработка документов внутри вашего ПО.',
        }),
        tags: [
          t({ en: 'RAG', hy: 'RAG', ru: 'RAG' }),
          t({ en: 'Assistants', hy: 'Օգնականներ', ru: 'Ассистенты' }),
          t({ en: 'Document AI', hy: 'Փաստաթղթային AI', ru: 'Document AI' }),
        ],
      },
      {
        category: 'artificial-intelligence',
        title: t({
          en: 'AI Agents & Business Automation',
          hy: 'AI գործակալներ և բիզնես ավտոմատացում',
          ru: 'AI-агенты и автоматизация бизнеса',
        }),
        summary: t({
          en: 'Multi-step agents and automations for leads, CRM workflows, documents and reporting.',
          hy: 'Բազմաքայլ գործակալներ և ավտոմատացումներ՝ լիդերի, CRM հոսքերի, փաստաթղթերի և հաշվետվությունների համար։',
          ru: 'Многошаговые агенты и автоматизации для лидов, CRM-процессов, документов и отчётности.',
        }),
        tags: [
          t({ en: 'Agents', hy: 'Գործակալներ', ru: 'Агенты' }),
          t({ en: 'CRM workflows', hy: 'CRM հոսքեր', ru: 'CRM-процессы' }),
          t({ en: 'Routing', hy: 'Ուղղորդում', ru: 'Маршрутизация' }),
        ],
      },
      {
        category: 'artificial-intelligence',
        title: t({
          en: 'Claude & AI Workflow Engineering',
          hy: 'Claude և AI աշխատահոսքերի ինժեներիա',
          ru: 'Claude и инженерия AI-процессов',
        }),
        summary: t({
          en: 'Claude API integration, internal assistants and controlled adoption of AI-assisted development.',
          hy: 'Claude API-ի ինտեգրում, ներքին օգնականներ և AI-ով աջակցվող մշակման վերահսկվող ներդրում։',
          ru: 'Интеграция Claude API, внутренние ассистенты и контролируемое внедрение AI-ассистированной разработки.',
        }),
        tags: [
          t({ en: 'Claude API', hy: 'Claude API', ru: 'Claude API' }),
          t({ en: 'AI-assisted dev', hy: 'AI-ով մշակում', ru: 'AI-ассистированная разработка' }),
          t({ en: 'Governance', hy: 'Կառավարում', ru: 'Контроль' }),
        ],
      },
      {
        category: 'infrastructure-operations',
        title: t({
          en: 'Server Management & Cloud Infrastructure',
          hy: 'Սերվերների կառավարում և ամպային ենթակառուցվածք',
          ru: 'Управление серверами и облачная инфраструктура',
        }),
        summary: t({
          en: 'Linux servers, cloud environments, Docker, monitoring, backups and recovery planning.',
          hy: 'Linux սերվերներ, ամպային միջավայրեր, Docker, մոնիթորինգ, պահուստավորում և վերականգնման պլանավորում։',
          ru: 'Linux-серверы, облачные среды, Docker, мониторинг, резервные копии и планирование восстановления.',
        }),
        tags: [
          t({ en: 'Linux', hy: 'Linux', ru: 'Linux' }),
          t({ en: 'Docker', hy: 'Docker', ru: 'Docker' }),
          t({ en: 'Backups', hy: 'Պահուստավորում', ru: 'Резервные копии' }),
        ],
      },
      {
        category: 'infrastructure-operations',
        title: t({
          en: 'DevOps & Deployment Automation',
          hy: 'DevOps և տեղակայման ավտոմատացում',
          ru: 'DevOps и автоматизация развёртывания',
        }),
        summary: t({
          en: 'CI/CD pipelines, environment configuration and predictable release workflows.',
          hy: 'CI/CD pipeline-ներ, միջավայրերի կարգավորում և կանխատեսելի թողարկման հոսքեր։',
          ru: 'CI/CD-пайплайны, конфигурация окружений и предсказуемые релизные процессы.',
        }),
        tags: [
          t({ en: 'CI/CD', hy: 'CI/CD', ru: 'CI/CD' }),
          t({ en: 'Environments', hy: 'Միջավայրեր', ru: 'Окружения' }),
          t({ en: 'Monitoring', hy: 'Մոնիթորինգ', ru: 'Мониторинг' }),
        ],
      },
      {
        category: 'infrastructure-operations',
        title: t({
          en: 'Software Maintenance & Technical Support',
          hy: 'Ծրագրերի սպասարկում և տեխնիկական աջակցություն',
          ru: 'Сопровождение ПО и техническая поддержка',
        }),
        summary: t({
          en: 'Bug fixes, upgrades, performance work and ongoing development for live systems.',
          hy: 'Սխալների շտկում, թարմացումներ, արագագործության աշխատանք և շարունակական մշակում գործող համակարգերի համար։',
          ru: 'Исправление ошибок, обновления, работа над производительностью и развитие работающих систем.',
        }),
        tags: [
          t({ en: 'Upgrades', hy: 'Թարմացումներ', ru: 'Обновления' }),
          t({ en: 'Performance', hy: 'Արագագործություն', ru: 'Производительность' }),
          t({ en: 'Refactoring', hy: 'Ռեֆակտորինգ', ru: 'Рефакторинг' }),
        ],
      },
      {
        category: 'engineering-partnerships',
        title: t({
          en: 'Dedicated Development Teams',
          hy: 'Նվիրված մշակման թիմեր',
          ru: 'Выделенные команды разработки',
        }),
        summary: t({
          en: 'Senior frontend, backend, mobile, AI, DevOps, UI/UX and QA specialists for your roadmap.',
          hy: 'Senior frontend, backend, մոբայլ, AI, DevOps, UI/UX և QA մասնագետներ ձեր ճանապարհային քարտեզի համար։',
          ru: 'Senior-специалисты frontend, backend, mobile, AI, DevOps, UI/UX и QA для вашего роадмапа.',
        }),
        tags: [
          t({ en: 'Senior specialists', hy: 'Senior մասնագետներ', ru: 'Senior-специалисты' }),
          t({ en: 'Tech leads', hy: 'Tech lead-եր', ru: 'Тимлиды' }),
          t({ en: 'QA', hy: 'QA', ru: 'QA' }),
        ],
      },
      {
        category: 'engineering-partnerships',
        title: t({
          en: 'White-Label Development',
          hy: 'White-label մշակում',
          ru: 'White-label разработка',
        }),
        summary: t({
          en: 'Technical execution for agencies and partners under agreed branding and communication.',
          hy: 'Տեխնիկական կատարում գործակալությունների և գործընկերների համար՝ համաձայնեցված բրենդավորմամբ և հաղորդակցությամբ։',
          ru: 'Техническое исполнение для агентств и партнёров под согласованным брендом и коммуникацией.',
        }),
        tags: [
          t({ en: 'Agencies', hy: 'Գործակալություններ', ru: 'Агентства' }),
          t({ en: 'Partners', hy: 'Գործընկերներ', ru: 'Партнёры' }),
          t({ en: 'Full-stack', hy: 'Full-stack', ru: 'Full-stack' }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default servicesContent;
