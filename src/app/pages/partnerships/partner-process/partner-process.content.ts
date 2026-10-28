import { t, type Dictionary } from 'intlayer';

const partnerProcessContent = {
  key: 'partnerships-process',
  content: {
    eyebrow: t({ en: 'How it works', hy: 'Ինչպես է աշխատում', ru: 'Как это работает' }),
    title: t({
      en: 'From first conversation to ongoing collaboration.',
      hy: 'Առաջին զրույցից մինչև շարունակական համագործակցություն։',
      ru: 'От первого разговора до постоянного сотрудничества.',
    }),
    steps: [
      {
        title: t({
          en: 'Introductory conversation',
          hy: 'Ծանոթական զրույց',
          ru: 'Вводный разговор',
        }),
        text: t({
          en: 'We learn about your business, clients and the kind of work you see demand for.',
          hy: 'Ծանոթանում ենք ձեր բիզնեսին, հաճախորդներին և այն աշխատանքին, որի պահանջարկը տեսնում եք։',
          ru: 'Узнаём о вашем бизнесе, клиентах и о том, на какую работу вы видите спрос.',
        }),
      },
      {
        title: t({
          en: 'Agree the model',
          hy: 'Համաձայնեցնում ենք մոդելը',
          ru: 'Согласуем модель',
        }),
        text: t({
          en: 'Together we choose a partnership type and agree terms, responsibilities and communication.',
          hy: 'Միասին ընտրում ենք գործընկերության տեսակը և համաձայնեցնում ենք պայմանները, պարտականությունները և հաղորդակցությունը։',
          ru: 'Вместе выбираем тип партнёрства и согласуем условия, обязанности и коммуникацию.',
        }),
      },
      {
        title: t({
          en: 'First opportunity',
          hy: 'Առաջին հնարավորություն',
          ru: 'Первая возможность',
        }),
        text: t({
          en: 'We collaborate on a first project or referral to establish how we work together.',
          hy: 'Համագործակցում ենք առաջին նախագծի կամ ուղղորդման շուրջ՝ հասկանալու համար, թե ինչպես ենք աշխատում միասին։',
          ru: 'Работаем над первым проектом или рекомендацией, чтобы выстроить совместную работу.',
        }),
      },
      {
        title: t({
          en: 'Ongoing partnership',
          hy: 'Շարունակական գործընկերություն',
          ru: 'Постоянное партнёрство',
        }),
        text: t({
          en: 'We refine the setup as the relationship and pipeline grow.',
          hy: 'Կատարելագործում ենք կառուցվածքը՝ հարաբերությունների և հոսքի աճին զուգընթաց։',
          ru: 'Дорабатываем схему по мере роста отношений и потока проектов.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;
export default partnerProcessContent;
