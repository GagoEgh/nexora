import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';
import type { ModelId } from '../engagement-model';

const modelDetailsContent = {
  key: 'engagement-models-details',
  content: {
    title: t({
      en: 'Engagement models in detail',
      hy: 'Համագործակցության ձևաչափերը՝ մանրամասն',
      ru: 'Форматы сотрудничества: подробно',
    }),
    howItWorks: t({ en: 'How it works', hy: 'Ինչպես է աշխատում', ru: 'Как это работает' }),
    goodFitWhen: t({ en: 'A good fit when', hy: 'Հարմար է, եթե', ru: 'Подходит, если' }),
    models: [
      {
        id: 'project-based' satisfies ModelId,
        icon: 'target' satisfies AppIconName,
        title: t({
          en: 'Project-Based Development',
          hy: 'Նախագծային մշակում',
          ru: 'Проектная разработка',
        }),
        description: t({
          en: 'Scoped development projects with agreed requirements and deliverables.',
          hy: 'Հստակ սահմանված ծավալով մշակման նախագծեր՝ համաձայնեցված պահանջներով և ակնկալվող արդյունքներով։',
          ru: 'Проекты разработки с чётко определённым объёмом работ, согласованными требованиями и ожидаемыми результатами.',
        }),
        steps: [
          t({
            en: 'Discovery and scope definition',
            hy: 'Պահանջների ուսումնասիրություն և աշխատանքի ծավալի սահմանում',
            ru: 'Изучение требований и определение объёма работ',
          }),
          t({
            en: 'Agreed deliverables and milestones',
            hy: 'Ակնկալվող արդյունքների և հիմնական փուլերի համաձայնեցում',
            ru: 'Согласование результатов и ключевых этапов',
          }),
          t({
            en: 'Delivery, handover and optional support',
            hy: 'Արդյունքի հանձնում և, ըստ անհրաժեշտության, հետագա տեխնիկական աջակցություն',
            ru: 'Передача результата и, при необходимости, дальнейшая техническая поддержка',
          }),
        ],
        fits: [
          t({
            en: 'You have a defined product, feature or modernization',
            hy: 'Դուք ունեք հստակ սահմանված արտադրանք, ֆունկցիոնալություն մշակելու կամ համակարգն արդիականացնելու խնդիր',
            ru: 'Вам необходимо разработать конкретный продукт или функциональность либо модернизировать существующую систему',
          }),
          t({
            en: 'You want clear scope and a single accountable team',
            hy: 'Ցանկանում եք հստակ սահմանված աշխատանքի ծավալ և արդյունքի համար պատասխանատու մեկ թիմ',
            ru: 'Вам нужны чётко определённый объём работ и одна команда, отвечающая за результат',
          }),
        ],
      },
      {
        id: 'dedicated-team' satisfies ModelId,
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Engineering Teams',
          hy: 'Նախագծին նվիրված ինժեներական թիմեր',
          ru: 'Выделенные инженерные команды',
        }),
        description: t({
          en: 'Senior specialists integrated into your projects or assigned to agreed engineering work.',
          hy: 'Senior մասնագետներ, որոնք ներգրավվում են ձեր նախագծերում կամ իրականացնում նախապես համաձայնեցված ինժեներական աշխատանքները։',
          ru: 'Senior-специалисты, которые подключаются к вашим проектам или выполняют заранее согласованные инженерные задачи.',
        }),
        steps: [
          t({
            en: 'Define roles and skills needed',
            hy: 'Անհրաժեշտ դերերի և մասնագիտական հմտությունների սահմանում',
            ru: 'Определение необходимых ролей и профессиональных навыков',
          }),
          t({
            en: 'Specialists join your tools and rituals',
            hy: 'Մասնագետներն աշխատում են ձեր գործիքներով և հետևում թիմի աշխատանքային գործընթացներին',
            ru: 'Специалисты подключаются к вашим инструментам и участвуют в командных рабочих процессах',
          }),
          t({
            en: 'Team composition adjusts as needs change',
            hy: 'Թիմի կազմը հարմարեցվում է կարիքների փոփոխությանը',
            ru: 'Состав команды адаптируется к изменяющимся потребностям',
          }),
        ],
        fits: [
          t({
            en: 'Your roadmap outgrows your in-house capacity',
            hy: 'Ձեր զարգացման պլանն ընդլայնվել է, և ներքին թիմի ռեսուրսներն այլևս բավարար չեն',
            ru: 'План развития продукта выходит за рамки возможностей вашей внутренней команды',
          }),
          t({
            en: 'You want to direct the work day to day',
            hy: 'Ցանկանում եք ամեն օր անմիջականորեն ուղղորդել աշխատանքը',
            ru: 'Вы хотите ежедневно напрямую управлять ходом работы',
          }),
        ],
      },
      {
        id: 'long-term-partnership' satisfies ModelId,
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Long-Term Technology Partnership',
          hy: 'Երկարաժամկետ տեխնոլոգիական գործընկերություն',
          ru: 'Долгосрочное технологическое партнёрство',
        }),
        description: t({
          en: 'Ongoing product evolution and technical collaboration.',
          hy: 'Արտադրանքի շարունակական զարգացում և երկարաժամկետ տեխնիկական համագործակցություն։',
          ru: 'Непрерывное развитие продукта и долгосрочное техническое сотрудничество.',
        }),
        steps: [
          t({
            en: 'Shared roadmap and priorities',
            hy: 'Զարգացման պլանի և առաջնահերթությունների համատեղ սահմանում',
            ru: 'Совместное формирование плана развития и определение приоритетов',
          }),
          t({
            en: 'Stable core team that knows your system',
            hy: 'Կայուն հիմնական թիմ, որը խորությամբ ճանաչում է ձեր համակարգը',
            ru: 'Постоянная основная команда, хорошо знакомая с вашей системой',
          }),
          t({
            en: 'Regular reviews of architecture and direction',
            hy: 'Ճարտարապետական լուծումների և զարգացման ուղղության պարբերական վերանայում',
            ru: 'Регулярный пересмотр архитектуры и направления развития',
          }),
        ],
        fits: [
          t({
            en: 'Your product keeps evolving over years',
            hy: 'Ձեր արտադրանքը շարունակաբար զարգանում է տարիների ընթացքում',
            ru: 'Ваш продукт продолжает развиваться на протяжении многих лет',
          }),
          t({
            en: 'You want a technical partner, not just extra hands',
            hy: 'Ցանկանում եք ունենալ տեխնիկական գործընկեր, ոչ թե պարզապես լրացուցիչ մասնագետներ',
            ru: 'Вам нужен технический партнёр, а не просто дополнительные специалисты',
          }),
        ],
      },
      {
        id: 'maintenance-support' satisfies ModelId,
        icon: 'wrench' satisfies AppIconName,
        title: t({
          en: 'Maintenance & Technical Support',
          hy: 'Տեխնիկական սպասարկում և աջակցություն',
          ru: 'Техническое сопровождение и поддержка',
        }),
        description: t({
          en: 'Continuous support, improvements and agreed technical responsibilities.',
          hy: 'Շարունակական տեխնիկական աջակցություն, համակարգի բարելավումներ և նախապես համաձայնեցված տեխնիկական պարտավորությունների կատարում։',
          ru: 'Постоянная техническая поддержка, улучшение системы и выполнение согласованных технических обязательств.',
        }),
        steps: [
          t({
            en: 'Onboarding and system assessment',
            hy: 'Համակարգին ծանոթացում և դրա տեխնիկական վիճակի գնահատում',
            ru: 'Знакомство с системой и оценка её технического состояния',
          }),
          t({
            en: 'Agreed responsibilities and priorities',
            hy: 'Պատասխանատվության շրջանակի և առաջնահերթությունների համաձայնեցում',
            ru: 'Согласование зон ответственности и приоритетов',
          }),
          t({
            en: 'Ongoing fixes, upgrades and improvements',
            hy: 'Սխալների շարունակական ուղղում, թարմացումներ և բարելավումներ',
            ru: 'Постоянное исправление ошибок, обновления и улучшения',
          }),
        ],
        fits: [
          t({
            en: 'You run a live system that needs steady care',
            hy: 'Դուք շահագործում եք գործող համակարգ, որը կանոնավոր տեխնիկական սպասարկման կարիք ունի',
            ru: 'Вы эксплуатируете действующую систему, которой необходимо регулярное техническое сопровождение',
          }),
          t({
            en: 'The original team is no longer available',
            hy: 'Համակարգը մշակած սկզբնական թիմն այլևս հասանելի չէ',
            ru: 'Команда, изначально разрабатывавшая систему, больше недоступна',
          }),
        ],
      },
      {
        id: 'white-label' satisfies ModelId,
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Development',
          hy: 'White-label մշակում',
          ru: 'White-label-разработка',
        }),
        description: t({
          en: 'Engineering execution for agencies and partners under agreed branding and communication arrangements.',
          hy: 'Գործակալությունների և գործընկերների համար տեխնիկական լուծումների մշակում՝ նախապես համաձայնեցված բրենդավորման և հաղորդակցության պայմաններով։',
          ru: 'Разработка технических решений для агентств и партнёров под их брендом и на заранее согласованных условиях взаимодействия.',
        }),
        steps: [
          t({
            en: 'Agree branding and communication model',
            hy: 'Բրենդավորման և հաղորդակցության ձևաչափի համաձայնեցում',
            ru: 'Согласование модели брендинга и коммуникации',
          }),
          t({
            en: 'Nexora engineers deliver behind your brand',
            hy: 'Nexora-ի ինժեներներն իրականացնում են աշխատանքները ձեր ապրանքանիշի ներքո',
            ru: 'Инженеры Nexora выполняют работу под вашим брендом',
          }),
          t({
            en: 'You keep the client relationship',
            hy: 'Հաճախորդի հետ հարաբերությունները վարում եք դուք',
            ru: 'Вы сохраняете прямые отношения с клиентом',
          }),
        ],
        fits: [
          t({
            en: 'You’re an agency selling technical projects',
            hy: 'Դուք գործակալություն եք, որն իր հաճախորդներին առաջարկում է տեխնիկական նախագծեր',
            ru: 'Вы агентство, которое предлагает клиентам технические проекты',
          }),
          t({
            en: 'You need reliable senior delivery capacity',
            hy: 'Ձեզ անհրաժեշտ է հուսալի թիմ՝ Senior մակարդակի մասնագետներով և աշխատանքների որակյալ իրականացմամբ',
            ru: 'Вам нужна надёжная команда Senior-специалистов для качественной реализации проектов',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default modelDetailsContent;
