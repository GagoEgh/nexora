import { t, type Dictionary } from 'intlayer';

const aiAgentContent = {
  key: 'ai-agent',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    breadcrumbServices: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    title: t({
      en: 'AI Agents & Business Automation',
      hy: 'AI գործակալներ և բիզնես գործընթացների ավտոմատացում',
      ru: 'AI-агенты и автоматизация бизнес-процессов',
    }),
    eyebrow: t({
      en: 'Artificial Intelligence · Service 09',
      hy: 'Արհեստական բանականություն · Ծառայություն 09',
      ru: 'Искусственный интеллект · Услуга 09',
    }),
    lead: t({
      en: 'Automate the repetitive, multi-step work between your systems — with agents that classify, retrieve, decide and act inside clear guardrails.',
      hy: 'Ավտոմատացրեք ձեր համակարգերի միջև իրականացվող կրկնվող և բազմափուլ գործընթացները՝ օգտագործելով գործակալներ, որոնք դասակարգում են տվյալները, գտնում անհրաժեշտ տեղեկատվությունը, որոշումներ կայացնում և գործողություններ կատարում հստակ սահմանված կանոնների շրջանակում։',
      ru: 'Автоматизируйте повторяющиеся многоэтапные процессы между вашими системами с помощью агентов, которые классифицируют данные, находят нужную информацию, принимают решения и выполняют действия в рамках чётко заданных правил.',
    }),
    primaryCta: t({
      en: 'Discuss this service',
      hy: 'Քննարկել այս ծառայությունը',
      ru: 'Обсудить эту услугу',
    }),
    secondaryCta: t({
      en: 'See related solutions',
      hy: 'Դիտել համապատասխան լուծումները',
      ru: 'Посмотреть подходящие решения',
    }),

    conversation: {
      eyebrow: t({
        en: 'Discuss this service',
        hy: 'Քննարկենք այս ծառայությունը',
        ru: 'Обсудим эту услугу',
      }),
      title: t({
        en: 'Have a process you’d like to automate?',
        hy: 'Կա՞ գործընթաց, որը ցանկանում եք ավտոմատացնել։',
        ru: 'Есть процесс, который вы хотели бы автоматизировать?',
      }),
      lead: t({
        en: 'Describe the workflow, the tools involved and where it slows you down. We’ll come back with a practical first step.',
        hy: 'Նկարագրեք գործընթացը, դրանում օգտագործվող գործիքները և այն փուլերը, որտեղ աշխատանքը դանդաղում է։ Մենք կուսումնասիրենք ձեր իրավիճակը և կառաջարկենք գործնական առաջին քայլը։',
        ru: 'Опишите процесс, используемые инструменты и этапы, на которых возникают задержки. Мы изучим вашу ситуацию и предложим конкретный первый шаг.',
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
