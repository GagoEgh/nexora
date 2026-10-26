import { t, type Dictionary } from 'intlayer';

const partnershipsContent = {
  key: 'partnerships',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
    eyebrow: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
    heading: t({
      en: 'Senior engineering behind your client relationships.',
      hy: 'Senior ինժեներություն ձեր հաճախորդային հարաբերությունների հետևում։',
      ru: 'Senior-инженерия за вашими клиентскими отношениями.',
    }),
    lead: t({
      en: 'For agencies, consultants, software companies and sales partners who want to offer — or refer — technical projects without building an engineering team of their own.',
      hy: 'Գործակալությունների, խորհրդատուների, ծրագրային ընկերությունների և վաճառքի գործընկերների համար, ովքեր ցանկանում են առաջարկել կամ ուղղորդել տեխնիկական նախագծեր՝ առանց սեփական ինժեներական թիմ կառուցելու։',
      ru: 'Для агентств, консультантов, софтверных компаний и партнёров по продажам, которые хотят предлагать — или рекомендовать — технические проекты, не создавая собственную инженерную команду.',
    }),
    primaryCta: t({ en: 'Become a Partner', hy: 'Դառնալ գործընկեր', ru: 'Стать партнёром' }),
    secondaryCta: t({
      en: 'How partnerships work',
      hy: 'Ինչպես է աշխատում գործընկերությունը',
      ru: 'Как работает партнёрство',
    }),
  },
} as const satisfies Dictionary;

export default partnershipsContent;
