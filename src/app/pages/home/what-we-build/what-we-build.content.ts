import { t, type Dictionary } from 'intlayer';
import type { WhatWeBuildIllustrationKind } from './illustration/what-we-build-illustration';

const whatWeBuildContent = {
  key: 'what-we-build',
  content: {
    eyebrow: t({
      en: 'What we build',
      hy: 'Ինչ ենք մենք ստեղծում',
      ru: 'Что мы создаём',
    }),
    title: t({
      en: 'Systems shaped around how your business runs.',
      hy: 'Համակարգեր, որոնք հարմարեցված են ձեր բիզնեսի աշխատանքային գործընթացներին։',
      ru: 'Системы, адаптированные под процессы вашего бизнеса.',
    }),
    intro: t({
      en: 'Representative categories of software we design and engineer. Every build starts from your processes, data and the tools you already rely on.',
      hy: 'Ծրագրային լուծումների հիմնական տեսակները, որոնք մենք նախագծում և մշակում ենք։ Յուրաքանչյուր նախագիծ սկսվում է ձեր բիզնես գործընթացների, տվյալների և արդեն օգտագործվող գործիքների ուսումնասիրությունից։',
      ru: 'Основные категории программных решений, которые мы проектируем и разрабатываем. Каждый проект начинается с изучения ваших бизнес-процессов, данных и инструментов, которыми вы уже пользуетесь.',
    }),
    note: t({
      en: 'Illustrations are conceptual and do not represent specific client projects.',
      hy: 'Պատկերազարդումները հայեցակարգային են և չեն ներկայացնում որևէ կոնկրետ հաճախորդի նախագիծ։',
      ru: 'Иллюстрации носят концептуальный характер и не представляют конкретные проекты клиентов.',
    }),
    items: [
      {
        illustration: 'saas' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'SaaS Platforms',
          hy: 'SaaS հարթակներ',
          ru: 'SaaS-платформы',
        }),
        description: t({
          en: 'Multi-tenant products with subscriptions, roles, billing and admin tooling.',
          hy: 'Բազմահաճախորդային ճարտարապետությամբ ծրագրային արտադրանքներ՝ բաժանորդագրությունների, օգտատերերի դերերի, վճարումների և կառավարման գործիքների աջակցությամբ։',
          ru: 'Программные продукты с поддержкой нескольких клиентов в рамках одной системы, включая подписки, роли пользователей, расчёты и инструменты администрирования.',
        }),
      },
      {
        illustration: 'crm-erp' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'CRM & ERP Systems',
          hy: 'CRM և ERP համակարգեր',
          ru: 'CRM- и ERP-системы',
        }),
        description: t({
          en: 'Custom or extended systems that match how your teams sell and operate.',
          hy: 'Անհատական կամ ընդլայնված համակարգեր, որոնք համապատասխանում են ձեր թիմերի վաճառքի և գործառնական աշխատանքների առանձնահատկություններին։',
          ru: 'Разрабатываем индивидуальные или расширяем существующие системы с учётом особенностей продаж и операционной деятельности ваших команд.',
        }),
      },
      {
        illustration: 'web' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'Web Applications',
          hy: 'Վեբ հավելվածներ',
          ru: 'Веб-приложения',
        }),
        description: t({
          en: 'Fast, accessible applications for customers, partners and staff.',
          hy: 'Արագագործ և մատչելի վեբ հավելվածներ հաճախորդների, գործընկերների և աշխատակիցների համար։',
          ru: 'Быстрые и доступные веб-приложения для клиентов, партнёров и сотрудников.',
        }),
      },
      {
        illustration: 'mobile' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'Mobile Applications',
          hy: 'Բջջային հավելվածներ',
          ru: 'Мобильные приложения',
        }),
        description: t({
          en: 'Native and cross-platform apps connected to your backend and services.',
          hy: 'Նեյթիվ և բազմահարթակ բջջային հավելվածներ՝ ինտեգրված ձեր backend համակարգի և ծառայությունների հետ։',
          ru: 'Нативные и кроссплатформенные мобильные приложения, интегрированные с вашим backend и сервисами.',
        }),
      },
      {
        illustration: 'ai' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'AI Assistants & Agents',
          hy: 'AI օգնականներ և գործակալներ',
          ru: 'AI-ассистенты и агенты',
        }),
        description: t({
          en: 'Assistants and multi-step agents grounded in your own data and tools.',
          hy: 'AI օգնականներ և բազմաքայլ գործակալներ, որոնք աշխատում են ձեր տվյալների և գործիքների հիման վրա։',
          ru: 'AI-ассистенты и многоэтапные агенты, работающие на основе ваших собственных данных и инструментов.',
        }),
      },
      {
        illustration: 'automation' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'Business Automation Platforms',
          hy: 'Բիզնես գործընթացների ավտոմատացման հարթակներ',
          ru: 'Платформы автоматизации бизнес-процессов',
        }),
        description: t({
          en: 'Workflows that move data and decisions between systems without manual steps.',
          hy: 'Աշխատանքային գործընթացներ, որոնք տվյալներն ու որոշումները փոխանցում են համակարգերի միջև՝ նվազեցնելով ձեռքով կատարվող գործողությունների անհրաժեշտությունը։',
          ru: 'Рабочие процессы, которые обеспечивают передачу данных и решений между системами без необходимости ручного выполнения операций.',
        }),
      },
      {
        illustration: 'portal' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'B2B Portals',
          hy: 'B2B պորտալներ',
          ru: 'B2B-порталы',
        }),
        description: t({
          en: 'Secure self-service portals for clients, distributors and partners.',
          hy: 'Անվտանգ ինքնասպասարկման պորտալներ հաճախորդների, դիստրիբյուտորների և գործընկերների համար։',
          ru: 'Безопасные порталы самообслуживания для клиентов, дистрибьюторов и партнёров.',
        }),
      },
      {
        illustration: 'internal-tools' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'Internal Business Tools',
          hy: 'Ներքին բիզնես գործիքներ',
          ru: 'Внутренние бизнес-инструменты',
        }),
        description: t({
          en: 'Dashboards and back-office tools that replace spreadsheets and email chains.',
          hy: 'Տվյալների վահանակներ և ներքին կառավարման գործիքներ, որոնք փոխարինում են աղյուսակներին ու էլեկտրոնային նամակների երկար շղթաներին։',
          ru: 'Панели мониторинга и внутренние инструменты управления, заменяющие электронные таблицы и длинные цепочки писем.',
        }),
      },
      {
        illustration: 'api' satisfies WhatWeBuildIllustrationKind,
        title: t({
          en: 'API-Connected Systems',
          hy: 'API-ների միջոցով ինտեգրված համակարգեր',
          ru: 'Системы с интеграцией через API',
        }),
        description: t({
          en: 'Integrations and middleware that connect the tools you already use.',
          hy: 'Ինտեգրումներ և միջանկյալ ծրագրային լուծումներ, որոնք կապում են ձեր արդեն օգտագործվող գործիքներն ու համակարգերը։',
          ru: 'Интеграции и промежуточное программное обеспечение, объединяющие инструменты и системы, которыми вы уже пользуетесь.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default whatWeBuildContent;
