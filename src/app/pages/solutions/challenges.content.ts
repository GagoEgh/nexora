import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';
import type { ChallengeId, ChallengeTone } from './challenge';

const challengesContent = {
  key: 'solutions-challenges',
  content: {
    challengeLabel: t({ en: 'The challenge', hy: 'Մարտահրավեր', ru: 'Задача' }),
    helpLabel: t({ en: 'How we help', hy: 'Ինչպես ենք օգնում', ru: 'Как мы помогаем' }),
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
        id: 'launch-digital-product' satisfies ChallengeId,
        icon: 'rocket' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Launch a New Digital Product',
          hy: 'Գործարկել նոր թվային արտադրանք',
          ru: 'Запустить новый цифровой продукт',
        }),
        challenge: t({
          en: 'You have a validated idea or an internal need and want a working product without assembling a team from scratch.',
          hy: 'Դուք ունեք վավերացված գաղափար կամ ներքին բիզնես կարիք և ցանկանում եք ստանալ աշխատող արտադրանք՝ առանց զրոյից թիմ հավաքելու։',
          ru: 'У вас есть проверенная идея или внутренняя бизнес-задача, и вы хотите получить работающий продукт без необходимости собирать команду с нуля.',
        }),
        help: [
          t({
            en: 'Product discovery and scoping',
            hy: 'Արտադրանքի ուսումնասիրություն և աշխատանքի շրջանակի սահմանում',
            ru: 'Исследование продукта и определение объёма работ',
          }),
          t({
            en: 'UX design and clickable prototype',
            hy: 'UX դիզայն և ինտերակտիվ նախատիպ',
            ru: 'UX-дизайн и интерактивный прототип',
          }),
          t({
            en: 'MVP built with room to scale',
            hy: 'MVP՝ հետագա ընդլայնման հնարավորությամբ',
            ru: 'MVP с возможностью дальнейшего масштабирования',
          }),
        ],
        services: [
          t({ en: 'Web Design & UI/UX', hy: 'Վեբ դիզայն և UI/UX', ru: 'Веб-дизайн и UI/UX' }),
          t({
            en: 'Custom Software',
            hy: 'Պատվերով ծրագրային լուծումներ',
            ru: 'Заказная разработка ПО',
          }),
          t({
            en: 'SaaS Development',
            hy: 'SaaS լուծումների մշակում',
            ru: 'Разработка SaaS-продуктов',
          }),
          t({ en: 'Mobile Apps', hy: 'Բջջային հավելվածներ', ru: 'Мобильные приложения' }),
        ],
      },
      {
        id: 'modernize-platform' satisfies ChallengeId,
        icon: 'refresh-cw' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Modernize an Existing Software Platform',
          hy: 'Արդիականացնել գործող ծրագրային հարթակը',
          ru: 'Модернизировать существующую программную платформу',
        }),
        challenge: t({
          en: 'A business-critical system has become slow to change, hard to maintain or risky to run.',
          hy: 'Բիզնեսի համար կարևոր համակարգը դժվարացել է փոփոխել ու սպասարկել, իսկ դրա շահագործումը՝ ռիսկային դարձել։',
          ru: 'Критически важную для бизнеса систему стало сложно изменять и сопровождать, а её эксплуатация сопряжена с рисками.',
        }),
        help: [
          t({
            en: 'Architecture and code assessment',
            hy: 'Ճարտարապետության և կոդի գնահատում',
            ru: 'Аудит архитектуры и кода',
          }),
          t({
            en: 'Incremental refactoring roadmap',
            hy: 'Աստիճանական ռեֆակտորինգի ճանապարհային քարտեզ',
            ru: 'План поэтапного рефакторинга',
          }),
          t({
            en: 'Modernized APIs and infrastructure',
            hy: 'Արդիականացված API-ներ և ենթակառուցվածք',
            ru: 'Модернизация API и инфраструктуры',
          }),
        ],
        services: [
          t({
            en: 'Legacy Modernization',
            hy: 'Ժառանգական համակարգերի արդիականացում',
            ru: 'Модернизация legacy-систем',
          }),
          t({ en: 'Backend & API', hy: 'Backend և API', ru: 'Backend и API' }),
          t({ en: 'DevOps', hy: 'DevOps', ru: 'DevOps' }),
        ],
      },
      {
        id: 'automate-operations' satisfies ChallengeId,
        icon: 'workflow' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Automate Repetitive Business Operations',
          hy: 'Ավտոմատացնել կրկնվող բիզնես գործընթացները',
          ru: 'Автоматизировать повторяющиеся бизнес-процессы',
        }),
        challenge: t({
          en: 'Teams spend hours on manual data entry, triage and reporting between tools.',
          hy: 'Թիմերը ժամեր են ծախսում տվյալները ձեռքով մուտքագրելու, դասակարգելու և տարբեր գործիքների միջև հաշվետվություններ կազմելու վրա։',
          ru: 'Команды тратят часы на ручной ввод и сортировку данных, а также на подготовку отчётов с использованием разных инструментов.',
        }),
        help: [
          t({
            en: 'Process mapping and prioritization',
            hy: 'Գործընթացների քարտեզագրում և առաջնահերթությունների սահմանում',
            ru: 'Картирование процессов и определение приоритетов',
          }),
          t({
            en: 'Automation and agent design',
            hy: 'Ավտոմատացման լուծումների և AI գործակալների նախագծում',
            ru: 'Проектирование автоматизации и AI-агентов',
          }),
          t({
            en: 'Integration, logging and monitoring',
            hy: 'Ինտեգրում, իրադարձությունների գրանցում և մոնիթորինգ',
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
          t({
            en: 'Custom Software',
            hy: 'Պատվերով ծրագրային լուծումներ',
            ru: 'Заказная разработка ПО',
          }),
        ],
      },
      {
        id: 'introduce-ai' satisfies ChallengeId,
        icon: 'sparkle' satisfies AppIconName,
        tone: 'accent' satisfies ChallengeTone,
        title: t({
          en: 'Introduce AI Into Existing Workflows',
          hy: 'Ներդնել AI-ը գործող աշխատանքային գործընթացներում',
          ru: 'Внедрить AI в существующие рабочие процессы',
        }),
        challenge: t({
          en: 'You want practical AI inside the tools people already use — with control over data and quality.',
          hy: 'Ցանկանում եք AI-ի գործնական կիրառություն արդեն օգտագործվող գործիքներում՝ պահպանելով տվյալների և արդյունքների որակի նկատմամբ վերահսկողությունը։',
          ru: 'Вы хотите внедрить практические AI-решения в уже используемые инструменты, сохраняя контроль над данными и качеством результатов.',
        }),
        help: [
          t({
            en: 'Use-case selection and validation',
            hy: 'Կիրառման սցենարների ընտրություն և վավերացում',
            ru: 'Выбор и проверка сценариев применения',
          }),
          t({
            en: 'Grounded assistants and retrieval',
            hy: 'Տվյալների վրա հիմնված օգնականներ և տեղեկատվության որոնում',
            ru: 'Ассистенты с опорой на данные и поиск информации',
          }),
          t({
            en: 'Guardrails and human review steps',
            hy: 'Անվտանգության սահմանափակումներ և մարդկային վերահսկողության փուլեր',
            ru: 'Механизмы контроля и этапы проверки человеком',
          }),
        ],
        services: [
          t({ en: 'AI Development', hy: 'AI լուծումների մշակում', ru: 'Разработка AI-решений' }),
          t({
            en: 'Claude & AI Workflow',
            hy: 'Claude և AI աշխատանքային գործընթացներ',
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
        id: 'connect-systems' satisfies ChallengeId,
        icon: 'plug' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Connect Disconnected Business Systems',
          hy: 'Ինտեգրել միմյանցից անջատ բիզնես համակարգերը',
          ru: 'Интегрировать разрозненные бизнес-системы',
        }),
        challenge: t({
          en: "CRM, ERP, payments and internal tools don't share data, so people bridge the gaps by hand.",
          hy: 'CRM-ը, ERP-ն, վճարային համակարգերն ու ներքին գործիքները տվյալներ չեն փոխանակում, ուստի աշխատակիցները ստիպված են ձեռքով լրացնել այդ բացերը։',
          ru: 'CRM, ERP, платёжные системы и внутренние инструменты не обмениваются данными, поэтому сотрудникам приходится вручную устранять эти разрывы.',
        }),
        help: [
          t({
            en: 'Integration architecture',
            hy: 'Ինտեգրումների ճարտարապետություն',
            ru: 'Архитектура интеграций',
          }),
          t({
            en: 'APIs and middleware',
            hy: 'API-ներ և միջանկյալ ծրագրային շերտ',
            ru: 'API и промежуточный программный слой',
          }),
          t({
            en: 'Data sync with monitoring',
            hy: 'Տվյալների համաժամացում և մոնիթորինգ',
            ru: 'Синхронизация данных и мониторинг',
          }),
        ],
        services: [
          t({ en: 'Backend & API', hy: 'Backend և API', ru: 'Backend и API' }),
          t({
            en: 'Custom Software',
            hy: 'Պատվերով ծրագրային լուծումներ',
            ru: 'Заказная разработка ПО',
          }),
          t({
            en: 'Cloud Infrastructure',
            hy: 'Ամպային ենթակառուցվածք',
            ru: 'Облачная инфраструктура',
          }),
        ],
      },
      {
        id: 'scale-engineering' satisfies ChallengeId,
        icon: 'users' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Scale Engineering Capacity',
          hy: 'Ընդլայնել ինժեներական թիմի կարողությունները',
          ru: 'Увеличить инженерные ресурсы команды',
        }),
        challenge: t({
          en: 'Your roadmap is larger than your team, and hiring senior engineers takes time.',
          hy: 'Նախատեսված աշխատանքների ծավալը գերազանցում է թիմի կարողությունները, իսկ փորձառու ինժեներների հավաքագրումը ժամանակ է պահանջում։',
          ru: 'Объём запланированных задач превышает возможности команды, а найм опытных инженеров требует времени.',
        }),
        help: [
          t({
            en: 'Senior specialists matched to your needs',
            hy: 'Ձեր կարիքներին համապատասխան Senior մասնագետներ',
            ru: 'Senior-специалисты с учётом ваших задач',
          }),
          t({
            en: 'Integration into your processes and tools',
            hy: 'Ինտեգրում ձեր գործընթացներին և գործիքներին',
            ru: 'Интеграция в ваши процессы и инструменты',
          }),
          t({
            en: 'Flexible team composition',
            hy: 'Թիմի ճկուն կազմավորում',
            ru: 'Гибкий состав команды',
          }),
        ],
        services: [
          t({ en: 'Dedicated Teams', hy: 'Ձեզ հատկացված թիմեր', ru: 'Выделенные команды' }),
          t({
            en: 'White-Label Development',
            hy: 'White-label մշակում',
            ru: 'White-label-разработка',
          }),
        ],
      },
      {
        id: 'build-saas' satisfies ChallengeId,
        icon: 'layers' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Build a SaaS Product',
          hy: 'Ստեղծել SaaS արտադրանք',
          ru: 'Создать SaaS-продукт',
        }),
        challenge: t({
          en: "You're turning expertise or an internal tool into a subscription product.",
          hy: 'Դուք ձեր փորձառությունը կամ ներքին գործիքը վերածում եք բաժանորդագրության վրա հիմնված արտադրանքի։',
          ru: 'Вы превращаете свою экспертизу или внутренний инструмент в продукт с подписочной моделью.',
        }),
        help: [
          t({
            en: 'Multi-tenant architecture',
            hy: 'Մի քանի հաճախորդի սպասարկման ճարտարապետություն',
            ru: 'Мультитенантная архитектура',
          }),
          t({
            en: 'Authentication, billing and admin',
            hy: 'Նույնականացում, վճարումների կառավարում և ադմինիստրատիվ գործիքներ',
            ru: 'Аутентификация, биллинг и административные инструменты',
          }),
          t({
            en: 'Analytics and scalable infrastructure',
            hy: 'Վերլուծություն և մասշտաբավորվող ենթակառուցվածք',
            ru: 'Аналитика и масштабируемая инфраструктура',
          }),
        ],
        services: [
          t({
            en: 'SaaS Development',
            hy: 'SaaS լուծումների մշակում',
            ru: 'Разработка SaaS-продуктов',
          }),
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
        id: 'improve-reliability' satisfies ChallengeId,
        icon: 'shield-check' satisfies AppIconName,
        tone: 'plain' satisfies ChallengeTone,
        title: t({
          en: 'Improve Deployment and Infrastructure Reliability',
          hy: 'Բարձրացնել տեղակայման և ենթակառուցվածքի հուսալիությունը',
          ru: 'Повысить надёжность развёртывания и инфраструктуры',
        }),
        challenge: t({
          en: 'Releases are manual and stressful, and problems are discovered by customers first.',
          hy: 'Թողարկումները կատարվում են ձեռքով և ուղեկցվում են լարվածությամբ, իսկ խնդիրներն առաջինը հայտնաբերում են հաճախորդները։',
          ru: 'Релизы выполняются вручную и сопровождаются стрессом, а проблемы первыми обнаруживают клиенты.',
        }),
        help: [
          t({
            en: 'CI/CD pipelines',
            hy: 'CI/CD խողովակաշարեր',
            ru: 'CI/CD-конвейеры',
          }),
          t({
            en: 'Monitoring and alerting',
            hy: 'Մոնիթորինգ և ծանուցումներ',
            ru: 'Мониторинг и оповещения',
          }),
          t({
            en: 'Backups and recovery planning',
            hy: 'Պահուստային պատճեններ և վերականգնման պլանավորում',
            ru: 'Резервное копирование и планирование восстановления',
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
            hy: 'Տեխնիկական սպասարկում և աջակցություն',
            ru: 'Техническое обслуживание и поддержка',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default challengesContent;
