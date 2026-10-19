import { t, type Dictionary } from 'intlayer';

const heroContent = {
  key: 'hero',
  content: {
    eyebrow: t({
      en: 'Technology development & AI solutions partner',
      hy: 'Տեխնոլոգիական մշակման և AI լուծումների գործընկեր',
      ru: 'Партнёр по разработке технологий и AI-решений',
    }),
    eyebrowShort: t({
      en: 'Technology & AI solutions partner',
      hy: 'Տեխնոլոգիական և AI լուծումների գործընկեր',
      ru: 'Партнёр по технологиям и AI-решениям',
    }),
    title: t({
      en: 'Engineering Digital Solutions That Move Business Forward.',
      hy: 'Թվային լուծումներ, որոնք առաջ են տանում բիզնեսը։',
      ru: 'Создаём цифровые решения, которые двигают бизнес вперёд.',
    }),
    lead: t({
      en: 'Nexora brings together Senior and Senior+ engineering expertise to build custom software, AI-powered solutions, web and mobile applications, and reliable technology infrastructure.',
      hy: 'Nexora-ն միավորում է Senior և Senior+ ինժեներական փորձը՝ ստեղծելու անհատական ծրագրային ապահովում, AI լուծումներ, վեբ և մոբայլ հավելվածներ և հուսալի տեխնոլոգիական ենթակառուցվածք։',
      ru: 'Nexora объединяет инженерную экспертизу уровня Senior и Senior+, чтобы создавать заказное ПО, решения на основе AI, веб- и мобильные приложения и надёжную технологическую инфраструктуру.',
    }),
    primaryCta: t({
      en: 'Discuss Your Project',
      hy: 'Քննարկել ձեր նախագիծը',
      ru: 'Обсудить ваш проект',
    }),
    secondaryCta: t({
      en: 'Explore Our Services',
      hy: 'Ծանոթանալ ծառայություններին',
      ru: 'Наши услуги',
    }),
    trust: [
      t({
        en: 'Senior & Senior+ engineers only',
        hy: 'Միայն Senior և Senior+ ինժեներներ',
        ru: 'Только Senior и Senior+ инженеры',
      }),
      t({ en: 'End-to-end delivery', hy: 'Ամբողջական մատակարարում', ru: 'Полный цикл разработки' }),
      t({
        en: 'Armenia & international',
        hy: 'Հայաստան և միջազգային',
        ru: 'Армения и международные проекты',
      }),
    ],
    illustration: {
      windowTitle: 'nexora / system-architecture',
      tiers: [
        [
          {
            icon: 'code',
            label: t({ en: 'Web App', hy: 'Վեբ հավելված', ru: 'Веб-приложение' }),
            shortLabel: t({ en: 'Web App', hy: 'Վեբ', ru: 'Веб' }),
            meta: 'next.js',
            dark: false,
          },
          {
            icon: 'plug',
            label: 'CRM / ERP',
            shortLabel: 'CRM / ERP',
            meta: 'rest · webhooks',
            dark: false,
          },
        ],
        [
          {
            icon: 'sparkle',
            label: t({ en: 'AI Orchestrator', hy: 'AI նվագախումբ', ru: 'AI-оркестратор' }),
            shortLabel: t({ en: 'AI Orchestrator', hy: 'AI նվագախումբ', ru: 'AI-оркестратор' }),
            meta: 'agents · rag',
            dark: true,
          },
        ],
        [
          {
            icon: 'smartphone',
            label: t({ en: 'Mobile App', hy: 'Մոբայլ հավելված', ru: 'Мобильное приложение' }),
            shortLabel: t({ en: 'Mobile', hy: 'Մոբայլ', ru: 'Мобильное' }),
            meta: 'ios · android',
            dark: false,
          },
          {
            icon: 'database',
            label: t({ en: 'Knowledge Base', hy: 'Գիտելիքների բազա', ru: 'База знаний' }),
            shortLabel: t({ en: 'Knowledge', hy: 'Գիտելիք', ru: 'Знания' }),
            meta: 'vector search',
            dark: false,
          },
        ],
      ],
      pipeline: ['build', 'test', 'deploy', 'monitor'],
      workflow: {
        title: t({
          en: 'Agent workflow',
          hy: 'Գործակալի աշխատահոսք',
          ru: 'Рабочий процесс агента',
        }),
        steps: [
          {
            label: t({
              en: 'Classify inbound request',
              hy: 'Դասակարգել մուտքային հարցումը',
              ru: 'Классифицировать входящий запрос',
            }),
            done: true,
          },
          {
            label: t({
              en: 'Retrieve context from CRM',
              hy: 'Ստանալ համատեքստը CRM-ից',
              ru: 'Получить контекст из CRM',
            }),
            done: true,
          },
          {
            label: t({
              en: 'Draft reply for review',
              hy: 'Պատրաստել պատասխանի նախագիծը',
              ru: 'Подготовить черновик ответа',
            }),
            done: false,
          },
        ],
      },
      request: {
        method: 'POST',
        path: '/v1/automations/route',
        status: '200',
        body: '{ owner: "sales-eu" }',
      },
    },
  },
} satisfies Dictionary;

export default heroContent;
