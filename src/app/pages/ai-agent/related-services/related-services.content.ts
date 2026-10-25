import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const relatedServicesContent = {
  key: 'ai-agent-related-services',
  content: {
    eyebrow: t({
      en: 'Related services',
      hy: 'Առնչվող ծառայություններ',
      ru: 'Смежные услуги',
    }),
    title: t({
      en: 'Often combined with this service.',
      hy: 'Հաճախ համակցվում է այս ծառայության հետ։',
      ru: 'Часто сочетается с этой услугой.',
    }),
    items: [
      {
        number: '08',
        title: t({
          en: 'AI Development & Integration',
          hy: 'AI մշակում և ինտեգրում',
          ru: 'AI-разработка и интеграция',
        }),
        summary: t({
          en: 'Model API integrations, assistants, RAG and document intelligence inside your software.',
          hy: 'Մոդելների API ինտեգրումներ, օգնականներ, RAG և փաստաթղթերի ինտելեկտ՝ ձեր ծրագրի ներսում։',
          ru: 'Интеграции API моделей, ассистенты, RAG и интеллектуальная обработка документов внутри вашего ПО.',
        }),
        tags: [
          t({ en: 'RAG', hy: 'RAG', ru: 'RAG' }),
          t({ en: 'Assistants', hy: 'Օգնականներ', ru: 'Ассистенты' }),
          t({ en: 'Document AI', hy: 'Փաստաթղթային AI', ru: 'Document AI' }),
        ],
      },
      {
        number: '06',
        title: t({
          en: 'Backend Development & API Integration',
          hy: 'Backend մշակում և API ինտեգրում',
          ru: 'Backend-разработка и интеграция API',
        }),
        summary: t({
          en: 'Server architecture, databases and APIs that connect CRMs, ERPs and payment providers.',
          hy: 'Սերվերային ճարտարապետություն, տվյալների բազաներ և API-ներ, որոնք միացնում են CRM-ները, ERP-ները և վճարային մատակարարներին։',
          ru: 'Серверная архитектура, базы данных и API, связывающие CRM, ERP и платёжных провайдеров.',
        }),
        tags: [
          t({ en: 'REST APIs', hy: 'REST API-ներ', ru: 'REST API' }),
          t({ en: 'Databases', hy: 'Տվյալների բազաներ', ru: 'Базы данных' }),
          t({ en: 'Integrations', hy: 'Ինտեգրումներ', ru: 'Интеграции' }),
        ],
      },
      {
        number: '10',
        title: t({
          en: 'Claude & AI Workflow Engineering',
          hy: 'Claude և AI աշխատահոսքերի ինժեներիա',
          ru: 'Claude и инженерия AI-процессов',
        }),
        summary: t({
          en: 'Claude API integration, internal assistants and controlled adoption of AI-assisted development.',
          hy: 'Claude API-ի ինտեգրում, ներքին օգնականներ և AI-ով աջակցվող մշակման վերահսկվող ներդրում։',
          ru: 'Интеграция Claude API, внутренние ассистенты и контролируемое внедрение AI-ассистированной разработки.',
        }),
        tags: [
          t({ en: 'Claude API', hy: 'Claude API', ru: 'Claude API' }),
          t({ en: 'AI-assisted dev', hy: 'AI-ով մշակում', ru: 'AI-ассистированная разработка' }),
          t({ en: 'Governance', hy: 'Կառավարում', ru: 'Контроль' }),
        ],
      },
    ],
    engage: {
      eyebrow: t({
        en: 'How to engage',
        hy: 'Ինչպես համագործակցել',
        ru: 'Как начать работу',
      }),
      title: t({
        en: 'Usually delivered as',
        hy: 'Սովորաբար մատուցվում է որպես',
        ru: 'Обычно реализуется как',
      }),
      models: [
        {
          icon: 'target' satisfies AppIconName,
          title: t({
            en: 'Project-Based',
            hy: 'Նախագծային',
            ru: 'Проектный формат',
          }),
          text: t({
            en: 'Scoped first automation',
            hy: 'Հստակ ծավալով առաջին ավտոմատացում',
            ru: 'Первая автоматизация с чётким объёмом',
          }),
        },
        {
          icon: 'handshake' satisfies AppIconName,
          title: t({
            en: 'Long-Term Partnership',
            hy: 'Երկարաժամկետ գործընկերություն',
            ru: 'Долгосрочное партнёрство',
          }),
          text: t({
            en: 'Expanding automation over time',
            hy: 'Ավտոմատացման աստիճանական ընդլայնում',
            ru: 'Постепенное расширение автоматизации',
          }),
        },
        {
          icon: 'wrench' satisfies AppIconName,
          title: t({
            en: 'Maintenance & Support',
            hy: 'Սպասարկում և աջակցություն',
            ru: 'Поддержка и сопровождение',
          }),
          text: t({
            en: 'Monitoring and improvements',
            hy: 'Մոնիթորինգ և բարելավումներ',
            ru: 'Мониторинг и улучшения',
          }),
        },
      ],
    },
  },
} as const satisfies Dictionary;

export default relatedServicesContent;
