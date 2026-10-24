import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';
import type { CapabilitiesTone } from './capabilities/capabilities';
import type { WorkflowTone } from './workflow/workflow';

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
    overview: {
      eyebrow: t({ en: 'Overview', hy: 'Ակնարկ', ru: 'Обзор' }),
      title: t({
        en: 'Automation that understands context, not just rules.',
        hy: 'Ավտոմատացում, որը հասկանում է համատեքստը, ոչ միայն կանոնները։',
        ru: 'Автоматизация, которая понимает контекст, а не только правила.',
      }),
      body: t({
        en: 'Many business processes are too variable for simple rules but too repetitive for skilled people to keep doing by hand. AI agents fill that gap: they read unstructured input, look up the context they need, and take the next step in your existing tools.',
        hy: 'Շատ բիզնես գործընթացներ չափազանց փոփոխական են պարզ կանոնների համար, բայց չափազանց կրկնվող՝ որակյալ մասնագետների կողմից ձեռքով կատարվելու համար։ AI գործակալները լրացնում են այդ բացը՝ նրանք կարդում են ոչ կառուցվածքային տվյալները, գտնում անհրաժեշտ համատեքստը և կատարում հաջորդ քայլը ձեր առկա գործիքներում։',
        ru: 'Многие бизнес-процессы слишком изменчивы для простых правил, но слишком повторяемы, чтобы квалифицированные люди выполняли их вручную. AI-агенты закрывают этот разрыв: они читают неструктурированные данные, находят нужный контекст и делают следующий шаг в ваших существующих инструментах.',
      }),
      note: t({
        en: 'We design these automations as engineered systems — with defined inputs, permissions, logging and review points — so they can be tested, monitored and improved like any other software your business depends on.',
        hy: 'Մենք նախագծում ենք այս ավտոմատացումները որպես ինժեներական համակարգեր՝ սահմանված մուտքերով, թույլտվություններով, գրանցամատյաններով և ստուգման կետերով, որպեսզի դրանք կարողանան փորձարկվել, վերահսկվել և բարելավվել ինչպես ցանկացած այլ ծրագիր, որի վրա հենվում է ձեր բիզնեսը։',
        ru: 'Мы проектируем такие автоматизации как инженерные системы — с заданными входами, правами доступа, логированием и точками проверки — чтобы их можно было тестировать, отслеживать и улучшать, как любое другое ПО, на которое опирается ваш бизнес.',
      }),
    },
    problems: {
      eyebrow: t({
        en: 'Problems we solve',
        hy: 'Խնդիրներ, որոնք լուծում ենք',
        ru: 'Задачи, которые мы решаем',
      }),
      title: t({
        en: 'Where manual work slows the business down.',
        hy: 'Երբ ձեռքով աշխատանքը դանդաղեցնում է բիզնեսը։',
        ru: 'Когда ручная работа замедляет бизнес.',
      }),
      intro: t({
        en: 'Typical situations where agents and automation create real leverage.',
        hy: 'Բնորոշ իրավիճակներ, որտեղ գործակալները և ավտոմատացումը տալիս են իրական արդյունք։',
        ru: 'Типичные ситуации, где агенты и автоматизация дают реальный эффект.',
      }),
      items: [
        {
          icon: 'refresh-cw' satisfies AppIconName,
          title: t({
            en: 'Data copied by hand',
            hy: 'Ձեռքով պատճենվող տվյալներ',
            ru: 'Данные копируются вручную',
          }),
          text: t({
            en: 'Teams move information between email, CRM and spreadsheets manually — slow and error-prone.',
            hy: 'Թիմերը ձեռքով են տեղափոխում տեղեկությունը էլ. փոստի, CRM-ի և աղյուսակների միջև՝ դանդաղ և սխալների հակված։',
            ru: 'Команды вручную переносят информацию между почтой, CRM и таблицами — медленно и с ошибками.',
          }),
        },
        {
          icon: 'mail' satisfies AppIconName,
          title: t({
            en: 'Requests wait in inboxes',
            hy: 'Հարցումները սպասում են փոստարկղերում',
            ru: 'Запросы ждут в почте',
          }),
          text: t({
            en: 'Inbound leads and tickets sit in shared inboxes until someone has time to triage them.',
            hy: 'Մուտքային լիդերն ու հարցումները մնում են ընդհանուր փոստարկղերում, մինչև ինչ-որ մեկը ժամանակ գտնի դրանք դասակարգելու։',
            ru: 'Входящие лиды и обращения лежат в общих ящиках, пока у кого-то не появится время их разобрать.',
          }),
        },
        {
          icon: 'file-text' satisfies AppIconName,
          title: t({
            en: 'Documents in every format',
            hy: 'Փաստաթղթեր՝ ամեն ձևաչափով',
            ru: 'Документы в разных форматах',
          }),
          text: t({
            en: 'Invoices, contracts and forms arrive differently each time and need manual checking.',
            hy: 'Հաշիվները, պայմանագրերը և ձևերը ամեն անգամ գալիս են տարբեր ձևաչափով և պահանջում ձեռքով ստուգում։',
            ru: 'Счета, договоры и формы каждый раз приходят по-разному и требуют ручной проверки.',
          }),
        },
        {
          icon: 'layout-dashboard' satisfies AppIconName,
          title: t({
            en: 'Reporting by hand',
            hy: 'Ձեռքով հաշվետվություններ',
            ru: 'Отчёты вручную',
          }),
          text: t({
            en: 'Weekly numbers depend on someone pulling data together from several tools.',
            hy: 'Շաբաթական ցուցանիշները կախված են նրանից, թե ինչպես է ինչ-որ մեկը տվյալները հավաքում մի քանի գործիքներից։',
            ru: 'Еженедельные цифры зависят от того, как кто-то собирает данные из нескольких инструментов.',
          }),
        },
      ],
    },
    capabilities: {
      eyebrow: t({
        en: 'Capabilities & deliverables',
        hy: 'Հնարավորություններ և արդյունքներ',
        ru: 'Возможности и результаты',
      }),
      title: t({
        en: 'What we build, and what you receive.',
        hy: 'Ինչ ենք կառուցում և ինչ եք ստանում։',
        ru: 'Что мы создаём и что вы получаете.',
      }),
      panels: [
        {
          tone: 'neutral' satisfies CapabilitiesTone,
          title: t({ en: 'Capabilities', hy: 'Հնարավորություններ', ru: 'Возможности' }),
          items: [
            t({
              en: 'Lead handling and qualification',
              hy: 'Լիդերի մշակում և որակավորում',
              ru: 'Обработка и квалификация лидов',
            }),
            t({
              en: 'CRM workflow automation',
              hy: 'CRM հոսքերի ավտոմատացում',
              ru: 'Автоматизация процессов в CRM',
            }),
            t({
              en: 'Document processing and data extraction',
              hy: 'Փաստաթղթերի մշակում և տվյալների արդյունահանում',
              ru: 'Обработка документов и извлечение данных',
            }),
            t({
              en: 'Intelligent routing and assignment',
              hy: 'Խելացի ուղղորդում և նշանակում',
              ru: 'Интеллектуальная маршрутизация и назначение',
            }),
            t({
              en: 'Notifications and escalations',
              hy: 'Ծանուցումներ և էսկալացիաներ',
              ru: 'Уведомления и эскалации',
            }),
            t({
              en: 'Automated reporting',
              hy: 'Ավտոմատացված հաշվետվություններ',
              ru: 'Автоматические отчёты',
            }),
            t({
              en: 'Multi-step agent orchestration',
              hy: 'Բազմաքայլ գործակալների նվագախմբում',
              ru: 'Оркестрация многошаговых агентов',
            }),
          ],
        },
        {
          tone: 'accent' satisfies CapabilitiesTone,
          title: t({ en: 'Deliverables', hy: 'Արդյունքներ', ru: 'Результаты' }),
          items: [
            t({
              en: 'Process map and automation design',
              hy: 'Գործընթացների քարտեզ և ավտոմատացման նախագիծ',
              ru: 'Карта процессов и дизайн автоматизации',
            }),
            t({
              en: 'Working agents and automations in your environment',
              hy: 'Աշխատող գործակալներ և ավտոմատացումներ ձեր միջավայրում',
              ru: 'Работающие агенты и автоматизации в вашей среде',
            }),
            t({
              en: 'Integrations with your existing tools',
              hy: 'Ինտեգրումներ ձեր առկա գործիքների հետ',
              ru: 'Интеграции с вашими текущими инструментами',
            }),
            t({
              en: 'Guardrails, logging and human-review steps',
              hy: 'Սահմանափակումներ, գրանցամատյաններ և մարդկային ստուգման քայլեր',
              ru: 'Ограничения, логирование и шаги проверки человеком',
            }),
            t({
              en: 'Documentation and team handover',
              hy: 'Փաստաթղթավորում և թիմին փոխանցում',
              ru: 'Документация и передача команде',
            }),
            t({
              en: 'Monitoring and iteration plan',
              hy: 'Մոնիտորինգ և կատարելագործման պլան',
              ru: 'Мониторинг и план доработок',
            }),
          ],
        },
      ],
    },
    workflow: {
      caption: 'workflow / inbound-request',
      badge: t({ en: 'example flow', hy: 'օրինակային հոսք', ru: 'пример потока' }),
      steps: [
        {
          icon: 'mail' satisfies AppIconName,
          tone: 'plain' satisfies WorkflowTone,
          label: t({ en: 'Trigger', hy: 'Գործարկիչ', ru: 'Триггер' }),
          text: t({
            en: 'New request arrives by email or form',
            hy: 'Նոր հարցումը ստացվում է էլ. փոստով կամ ձևով',
            ru: 'Новый запрос приходит по почте или через форму',
          }),
        },
        {
          icon: 'sparkle' satisfies AppIconName,
          tone: 'dark' satisfies WorkflowTone,
          label: t({ en: 'Agent', hy: 'Գործակալ', ru: 'Агент' }),
          text: t({
            en: 'Classify intent and extract key details',
            hy: 'Դասակարգում է մտադրությունը և առանձնացնում հիմնական մանրամասները',
            ru: 'Классифицирует намерение и извлекает ключевые детали',
          }),
        },
        {
          icon: 'database' satisfies AppIconName,
          tone: 'plain' satisfies WorkflowTone,
          label: t({ en: 'Tool', hy: 'Գործիք', ru: 'Инструмент' }),
          text: t({
            en: 'Look up the account in the CRM',
            hy: 'Գտնում է հաշիվը CRM-ում',
            ru: 'Находит аккаунт в CRM',
          }),
        },
        {
          icon: 'git-branch' satisfies AppIconName,
          tone: 'plain' satisfies WorkflowTone,
          label: t({ en: 'Decision', hy: 'Որոշում', ru: 'Решение' }),
          text: t({
            en: 'Route by type, region and priority',
            hy: 'Ուղղորդում ըստ տեսակի, տարածաշրջանի և առաջնահերթության',
            ru: 'Маршрутизирует по типу, региону и приоритету',
          }),
        },
        {
          icon: 'users' satisfies AppIconName,
          tone: 'accent' satisfies WorkflowTone,
          label: t({ en: 'Human review', hy: 'Մարդկային ստուգում', ru: 'Проверка человеком' }),
          text: t({
            en: 'Approve the drafted reply when needed',
            hy: 'Հաստատում է պատրաստված պատասխանը, երբ անհրաժեշտ է',
            ru: 'Утверждает подготовленный ответ, когда это нужно',
          }),
        },
        {
          icon: 'message-square' satisfies AppIconName,
          tone: 'plain' satisfies WorkflowTone,
          label: t({ en: 'Action', hy: 'Գործողություն', ru: 'Действие' }),
          text: t({
            en: 'Assign owner and notify the team',
            hy: 'Նշանակում է պատասխանատու և տեղեկացնում թիմին',
            ru: 'Назначает ответственного и уведомляет команду',
          }),
        },
      ],
    },
  },
} as const satisfies Dictionary;

export default aiAgentContent;
