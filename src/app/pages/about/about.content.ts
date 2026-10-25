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
    glance: {
      title: t({ en: 'Nexora at a glance', hy: 'Nexora-ն համառոտ', ru: 'Nexora вкратце' }),
      rows: [
        {
          label: t({ en: 'Focus', hy: 'Ուղղություն', ru: 'Фокус' }),
          value: t({
            en: 'Software engineering & AI solutions',
            hy: 'Ծրագրային ինժեներիա և AI լուծումներ',
            ru: 'Программная инженерия и AI-решения',
          }),
        },
        {
          label: t({ en: 'Team', hy: 'Թիմ', ru: 'Команда' }),
          value: t({
            en: 'Senior and Senior+ engineers only',
            hy: 'Միայն Senior և Senior+ ինժեներներ',
            ru: 'Только Senior и Senior+ инженеры',
          }),
        },
        {
          label: t({ en: 'Markets', hy: 'Շուկաներ', ru: 'Рынки' }),
          value: t({
            en: 'Armenia & international',
            hy: 'Հայաստան և միջազգային',
            ru: 'Армения и международные рынки',
          }),
        },
        {
          label: t({ en: 'Clients', hy: 'Հաճախորդներ', ru: 'Клиенты' }),
          value: t({
            en: 'Startups, SMEs, enterprises, software companies, agencies',
            hy: 'Ստարտափներ, ՓՄՁ-ներ, խոշոր ընկերություններ, ծրագրային ընկերություններ, գործակալություններ',
            ru: 'Стартапы, МСБ, крупные компании, софтверные компании, агентства',
          }),
        },
        {
          label: t({ en: 'Engagement', hy: 'Համագործակցություն', ru: 'Форматы работы' }),
          value: t({
            en: 'Projects, dedicated teams, partnership, white-label, support',
            hy: 'Նախագծեր, նվիրված թիմեր, գործընկերություն, white-label, աջակցություն',
            ru: 'Проекты, выделенные команды, партнёрство, white-label, поддержка',
          }),
        },
      ],
    },
  },
} as const satisfies Dictionary;

export default aboutContent;
