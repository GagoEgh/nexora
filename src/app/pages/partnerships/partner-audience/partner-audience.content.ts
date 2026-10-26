import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const partnerAudienceContent = {
  key: 'partnerships-audience',
  content: {
    eyebrow: t({
      en: 'Who we partner with',
      hy: 'Ում հետ ենք համագործակցում',
      ru: 'С кем мы сотрудничаем',
    }),
    title: t({
      en: 'Built for companies that sell or advise on technology.',
      hy: 'Ստեղծված է ընկերությունների համար, որոնք վաճառում կամ խորհրդատվություն են տալիս տեխնոլոգիաների շուրջ։',
      ru: 'Создано для компаний, которые продают технологии или консультируют по ним.',
    }),
    lead: t({
      en: 'If your clients ask for software, AI or infrastructure work you don’t deliver in-house, a partnership can close that gap.',
      hy: 'Եթե ձեր հաճախորդները խնդրում են ծրագրային, AI կամ ենթակառուցվածքային աշխատանք, որը դուք ներքուստ չեք իրականացնում, գործընկերությունը կարող է լրացնել այդ բացը։',
      ru: 'Если клиенты просят разработку, AI или инфраструктурные работы, которые вы не выполняете своими силами, партнёрство закроет этот пробел.',
    }),
    items: [
      {
        icon: 'layout-dashboard' satisfies AppIconName,
        title: t({
          en: 'Digital Agencies',
          hy: 'Թվային գործակալություններ',
          ru: 'Цифровые агентства',
        }),
        text: t({
          en: 'Extend web and product offers with senior engineering for complex builds.',
          hy: 'Ընդլայնեք վեբ և պրոդուկտային առաջարկները senior ինժեներությամբ՝ բարդ նախագծերի համար։',
          ru: 'Расширьте веб- и продуктовые предложения senior-инженерией для сложных проектов.',
        }),
      },
      {
        icon: 'target' satisfies AppIconName,
        title: t({
          en: 'Marketing Agencies',
          hy: 'Մարքեթինգային գործակալություններ',
          ru: 'Маркетинговые агентства',
        }),
        text: t({
          en: 'Deliver the platforms, integrations and automation behind your campaigns.',
          hy: 'Մատակարարեք ձեր արշավների հիմքում ընկած հարթակները, ինտեգրացիաները և ավտոմատացումը։',
          ru: 'Поставляйте платформы, интеграции и автоматизацию, стоящие за вашими кампаниями.',
        }),
      },
      {
        icon: 'compass' satisfies AppIconName,
        title: t({ en: 'IT Consultants', hy: 'ՏՏ խորհրդատուներ', ru: 'ИТ-консультанты' }),
        text: t({
          en: 'Turn recommendations into implemented, maintained systems.',
          hy: 'Վերածեք առաջարկությունները ներդրված և սպասարկվող համակարգերի։',
          ru: 'Превращайте рекомендации во внедрённые и сопровождаемые системы.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        title: t({
          en: 'Software Companies',
          hy: 'Ծրագրային ընկերություններ',
          ru: 'Софтверные компании',
        }),
        text: t({
          en: 'Add capacity for client projects, integrations or new product lines.',
          hy: 'Ավելացրեք հզորություն հաճախորդային նախագծերի, ինտեգրացիաների կամ նոր պրոդուկտային ուղղությունների համար։',
          ru: 'Добавьте ресурсы для клиентских проектов, интеграций или новых продуктовых линеек.',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Independent Sales Partners',
          hy: 'Անկախ վաճառքի գործընկերներ',
          ru: 'Независимые партнёры по продажам',
        }),
        text: t({
          en: 'Introduce technical projects from your network to a delivery partner.',
          hy: 'Ձեր ցանցից տեխնիկական նախագծերը ներկայացրեք մատակարարող գործընկերոջը։',
          ru: 'Приводите технические проекты из своей сети к партнёру по разработке.',
        }),
      },
      {
        icon: 'briefcase' satisfies AppIconName,
        title: t({
          en: 'Business Development Professionals',
          hy: 'Բիզնեսի զարգացման մասնագետներ',
          ru: 'Специалисты по развитию бизнеса',
        }),
        text: t({
          en: 'Open new markets and opportunities together with an engineering team.',
          hy: 'Բացեք նոր շուկաներ և հնարավորություններ ինժեներական թիմի հետ միասին։',
          ru: 'Открывайте новые рынки и возможности вместе с инженерной командой.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default partnerAudienceContent;
