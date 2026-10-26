import { t, type Dictionary } from 'intlayer';

const engagementModelsPageContent = {
  key: 'engagement-models-page',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({
      en: 'Engagement Models',
      hy: 'Համագործակցության մոդելներ',
      ru: 'Модели сотрудничества',
    }),
    eyebrow: t({
      en: 'Engagement models',
      hy: 'Համագործակցության մոդելներ',
      ru: 'Модели сотрудничества',
    }),
    heading: t({
      en: 'Choose how we work together.',
      hy: 'Ընտրեք, թե ինչպես ենք աշխատելու միասին։',
      ru: 'Выберите, как мы будем работать вместе.',
    }),
    lead: t({
      en: 'Five ways to collaborate. Scope, terms and responsibilities are always agreed individually — nothing on this page is a fixed contract or price list.',
      hy: 'Համագործակցության հինգ եղանակ։ Ծավալը, պայմանները և պարտականությունները միշտ համաձայնեցվում են անհատապես — այս էջում ոչինչ ֆիքսված պայմանագիր կամ գնացուցակ չէ։',
      ru: 'Пять способов сотрудничества. Объём, условия и обязанности всегда согласуются индивидуально — ничто на этой странице не является фиксированным договором или прайс-листом.',
    }),
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք զրույցը',
        ru: 'Начнём разговор',
      }),
      title: t({
        en: 'Not sure which model fits?',
        hy: 'Վստա՞հ չեք, թե որ մոդելն է հարմար։',
        ru: 'Не уверены, какая модель подходит?',
      }),
      lead: t({
        en: 'Tell us about your situation and constraints. We’ll recommend an engagement model — and explain why.',
        hy: 'Պատմեք ձեր իրավիճակի և սահմանափակումների մասին։ Մենք կառաջարկենք համագործակցության մոդել և կբացատրենք՝ ինչու։',
        ru: 'Расскажите о своей ситуации и ограничениях. Мы предложим модель сотрудничества — и объясним почему.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ուսումնասիրել մեր ծառայությունները',
        ru: 'Изучить наши услуги',
      }),
    },
  },
} as const satisfies Dictionary;

export default engagementModelsPageContent;
