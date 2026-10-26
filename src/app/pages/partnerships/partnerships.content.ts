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
    conversation: {
      eyebrow: t({
        en: 'Partnership inquiry',
        hy: 'Գործընկերության հարցում',
        ru: 'Запрос о партнёрстве',
      }),
      title: t({
        en: 'Interested in partnering with Nexora?',
        hy: 'Հետաքրքրվա՞ծ եք Nexora-ի հետ գործընկերությամբ։',
        ru: 'Хотите стать партнёром Nexora?',
      }),
      lead: t({
        en: 'Tell us about your business, your clients and the kind of partnership you have in mind. We’ll follow up to explore the fit.',
        hy: 'Պատմեք ձեր բիզնեսի, հաճախորդների և այն գործընկերության մասին, որը պատկերացնում եք։ Մենք կկապվենք՝ քննարկելու համապատասխանությունը։',
        ru: 'Расскажите о своём бизнесе, клиентах и о том, какое партнёрство вы имеете в виду. Мы свяжемся, чтобы обсудить, насколько это подходит.',
      }),
      primaryCta: t({ en: 'Become a Partner', hy: 'Դառնալ գործընկեր', ru: 'Стать партнёром' }),
      secondaryCta: t({
        en: 'White-label services',
        hy: 'White-label ծառայություններ',
        ru: 'White-label услуги',
      }),
    },
  },
} as const satisfies Dictionary;

export default partnershipsContent;
