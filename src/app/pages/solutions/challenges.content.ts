import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';
import type { ChallengeTone } from './challenge';

const challengesContent = {
  key: 'solutions-challenges',
  content: {
    challengeLabel: t({ en: 'The challenge', hy: 'Մարտահրավերը', ru: 'Задача' }),
    helpLabel: t({ en: 'How we help', hy: 'Ինչպես ենք օգնում', ru: 'Чем помогаем' }),
    servicesLabel: t({
      en: 'Relevant services',
      hy: 'Համապատասխան ծառայություններ',
      ru: 'Подходящие услуги',
    }),
    discuss: t({
      en: 'Discuss this challenge',
      hy: 'Քննարկել այս մարտահրավերը',
      ru: 'Обсудить эту задачу',
    }),
    items: [
      {
        icon: 'rocket' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Launch a New Digital Product',
          hy: 'Գործարկել նոր թվային արտադրանք',
          ru: 'Запустить новый цифровой продукт',
        }),
        challenge: t({
          en: 'You have a validated idea or an internal need and want a working product without assembling a team from scratch.',
          hy: 'Ունեք հաստատված գաղափար կամ ներքին կարիք և ցանկանում եք աշխատող արտադրանք՝ առանց թիմը զրոյից հավաքելու։',
          ru: 'У вас есть проверенная идея или внутренняя потребность, и нужен работающий продукт без сборки команды с нуля.',
        }),
        help: [
          t({
            en: 'Product discovery and scoping',
            hy: 'Արտադրանքի հետազոտում և շրջանակի սահմանում',
            ru: 'Исследование продукта и определение объёма',
          }),
          t({
            en: 'UX design and clickable prototype',
            hy: 'UX դիզայն և ինտերակտիվ նախատիպ',
            ru: 'UX-дизайн и кликабельный прототип',
          }),
          t({
            en: 'MVP built with room to scale',
            hy: 'MVP՝ մասշտաբավորման հնարավորությամբ',
            ru: 'MVP с запасом для масштабирования',
          }),
        ],
        services: [
          t({ en: 'Web Design & UI/UX', hy: 'Վեբ դիզայն և UI/UX', ru: 'Веб-дизайн и UI/UX' }),
          t({ en: 'Custom Software', hy: 'Պատվերով ծրագրակազմ', ru: 'Заказная разработка' }),
          t({ en: 'SaaS Development', hy: 'SaaS մշակում', ru: 'Разработка SaaS' }),
          t({ en: 'Mobile Apps', hy: 'Բջջային հավելվածներ', ru: 'Мобильные приложения' }),
        ],
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Modernize an Existing Software Platform',
          hy: 'Արդիականացնել գործող ծրագրային հարթակը',
          ru: 'Модернизировать существующую платформу',
        }),
        challenge: t({
          en: 'A business-critical system has become slow to change, hard to maintain or risky to run.',
          hy: 'Բիզնեսի համար կարևոր համակարգը դժվար է փոփոխել, սպասարկել կամ ռիսկային է շահագործել։',
          ru: 'Критичная для бизнеса система стала медленной в изменениях, сложной в поддержке или рискованной в эксплуатации.',
        }),
        help: [
          t({
            en: 'Architecture and code assessment',
            hy: 'Ճարտարապետության և կոդի գնահատում',
            ru: 'Оценка архитектуры и кода',
          }),
          t({
            en: 'Incremental refactoring roadmap',
            hy: 'Աստիճանական ռեֆակտորինգի ճանապարհային քարտեզ',
            ru: 'План поэтапного рефакторинга',
          }),
          t({
            en: 'Modernized APIs and infrastructure',
            hy: 'Արդիականացված API-ներ և ենթակառուցվածք',
            ru: 'Обновлённые API и инфраструктура',
          }),
        ],
        services: [
          t({
            en: 'Legacy Modernization',
            hy: 'Հին համակարգերի արդիականացում',
            ru: 'Модернизация legacy-систем',
          }),
          t({ en: 'Backend & API', hy: 'Backend և API', ru: 'Backend и API' }),
          t({ en: 'DevOps', hy: 'DevOps', ru: 'DevOps' }),
        ],
      },
      {
        icon: 'workflow' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Automate Repetitive Business Operations',
          hy: 'Ավտոմատացնել կրկնվող բիզնես գործառնությունները',
          ru: 'Автоматизировать повторяющиеся операции',
        }),
        challenge: t({
          en: 'Teams spend hours on manual data entry, triage and reporting between tools.',
          hy: 'Թիմերը ժամեր են ծախսում ձեռքով տվյալների մուտքագրման, տեսակավորման և գործիքների միջև հաշվետվությունների վրա։',
          ru: 'Команды тратят часы на ручной ввод данных, сортировку и отчётность между инструментами.',
        }),
        help: [
          t({
            en: 'Process mapping and prioritization',
            hy: 'Գործընթացների քարտեզագրում և առաջնահերթում',
            ru: 'Картирование и приоритизация процессов',
          }),
          t({
            en: 'Automation and agent design',
            hy: 'Ավտոմատացման և գործակալների նախագծում',
            ru: 'Проектирование автоматизации и агентов',
          }),
          t({
            en: 'Integration, logging and monitoring',
            hy: 'Ինտեգրում, գրանցում և մոնիթորինգ',
            ru: 'Интеграция, логирование и мониторинг',
          }),
        ],
        services: [
          t({
            en: 'AI Agents & Automation',
            hy: 'AI գործակալներ և ավտոմատացում',
            ru: 'AI-агенты и автоматизация',
          }),
          t({ en: 'Backend & API', hy: 'Backend և API', ru: 'Backend и API' }),
          t({ en: 'Custom Software', hy: 'Պատվերով ծրագրակազմ', ru: 'Заказная разработка' }),
        ],
      },
      {
        icon: 'sparkle' satisfies AppIconName,
        tone: 'accent' satisfies ChallengeTone,
        title: t({
          en: 'Introduce AI Into Existing Workflows',
          hy: 'Ներդնել AI-ն գործող աշխատանքային հոսքերում',
          ru: 'Внедрить AI в существующие процессы',
        }),
        challenge: t({
          en: 'You want practical AI inside the tools people already use — with control over data and quality.',
          hy: 'Ցանկանում եք գործնական AI այն գործիքներում, որոնք մարդիկ արդեն օգտագործում են՝ տվյալների և որակի վերահսկողությամբ։',
          ru: 'Нужен практичный AI внутри инструментов, которыми люди уже пользуются, — с контролем данных и качества.',
        }),
        help: [
          t({
            en: 'Use-case selection and validation',
            hy: 'Կիրառման դեպքերի ընտրություն և վավերացում',
            ru: 'Выбор и проверка сценариев применения',
          }),
          t({
            en: 'Grounded assistants and retrieval',
            hy: 'Հիմնավորված օգնականներ և որոնում',
            ru: 'Ассистенты с опорой на данные и поиск',
          }),
          t({
            en: 'Guardrails and human review steps',
            hy: 'Պաշտպանիչ մեխանիզմներ և մարդկային ստուգման քայլեր',
            ru: 'Ограничения и этапы проверки человеком',
          }),
        ],
        services: [
          t({ en: 'AI Development', hy: 'AI մշակում', ru: 'AI-разработка' }),
          t({
            en: 'Claude & AI Workflow',
            hy: 'Claude և AI աշխատահոսք',
            ru: 'Claude и AI-процессы',
          }),
          t({
            en: 'AI Agents & Automation',
            hy: 'AI գործակալներ և ավտոմատացում',
            ru: 'AI-агенты и автоматизация',
          }),
        ],
      },
      {
        icon: 'plug' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Connect Disconnected Business Systems',
          hy: 'Միացնել իրարից անջատ բիզնես համակարգերը',
          ru: 'Связать разрозненные бизнес-системы',
        }),
        challenge: t({
          en: "CRM, ERP, payments and internal tools don't share data, so people bridge the gaps by hand.",
          hy: 'CRM-ը, ERP-ն, վճարումները և ներքին գործիքները չեն փոխանակում տվյալներ, ուստի մարդիկ ձեռքով են լրացնում բացերը։',
          ru: 'CRM, ERP, платежи и внутренние инструменты не обмениваются данными, и люди закрывают разрывы вручную.',
        }),
        help: [
          t({
            en: 'Integration architecture',
            hy: 'Ինտեգրման ճարտարապետություն',
            ru: 'Архитектура интеграций',
          }),
          t({
            en: 'APIs and middleware',
            hy: 'API-ներ և միջնաշերտ',
            ru: 'API и промежуточный слой',
          }),
          t({
            en: 'Data sync with monitoring',
            hy: 'Տվյալների համաժամացում մոնիթորինգով',
            ru: 'Синхронизация данных с мониторингом',
          }),
        ],
        services: [
          t({ en: 'Backend & API', hy: 'Backend և API', ru: 'Backend и API' }),
          t({ en: 'Custom Software', hy: 'Պատվերով ծրագրակազմ', ru: 'Заказная разработка' }),
          t({
            en: 'Cloud Infrastructure',
            hy: 'Ամպային ենթակառուցվածք',
            ru: 'Облачная инфраструктура',
          }),
        ],
      },
      {
        icon: 'users' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Scale Engineering Capacity',
          hy: 'Մասշտաբավորել ինժեներական հզորությունը',
          ru: 'Масштабировать инженерные ресурсы',
        }),
        challenge: t({
          en: 'Your roadmap is larger than your team, and hiring senior engineers takes time.',
          hy: 'Ձեր ճանապարհային քարտեզը մեծ է թիմից, իսկ փորձառու ինժեներների հավաքագրումը ժամանակ է պահանջում։',
          ru: 'Ваш роадмап больше команды, а наём senior-инженеров занимает время.',
        }),
        help: [
          t({
            en: 'Senior specialists matched to your needs',
            hy: 'Ձեր կարիքներին համապատասխան փորձառու մասնագետներ',
            ru: 'Senior-специалисты под ваши задачи',
          }),
          t({
            en: 'Integration into your processes and tools',
            hy: 'Ինտեգրում ձեր գործընթացներին և գործիքներին',
            ru: 'Интеграция в ваши процессы и инструменты',
          }),
          t({
            en: 'Flexible team composition',
            hy: 'Թիմի ճկուն կազմ',
            ru: 'Гибкий состав команды',
          }),
        ],
        services: [
          t({ en: 'Dedicated Teams', hy: 'Հատուկ թիմեր', ru: 'Выделенные команды' }),
          t({
            en: 'White-Label Development',
            hy: 'White-Label մշակում',
            ru: 'White-label разработка',
          }),
        ],
      },
      {
        icon: 'layers' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Build a SaaS Product',
          hy: 'Ստեղծել SaaS արտադրանք',
          ru: 'Создать SaaS-продукт',
        }),
        challenge: t({
          en: "You're turning expertise or an internal tool into a subscription product.",
          hy: 'Փորձագիտությունը կամ ներքին գործիքը վերածում եք բաժանորդագրային արտադրանքի։',
          ru: 'Вы превращаете экспертизу или внутренний инструмент в продукт по подписке.',
        }),
        help: [
          t({
            en: 'Multi-tenant architecture',
            hy: 'Բազմաբաժանորդ ճարտարապետություն',
            ru: 'Мультитенантная архитектура',
          }),
          t({
            en: 'Authentication, billing and admin',
            hy: 'Նույնականացում, վճարումներ և ադմինիստրում',
            ru: 'Аутентификация, биллинг и админка',
          }),
          t({
            en: 'Analytics and scalable infrastructure',
            hy: 'Վերլուծություն և մասշտաբավորվող ենթակառուցվածք',
            ru: 'Аналитика и масштабируемая инфраструктура',
          }),
        ],
        services: [
          t({ en: 'SaaS Development', hy: 'SaaS մշակում', ru: 'Разработка SaaS' }),
          t({ en: 'Web Design & UI/UX', hy: 'Վեբ դիզայն և UI/UX', ru: 'Веб-дизайн и UI/UX' }),
          t({
            en: 'Cloud Infrastructure',
            hy: 'Ամպային ենթակառուցվածք',
            ru: 'Облачная инфраструктура',
          }),
          t({ en: 'DevOps', hy: 'DevOps', ru: 'DevOps' }),
        ],
      },
      {
        icon: 'shield-check' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Improve Deployment and Infrastructure Reliability',
          hy: 'Բարելավել տեղակայման և ենթակառուցվածքի հուսալիությունը',
          ru: 'Повысить надёжность развёртывания и инфраструктуры',
        }),
        challenge: t({
          en: 'Releases are manual and stressful, and problems are discovered by customers first.',
          hy: 'Թողարկումները ձեռքով են և սթրեսային, իսկ խնդիրներն առաջինը հայտնաբերում են հաճախորդները։',
          ru: 'Релизы ручные и напряжённые, а проблемы первыми находят клиенты.',
        }),
        help: [
          t({ en: 'CI/CD pipelines', hy: 'CI/CD հոսքագծեր', ru: 'CI/CD-конвейеры' }),
          t({
            en: 'Monitoring and alerting',
            hy: 'Մոնիթորինգ և ծանուցումներ',
            ru: 'Мониторинг и оповещения',
          }),
          t({
            en: 'Backups and recovery planning',
            hy: 'Պահուստավորում և վերականգնման պլանավորում',
            ru: 'Резервные копии и план восстановления',
          }),
        ],
        services: [
          t({ en: 'DevOps', hy: 'DevOps', ru: 'DevOps' }),
          t({
            en: 'Cloud Infrastructure',
            hy: 'Ամպային ենթակառուցվածք',
            ru: 'Облачная инфраструктура',
          }),
          t({
            en: 'Maintenance & Support',
            hy: 'Սպասարկում և աջակցություն',
            ru: 'Поддержка и сопровождение',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default challengesContent;
