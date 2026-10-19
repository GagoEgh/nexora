import { t, type Dictionary } from 'intlayer';

const whatWeBuildContent = {
  key: 'what-we-build',
  content: {
    eyebrow: t({ en: 'What we build', hy: 'Ինչ ենք կառուցում', ru: 'Что мы создаём' }),
    title: t({
      en: 'Systems shaped around how your business runs.',
      hy: 'Համակարգեր՝ կառուցված ձեր բիզնեսի աշխատելու ձևի շուրջ։',
      ru: 'Системы, построенные вокруг того, как работает ваш бизнес.',
    }),
    intro: t({
      en: 'Representative categories of software we design and engineer. Every build starts from your processes, data and the tools you already rely on.',
      hy: 'Ծրագրային ապահովման բնորոշ կատեգորիաներ, որոնք մենք նախագծում և մշակում ենք։ Յուրաքանչյուր լուծում սկսվում է ձեր գործընթացներից, տվյալներից և այն գործիքներից, որոնց վրա արդեն հենվում եք։',
      ru: 'Характерные категории программного обеспечения, которое мы проектируем и разрабатываем. Каждая разработка начинается с ваших процессов, данных и инструментов, на которые вы уже опираетесь.',
    }),
    note: t({
      en: 'Illustrations are conceptual and do not represent specific client projects.',
      hy: 'Պատկերազարդումները հայեցակարգային են և չեն ներկայացնում հաճախորդների կոնկրետ նախագծեր։',
      ru: 'Иллюстрации концептуальные и не отображают конкретные клиентские проекты.',
    }),
    items: [
      {
        illustration: 'saas',
        title: t({ en: 'SaaS Platforms', hy: 'SaaS հարթակներ', ru: 'SaaS-платформы' }),
        description: t({
          en: 'Multi-tenant products with subscriptions, roles, billing and admin tooling.',
          hy: 'Բազմավարձակալ պրոդուկտներ՝ բաժանորդագրություններով, դերերով, վճարումներով և ադմինիստրատիվ գործիքներով։',
          ru: 'Мультитенантные продукты с подписками, ролями, биллингом и инструментами администрирования.',
        }),
      },
      {
        illustration: 'crm-erp',
        title: t({ en: 'CRM & ERP Systems', hy: 'CRM և ERP համակարգեր', ru: 'CRM- и ERP-системы' }),
        description: t({
          en: 'Custom or extended systems that match how your teams sell and operate.',
          hy: 'Անհատական կամ ընդլայնված համակարգեր, որոնք համապատասխանում են ձեր թիմերի վաճառքի և աշխատանքի ձևին։',
          ru: 'Заказные или расширенные системы, соответствующие тому, как ваши команды продают и работают.',
        }),
      },
      {
        illustration: 'web',
        title: t({ en: 'Web Applications', hy: 'Վեբ հավելվածներ', ru: 'Веб-приложения' }),
        description: t({
          en: 'Fast, accessible applications for customers, partners and staff.',
          hy: 'Արագ և հասանելի հավելվածներ հաճախորդների, գործընկերների և աշխատակիցների համար։',
          ru: 'Быстрые и доступные приложения для клиентов, партнёров и сотрудников.',
        }),
      },
      {
        illustration: 'mobile',
        title: t({ en: 'Mobile Applications', hy: 'Մոբայլ հավելվածներ', ru: 'Мобильные приложения' }),
        description: t({
          en: 'Native and cross-platform apps connected to your backend and services.',
          hy: 'Նեյթիվ և կրոսպլատֆորմ հավելվածներ՝ միացված ձեր backend-ին և ծառայություններին։',
          ru: 'Нативные и кроссплатформенные приложения, связанные с вашим backend и сервисами.',
        }),
      },
      {
        illustration: 'ai',
        title: t({ en: 'AI Assistants & Agents', hy: 'AI օգնականներ և գործակալներ', ru: 'AI-ассистенты и агенты' }),
        description: t({
          en: 'Assistants and multi-step agents grounded in your own data and tools.',
          hy: 'Օգնականներ և բազմաքայլ գործակալներ՝ հիմնված ձեր սեփական տվյալների և գործիքների վրա։',
          ru: 'Ассистенты и многошаговые агенты, опирающиеся на ваши собственные данные и инструменты.',
        }),
      },
      {
        illustration: 'automation',
        title: t({
          en: 'Business Automation Platforms',
          hy: 'Բիզնես ավտոմատացման հարթակներ',
          ru: 'Платформы автоматизации бизнеса',
        }),
        description: t({
          en: 'Workflows that move data and decisions between systems without manual steps.',
          hy: 'Աշխատահոսքեր, որոնք տվյալներն ու որոշումները տեղափոխում են համակարգերի միջև առանց ձեռքով քայլերի։',
          ru: 'Рабочие процессы, которые передают данные и решения между системами без ручных шагов.',
        }),
      },
      {
        illustration: 'portal',
        title: t({ en: 'B2B Portals', hy: 'B2B պորտալներ', ru: 'B2B-порталы' }),
        description: t({
          en: 'Secure self-service portals for clients, distributors and partners.',
          hy: 'Անվտանգ ինքնասպասարկման պորտալներ հաճախորդների, դիստրիբյուտորների և գործընկերների համար։',
          ru: 'Безопасные порталы самообслуживания для клиентов, дистрибьюторов и партнёров.',
        }),
      },
      {
        illustration: 'internal-tools',
        title: t({ en: 'Internal Business Tools', hy: 'Ներքին բիզնես գործիքներ', ru: 'Внутренние бизнес-инструменты' }),
        description: t({
          en: 'Dashboards and back-office tools that replace spreadsheets and email chains.',
          hy: 'Վահանակներ և back-office գործիքներ, որոնք փոխարինում են աղյուսակներին և նամակների շղթաներին։',
          ru: 'Дашборды и back-office-инструменты, заменяющие таблицы и цепочки писем.',
        }),
      },
      {
        illustration: 'api',
        title: t({ en: 'API-Connected Systems', hy: 'API-ով միացված համակարգեր', ru: 'Системы, связанные через API' }),
        description: t({
          en: 'Integrations and middleware that connect the tools you already use.',
          hy: 'Ինտեգրումներ և միջանկյալ ծրագրային ապահովում, որոնք միացնում են ձեր արդեն օգտագործվող գործիքները։',
          ru: 'Интеграции и промежуточное ПО, связывающие инструменты, которыми вы уже пользуетесь.',
        }),
      },
    ],
  },
} satisfies Dictionary;

export default whatWeBuildContent;
