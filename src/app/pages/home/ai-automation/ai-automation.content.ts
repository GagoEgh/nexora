import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const aiAutomationContent = {
  key: 'ai-automation',
  content: {
    eyebrow: t({ en: 'AI & automation', hy: 'AI և ավտոմատացում', ru: 'AI и автоматизация' }),
    title: t({
      en: 'Practical AI, engineered into how you already work.',
      hy: 'Գործնական AI՝ ներկառուցված ձեր արդեն գործող աշխատանքի մեջ։',
      ru: 'Практичный AI, встроенный в то, как вы уже работаете.',
    }),
    lead: t({
      en: 'We treat AI as an engineering discipline: clear use cases, grounded data, human review where it matters, and integrations that fit your existing systems.',
      hy: 'Մենք AI-ին վերաբերվում ենք որպես ինժեներական առարկայի՝ հստակ կիրառումներ, հիմնավորված տվյալներ, մարդկային վերանայում այնտեղ, որտեղ դա կարևոր է, և ինտեգրումներ, որոնք համապատասխանում են ձեր գործող համակարգերին։',
      ru: 'Мы относимся к AI как к инженерной дисциплине: понятные сценарии, достоверные данные, проверка человеком там, где это важно, и интеграции, которые вписываются в ваши существующие системы.',
    }),
    primaryCta: t({ en: 'Explore AI Services', hy: 'AI ծառայություններ', ru: 'AI-услуги' }),
    secondaryCta: t({
      en: 'Discuss a use case',
      hy: 'Քննարկել կիրառումը',
      ru: 'Обсудить сценарий',
    }),
    capabilities: [
      {
        icon: 'message-square' satisfies AppIconName,
        title: t({ en: 'Intelligent assistants', hy: 'Խելացի օգնականներ', ru: 'Умные ассистенты' }),
        description: t({
          en: 'Internal and customer-facing assistants that answer from your own knowledge.',
          hy: 'Ներքին և հաճախորդներին ուղղված օգնականներ, որոնք պատասխանում են ձեր սեփական գիտելիքների հիման վրա։',
          ru: 'Внутренние и клиентские ассистенты, которые отвечают на основе ваших собственных знаний.',
        }),
      },
      {
        icon: 'search' satisfies AppIconName,
        title: t({
          en: 'RAG & knowledge retrieval',
          hy: 'RAG և գիտելիքների որոնում',
          ru: 'RAG и поиск по знаниям',
        }),
        description: t({
          en: 'Answers grounded in your documents, wikis and databases — with sources.',
          hy: 'Պատասխաններ՝ հիմնված ձեր փաստաթղթերի, վիքիների և տվյալների բազաների վրա, աղբյուրներով։',
          ru: 'Ответы, основанные на ваших документах, вики и базах данных, с указанием источников.',
        }),
      },
      {
        icon: 'file-text' satisfies AppIconName,
        title: t({
          en: 'Document processing',
          hy: 'Փաստաթղթերի մշակում',
          ru: 'Обработка документов',
        }),
        description: t({
          en: 'Extract, classify and validate data from contracts, invoices and forms.',
          hy: 'Տվյալների դուրսբերում, դասակարգում և վավերացում պայմանագրերից, հաշիվ-ապրանքագրերից և ձևերից։',
          ru: 'Извлечение, классификация и проверка данных из договоров, счетов и форм.',
        }),
      },
      {
        icon: 'workflow' satisfies AppIconName,
        title: t({
          en: 'Workflow automation',
          hy: 'Աշխատահոսքերի ավտոմատացում',
          ru: 'Автоматизация процессов',
        }),
        description: t({
          en: 'Automate repetitive steps across email, CRM and internal tools.',
          hy: 'Կրկնվող քայլերի ավտոմատացում էլ. փոստում, CRM-ում և ներքին գործիքներում։',
          ru: 'Автоматизация повторяющихся шагов в почте, CRM и внутренних инструментах.',
        }),
      },
      {
        icon: 'plug' satisfies AppIconName,
        title: t({ en: 'CRM integrations', hy: 'CRM ինտեգրումներ', ru: 'Интеграции с CRM' }),
        description: t({
          en: 'Enrich leads, summarize activity and route requests inside your CRM.',
          hy: 'Լիդերի հարստացում, գործունեության ամփոփում և հարցումների ուղղորդում ձեր CRM-ի ներսում։',
          ru: 'Обогащение лидов, сводки активности и маршрутизация запросов внутри вашей CRM.',
        }),
      },
      {
        icon: 'bot' satisfies AppIconName,
        title: t({
          en: 'Multi-step AI agents',
          hy: 'Բազմաքայլ AI գործակալներ',
          ru: 'Многошаговые AI-агенты',
        }),
        description: t({
          en: 'Agents that plan and carry out tasks with guardrails and approval steps.',
          hy: 'Գործակալներ, որոնք պլանավորում և կատարում են առաջադրանքներ՝ սահմանափակումներով և հաստատման քայլերով։',
          ru: 'Агенты, которые планируют и выполняют задачи с ограничениями и шагами согласования.',
        }),
      },
    ],
    pipelineLabel: t({
      en: 'How an AI workflow runs',
      hy: 'Ինչպես է աշխատում AI հոսքը',
      ru: 'Как работает AI-процесс',
    }),
    pipeline: ['input', 'retrieve', 'reason', 'act', 'human review'],
    note: t({
      en: 'Designed to be observable and testable, with human review where decisions matter.',
      hy: 'Նախագծված է դիտարկելի և փորձարկելի լինելու համար՝ մարդկային վերանայումով այնտեղ, որտեղ որոշումները կարևոր են։',
      ru: 'Спроектировано так, чтобы быть наблюдаемым и тестируемым, с проверкой человеком там, где важны решения.',
    }),
  },
} as const satisfies Dictionary;

export default aiAutomationContent;
