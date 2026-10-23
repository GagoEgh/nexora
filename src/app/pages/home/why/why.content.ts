import { t, type Dictionary } from 'intlayer';

const whyContent = {
  key: 'why',
  content: {
    eyebrow: t({ en: 'Why Nexora', hy: 'Ինչու Nexora', ru: 'Почему Nexora' }),
    title: t({
      en: 'Senior engineering, applied to real business problems.',
      hy: 'Senior ինժեներիա՝ կիրառված իրական բիզնես խնդիրների վրա։',
      ru: 'Senior-инженерия, применённая к реальным бизнес-задачам.',
    }),
    lead: t({
      en: 'Good software is mostly good decisions. We keep teams small and senior so that architecture, trade-offs and delivery stay in experienced hands from the first conversation onward.',
      hy: 'Լավ ծրագրային ապահովումը հիմնականում լավ որոշումներ են։ Մենք թիմերը պահում ենք փոքր և senior, որպեսզի ճարտարապետությունը, փոխզիջումները և մատակարարումը առաջին զրույցից սկսած մնան փորձառու ձեռքերում։',
      ru: 'Хорошее ПО — это прежде всего хорошие решения. Мы держим команды небольшими и senior-уровня, чтобы архитектура, компромиссы и поставка с первого разговора оставались в опытных руках.',
    }),
    team: {
      title: t({
        en: 'One team, every discipline',
        hy: 'Մեկ թիմ, բոլոր ուղղությունները',
        ru: 'Одна команда, все дисциплины',
      }),
      disciplinesLabel: t({ en: 'Disciplines', hy: 'Ուղղություններ', ru: 'Дисциплины' }),
      note: t({
        en: 'Combined per project — only the disciplines the work actually needs.',
        hy: 'Համադրվում են ըստ նախագծի՝ միայն այն ուղղությունները, որոնք իրականում անհրաժեշտ են։',
        ru: 'Собираются под проект — только те дисциплины, которые действительно нужны.',
      }),
    },
    disciplines: [
      {
        label: t({
          en: 'Solution architecture',
          hy: 'Լուծումների ճարտարապետություն',
          ru: 'Архитектура решений',
        }),
        reasons: [
          {
            title: t({
              en: 'Senior & Senior+ engineers',
              hy: 'Senior և Senior+ ինժեներներ',
              ru: 'Senior и Senior+ инженеры',
            }),
            description: t({
              en: 'Every engineer on a Nexora project works at senior level or above — fewer hand-offs, fewer rewrites, and technical decisions made with experience.',
              hy: 'Nexora-ի նախագծերում յուրաքանչյուր ինժեներ աշխատում է senior կամ ավելի բարձր մակարդակով՝ ավելի քիչ փոխանցումներ, ավելի քիչ վերագրումներ և փորձով կայացված տեխնիկական որոշումներ։',
              ru: 'Каждый инженер в проекте Nexora работает на уровне senior и выше — меньше передач, меньше переписываний, технические решения принимаются с опытом.',
            }),
          },
          {
            title: t({
              en: 'End-to-end delivery',
              hy: 'Ամբողջական մատակարարում',
              ru: 'Полный цикл поставки',
            }),
            description: t({
              en: 'Design, architecture, development, integration, deployment and support from one accountable team, combining disciplines inside a single project when needed.',
              hy: 'Դիզայն, ճարտարապետություն, մշակում, ինտեգրում, տեղակայում և աջակցություն մեկ պատասխանատու թիմից՝ անհրաժեշտության դեպքում համադրելով ուղղությունները մեկ նախագծում։',
              ru: 'Дизайн, архитектура, разработка, интеграция, развёртывание и поддержка от одной ответственной команды, при необходимости объединяющей дисциплины в рамках одного проекта.',
            }),
          },
          {
            title: t({
              en: 'Business-first approach',
              hy: 'Բիզնեսից ելնող մոտեցում',
              ru: 'Подход от бизнеса',
            }),
            description: t({
              en: 'We start from the problem you need to solve and the constraints you work within, then choose the technology — not the other way round.',
              hy: 'Մենք սկսում ենք այն խնդրից, որը պետք է լուծեք, և այն սահմանափակումներից, որոնց մեջ աշխատում եք, հետո ընտրում ենք տեխնոլոգիան՝ ոչ թե հակառակը։',
              ru: 'Мы начинаем с задачи, которую вам нужно решить, и ограничений, в которых вы работаете, а затем выбираем технологию — не наоборот.',
            }),
          },
          {
            title: t({
              en: 'Flexible collaboration',
              hy: 'Ճկուն համագործակցություն',
              ru: 'Гибкое сотрудничество',
            }),
            description: t({
              en: 'Scoped projects, dedicated specialists, white-label execution or ongoing support. The engagement model follows your situation.',
              hy: 'Սահմանված նախագծեր, նվիրված մասնագետներ, white-label կատարում կամ շարունակական աջակցություն։ Համագործակցության մոդելը հետևում է ձեր իրավիճակին։',
              ru: 'Проекты с фиксированным объёмом, выделенные специалисты, white-label исполнение или постоянная поддержка. Модель сотрудничества подстраивается под вашу ситуацию.',
            }),
          },
          {
            title: t({
              en: 'Long-term technical partnership',
              hy: 'Երկարաժամկետ տեխնիկական գործընկերություն',
              ru: 'Долгосрочное техническое партнёрство',
            }),
            description: t({
              en: 'Maintainable architecture, current documentation, and engineers who can keep evolving the system with you as the business changes.',
              hy: 'Սպասարկվող ճարտարապետություն, արդի փաստաթղթեր և ինժեներներ, որոնք կարող են շարունակել զարգացնել համակարգը ձեզ հետ, երբ բիզնեսը փոխվում է։',
              ru: 'Поддерживаемая архитектура, актуальная документация и инженеры, которые продолжают развивать систему вместе с вами по мере изменений бизнеса.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'Backend', hy: 'Backend', ru: 'Backend' }),
        reasons: [
          {
            title: t({
              en: 'Services built to last',
              hy: 'Երկարակյաց ծառայություններ',
              ru: 'Сервисы, рассчитанные на годы',
            }),
            description: t({
              en: 'APIs, data models and integrations designed around your domain, with clear boundaries that keep change cheap as the product grows.',
              hy: 'API-ներ, տվյալների մոդելներ և ինտեգրումներ՝ նախագծված ձեր ոլորտի շուրջ, հստակ սահմաններով, որոնք փոփոխությունը պահում են էժան, երբ պրոդուկտն աճում է։',
              ru: 'API, модели данных и интеграции, спроектированные вокруг вашей предметной области, с чёткими границами, благодаря которым изменения остаются дешёвыми по мере роста продукта.',
            }),
          },
          {
            title: t({
              en: 'Reliability by default',
              hy: 'Հուսալիություն լռելյայն',
              ru: 'Надёжность по умолчанию',
            }),
            description: t({
              en: 'Observability, automated tests and error budgets are part of the definition of done, not a later phase.',
              hy: 'Դիտարկելիությունը, ավտոմատ թեստերը և սխալների բյուջեները ավարտի սահմանման մաս են, ոչ թե հետագա փուլ։',
              ru: 'Наблюдаемость, автоматические тесты и бюджеты ошибок — часть определения готовности, а не отдельный поздний этап.',
            }),
          },
          {
            title: t({
              en: 'Fits your platform',
              hy: 'Համապատասխանում է ձեր հարթակին',
              ru: 'Под вашу платформу',
            }),
            description: t({
              en: 'We work inside the languages, frameworks and cloud accounts you already run, so there is nothing new to operate afterwards.',
              hy: 'Մենք աշխատում ենք այն լեզուների, framework-ների և ամպային հաշիվների ներսում, որոնք արդեն օգտագործում եք, այնպես որ հետո նոր բան շահագործելու կարիք չկա։',
              ru: 'Мы работаем в тех языках, фреймворках и облачных аккаунтах, которые вы уже используете, поэтому после нас не появляется ничего нового в эксплуатации.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'Frontend', hy: 'Frontend', ru: 'Frontend' }),
        reasons: [
          {
            title: t({
              en: 'Interfaces that scale',
              hy: 'Մասշտաբավորվող ինտերֆեյսներ',
              ru: 'Масштабируемые интерфейсы',
            }),
            description: t({
              en: 'Component systems, design tokens and typed state so that new screens are assembled, not reinvented.',
              hy: 'Բաղադրիչների համակարգեր, դիզայն տոկեններ և տիպավորված վիճակ, որպեսզի նոր էկրանները հավաքվեն, ոչ թե նորից հորինվեն։',
              ru: 'Системы компонентов, дизайн-токены и типизированное состояние, чтобы новые экраны собирались, а не изобретались заново.',
            }),
          },
          {
            title: t({
              en: 'Performance and accessibility',
              hy: 'Արդյունավետություն և հասանելիություն',
              ru: 'Производительность и доступность',
            }),
            description: t({
              en: 'Measured load times, keyboard and screen-reader support, and responsive layouts verified against the design on real devices.',
              hy: 'Չափված բեռնման ժամանակներ, ստեղնաշարի և էկրանի ընթերցողի աջակցություն և դիզայնի դեմ ստուգված հարմարվող դասավորություններ իրական սարքերի վրա։',
              ru: 'Измеренное время загрузки, поддержка клавиатуры и скринридеров, адаптивные макеты, сверенные с дизайном на реальных устройствах.',
            }),
          },
          {
            title: t({
              en: 'Design-faithful delivery',
              hy: 'Դիզայնին հավատարիմ իրականացում',
              ru: 'Точное воплощение дизайна',
            }),
            description: t({
              en: 'Pixel-checked implementation of the approved designs, with the differences documented instead of discovered later.',
              hy: 'Հաստատված դիզայնի պիքսելային ճշգրտությամբ իրականացում՝ տարբերությունները փաստաթղթավորված, ոչ թե հետո հայտնաբերված։',
              ru: 'Реализация утверждённых макетов с попиксельной проверкой; расхождения документируются, а не обнаруживаются позже.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'Mobile', hy: 'Մոբայլ', ru: 'Мобильная разработка' }),
        reasons: [
          {
            title: t({
              en: 'Native where it matters',
              hy: 'Native այնտեղ, որտեղ կարևոր է',
              ru: 'Native там, где это важно',
            }),
            description: t({
              en: 'iOS, Android or cross-platform chosen per product, based on the features, devices and release cadence you actually need.',
              hy: 'iOS, Android կամ կրոսպլատֆորմ՝ ընտրված ըստ պրոդուկտի, ելնելով այն հնարավորություններից, սարքերից և թողարկման ռիթմից, որոնք իրականում պետք են։',
              ru: 'iOS, Android или кроссплатформа выбираются под продукт, исходя из нужных функций, устройств и ритма релизов.',
            }),
          },
          {
            title: t({
              en: 'Connected to your systems',
              hy: 'Միացված ձեր համակարգերին',
              ru: 'Связь с вашими системами',
            }),
            description: t({
              en: 'Apps that talk to the same backends, identity and analytics as the rest of your product, with offline behaviour designed in.',
              hy: 'Հավելվածներ, որոնք աշխատում են նույն backend-երի, ինքնության և վերլուծության հետ, ինչ ձեր պրոդուկտի մնացած մասը, նախագծված offline վարքով։',
              ru: 'Приложения работают с теми же backend-ами, идентификацией и аналитикой, что и остальной продукт, с заранее спроектированным offline-режимом.',
            }),
          },
          {
            title: t({
              en: 'Store-ready releases',
              hy: 'Խանութի համար պատրաստ թողարկումներ',
              ru: 'Релизы, готовые к сторам',
            }),
            description: t({
              en: 'Signing, review requirements, crash monitoring and staged roll-outs handled as part of delivery.',
              hy: 'Ստորագրում, վերանայման պահանջներ, խափանումների մոնիթորինգ և փուլային թողարկումներ՝ մատակարարման մաս։',
              ru: 'Подпись, требования ревью, мониторинг сбоев и поэтапные выкатки — часть поставки.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'AI engineering', hy: 'AI ինժեներիա', ru: 'AI-инженерия' }),
        reasons: [
          {
            title: t({
              en: 'Built into real processes',
              hy: 'Ներկառուցված իրական գործընթացներում',
              ru: 'Встроено в реальные процессы',
            }),
            description: t({
              en: 'Assistants, agents and retrieval wired into the workflows and systems your teams already use, not a separate demo.',
              hy: 'Օգնականներ, գործակալներ և որոնում՝ միացված այն աշխատահոսքերին և համակարգերին, որոնք ձեր թիմերն արդեն օգտագործում են, ոչ թե առանձին ցուցադրություն։',
              ru: 'Ассистенты, агенты и поиск встраиваются в рабочие процессы и системы, которыми ваши команды уже пользуются, а не живут отдельной демо-версией.',
            }),
          },
          {
            title: t({
              en: 'Measurable and controllable',
              hy: 'Չափելի և կառավարելի',
              ru: 'Измеримо и управляемо',
            }),
            description: t({
              en: 'Evaluation sets, guardrails and cost tracking from the first iteration, so quality and spend stay visible.',
              hy: 'Գնահատման հավաքածուներ, պաշտպանիչ սահմաններ և ծախսերի հետևում առաջին կրկնությունից, որպեսզի որակն ու ծախսը մնան տեսանելի։',
              ru: 'Наборы для оценки, ограничители и учёт затрат с первой итерации, чтобы качество и расходы оставались видимыми.',
            }),
          },
          {
            title: t({
              en: 'Your data stays yours',
              hy: 'Ձեր տվյալները մնում են ձերը',
              ru: 'Ваши данные остаются вашими',
            }),
            description: t({
              en: 'Model choice, hosting and data flows decided with your compliance constraints, including fully private deployments.',
              hy: 'Մոդելի ընտրությունը, հոսթինգը և տվյալների հոսքերը որոշվում են ձեր համապատասխանության պահանջներով, ներառյալ լիովին մասնավոր տեղակայումները։',
              ru: 'Выбор модели, хостинг и потоки данных определяются с учётом ваших требований комплаенса, включая полностью приватные развёртывания.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'DevOps', hy: 'DevOps', ru: 'DevOps' }),
        reasons: [
          {
            title: t({
              en: 'Releases become routine',
              hy: 'Թողարկումները դառնում են սովորական',
              ru: 'Релизы становятся рутиной',
            }),
            description: t({
              en: 'CI/CD pipelines, environments and rollbacks set up so that shipping is a daily non-event.',
              hy: 'CI/CD հոսքեր, միջավայրեր և հետադարձումներ՝ կարգավորված այնպես, որ թողարկումը դառնա ամենօրյա սովորական գործողություն։',
              ru: 'CI/CD-конвейеры, окружения и откаты настроены так, что выкатка становится ежедневной рутиной.',
            }),
          },
          {
            title: t({
              en: 'Infrastructure as code',
              hy: 'Ենթակառուցվածքը որպես կոդ',
              ru: 'Инфраструктура как код',
            }),
            description: t({
              en: 'Reproducible cloud environments under version control, reviewed like any other change.',
              hy: 'Վերարտադրելի ամպային միջավայրեր տարբերակների վերահսկողության տակ՝ վերանայված ինչպես ցանկացած այլ փոփոխություն։',
              ru: 'Воспроизводимые облачные окружения под контролем версий, проходящие ревью как любое другое изменение.',
            }),
          },
          {
            title: t({
              en: 'Monitoring that pays off',
              hy: 'Մոնիթորինգ, որն արդյունք է տալիս',
              ru: 'Мониторинг, который окупается',
            }),
            description: t({
              en: 'Alerts tied to user impact, dashboards your team actually reads, and incident reviews that remove the root cause.',
              hy: 'Ազդանշաններ՝ կապված օգտատերերի վրա ազդեցության հետ, վահանակներ, որոնք ձեր թիմն իրոք կարդում է, և միջադեպերի վերանայումներ, որոնք վերացնում են արմատական պատճառը։',
              ru: 'Оповещения, привязанные к влиянию на пользователей, дашборды, которые команда действительно читает, и разборы инцидентов, устраняющие первопричину.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'UI/UX', hy: 'UI/UX', ru: 'UI/UX' }),
        reasons: [
          {
            title: t({
              en: 'Research before pixels',
              hy: 'Հետազոտություն պիքսելներից առաջ',
              ru: 'Исследование до пикселей',
            }),
            description: t({
              en: 'Interviews, flows and prototypes that validate the problem with real users before anything is built.',
              hy: 'Հարցազրույցներ, հոսքեր և նախատիպեր, որոնք հաստատում են խնդիրը իրական օգտատերերի հետ՝ նախքան որևէ բան կառուցելը։',
              ru: 'Интервью, сценарии и прототипы, подтверждающие задачу с реальными пользователями до начала разработки.',
            }),
          },
          {
            title: t({
              en: 'Design systems, not one-offs',
              hy: 'Դիզայն համակարգեր, ոչ թե միանվագ լուծումներ',
              ru: 'Дизайн-системы, а не разовые макеты',
            }),
            description: t({
              en: 'Tokens, components and documentation that engineers can implement exactly and product teams can extend.',
              hy: 'Տոկեններ, բաղադրիչներ և փաստաթղթեր, որոնք ինժեներները կարող են ճշգրիտ իրականացնել, իսկ պրոդուկտի թիմերը՝ ընդլայնել։',
              ru: 'Токены, компоненты и документация, которые инженеры реализуют точно, а продуктовые команды могут расширять.',
            }),
          },
          {
            title: t({
              en: 'Clarity for complex products',
              hy: 'Պարզություն բարդ պրոդուկտների համար',
              ru: 'Ясность для сложных продуктов',
            }),
            description: t({
              en: 'Dense workflows and data made understandable through hierarchy, progressive disclosure and consistent patterns.',
              hy: 'Խիտ աշխատահոսքեր և տվյալներ՝ դարձված հասկանալի հիերարխիայի, աստիճանական բացահայտման և հետևողական օրինաչափությունների միջոցով։',
              ru: 'Насыщенные сценарии и данные становятся понятными благодаря иерархии, постепенному раскрытию и единым паттернам.',
            }),
          },
        ],
      },
      {
        label: t({ en: 'QA', hy: 'QA', ru: 'QA' }),
        reasons: [
          {
            title: t({
              en: 'Automation first',
              hy: 'Նախ ավտոմատացում',
              ru: 'Сначала автоматизация',
            }),
            description: t({
              en: 'Unit, integration and end-to-end suites that run on every change, so regressions are caught before review.',
              hy: 'Միավորի, ինտեգրման և ամբողջական թեստերի հավաքածուներ, որոնք աշխատում են յուրաքանչյուր փոփոխության ժամանակ, որպեսզի ռեգրեսիաները բռնվեն մինչև վերանայումը։',
              ru: 'Модульные, интеграционные и end-to-end наборы запускаются на каждое изменение, поэтому регрессии ловятся до ревью.',
            }),
          },
          {
            title: t({
              en: 'Risk-based coverage',
              hy: 'Ռիսկի վրա հիմնված ծածկույթ',
              ru: 'Покрытие по рискам',
            }),
            description: t({
              en: 'Test effort focused on the flows that carry revenue and compliance, with the evidence documented per release.',
              hy: 'Թեստավորման ջանքերը կենտրոնացված են այն հոսքերի վրա, որոնք բերում են եկամուտ և համապատասխանություն՝ ապացույցները փաստաթղթավորված յուրաքանչյուր թողարկման համար։',
              ru: 'Усилия сосредоточены на сценариях, несущих выручку и комплаенс, с задокументированными результатами по каждому релизу.',
            }),
          },
          {
            title: t({
              en: 'Quality as a team habit',
              hy: 'Որակը որպես թիմային սովորություն',
              ru: 'Качество как привычка команды',
            }),
            description: t({
              en: 'Reviews, definitions of done and test design shared across engineers rather than owned by a separate gate.',
              hy: 'Վերանայումներ, ավարտի սահմանումներ և թեստերի նախագծում՝ ընդհանուր բոլոր ինժեներների համար, ոչ թե առանձին դարպասի սեփականություն։',
              ru: 'Ревью, критерии готовности и проектирование тестов — общее дело инженеров, а не отдельный барьер.',
            }),
          },
        ],
      },
      {
        label: t({
          en: 'Technical leadership',
          hy: 'Տեխնիկական ղեկավարություն',
          ru: 'Техническое лидерство',
        }),
        reasons: [
          {
            title: t({
              en: 'Decisions you can defend',
              hy: 'Որոշումներ, որոնք կարող եք պաշտպանել',
              ru: 'Решения, которые можно отстоять',
            }),
            description: t({
              en: 'Architecture reviews, written trade-offs and roadmaps that stakeholders and engineers can both read.',
              hy: 'Ճարտարապետության վերանայումներ, գրավոր փոխզիջումներ և ճանապարհային քարտեզներ, որոնք կարող են կարդալ և՛ շահագրգիռ կողմերը, և՛ ինժեներները։',
              ru: 'Архитектурные ревью, письменно зафиксированные компромиссы и роадмапы, понятные и заказчикам, и инженерам.',
            }),
          },
          {
            title: t({
              en: 'Teams that grow',
              hy: 'Թիմեր, որոնք աճում են',
              ru: 'Команды, которые растут',
            }),
            description: t({
              en: 'Mentoring, hiring support and engineering practices that raise the level of your own team, not just ours.',
              hy: 'Մենթորություն, հավաքագրման աջակցություն և ինժեներական պրակտիկաներ, որոնք բարձրացնում են ձեր թիմի մակարդակը, ոչ միայն մերը։',
              ru: 'Менторство, помощь в найме и инженерные практики, которые поднимают уровень вашей команды, а не только нашей.',
            }),
          },
          {
            title: t({
              en: 'Continuity across projects',
              hy: 'Շարունակականություն նախագծերի միջև',
              ru: 'Преемственность между проектами',
            }),
            description: t({
              en: 'One accountable technical lead who keeps context, priorities and quality consistent as the work evolves.',
              hy: 'Մեկ պատասխանատու տեխնիկական ղեկավար, որը պահպանում է համատեքստը, առաջնահերթությունները և որակը, երբ աշխատանքը զարգանում է։',
              ru: 'Один ответственный технический лидер, который сохраняет контекст, приоритеты и качество по мере развития работы.',
            }),
          },
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default whyContent;
