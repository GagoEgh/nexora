import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const engagementModelsContent = {
  key: 'engagement-models',
  content: {
    eyebrow: t({
      en: 'Engagement models',
      hy: 'Համագործակցության մոդելներ',
      ru: 'Модели сотрудничества',
    }),
    title: t({
      en: 'Collaboration that fits your situation.',
      hy: 'Համագործակցություն, որը համապատասխանում է ձեր իրավիճակին։',
      ru: 'Сотрудничество, которое подходит вашей ситуации.',
    }),
    intro: t({
      en: 'Choose how we work together. Scope, terms and responsibilities are agreed individually for every engagement.',
      hy: 'Ընտրեք, թե ինչպես ենք աշխատելու միասին։ Ծավալը, պայմանները և պարտականությունները համաձայնեցվում են անհատապես յուրաքանչյուր համագործակցության համար։',
      ru: 'Выберите, как мы будем работать вместе. Объём, условия и обязанности согласуются индивидуально для каждого сотрудничества.',
    }),
    compare: t({
      en: 'Compare engagement models',
      hy: 'Համեմատել համագործակցության մոդելները',
      ru: 'Сравнить модели сотрудничества',
    }),
    bestFor: t({ en: 'Best for', hy: 'Լավագույնն է', ru: 'Лучше всего для' }),
    models: [
      {
        icon: 'target' satisfies AppIconName,
        title: t({
          en: 'Project-Based Development',
          hy: 'Նախագծային մշակում',
          ru: 'Проектная разработка',
        }),
        description: t({
          en: 'Scoped projects with agreed requirements and deliverables.',
          hy: 'Հստակ ծավալով նախագծեր՝ համաձայնեցված պահանջներով և արդյունքներով։',
          ru: 'Проекты с фиксированным объёмом, согласованными требованиями и результатами.',
        }),
        bestFor: t({
          en: 'A defined product, feature or modernization.',
          hy: 'Սահմանված պրոդուկտ, ֆունկցիոնալություն կամ արդիականացում։',
          ru: 'Определённый продукт, функция или модернизация.',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Development Teams',
          hy: 'Նվիրված մշակման թիմեր',
          ru: 'Выделенные команды разработки',
        }),
        description: t({
          en: 'Senior specialists integrated into your project or assigned to agreed work.',
          hy: 'Senior մասնագետներ՝ ինտեգրված ձեր նախագծին կամ նշանակված համաձայնեցված աշխատանքին։',
          ru: 'Senior-специалисты, интегрированные в ваш проект или закреплённые за согласованными задачами.',
        }),
        bestFor: t({
          en: 'Extending your team with senior capacity.',
          hy: 'Ձեր թիմի ընդլայնումը senior հզորությամբ։',
          ru: 'Расширение команды senior-ресурсами.',
        }),
      },
      {
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Long-Term Technical Partnership',
          hy: 'Երկարաժամկետ տեխնիկական գործընկերություն',
          ru: 'Долгосрочное техническое партнёрство',
        }),
        description: t({
          en: 'Ongoing product evolution and technical collaboration.',
          hy: 'Պրոդուկտի շարունակական զարգացում և տեխնիկական համագործակցություն։',
          ru: 'Постоянное развитие продукта и техническое сотрудничество.',
        }),
        bestFor: t({
          en: 'Products that keep evolving over years.',
          hy: 'Պրոդուկտներ, որոնք զարգանում են տարիների ընթացքում։',
          ru: 'Продукты, которые развиваются годами.',
        }),
      },
      {
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Development',
          hy: 'White-label մշակում',
          ru: 'White-label разработка',
        }),
        description: t({
          en: 'Engineering execution for agencies and partners under agreed branding.',
          hy: 'Ինժեներական կատարում գործակալությունների և գործընկերների համար՝ համաձայնեցված բրենդավորմամբ։',
          ru: 'Инженерное исполнение для агентств и партнёров под согласованным брендом.',
        }),
        bestFor: t({
          en: 'Agencies delivering technical work to clients.',
          hy: 'Գործակալություններ, որոնք տեխնիկական աշխատանք են մատուցում հաճախորդներին։',
          ru: 'Агентства, выполняющие техническую работу для клиентов.',
        }),
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
        bestFor: t({
          en: 'Live systems that need steady care.',
          hy: 'Գործող համակարգեր, որոնք կայուն խնամքի կարիք ունեն։',
          ru: 'Работающие системы, которым нужен постоянный уход.',
        }),
      },
    ],
  },
} satisfies Dictionary;

export default engagementModelsContent;
