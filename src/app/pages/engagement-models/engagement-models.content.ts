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
  },
} as const satisfies Dictionary;

export default engagementModelsPageContent;
