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
      hy: 'Փորձառու ինժեներական գործընկեր տեխնոլոգիաների վրա հիմնված բիզնեսների համար։',
      ru: 'Опытный инженерный партнёр для компаний, развивающих бизнес с помощью технологий.',
    }),
    lead: t({
      en: 'Nexora is a technology development and AI solutions company. We help organizations design, build, integrate, deploy, maintain and evolve the digital systems they depend on — with a team made up exclusively of Senior and Senior+ engineers.',
      hy: 'Nexora-ն տեխնոլոգիաների մշակմամբ և արհեստական բանականության (AI) լուծումներով զբաղվող ընկերություն է։ Մենք օգնում ենք կազմակերպություններին նախագծել, մշակել, ինտեգրել, ներդնել, սպասարկել և շարունակաբար զարգացնել իրենց գործունեության համար կարևոր թվային համակարգերը։ Մեր թիմը բաղկացած է բացառապես Senior և Senior+ մակարդակի ինժեներներից։',
      ru: 'Nexora — компания, специализирующаяся на разработке технологий и решениях на основе искусственного интеллекта (AI). Мы помогаем организациям проектировать, разрабатывать, интегрировать, внедрять, сопровождать и непрерывно развивать цифровые системы, важные для их деятельности. Наша команда состоит исключительно из инженеров уровня Senior и Senior+.',
    }),
    conversation: {
      eyebrow: t({
        en: 'Collaborate with Nexora',
        hy: 'Համագործակցեք Nexora-ի հետ',
        ru: 'Сотрудничество с Nexora',
      }),
      title: t({
        en: 'Let’s talk about working together.',
        hy: 'Եկե՛ք քննարկենք համագործակցության հնարավորությունները։',
        ru: 'Давайте обсудим возможности сотрудничества.',
      }),
      lead: t({
        en: 'Whether it’s a single project, a dedicated team or a long-term partnership, the first step is a conversation about what you need.',
        hy: 'Անկախ նրանից՝ ձեզ անհրաժեշտ է առանձին նախագիծ, ձեր նպատակներին նվիրված թիմ, թե երկարաժամկետ գործընկերություն, առաջին քայլը ձեր կարիքներն ու նպատակները քննարկելն է։',
        ru: 'Будь то отдельный проект, выделенная команда или долгосрочное партнёрство, первый шаг — обсудить ваши задачи, цели и потребности.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Engagement models',
        hy: 'Համագործակցության ձևաչափեր',
        ru: 'Форматы сотрудничества',
      }),
    },
  },
} as const satisfies Dictionary;

export default aboutContent;
