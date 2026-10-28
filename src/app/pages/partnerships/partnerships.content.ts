import { t, type Dictionary } from 'intlayer';

const partnershipsContent = {
  key: 'partnerships',
  content: {
    breadcrumbLabel: t({
      en: 'Breadcrumb',
      hy: 'Նավիգացիոն ուղի',
      ru: 'Навигационная цепочка',
    }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
    eyebrow: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
    heading: t({
      en: 'Senior engineering behind your client relationships.',
      hy: 'Senior մակարդակի ինժեներական փորձ՝ ձեր հաճախորդների նախագծերն իրականացնելու համար։',
      ru: 'Инженерная экспертиза уровня Senior для реализации проектов ваших клиентов.',
    }),
    lead: t({
      en: 'For agencies, consultants, software companies and sales partners who want to offer — or refer — technical projects without building an engineering team of their own.',
      hy: 'Գործակալությունների, խորհրդատուների, ծրագրային ապահովման ընկերությունների և վաճառքի գործընկերների համար, որոնք ցանկանում են առաջարկել տեխնիկական ծառայություններ կամ ուղղորդել համապատասխան նախագծեր՝ առանց սեփական ինժեներական թիմ ստեղծելու։',
      ru: 'Для агентств, консультантов, компаний-разработчиков ПО и партнёров по продажам, которые хотят предлагать технические услуги или направлять профильные проекты, не создавая собственную инженерную команду.',
    }),
    primaryCta: t({
      en: 'Become a Partner',
      hy: 'Դառնալ գործընկեր',
      ru: 'Стать партнёром',
    }),
    secondaryCta: t({
      en: 'How partnerships work',
      hy: 'Ինչպես է գործում գործընկերությունը',
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
        hy: 'Ցանկանո՞ւմ եք համագործակցել Nexora-ի հետ։',
        ru: 'Хотите сотрудничать с Nexora?',
      }),
      lead: t({
        en: 'Tell us about your business, your clients and the kind of partnership you have in mind. We’ll follow up to explore the fit.',
        hy: 'Պատմեք ձեր բիզնեսի, հաճախորդների և համագործակցության ձեր պատկերացումների մասին։ Մենք կկապվենք ձեզ հետ՝ քննարկելու հնարավոր համագործակցությունն ու դրա համապատասխանությունը ձեր նպատակներին։',
        ru: 'Расскажите о своём бизнесе, клиентах и желаемом формате партнёрства. Мы свяжемся с вами, чтобы обсудить возможности сотрудничества и его соответствие вашим целям.',
      }),
      primaryCta: t({
        en: 'Become a Partner',
        hy: 'Դառնալ գործընկեր',
        ru: 'Стать партнёром',
      }),
      secondaryCta: t({
        en: 'White-label services',
        hy: 'White-label ծառայություններ',
        ru: 'White-label-услуги',
      }),
    },
  },
} as const satisfies Dictionary;

export default partnershipsContent;
