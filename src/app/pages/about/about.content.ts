import { t, type Dictionary } from 'intlayer';

const aboutContent = {
  key: 'about',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }),
    eyebrow: t({ en: 'About Nexora', hy: 'Nexora-ի մասին', ru: 'О Nexora' }),
    heading: t({
      en: 'A senior engineering partner for businesses that build with technology.',
      hy: 'Senior ինժեներական գործընկեր այն բիզնեսների համար, որոնք կառուցում են տեխնոլոգիայով։',
      ru: 'Senior-инженерный партнёр для компаний, которые строят на технологиях.',
    }),
    lead: t({
      en: 'Nexora is a technology development and AI solutions company. We help organizations design, build, integrate, deploy, maintain and evolve the digital systems they depend on — with a team made up exclusively of Senior and Senior+ engineers.',
      hy: 'Nexora-ն տեխնոլոգիական մշակման և AI լուծումների ընկերություն է։ Մենք օգնում ենք կազմակերպություններին նախագծել, կառուցել, ինտեգրել, ներդնել, սպասարկել և զարգացնել այն թվային համակարգերը, որոնցից կախված է իրենց աշխատանքը՝ բացառապես Senior և Senior+ ինժեներներից բաղկացած թիմով։',
      ru: 'Nexora — компания технологической разработки и AI-решений. Мы помогаем организациям проектировать, создавать, интегрировать, развёртывать, поддерживать и развивать цифровые системы, на которые они опираются, — командой, состоящей исключительно из Senior и Senior+ инженеров.',
    }),
    conversation: {
      eyebrow: t({
        en: 'Collaborate with Nexora',
        hy: 'Համագործակցեք Nexora-ի հետ',
        ru: 'Сотрудничайте с Nexora',
      }),
      title: t({
        en: 'Let’s talk about working together.',
        hy: 'Եկեք խոսենք համատեղ աշխատանքի մասին։',
        ru: 'Давайте обсудим совместную работу.',
      }),
      lead: t({
        en: 'Whether it’s a single project, a dedicated team or a long-term partnership, the first step is a conversation about what you need.',
        hy: 'Անկախ նրանից՝ դա առանձին նախագիծ է, նվիրված թիմ, թե երկարաժամկետ գործընկերություն, առաջին քայլը զրույցն է այն մասին, թե ինչ է ձեզ անհրաժեշտ։',
        ru: 'Будь то отдельный проект, выделенная команда или долгосрочное партнёрство — первый шаг это разговор о том, что вам нужно.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Engagement models',
        hy: 'Համագործակցության մոդելներ',
        ru: 'Форматы сотрудничества',
      }),
    },
  },
} as const satisfies Dictionary;

export default aboutContent;
