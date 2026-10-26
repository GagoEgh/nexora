import { t, type Dictionary } from 'intlayer';

const contactContent = {
  key: 'contact',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
    eyebrow: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
    heading: t({
      en: 'Let’s Build Something Meaningful.',
      hy: 'Եկեք կառուցենք իմաստալի բան։',
      ru: 'Давайте создадим что-то значимое.',
    }),
    lead: t({
      en: 'Tell us about your project, team needs or partnership idea. The more context you share, the more useful our first conversation will be.',
      hy: 'Պատմեք ձեր նախագծի, թիմի կարիքների կամ գործընկերության գաղափարի մասին։ Որքան շատ համատեքստ կիսվեք, այնքան օգտակար կլինի մեր առաջին զրույցը։',
      ru: 'Расскажите о своём проекте, потребностях команды или идее партнёрства. Чем больше контекста вы поделитесь, тем полезнее будет наш первый разговор.',
    }),
  },
} as const satisfies Dictionary;

export default contactContent;
