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
      hy: 'Տեխնոլոգիական ծառայություններ առաջարկող և խորհրդատվություն տրամադրող ընկերությունների համար։',
      ru: 'Для компаний, которые предлагают технологические решения или консультируют в сфере технологий.',
    }),
    lead: t({
      en: 'If your clients ask for software, AI or infrastructure work you don’t deliver in-house, a partnership can close that gap.',
      hy: 'Եթե ձեր հաճախորդներին անհրաժեշտ են ծրագրային ապահովման, AI-ի կամ ենթակառուցվածքների հետ կապված ծառայություններ, որոնք դուք ինքներդ չեք մատուցում, համագործակցությունը Nexora-ի հետ կօգնի լրացնել այդ բացը։',
      ru: 'Если вашим клиентам нужны услуги по разработке ПО, внедрению AI или работе с инфраструктурой, которые вы не предоставляете собственными силами, партнёрство с Nexora поможет закрыть эту потребность.',
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
          hy: 'Ընդլայնեք ձեր վեբ ծառայությունների և թվային արտադրանքների առաջարկը՝ բարդ նախագծերի համար ներգրավելով Senior մակարդակի ինժեներների։',
          ru: 'Расширяйте предложения в области веб-разработки и цифровых продуктов, привлекая Senior-инженеров для реализации сложных проектов.',
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
          hy: 'Իրականացրեք ձեր մարքեթինգային արշավների համար անհրաժեշտ հարթակների, ինտեգրացիաների և ավտոմատացման լուծումները։',
          ru: 'Реализуйте платформы, интеграции и решения по автоматизации, необходимые для ваших маркетинговых кампаний.',
        }),
      },
      {
        icon: 'compass' satisfies AppIconName,
        title: t({ en: 'IT Consultants', hy: 'ՏՏ խորհրդատուներ', ru: 'ИТ-консультанты' }),
        text: t({
          en: 'Turn recommendations into implemented, maintained systems.',
          hy: 'Превратите рекомендации в полноценно внедрённые системы с последующим техническим сопровождением.',
          ru: 'Превращайте рекомендации в реализованные решения с последующим техническим сопровождением.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        title: t({
          en: 'Software Companies',
          hy: 'Ծրագրային ապահովման ընկերություններ',
          ru: 'Компании-разработчики ПО',
        }),
        text: t({
          en: 'Add capacity for client projects, integrations or new product lines.',
          hy: 'Ընդլայնեք ձեր թիմի կարողությունները՝ հաճախորդների նախագծերն իրականացնելու, ինտեգրացիաներ մշակելու կամ նոր արտադրանքների ուղղություններ զարգացնելու համար։',
          ru: 'Расширяйте возможности команды для реализации клиентских проектов, разработки интеграций или запуска новых продуктовых направлений.',
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
          hy: 'Ձեր մասնագիտական կապերի միջոցով ներգրավեք տեխնիկական նախագծեր և համագործակցեք դրանք իրականացնող գործընկերոջ հետ։',
          ru: 'Находите технические проекты среди своих деловых контактов и передавайте их партнёру, который обеспечит реализацию.',
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
          hy: 'Ինժեներական թիմի հետ միասին զարգացրեք նոր շուկաներ և բացահայտեք բիզնեսի նոր հնարավորություններ։',
          ru: 'Осваивайте новые рынки и открывайте дополнительные бизнес-возможности вместе с инженерной командой.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default partnerAudienceContent;
