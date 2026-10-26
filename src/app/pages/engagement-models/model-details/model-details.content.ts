import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const modelDetailsContent = {
  key: 'engagement-models-details',
  content: {
    title: t({
      en: 'Engagement models in detail',
      hy: 'Համագործակցության մոդելները մանրամասն',
      ru: 'Модели сотрудничества подробно',
    }),
    howItWorks: t({ en: 'How it works', hy: 'Ինչպես է աշխատում', ru: 'Как это работает' }),
    goodFitWhen: t({ en: 'A good fit when', hy: 'Հարմար է, երբ', ru: 'Подходит, когда' }),
    models: [
      {
        icon: 'target' satisfies AppIconName,
        title: t({
          en: 'Project-Based Development',
          hy: 'Նախագծային մշակում',
          ru: 'Проектная разработка',
        }),
        description: t({
          en: 'Scoped development projects with agreed requirements and deliverables.',
          hy: 'Հստակ ծավալով մշակման նախագծեր՝ համաձայնեցված պահանջներով և արդյունքներով։',
          ru: 'Проекты разработки с фиксированным объёмом, согласованными требованиями и результатами.',
        }),
        steps: [
          t({
            en: 'Discovery and scope definition',
            hy: 'Հետազոտություն և ծավալի սահմանում',
            ru: 'Исследование и определение объёма',
          }),
          t({
            en: 'Agreed deliverables and milestones',
            hy: 'Համաձայնեցված արդյունքներ և փուլեր',
            ru: 'Согласованные результаты и этапы',
          }),
          t({
            en: 'Delivery, handover and optional support',
            hy: 'Մատակարարում, հանձնում և ըստ ցանկության՝ աջակցություն',
            ru: 'Поставка, передача и поддержка по желанию',
          }),
        ],
        fits: [
          t({
            en: 'You have a defined product, feature or modernization',
            hy: 'Դուք ունեք սահմանված պրոդուկտ, ֆունկցիոնալություն կամ արդիականացում',
            ru: 'У вас есть определённый продукт, функция или модернизация',
          }),
          t({
            en: 'You want clear scope and a single accountable team',
            hy: 'Ցանկանում եք հստակ ծավալ և մեկ պատասխանատու թիմ',
            ru: 'Вам нужны чёткий объём и одна ответственная команда',
          }),
        ],
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Engineering Teams',
          hy: 'Նվիրված ինժեներական թիմեր',
          ru: 'Выделенные инженерные команды',
        }),
        description: t({
          en: 'Senior specialists integrated into your projects or assigned to agreed engineering work.',
          hy: 'Senior մասնագետներ՝ ինտեգրված ձեր նախագծերին կամ նշանակված համաձայնեցված ինժեներական աշխատանքին։',
          ru: 'Senior-специалисты, интегрированные в ваши проекты или закреплённые за согласованной инженерной работой.',
        }),
        steps: [
          t({
            en: 'Define roles and skills needed',
            hy: 'Սահմանել անհրաժեշտ դերերը և հմտությունները',
            ru: 'Определить нужные роли и навыки',
          }),
          t({
            en: 'Specialists join your tools and rituals',
            hy: 'Մասնագետները միանում են ձեր գործիքներին և ռիթմին',
            ru: 'Специалисты подключаются к вашим инструментам и ритуалам',
          }),
          t({
            en: 'Team composition adjusts as needs change',
            hy: 'Թիմի կազմը հարմարվում է փոփոխվող կարիքներին',
            ru: 'Состав команды меняется вместе с потребностями',
          }),
        ],
        fits: [
          t({
            en: 'Your roadmap outgrows your in-house capacity',
            hy: 'Ձեր ճանապարհային քարտեզը գերազանցում է ներքին հզորությունը',
            ru: 'Ваш роадмап перерастает возможности внутренней команды',
          }),
          t({
            en: 'You want to direct the work day to day',
            hy: 'Ցանկանում եք ամենօրյա ղեկավարել աշխատանքը',
            ru: 'Вы хотите управлять работой ежедневно',
          }),
        ],
      },
      {
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Long-Term Technology Partnership',
          hy: 'Երկարաժամկետ տեխնոլոգիական գործընկերություն',
          ru: 'Долгосрочное технологическое партнёрство',
        }),
        description: t({
          en: 'Ongoing product evolution and technical collaboration.',
          hy: 'Պրոդուկտի շարունակական զարգացում և տեխնիկական համագործակցություն։',
          ru: 'Постоянное развитие продукта и техническое сотрудничество.',
        }),
        steps: [
          t({
            en: 'Shared roadmap and priorities',
            hy: 'Ընդհանուր ճանապարհային քարտեզ և առաջնահերթություններ',
            ru: 'Общий роадмап и приоритеты',
          }),
          t({
            en: 'Stable core team that knows your system',
            hy: 'Կայուն հիմնական թիմ, որը ճանաչում է ձեր համակարգը',
            ru: 'Стабильное ядро команды, которое знает вашу систему',
          }),
          t({
            en: 'Regular reviews of architecture and direction',
            hy: 'Ճարտարապետության և ուղղության պարբերական վերանայում',
            ru: 'Регулярные ревью архитектуры и направления',
          }),
        ],
        fits: [
          t({
            en: 'Your product keeps evolving over years',
            hy: 'Ձեր պրոդուկտը զարգանում է տարիների ընթացքում',
            ru: 'Ваш продукт развивается годами',
          }),
          t({
            en: 'You want a technical partner, not just extra hands',
            hy: 'Ցանկանում եք տեխնիկական գործընկեր, ոչ թե պարզապես լրացուցիչ ձեռքեր',
            ru: 'Вам нужен технический партнёр, а не просто дополнительные руки',
          }),
        ],
      },
      {
        icon: 'wrench' satisfies AppIconName,
        title: t({
          en: 'Maintenance & Technical Support',
          hy: 'Սպասարկում և տեխնիկական աջակցություն',
          ru: 'Сопровождение и техническая поддержка',
        }),
        description: t({
          en: 'Continuous support, improvements and agreed technical responsibilities.',
          hy: 'Շարունակական աջակցություն, բարելավումներ և համաձայնեցված տեխնիկական պարտականություններ։',
          ru: 'Непрерывная поддержка, улучшения и согласованные технические обязанности.',
        }),
        steps: [
          t({
            en: 'Onboarding and system assessment',
            hy: 'Ծանոթացում և համակարգի գնահատում',
            ru: 'Онбординг и оценка системы',
          }),
          t({
            en: 'Agreed responsibilities and priorities',
            hy: 'Համաձայնեցված պարտականություններ և առաջնահերթություններ',
            ru: 'Согласованные обязанности и приоритеты',
          }),
          t({
            en: 'Ongoing fixes, upgrades and improvements',
            hy: 'Շարունակական ուղղումներ, թարմացումներ և բարելավումներ',
            ru: 'Постоянные исправления, обновления и улучшения',
          }),
        ],
        fits: [
          t({
            en: 'You run a live system that needs steady care',
            hy: 'Դուք շահագործում եք գործող համակարգ, որը կայուն խնամքի կարիք ունի',
            ru: 'Вы эксплуатируете работающую систему, которой нужен постоянный уход',
          }),
          t({
            en: 'The original team is no longer available',
            hy: 'Սկզբնական թիմն այլևս հասանելի չէ',
            ru: 'Исходная команда больше недоступна',
          }),
        ],
      },
      {
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Development',
          hy: 'White-label մշակում',
          ru: 'White-label разработка',
        }),
        description: t({
          en: 'Engineering execution for agencies and partners under agreed branding and communication arrangements.',
          hy: 'Ինժեներական կատարում գործակալությունների և գործընկերների համար՝ համաձայնեցված բրենդավորման և հաղորդակցության պայմաններով։',
          ru: 'Инженерное исполнение для агентств и партнёров на согласованных условиях брендинга и коммуникации.',
        }),
        steps: [
          t({
            en: 'Agree branding and communication model',
            hy: 'Համաձայնեցնել բրենդավորման և հաղորդակցության մոդելը',
            ru: 'Согласовать модель брендинга и коммуникации',
          }),
          t({
            en: 'Nexora engineers deliver behind your brand',
            hy: 'Nexora-ի ինժեներներն աշխատում են ձեր բրենդի ներքո',
            ru: 'Инженеры Nexora работают под вашим брендом',
          }),
          t({
            en: 'You keep the client relationship',
            hy: 'Հաճախորդի հետ հարաբերությունը մնում է ձեզ',
            ru: 'Отношения с клиентом остаются за вами',
          }),
        ],
        fits: [
          t({
            en: 'You’re an agency selling technical projects',
            hy: 'Դուք գործակալություն եք, որը վաճառում է տեխնիկական նախագծեր',
            ru: 'Вы агентство, продающее технические проекты',
          }),
          t({
            en: 'You need reliable senior delivery capacity',
            hy: 'Ձեզ անհրաժեշտ է հուսալի senior մատակարարման հզորություն',
            ru: 'Вам нужны надёжные senior-ресурсы для поставки',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default modelDetailsContent;
