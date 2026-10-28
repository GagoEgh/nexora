import { t, type Dictionary } from 'intlayer';

const modelFinderContent = {
  key: 'engagement-models-finder',
  content: {
    title: t({
      en: 'Which model fits?',
      hy: 'Ո՞ր համագործակցության ձևաչափն է ձեզ հարմար։',
      ru: 'Какой формат сотрудничества вам подходит?',
    }),
    need: t({
      en: 'You need',
      hy: 'Ձեզ անհրաժեշտ է',
      ru: 'Вам нужно',
    }),
    rows: [
      {
        statement: t({
          en: 'A clearly defined scope',
          hy: 'Հստակ սահմանված աշխատանքի ծավալ',
          ru: 'Чётко определённый объём работ',
        }),
        model: t({
          en: 'Project-Based',
          hy: 'Նախագծային մշակում',
          ru: 'Проектная разработка',
        }),
      },
      {
        statement: t({
          en: 'Ongoing extra senior capacity',
          hy: 'Senior մակարդակի լրացուցիչ մասնագետների շարունակական ներգրավում',
          ru: 'Постоянное привлечение дополнительных Senior-специалистов',
        }),
        model: t({
          en: 'Dedicated Team',
          hy: 'Նախագծին նվիրված թիմ',
          ru: 'Выделенная команда',
        }),
      },
      {
        statement: t({
          en: 'A product that keeps evolving',
          hy: 'Շարունակաբար զարգացող թվային արտադրանք',
          ru: 'Продукт, который постоянно развивается',
        }),
        model: t({
          en: 'Long-Term Partnership',
          hy: 'Երկարաժամկետ տեխնոլոգիական գործընկերություն',
          ru: 'Долгосрочное технологическое партнёрство',
        }),
      },
      {
        statement: t({
          en: 'A live system that needs care',
          hy: 'Գործող համակարգ, որը կանոնավոր տեխնիկական սպասարկման կարիք ունի',
          ru: 'Действующая система, которой необходимо регулярное техническое сопровождение',
        }),
        model: t({
          en: 'Maintenance & Support',
          hy: 'Տեխնիկական սպասարկում և աջակցություն',
          ru: 'Техническое сопровождение и поддержка',
        }),
      },
      {
        statement: t({
          en: 'Delivery for your own clients',
          hy: 'Տեխնիկական լուծումների մշակում ձեր հաճախորդների համար',
          ru: 'Разработка технических решений для ваших клиентов',
        }),
        model: t({
          en: 'White-Label',
          hy: 'White-label մշակում',
          ru: 'White-label-разработка',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default modelFinderContent;
