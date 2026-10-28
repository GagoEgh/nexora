import { t, type Dictionary } from 'intlayer';

const contactContent = {
  key: 'contact',
  content: {
    breadcrumbLabel: t({
      en: 'Breadcrumb',
      hy: 'Նավիգացիոն ուղի',
      ru: 'Навигационная цепочка',
    }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
    eyebrow: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
    heading: t({
      en: 'Let’s Build Something Meaningful.',
      hy: 'Եկե՛ք միասին արժեքավոր բան ստեղծենք։',
      ru: 'Давайте вместе создадим нечто действительно ценное.',
    }),
    lead: t({
      en: 'Tell us about your project, team needs or partnership idea. The more context you share, the more useful our first conversation will be.',
      hy: 'Պատմե՛ք մեզ ձեր նախագծի, թիմի կարիքների կամ համագործակցության գաղափարի մասին։ Որքան ավելի մանրամասն ներկայացնեք ձեր նպատակներն ու կարիքները, այնքան ավելի արդյունավետ կլինի մեր առաջին զրույցը։',
      ru: 'Расскажите нам о своём проекте, потребностях команды или идее сотрудничества. Чем подробнее вы опишете свои цели и задачи, тем продуктивнее будет наша первая встреча.',
    }),
  },
} as const satisfies Dictionary;

export default contactContent;
