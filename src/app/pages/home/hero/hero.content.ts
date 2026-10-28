import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const heroContent = {
  key: 'hero',
  content: {
    eyebrow: t({
      en: 'Technology development & AI solutions partner',
      hy: 'Տեխնոլոգիաների մշակման և AI լուծումների գործընկեր',
      ru: 'Партнёр по разработке технологий и созданию AI-решений',
    }),
    eyebrowShort: t({
      en: 'Technology & AI solutions partner',
      hy: 'Տեխնոլոգիական և AI լուծումների գործընկեր',
      ru: 'Партнёр в области технологий и AI-решений',
    }),
    title: t({
      en: 'Engineering Digital Solutions That Move Business Forward.',
      hy: 'Մշակում ենք թվային լուծումներ, որոնք առաջ են տանում բիզնեսը։',
      ru: 'Создаём цифровые решения, которые двигают бизнес вперёд.',
    }),
    lead: t({
      en: 'Nexora brings together Senior and Senior+ engineering expertise to build custom software, AI-powered solutions, web and mobile applications, and reliable technology infrastructure.',
      hy: 'Nexora-ն միավորում է Senior և Senior+ մակարդակի ինժեներների փորձառությունը՝ անհատական ծրագրային լուծումներ, AI-ի վրա հիմնված համակարգեր, վեբ և բջջային հավելվածներ ու հուսալի տեխնոլոգիական ենթակառուցվածքներ մշակելու համար։',
      ru: 'Nexora объединяет опыт инженеров уровня Senior и Senior+ для разработки программного обеспечения на заказ, решений на базе AI, веб- и мобильных приложений, а также надёжной технологической инфраструктуры.',
    }),
    primaryCta: t({
      en: 'Discuss Your Project',
      hy: 'Քննարկենք ձեր նախագիծը',
      ru: 'Обсудить ваш проект',
    }),
    secondaryCta: t({
      en: 'Explore Our Services',
      hy: 'Ծանոթացեք մեր ծառայություններին',
      ru: 'Ознакомиться с нашими услугами',
    }),
    trust: [
      t({
        en: 'Senior & Senior+ engineers only',
        hy: 'Միայն Senior և Senior+ մակարդակի ինժեներներ',
        ru: 'Только инженеры уровня Senior и Senior+',
      }),
      t({
        en: 'End-to-end delivery',
        hy: 'Նախագծի իրականացում՝ սկզբից մինչև վերջ',
        ru: 'Полный цикл реализации проекта',
      }),
      t({
        en: 'Armenia & international',
        hy: 'Հայաստան և միջազգային շուկաներ',
        ru: 'Армения и международные рынки',
      }),
    ],
    illustration: {
      windowTitle: 'nexora / system-architecture',
      tiers: [
        [
          {
            icon: 'code' satisfies AppIconName,
            label: t({
              en: 'Web App',
              hy: 'Վեբ հավելված',
              ru: 'Веб-приложение',
            }),
            shortLabel: t({
              en: 'Web App',
              hy: 'Վեբ',
              ru: 'Веб',
            }),
            meta: 'next.js',
            dark: false,
          },
          {
            icon: 'plug' satisfies AppIconName,
            label: 'CRM / ERP',
            shortLabel: 'CRM / ERP',
            meta: 'rest · webhooks',
            dark: false,
          },
        ],
        [
          {
            icon: 'sparkle' satisfies AppIconName,
            label: t({
              en: 'AI Orchestrator',
              hy: 'AI համակարգերի համակարգող',
              ru: 'Оркестратор AI-систем',
            }),
            shortLabel: t({
              en: 'AI Orchestrator',
              hy: 'AI համակարգող',
              ru: 'AI-оркестратор',
            }),
            meta: 'agents · rag',
            dark: true,
          },
        ],
        [
          {
            icon: 'smartphone' satisfies AppIconName,
            label: t({
              en: 'Mobile App',
              hy: 'Բջջային հավելված',
              ru: 'Мобильное приложение',
            }),
            shortLabel: t({
              en: 'Mobile',
              hy: 'Բջջային',
              ru: 'Мобильное',
            }),
            meta: 'ios · android',
            dark: false,
          },
          {
            icon: 'database' satisfies AppIconName,
            label: t({
              en: 'Knowledge Base',
              hy: 'Գիտելիքների բազա',
              ru: 'База знаний',
            }),
            shortLabel: t({
              en: 'Knowledge',
              hy: 'Գիտելիքներ',
              ru: 'Знания',
            }),
            meta: 'vector search',
            dark: false,
          },
        ],
      ],
      pipeline: ['build', 'test', 'deploy', 'monitor'],
      workflow: {
        title: t({
          en: 'Agent workflow',
          hy: 'AI գործակալի աշխատանքային գործընթաց',
          ru: 'Рабочий процесс AI-агента',
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
              hy: 'Ստանալ անհրաժեշտ համատեքստը CRM-ից',
              ru: 'Получить необходимые данные из CRM',
            }),
            done: true,
          },
          {
            label: t({
              en: 'Draft reply for review',
              hy: 'Պատրաստել պատասխանի նախագիծը՝ ստուգման համար',
              ru: 'Подготовить черновик ответа для проверки',
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
} as const satisfies Dictionary;

export default heroContent;
