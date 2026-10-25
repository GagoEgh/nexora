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
    audiences: {
      projects: {
        eyebrow: t({
          en: 'Typical projects',
          hy: 'Բնորոշ նախագծեր',
          ru: 'Типичные проекты',
        }),
        title: t({
          en: 'What these engagements usually look like.',
          hy: 'Ինչպիսին են սովորաբար այս նախագծերը։',
          ru: 'Как обычно выглядят такие проекты.',
        }),
        items: [
          t({
            en: 'Inbound lead triage and enrichment',
            hy: 'Մուտքային լիդերի դասակարգում և հարստացում',
            ru: 'Сортировка и обогащение входящих лидов',
          }),
          t({
            en: 'Support ticket classification and routing',
            hy: 'Աջակցության հարցումների դասակարգում և ուղղորդում',
            ru: 'Классификация и маршрутизация обращений в поддержку',
          }),
          t({
            en: 'Invoice and document intake',
            hy: 'Հաշիվների և փաստաթղթերի ընդունում',
            ru: 'Приём счетов и документов',
          }),
          t({
            en: 'Weekly reporting automation',
            hy: 'Շաբաթական հաշվետվությունների ավտոմատացում',
            ru: 'Автоматизация еженедельной отчётности',
          }),
          t({
            en: 'Sales follow-up assistant',
            hy: 'Վաճառքի հետագա կապի օգնական',
            ru: 'Ассистент повторных контактов в продажах',
          }),
          t({
            en: 'Internal approval workflows',
            hy: 'Ներքին հաստատման հոսքեր',
            ru: 'Внутренние процессы согласования',
          }),
        ],
      },
      fit: {
        eyebrow: t({
          en: "Who it's for",
          hy: 'Ում համար է',
          ru: 'Для кого это',
        }),
        title: t({
          en: 'Built for teams that run on repeatable processes.',
          hy: 'Ստեղծված է թիմերի համար, որոնք աշխատում են կրկնվող գործընթացներով։',
          ru: 'Создано для команд, работающих с повторяемыми процессами.',
        }),
        chips: [
          {
            icon: 'briefcase' satisfies AppIconName,
            label: t({
              en: 'Operations teams',
              hy: 'Գործառնական թիմեր',
              ru: 'Операционные команды',
            }),
          },
          {
            icon: 'users' satisfies AppIconName,
            label: t({
              en: 'Sales & customer success',
              hy: 'Վաճառք և հաճախորդների սպասարկում',
              ru: 'Продажи и клиентский сервис',
            }),
          },
          {
            icon: 'rocket' satisfies AppIconName,
            label: t({
              en: 'Growing SMEs',
              hy: 'Աճող փոքր և միջին բիզնես',
              ru: 'Растущий малый и средний бизнес',
            }),
          },
          {
            icon: 'layers' satisfies AppIconName,
            label: t({
              en: 'Enterprises with CRM/ERP',
              hy: 'CRM/ERP ունեցող ձեռնարկություններ',
              ru: 'Предприятия с CRM/ERP',
            }),
          },
          {
            icon: 'layout-dashboard' satisfies AppIconName,
            label: t({
              en: 'SaaS companies',
              hy: 'SaaS ընկերություններ',
              ru: 'SaaS-компании',
            }),
          },
          {
            icon: 'tag' satisfies AppIconName,
            label: t({
              en: 'Digital agencies',
              hy: 'Թվային գործակալություններ',
              ru: 'Цифровые агентства',
            }),
          },
        ],
        note: t({
          en: 'Also relevant for software companies that want to add automation features to their own products.',
          hy: 'Արդիական է նաև ծրագրային ապահովման ընկերությունների համար, որոնք ցանկանում են ավտոմատացման հնարավորություններ ավելացնել իրենց պրոդուկտներում։',
          ru: 'Также актуально для софтверных компаний, которые хотят добавить возможности автоматизации в свои продукты.',
        }),
      },
    },
    businessValue: {
      eyebrow: t({
        en: 'Business value',
        hy: 'Բիզնես արժեք',
        ru: 'Ценность для бизнеса',
      }),
      title: t({
        en: 'What changes when the routine runs itself.',
        hy: 'Ինչ է փոխվում, երբ առօրյա գործընթացներն ինքնաշխատ են դառնում։',
        ru: 'Что меняется, когда рутина выполняется сама.',
      }),
      items: [
        {
          icon: 'refresh-cw' satisfies AppIconName,
          title: t({
            en: 'Less manual work',
            hy: 'Ավելի քիչ ձեռքով աշխատանք',
            ru: 'Меньше ручной работы',
          }),
          text: t({
            en: 'People spend time on judgement and relationships instead of copying data.',
            hy: 'Մարդիկ ժամանակ են հատկացնում որոշումներին և հարաբերություններին՝ տվյալներ պատճենելու փոխարեն։',
            ru: 'Люди тратят время на решения и отношения, а не на копирование данных.',
          }),
        },
        {
          icon: 'rocket' satisfies AppIconName,
          title: t({
            en: 'Faster response',
            hy: 'Ավելի արագ արձագանք',
            ru: 'Более быстрый отклик',
          }),
          text: t({
            en: 'Requests are triaged and routed as they arrive, not when someone is free.',
            hy: 'Հարցումները դասակարգվում և ուղղորդվում են ստացման պահին, ոչ թե երբ ինչ-որ մեկն ազատվի։',
            ru: 'Запросы сортируются и направляются сразу при поступлении, а не когда кто-то освободится.',
          }),
        },
        {
          icon: 'layers' satisfies AppIconName,
          title: t({
            en: 'Consistent processes',
            hy: 'Հետևողական գործընթացներ',
            ru: 'Единообразные процессы',
          }),
          text: t({
            en: 'The same steps run the same way, every time, across the team.',
            hy: 'Նույն քայլերը կատարվում են նույն կերպ՝ ամեն անգամ, ամբողջ թիմում։',
            ru: 'Одни и те же шаги выполняются одинаково каждый раз и во всей команде.',
          }),
        },
        {
          icon: 'shield-check' satisfies AppIconName,
          title: t({
            en: 'Visibility and control',
            hy: 'Տեսանելիություն և վերահսկողություն',
            ru: 'Прозрачность и контроль',
          }),
          text: t({
            en: 'Every automated step is logged and reviewable, with humans in the loop where needed.',
            hy: 'Ամեն ինքնաշխատ քայլ գրանցվում է և ենթակա է ստուգման՝ անհրաժեշտության դեպքում մարդկային մասնակցությամբ։',
            ru: 'Каждый автоматизированный шаг логируется и доступен для проверки, а при необходимости в процесс включается человек.',
          }),
        },
      ],
      note: t({
        en: "Outcomes depend on each process and are agreed per project — we don't promise generic percentages.",
        hy: 'Արդյունքները կախված են կոնկրետ գործընթացից և համաձայնեցվում են յուրաքանչյուր նախագծի շրջանակում — մենք ընդհանուր տոկոսներ չենք խոստանում։',
        ru: 'Результаты зависят от конкретного процесса и согласуются по каждому проекту — мы не обещаем универсальных процентов.',
      }),
    },
  },
} as const satisfies Dictionary;

export default aiAgentContent;
