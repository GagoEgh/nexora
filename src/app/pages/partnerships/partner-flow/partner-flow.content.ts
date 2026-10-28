import { t, type Dictionary } from 'intlayer';

const partnerFlowContent = {
  key: 'partnerships-flow',
  content: {
    label: t({
      en: 'What each side brings',
      hy: 'Յուրաքանչյուր կողմի ներդրումը',
      ru: 'Вклад каждой стороны',
    }),
    partnerTitle: t({ en: 'Your side', hy: 'Ձեր ներդրումը', ru: 'Ваш вклад' }),
    nexoraTitle: 'Nexora',
    badge: t({
      en: 'Agreed partnership model',
      hy: 'Համաձայնեցված գործընկերության ձևաչափ',
      ru: 'Согласованный формат партнёрства',
    }),
    partnerChips: [
      t({
        en: 'Client relationships',
        hy: 'Հաճախորդների հետ հարաբերություններ',
        ru: 'Отношения с клиентами',
      }),
      t({ en: 'Market knowledge', hy: 'Շուկայի իմացություն', ru: 'Знание рынка' }),
      t({ en: 'Sales pipeline', hy: 'Պոտենցիալ գործարքների հոսք', ru: 'Воронка продаж' }),
      t({
        en: 'Brand & account management',
        hy: 'Բրենդի և հաճախորդների կառավարում',
        ru: 'Управление брендом и клиентскими аккаунтами',
      }),
    ],
    nexoraChips: [
      t({ en: 'Senior engineers', hy: 'Senior մակարդակի ինժեներներ', ru: 'Senior-инженеры' }),
      t({
        en: 'Architecture & delivery',
        hy: 'Համակարգերի ճարտարապետություն և նախագծերի իրականացում',
        ru: 'Архитектура систем и реализация проектов',
      }),
      t({ en: 'AI & automation', hy: 'AI և ավտոմատացում', ru: 'AI и автоматизация' }),
      t({
        en: 'Infrastructure & support',
        hy: 'Ենթակառուցվածքներ և տեխնիկական աջակցություն',
        ru: 'Инфраструктура и техническая поддержка',
      }),
    ],
  },
} as const satisfies Dictionary;

export default partnerFlowContent;
