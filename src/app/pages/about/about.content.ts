import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';

const aboutContent = {
  key: 'about',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }),
    eyebrow: t({ en: 'About Nexora', hy: 'Nexora-ի մասին', ru: 'О Nexora' }),
    heading: t({
      en: 'A senior engineering partner for businesses that build with technology.',
      hy: 'Senior ինժեներական գործընկեր այն բիզնեսների համար, որոնք կառուցում են տեխնոլոգիայով։',
      ru: 'Senior-инженерный партнёр для компаний, которые строят на технологиях.',
    }),
    lead: t({
      en: 'Nexora is a technology development and AI solutions company. We help organizations design, build, integrate, deploy, maintain and evolve the digital systems they depend on — with a team made up exclusively of Senior and Senior+ engineers.',
      hy: 'Nexora-ն տեխնոլոգիական մշակման և AI լուծումների ընկերություն է։ Մենք օգնում ենք կազմակերպություններին նախագծել, կառուցել, ինտեգրել, ներդնել, սպասարկել և զարգացնել այն թվային համակարգերը, որոնցից կախված է իրենց աշխատանքը՝ բացառապես Senior և Senior+ ինժեներներից բաղկացած թիմով։',
      ru: 'Nexora — компания технологической разработки и AI-решений. Мы помогаем организациям проектировать, создавать, интегрировать, развёртывать, поддерживать и развивать цифровые системы, на которые они опираются, — командой, состоящей исключительно из Senior и Senior+ инженеров.',
    }),
    glance: {
      title: t({ en: 'Nexora at a glance', hy: 'Nexora-ն համառոտ', ru: 'Nexora вкратце' }),
      rows: [
        {
          label: t({ en: 'Focus', hy: 'Ուղղություն', ru: 'Фокус' }),
          value: t({
            en: 'Software engineering & AI solutions',
            hy: 'Ծրագրային ինժեներիա և AI լուծումներ',
            ru: 'Программная инженерия и AI-решения',
          }),
        },
        {
          label: t({ en: 'Team', hy: 'Թիմ', ru: 'Команда' }),
          value: t({
            en: 'Senior and Senior+ engineers only',
            hy: 'Միայն Senior և Senior+ ինժեներներ',
            ru: 'Только Senior и Senior+ инженеры',
          }),
        },
        {
          label: t({ en: 'Markets', hy: 'Շուկաներ', ru: 'Рынки' }),
          value: t({
            en: 'Armenia & international',
            hy: 'Հայաստան և միջազգային',
            ru: 'Армения и международные рынки',
          }),
        },
        {
          label: t({ en: 'Clients', hy: 'Հաճախորդներ', ru: 'Клиенты' }),
          value: t({
            en: 'Startups, SMEs, enterprises, software companies, agencies',
            hy: 'Ստարտափներ, ՓՄՁ-ներ, խոշոր ընկերություններ, ծրագրային ընկերություններ, գործակալություններ',
            ru: 'Стартапы, МСБ, крупные компании, софтверные компании, агентства',
          }),
        },
        {
          label: t({ en: 'Engagement', hy: 'Համագործակցություն', ru: 'Форматы работы' }),
          value: t({
            en: 'Projects, dedicated teams, partnership, white-label, support',
            hy: 'Նախագծեր, նվիրված թիմեր, գործընկերություն, white-label, աջակցություն',
            ru: 'Проекты, выделенные команды, партнёрство, white-label, поддержка',
          }),
        },
      ],
    },
    philosophy: {
      eyebrow: t({
        en: 'Engineering philosophy',
        hy: 'Ինժեներական փիլիսոփայություն',
        ru: 'Инженерная философия',
      }),
      title: t({
        en: 'Good software is mostly good decisions.',
        hy: 'Լավ ծրագրակազմը հիմնականում լավ որոշումներ են։',
        ru: 'Хорошее ПО — это прежде всего хорошие решения.',
      }),
      intro: [
        t({
          en: 'Frameworks change every year. What lasts is the quality of the decisions underneath: how a system is structured, where its boundaries are, what is automated and what is left simple on purpose.',
          hy: 'Ֆրեյմվորքերը փոխվում են ամեն տարի։ Մնում է դրանց տակ ընկած որոշումների որակը՝ ինչպես է կառուցված համակարգը, որտեղ են նրա սահմանները, ինչն է ավտոմատացված և ինչը դիտավորյալ պարզ է թողնված։',
          ru: 'Фреймворки меняются каждый год. Остаётся качество решений под ними: как устроена система, где проходят её границы, что автоматизировано и что намеренно оставлено простым.',
        }),
        t({
          en: 'These principles guide every project, whatever the stack.',
          hy: 'Այս սկզբունքներն առաջնորդում են յուրաքանչյուր նախագիծ՝ անկախ տեխնոլոգիական փաթեթից։',
          ru: 'Эти принципы направляют каждый проект, независимо от стека.',
        }),
      ],
      cards: [
        {
          icon: 'search' satisfies AppIconName,
          title: t({
            en: 'Understand before building',
            hy: 'Հասկանալ նախքան կառուցելը',
            ru: 'Понять до того, как строить',
          }),
          text: t({
            en: 'We clarify the problem, users and constraints before committing to an approach.',
            hy: 'Մենք հստակեցնում ենք խնդիրը, օգտատերերին և սահմանափակումները՝ նախքան մոտեցում ընտրելը։',
            ru: 'Мы проясняем задачу, пользователей и ограничения до выбора подхода.',
          }),
        },
        {
          icon: 'layers' satisfies AppIconName,
          title: t({
            en: 'Architecture is a business decision',
            hy: 'Ճարտարապետությունը բիզնես որոշում է',
            ru: 'Архитектура — это бизнес-решение',
          }),
          text: t({
            en: 'Structure is chosen for how the business will grow, not for novelty.',
            hy: 'Կառուցվածքն ընտրվում է ըստ բիզնեսի աճի, ոչ թե նորույթի համար։',
            ru: 'Структура выбирается под рост бизнеса, а не ради новизны.',
          }),
        },
        {
          icon: 'shield-check' satisfies AppIconName,
          title: t({
            en: 'Quality is designed in',
            hy: 'Որակը ներդրվում է նախագծման փուլում',
            ru: 'Качество закладывается в проект',
          }),
          text: t({
            en: 'Reviews, tests and documentation are part of the work, not an afterthought.',
            hy: 'Վերանայումները, թեստերը և փաստաթղթերը աշխատանքի մասն են, ոչ թե հետագա հավելում։',
            ru: 'Ревью, тесты и документация — часть работы, а не дополнение к ней.',
          }),
        },
        {
          icon: 'refresh-cw' satisfies AppIconName,
          title: t({
            en: 'Leave systems better',
            hy: 'Թողնել համակարգերն ավելի լավ վիճակում',
            ru: 'Оставлять системы лучше',
          }),
          text: t({
            en: 'Every change should make the next change easier and safer.',
            hy: 'Յուրաքանչյուր փոփոխություն պետք է հաջորդը դարձնի ավելի հեշտ և ապահով։',
            ru: 'Каждое изменение должно делать следующее проще и безопаснее.',
          }),
        },
      ],
    },
    seniorModel: {
      eyebrow: t({
        en: 'Senior & Senior+ only',
        hy: 'Միայն Senior և Senior+',
        ru: 'Только Senior и Senior+',
      }),
      title: t({
        en: 'Experience where the decisions are made.',
        hy: 'Փորձառություն այնտեղ, որտեղ կայացվում են որոշումները։',
        ru: 'Опыт там, где принимаются решения.',
      }),
      lead: t({
        en: 'Many delivery models put a few senior people on top of a large junior team. We work differently: every engineer on a Nexora project is senior or above, so the people writing the code are the people who understand the trade-offs.',
        hy: 'Մատակարարման շատ մոդելներ մի քանի senior մասնագետի դնում են մեծ junior թիմի գլխին։ Մենք աշխատում ենք այլ կերպ՝ Nexora-ի նախագծի յուրաքանչյուր ինժեներ senior է կամ ավելի բարձր, այնպես որ կոդը գրողները հենց այն մարդիկ են, ովքեր հասկանում են փոխզիջումները։',
        ru: 'Многие модели поставки ставят нескольких senior-специалистов над большой junior-командой. Мы работаем иначе: каждый инженер на проекте Nexora — senior или выше, поэтому код пишут те же люди, которые понимают компромиссы.',
      }),
      points: [
        t({
          en: 'Fewer hand-offs between planning and implementation',
          hy: 'Ավելի քիչ փոխանցումներ պլանավորման և իրականացման միջև',
          ru: 'Меньше передач между планированием и реализацией',
        }),
        t({
          en: 'Architecture decisions made by people who build',
          hy: 'Ճարտարապետական որոշումներ՝ կայացված նրանց կողմից, ովքեր կառուցում են',
          ru: 'Архитектурные решения принимают те, кто строит',
        }),
        t({
          en: 'Smaller teams, clearer ownership',
          hy: 'Ավելի փոքր թիմեր, ավելի հստակ պատասխանատվություն',
          ru: 'Меньше команды, яснее зона ответственности',
        }),
      ],
      pyramid: {
        label: t({ en: 'Common pyramid', hy: 'Սովորական բուրգ', ru: 'Обычная пирамида' }),
        senior: t({ en: 'Senior', hy: 'Senior', ru: 'Senior' }),
        junior: t({ en: 'Junior / mid', hy: 'Junior / mid', ru: 'Junior / mid' }),
      },
      nexora: {
        label: t({ en: 'Nexora model', hy: 'Nexora-ի մոդել', ru: 'Модель Nexora' }),
        legend: t({ en: 'Senior & Senior+', hy: 'Senior և Senior+', ru: 'Senior и Senior+' }),
      },
    },
    businessFlow: {
      eyebrow: t({
        en: 'Business-first approach',
        hy: 'Բիզնեսից սկսող մոտեցում',
        ru: 'Подход от бизнеса',
      }),
      title: t({
        en: 'We start with the outcome, then choose the technology.',
        hy: 'Մենք սկսում ենք արդյունքից, հետո ընտրում տեխնոլոգիան։',
        ru: 'Мы начинаем с результата, а технологию выбираем потом.',
      }),
      intro: t({
        en: 'A business goal and its constraints shape the architecture — and the architecture shapes how the system can evolve. We keep that chain explicit so every technical decision can be traced back to a reason.',
        hy: 'Բիզնես նպատակը և դրա սահմանափակումները ձևավորում են ճարտարապետությունը, իսկ ճարտարապետությունը՝ համակարգի զարգացման հնարավորությունները։ Մենք այդ շղթան պահում ենք բացահայտ, որպեսզի յուրաքանչյուր տեխնիկական որոշում հնարավոր լինի հետագծել մինչև իր պատճառը։',
        ru: 'Бизнес-цель и её ограничения формируют архитектуру, а архитектура определяет, как система сможет развиваться. Мы держим эту цепочку явной, чтобы каждое техническое решение можно было проследить до его причины.',
      }),
      steps: [
        {
          icon: 'target' satisfies AppIconName,
          title: t({ en: 'Business goal', hy: 'Բիզնես նպատակ', ru: 'Бизнес-цель' }),
          text: t({
            en: 'What must change, for whom',
            hy: 'Ինչը պետք է փոխվի և ում համար',
            ru: 'Что должно измениться и для кого',
          }),
        },
        {
          icon: 'compass' satisfies AppIconName,
          title: t({ en: 'Constraints', hy: 'Սահմանափակումներ', ru: 'Ограничения' }),
          text: t({
            en: 'Budget, timing, data, compliance',
            hy: 'Բյուջե, ժամկետներ, տվյալներ, համապատասխանություն',
            ru: 'Бюджет, сроки, данные, соответствие требованиям',
          }),
        },
        {
          icon: 'git-branch' satisfies AppIconName,
          title: t({ en: 'Architecture', hy: 'Ճարտարապետություն', ru: 'Архитектура' }),
          text: t({
            en: 'Structure that fits the goal',
            hy: 'Կառուցվածք, որը համապատասխանում է նպատակին',
            ru: 'Структура, которая отвечает цели',
          }),
        },
        {
          icon: 'code' satisfies AppIconName,
          title: t({ en: 'Delivery', hy: 'Մատակարարում', ru: 'Поставка' }),
          text: t({
            en: 'Iterative, reviewed, tested',
            hy: 'Իտերատիվ, վերանայված, թեստավորված',
            ru: 'Итеративно, с ревью и тестами',
          }),
        },
        {
          icon: 'refresh-cw' satisfies AppIconName,
          title: t({ en: 'Evolution', hy: 'Զարգացում', ru: 'Развитие' }),
          text: t({
            en: 'Support, measure, improve',
            hy: 'Աջակցել, չափել, բարելավել',
            ru: 'Поддержка, измерение, улучшение',
          }),
        },
      ],
    },
    qualityCapability: {
      practices: {
        eyebrow: t({
          en: 'Quality mindset',
          hy: 'Որակի մտածելակերպ',
          ru: 'Подход к качеству',
        }),
        title: t({
          en: 'Practices built into the work.',
          hy: 'Պրակտիկաներ, որոնք ներդրված են հենց աշխատանքի մեջ։',
          ru: 'Практики, встроенные в саму работу.',
        }),
        note: t({
          en: 'Applied in proportion to each project’s size and risk.',
          hy: 'Կիրառվում են յուրաքանչյուր նախագծի ծավալին և ռիսկին համապատասխան։',
          ru: 'Применяются соразмерно масштабу и рискам каждого проекта.',
        }),
        items: [
          {
            icon: 'git-branch' satisfies AppIconName,
            label: t({
              en: 'Architecture reviews',
              hy: 'Ճարտարապետության վերանայումներ',
              ru: 'Ревью архитектуры',
            }),
          },
          {
            icon: 'code' satisfies AppIconName,
            label: t({
              en: 'Code review on every change',
              hy: 'Կոդի վերանայում յուրաքանչյուր փոփոխության դեպքում',
              ru: 'Ревью кода при каждом изменении',
            }),
          },
          {
            icon: 'shield-check' satisfies AppIconName,
            label: t({
              en: 'Automated testing',
              hy: 'Ավտոմատացված թեստավորում',
              ru: 'Автоматизированное тестирование',
            }),
          },
          {
            icon: 'file-text' satisfies AppIconName,
            label: t({
              en: 'Living documentation',
              hy: 'Կենդանի փաստաթղթեր',
              ru: 'Живая документация',
            }),
          },
          {
            icon: 'shield-check' satisfies AppIconName,
            label: t({
              en: 'Security by default',
              hy: 'Անվտանգություն ըստ լռելյայնի',
              ru: 'Безопасность по умолчанию',
            }),
          },
          {
            icon: 'server' satisfies AppIconName,
            label: t({ en: 'Observability', hy: 'Դիտելիություն', ru: 'Наблюдаемость' }),
          },
        ],
      },
      disciplines: {
        eyebrow: t({
          en: 'End-to-end capability',
          hy: 'Ամբողջական հնարավորություններ',
          ru: 'Полный цикл',
        }),
        title: t({
          en: 'Every discipline a project needs, in one team.',
          hy: 'Նախագծին անհրաժեշտ բոլոր ուղղությունները՝ մեկ թիմում։',
          ru: 'Все дисциплины, которые нужны проекту, в одной команде.',
        }),
        note: t({
          en: 'Disciplines are combined per project — so a single team can carry a product from first sketch to production support.',
          hy: 'Ուղղությունները համադրվում են ըստ նախագծի՝ որպեսզի մեկ թիմը կարողանա արտադրանքը տանել առաջին էսքիզից մինչև արդյունաբերական աջակցություն։',
          ru: 'Дисциплины комбинируются под проект — так одна команда ведёт продукт от первого эскиза до поддержки в продакшене.',
        }),
        items: [
          t({ en: 'UI/UX design', hy: 'UI/UX դիզայն', ru: 'UI/UX-дизайн' }),
          t({ en: 'Frontend', hy: 'Frontend', ru: 'Frontend' }),
          t({ en: 'Backend & APIs', hy: 'Backend և API-ներ', ru: 'Backend и API' }),
          t({ en: 'Mobile', hy: 'Մոբայլ', ru: 'Мобильная разработка' }),
          t({ en: 'AI engineering', hy: 'AI ինժեներիա', ru: 'AI-инженерия' }),
          t({ en: 'Cloud & DevOps', hy: 'Ամպ և DevOps', ru: 'Облако и DevOps' }),
          t({ en: 'QA', hy: 'QA', ru: 'QA' }),
          t({
            en: 'Solution architecture',
            hy: 'Լուծումների ճարտարապետություն',
            ru: 'Архитектура решений',
          }),
          t({
            en: 'Technical leadership',
            hy: 'Տեխնիկական առաջնորդություն',
            ru: 'Техническое лидерство',
          }),
          t({ en: 'Maintenance', hy: 'Սպասարկում', ru: 'Поддержка' }),
        ],
      },
    },
    longTerm: {
      eyebrow: t({
        en: 'Long-term partnership',
        hy: 'Երկարաժամկետ գործընկերություն',
        ru: 'Долгосрочное партнёрство',
      }),
      title: t({
        en: 'We build systems we’d be comfortable maintaining ourselves.',
        hy: 'Մենք կառուցում ենք համակարգեր, որոնք հարմար կլինեին մեզ՝ ինքներս սպասարկելու համար։',
        ru: 'Мы строим системы, которые нам самим было бы комфортно поддерживать.',
      }),
      body: [
        t({
          en: 'Most software lives far longer than its first release. We design for that: maintainable code, documented decisions and infrastructure that can be handed over or grown.',
          hy: 'Ծրագրերի մեծ մասն ապրում է առաջին թողարկումից շատ ավելի երկար։ Մենք նախագծում ենք հենց դրա համար՝ սպասարկելի կոդ, փաստագրված որոշումներ և ենթակառուցվածք, որը կարելի է փոխանցել կամ զարգացնել։',
          ru: 'Большинство продуктов живёт намного дольше первого релиза. Мы проектируем именно под это: поддерживаемый код, задокументированные решения и инфраструктуру, которую можно передать или развивать.',
        }),
        t({
          en: 'Engagements can continue as ongoing partnerships, with the same engineers evolving the product as the business changes.',
          hy: 'Համագործակցությունը կարող է շարունակվել որպես երկարաժամկետ գործընկերություն՝ նույն ինժեներներով, որոնք զարգացնում են արտադրանքը բիզնեսի փոփոխություններին համընթաց։',
          ru: 'Сотрудничество может продолжаться как долгосрочное партнёрство — те же инженеры развивают продукт вместе с изменениями бизнеса.',
        }),
      ],
    },
    markets: [
      {
        icon: 'globe' satisfies AppIconName,
        title: t({ en: 'Armenia', hy: 'Հայաստան', ru: 'Армения' }),
        text: t({
          en: 'We work with startups, growing businesses and established companies in Armenia’s technology and business community.',
          hy: 'Մենք աշխատում ենք ստարտափների, աճող բիզնեսների և կայացած ընկերությունների հետ՝ Հայաստանի տեխնոլոգիական և բիզնես համայնքում։',
          ru: 'Мы работаем со стартапами, растущим бизнесом и состоявшимися компаниями в технологическом и деловом сообществе Армении.',
        }),
      },
      {
        icon: 'globe' satisfies AppIconName,
        title: t({
          en: 'International markets',
          hy: 'Միջազգային շուկաներ',
          ru: 'Международные рынки',
        }),
        text: t({
          en: 'We partner with clients and agencies abroad, from early-stage product teams to software companies extending their capacity.',
          hy: 'Մենք գործընկերություն ենք կառուցում արտասահմանյան հաճախորդների և գործակալությունների հետ՝ վաղ փուլի պրոդուկտային թիմերից մինչև ծրագրային ընկերություններ, որոնք ընդլայնում են իրենց հզորությունը։',
          ru: 'Мы сотрудничаем с клиентами и агентствами за рубежом — от продуктовых команд на ранней стадии до софтверных компаний, расширяющих свои возможности.',
        }),
      },
    ],
    conversation: {
      eyebrow: t({
        en: 'Collaborate with Nexora',
        hy: 'Համագործակցեք Nexora-ի հետ',
        ru: 'Сотрудничайте с Nexora',
      }),
      title: t({
        en: 'Let’s talk about working together.',
        hy: 'Եկեք խոսենք համատեղ աշխատանքի մասին։',
        ru: 'Давайте обсудим совместную работу.',
      }),
      lead: t({
        en: 'Whether it’s a single project, a dedicated team or a long-term partnership, the first step is a conversation about what you need.',
        hy: 'Անկախ նրանից՝ դա առանձին նախագիծ է, նվիրված թիմ, թե երկարաժամկետ գործընկերություն, առաջին քայլը զրույցն է այն մասին, թե ինչ է ձեզ անհրաժեշտ։',
        ru: 'Будь то отдельный проект, выделенная команда или долгосрочное партнёрство — первый шаг это разговор о том, что вам нужно.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Engagement models',
        hy: 'Համագործակցության մոդելներ',
        ru: 'Форматы сотрудничества',
      }),
    },
  },
} as const satisfies Dictionary;

export default aboutContent;
