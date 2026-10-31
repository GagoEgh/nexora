import { t, type Dictionary } from 'intlayer';

const footerContent = {
  key: 'footer',
  content: {
    description: t({
      en: 'Technology development and AI solutions partner. Senior and Senior+ engineers who design, build and evolve software that businesses rely on.',
      hy: 'Տեխնոլոգիական մշակման և AI լուծումների գործընկեր։ Senior և Senior+ ինժեներներ, որոնք նախագծում, կառուցում և զարգացնում են ծրագրային ապահովում, որի վրա հենվում են բիզնեսները։',
      ru: 'Партнёр по разработке технологий и AI-решений. Инженеры уровня Senior и Senior+, которые проектируют, создают и развивают программное обеспечение, на которое полагается бизнес.',
    }),
    tagline: t({ en: 'Engineering the next', hy: 'Կառուցում ենք ապագան', ru: 'Создаём будущее' }),
    columns: [
      {
        heading: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
        links: [
          {
            path: '/services?category=software-engineering',
            label: t({
              en: 'Software Engineering',
              hy: 'Ծրագրային ինժեներիա',
              ru: 'Разработка ПО',
            }),
          },
          {
            path: '/services?category=artificial-intelligence',
            label: t({
              en: 'Artificial Intelligence',
              hy: 'Արհեստական բանականություն',
              ru: 'Искусственный интеллект',
            }),
          },
          {
            path: '/services?category=design-product',
            label: t({ en: 'Design & Product', hy: 'Դիզայն և պրոդուկտ', ru: 'Дизайн и продукт' }),
          },
          {
            path: '/services?category=infrastructure-operations',
            label: t({
              en: 'Infrastructure & Operations',
              hy: 'Ենթակառուցվածք և շահագործում',
              ru: 'Инфраструктура и эксплуатация',
            }),
          },
          {
            path: '/services?category=engineering-partnerships',
            label: t({
              en: 'Engineering Partnerships',
              hy: 'Ինժեներական գործընկերություն',
              ru: 'Инженерное партнёрство',
            }),
          },
          {
            path: '/services',
            label: t({
              en: 'All 15 services',
              hy: 'Բոլոր 15 ծառայությունները',
              ru: 'Все 15 услуг',
            }),
          },
        ],
      },
      {
        heading: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
        links: [
          {
            path: '/solutions?challenge=launch-digital-product',
            label: t({
              en: 'Launch a digital product',
              hy: 'Թողարկել թվային պրոդուկտ',
              ru: 'Запустить цифровой продукт',
            }),
          },
          {
            path: '/solutions?challenge=modernize-platform',
            label: t({
              en: 'Modernize a platform',
              hy: 'Արդիականացնել հարթակը',
              ru: 'Модернизировать платформу',
            }),
          },
          {
            path: '/solutions?challenge=automate-operations',
            label: t({
              en: 'Automate operations',
              hy: 'Ավտոմատացնել գործընթացները',
              ru: 'Автоматизировать процессы',
            }),
          },
          {
            path: '/solutions?challenge=introduce-ai',
            label: t({
              en: 'Introduce AI into workflows',
              hy: 'Ներդնել AI աշխատանքային հոսքերում',
              ru: 'Внедрить AI в рабочие процессы',
            }),
          },
          {
            path: '/solutions?challenge=scale-engineering',
            label: t({
              en: 'Scale engineering capacity',
              hy: 'Ընդլայնել ինժեներական հզորությունը',
              ru: 'Масштабировать инженерные ресурсы',
            }),
          },
        ],
      },
      {
        heading: t({ en: 'Company', hy: 'Ընկերություն', ru: 'Компания' }),
        links: [
          {
            path: '/about',
            label: t({ en: 'About Nexora', hy: 'Nexora-ի մասին', ru: 'О Nexora' }),
          },
          {
            path: '/engagement-models',
            label: t({
              en: 'Engagement Models',
              hy: 'Համագործակցության մոդելներ',
              ru: 'Модели сотрудничества',
            }),
          },
          {
            path: '/partnerships',
            label: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
          },
          { path: '/contact', label: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }) },
        ],
      },
      {
        heading: t({ en: 'Get in touch', hy: 'Կապ հաստատեք', ru: 'Связаться' }),
        links: [
          {
            path: '/contact',
            label: t({ en: 'Start a project', hy: 'Սկսել նախագիծ', ru: 'Начать проект' }),
          },
          {
            path: '/partnerships',
            label: t({ en: 'Become a partner', hy: 'Դառնալ գործընկեր', ru: 'Стать партнёром' }),
          },
        ],
      },
    ],
    legal: [
      {
        path: '/privacy-policy',
        label: t({
          en: 'Privacy Policy',
          hy: 'Գաղտնիության քաղաքականություն',
          ru: 'Политика конфиденциальности',
        }),
      },
      {
        path: '/terms-of-use',
        label: t({ en: 'Terms of Use', hy: 'Օգտագործման պայմաններ', ru: 'Условия использования' }),
      },
    ],
    rightsReserved: t({
      en: 'All rights reserved.',
      hy: 'Բոլոր իրավունքները պաշտպանված են։',
      ru: 'Все права защищены.',
    }),
    language: t({ en: 'Language', hy: 'Լեզու', ru: 'Язык' }),
  },
} as const satisfies Dictionary;

export default footerContent;
