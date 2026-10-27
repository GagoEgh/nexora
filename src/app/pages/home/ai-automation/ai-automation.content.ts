import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const aiAutomationContent = {
  key: 'ai-automation',
  content: {
    eyebrow: t({
      en: 'AI & automation',
      hy: 'AI և ավտոմատացում',
      ru: 'AI и автоматизация',
    }),
    title: t({
      en: 'Practical AI, engineered into how you already work.',
      hy: 'Գործնական AI լուծումներ՝ ինտեգրված ձեր բիզնեսի աշխատանքային գործընթացներում։',
      ru: 'Практические AI-решения, интегрированные в ваши рабочие процессы.',
    }),
    lead: t({
      en: 'We treat AI as an engineering discipline: clear use cases, grounded data, human review where it matters, and integrations that fit your existing systems.',
      hy: 'Մենք AI-ը դիտարկում ենք որպես ինժեներական ուղղություն՝ հստակ կիրառման նպատակներով, վստահելի տվյալներով, անհրաժեշտ դեպքերում մարդկային վերահսկողությամբ և ձեր գործող համակարգերին համապատասխան ինտեգրումներով։',
      ru: 'Мы рассматриваем AI как инженерную дисциплину: чётко определяем сценарии применения, опираемся на достоверные данные, предусматриваем проверку человеком там, где это необходимо, и интегрируем решения в существующие системы.',
    }),
    primaryCta: t({
      en: 'Explore AI Services',
      hy: 'Ծանոթանալ AI ծառայություններին',
      ru: 'Наши AI-услуги',
    }),
    secondaryCta: t({
      en: 'Discuss a use case',
      hy: 'Քննարկել կիրառման հնարավորությունը',
      ru: 'Обсудить сценарий применения',
    }),
    capabilities: [
      {
        icon: 'message-square' satisfies AppIconName,
        title: t({
          en: 'Intelligent assistants',
          hy: 'Խելացի AI օգնականներ',
          ru: 'Интеллектуальные AI-ассистенты',
        }),
        description: t({
          en: 'Internal and customer-facing assistants that answer from your own knowledge.',
          hy: 'Ներքին օգտագործման և հաճախորդների համար նախատեսված օգնականներ, որոնք պատասխաններ են տրամադրում ձեր սեփական գիտելիքների բազայի հիման վրա։',
          ru: 'Внутренние ассистенты и решения для клиентов, которые формируют ответы на основе вашей собственной базы знаний.',
        }),
      },
      {
        icon: 'search' satisfies AppIconName,
        title: t({
          en: 'RAG & knowledge retrieval',
          hy: 'RAG և գիտելիքների որոնում',
          ru: 'RAG и поиск по базе знаний',
        }),
        description: t({
          en: 'Answers grounded in your documents, wikis and databases — with sources.',
          hy: 'Պատասխաններ՝ հիմնված ձեր փաստաթղթերի, վիքիների և տվյալների բազաների վրա՝ համապատասխան աղբյուրների հղումներով։',
          ru: 'Ответы на основе ваших документов, вики-ресурсов и баз данных с указанием источников.',
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
          hy: 'Պայմանագրերից, հաշիվ-ապրանքագրերից և ձևաթղթերից տվյալների դուրսբերում, դասակարգում և վավերացում։',
          ru: 'Извлечение, классификация и проверка данных из договоров, счетов-фактур и форм.',
        }),
      },
      {
        icon: 'workflow' satisfies AppIconName,
        title: t({
          en: 'Workflow automation',
          hy: 'Աշխատանքային գործընթացների ավտոմատացում',
          ru: 'Автоматизация рабочих процессов',
        }),
        description: t({
          en: 'Automate repetitive steps across email, CRM and internal tools.',
          hy: 'Կրկնվող գործողությունների ավտոմատացում էլեկտրոնային փոստում, CRM համակարգերում և ներքին գործիքներում։',
          ru: 'Автоматизация повторяющихся операций в электронной почте, CRM-системах и внутренних инструментах.',
        }),
      },
      {
        icon: 'plug' satisfies AppIconName,
        title: t({
          en: 'CRM integrations',
          hy: 'Ինտեգրումներ CRM համակարգերի հետ',
          ru: 'Интеграции с CRM-системами',
        }),
        description: t({
          en: 'Enrich leads, summarize activity and route requests inside your CRM.',
          hy: 'Պոտենցիալ հաճախորդների տվյալների հարստացում, գործունեության ամփոփում և հարցումների ուղղորդում ձեր CRM համակարգում։',
          ru: 'Обогащение данных о потенциальных клиентах, сводки активности и маршрутизация запросов внутри вашей CRM-системы.',
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
          hy: 'AI գործակալներ, որոնք պլանավորում և կատարում են առաջադրանքներ՝ սահմանված սահմանափակումներով և հաստատման փուլերով։',
          ru: 'AI-агенты, которые планируют и выполняют задачи с заданными ограничениями и этапами согласования.',
        }),
      },
    ],
    pipelineLabel: t({
      en: 'How an AI workflow runs',
      hy: 'Ինչպես է աշխատում AI գործընթացը',
      ru: 'Как работает AI-процесс',
    }),
    pipeline: ['input', 'retrieve', 'reason', 'act', 'human review'],
    note: t({
      en: 'Designed to be observable and testable, with human review where decisions matter.',
      hy: 'Լուծումները նախագծվում են այնպես, որ դրանց աշխատանքը հնարավոր լինի վերահսկել և փորձարկել՝ կարևոր որոշումների դեպքում նախատեսելով նաև մարդկային ստուգում։',
      ru: 'Решения проектируются с возможностью мониторинга и тестирования, а в случаях, когда решения имеют существенное значение, предусматривается проверка человеком.',
    }),
  },
} as const satisfies Dictionary;

export default aiAutomationContent;
