import { t, type Dictionary } from 'intlayer';

const partnerFlowContent = {
  key: 'partnerships-flow',
  content: {
    partnerTitle: t({ en: 'Your side', hy: 'Ձեր կողմը', ru: 'Ваша сторона' }),
    nexoraTitle: 'Nexora',
    badge: t({
      en: 'Agreed partnership model',
      hy: 'Համաձայնեցված գործընկերության մոդել',
      ru: 'Согласованная модель партнёрства',
    }),
    partnerChips: [
      t({
        en: 'Client relationships',
        hy: 'Հաճախորդային հարաբերություններ',
        ru: 'Клиентские отношения',
      }),
      t({ en: 'Market knowledge', hy: 'Շուկայի իմացություն', ru: 'Знание рынка' }),
      t({ en: 'Sales pipeline', hy: 'Վաճառքի հոսք', ru: 'Воронка продаж' }),
      t({
        en: 'Brand & account management',
        hy: 'Բրենդի և հաշվի կառավարում',
        ru: 'Управление брендом и клиентами',
      }),
    ],
    nexoraChips: [
      t({ en: 'Senior engineers', hy: 'Senior ինժեներներ', ru: 'Senior-инженеры' }),
      t({
        en: 'Architecture & delivery',
        hy: 'Ճարտարապետություն և մատակարարում',
        ru: 'Архитектура и поставка',
      }),
      t({ en: 'AI & automation', hy: 'AI և ավտոմատացում', ru: 'AI и автоматизация' }),
      t({
        en: 'Infrastructure & support',
        hy: 'Ենթակառուցվածք և աջակցություն',
        ru: 'Инфраструктура и поддержка',
      }),
    ],
  },
} as const satisfies Dictionary;

export default partnerFlowContent;
