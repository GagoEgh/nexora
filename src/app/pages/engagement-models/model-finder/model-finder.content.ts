import { t, type Dictionary } from 'intlayer';

const modelFinderContent = {
  key: 'engagement-models-finder',
  content: {
    title: t({
      en: 'Which model fits?',
      hy: 'Ո՞ր մոդելն է համապատասխանում',
      ru: 'Какая модель подходит?',
    }),
    need: t({ en: 'You need', hy: 'Ձեզ հարկավոր է', ru: 'Вам нужно' }),
    rows: [
      {
        statement: t({
          en: 'A clearly defined scope',
          hy: 'Հստակ սահմանված ծավալ',
          ru: 'Чётко определённый объём',
        }),
        model: t({ en: 'Project-Based', hy: 'Նախագծային', ru: 'Проектная' }),
      },
      {
        statement: t({
          en: 'Ongoing extra senior capacity',
          hy: 'Շարունակական լրացուցիչ senior հզորություն',
          ru: 'Постоянные дополнительные senior-ресурсы',
        }),
        model: t({ en: 'Dedicated Team', hy: 'Նվիրված թիմ', ru: 'Выделенная команда' }),
      },
      {
        statement: t({
          en: 'A product that keeps evolving',
          hy: 'Պրոդուկտ, որը շարունակ զարգանում է',
          ru: 'Продукт, который постоянно развивается',
        }),
        model: t({
          en: 'Long-Term Partnership',
          hy: 'Երկարաժամկետ գործընկերություն',
          ru: 'Долгосрочное партнёрство',
        }),
      },
      {
        statement: t({
          en: 'A live system that needs care',
          hy: 'Գործող համակարգ, որը խնամքի կարիք ունի',
          ru: 'Работающая система, которой нужен уход',
        }),
        model: t({
          en: 'Maintenance & Support',
          hy: 'Սպասարկում և աջակցություն',
          ru: 'Сопровождение и поддержка',
        }),
      },
      {
        statement: t({
          en: 'Delivery for your own clients',
          hy: 'Կատարում ձեր սեփական հաճախորդների համար',
          ru: 'Исполнение для ваших клиентов',
        }),
        model: t({ en: 'White-Label', hy: 'White-label', ru: 'White-label' }),
      },
    ],
  },
} as const satisfies Dictionary;

export default modelFinderContent;
