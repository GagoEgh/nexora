import { t, type Dictionary } from 'intlayer';

const aiAgentContent = {
  key: 'ai-agent',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    breadcrumbServices: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    title: t({
      en: 'AI Agents & Business Automation',
      hy: 'AI գործակալներ և բիզնես ավտոմատացում',
      ru: 'AI-агенты и автоматизация бизнеса',
    }),
    eyebrow: t({
      en: 'Artificial Intelligence · Service 09',
      hy: 'Արհեստական բանականություն · Ծառայություն 09',
      ru: 'Искусственный интеллект · Услуга 09',
    }),
    lead: t({
      en: 'Automate the repetitive, multi-step work between your systems — with agents that classify, retrieve, decide and act inside clear guardrails.',
      hy: 'Ավտոմատացրեք ձեր համակարգերի միջև կրկնվող, բազմաքայլ աշխատանքը՝ գործակալներով, որոնք դասակարգում, որոնում, որոշում և գործում են հստակ սահմանների ներսում։',
      ru: 'Автоматизируйте повторяющуюся многошаговую работу между вашими системами — с агентами, которые классифицируют, находят, решают и действуют в чётких рамках.',
    }),
    primaryCta: t({
      en: 'Discuss this service',
      hy: 'Քննարկել այս ծառայությունը',
      ru: 'Обсудить услугу',
    }),
    secondaryCta: t({
      en: 'See related solutions',
      hy: 'Տեսնել հարակից լուծումները',
      ru: 'Смотреть связанные решения',
    }),

    conversation: {
      eyebrow: t({
        en: 'Discuss this service',
        hy: 'Քննարկենք այս ծառայությունը',
        ru: 'Обсудим эту услугу',
      }),
      title: t({
        en: 'Have a process you’d like to automate?',
        hy: 'Ունե՞ք գործընթաց, որը ցանկանում եք ավտոմատացնել։',
        ru: 'Есть процесс, который вы хотите автоматизировать?',
      }),
      lead: t({
        en: 'Describe the workflow, the tools involved and where it slows you down. We’ll come back with a practical first step.',
        hy: 'Նկարագրեք աշխատահոսքը, ներգրավված գործիքները և այն, թե որտեղ է այն դանդաղեցնում ձեզ։ Մենք կվերադառնանք գործնական առաջին քայլով։',
        ru: 'Опишите рабочий процесс, используемые инструменты и то, где он вас тормозит. Мы вернёмся с практичным первым шагом.',
      }),
      primaryCta: t({
        en: 'Discuss this service',
        hy: 'Քննարկել այս ծառայությունը',
        ru: 'Обсудить эту услугу',
      }),
      secondaryCta: t({
        en: 'All services',
        hy: 'Բոլոր ծառայությունները',
        ru: 'Все услуги',
      }),
    },
  },
} as const satisfies Dictionary;

export default aiAgentContent;
