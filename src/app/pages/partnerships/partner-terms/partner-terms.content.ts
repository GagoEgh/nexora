import { t, type Dictionary } from 'intlayer';

const partnerTermsContent = {
  key: 'partnerships-terms',
  content: {
    title: t({
      en: 'Every partnership is agreed individually.',
      hy: 'Յուրաքանչյուր գործընկերություն համաձայնեցվում է անհատապես։',
      ru: 'Каждое партнёрство согласуется индивидуально.',
    }),
    lead: t({
      en: 'We don’t publish fixed commissions or standard contracts. These points are discussed and documented for each partner.',
      hy: 'Մենք չենք հրապարակում ֆիքսված միջնորդավճարներ կամ ստանդարտ պայմանագրեր։ Այս կետերը քննարկվում և փաստաթղթավորվում են յուրաքանչյուր գործընկերոջ համար։',
      ru: 'Мы не публикуем фиксированные комиссии или стандартные договоры. Эти пункты обсуждаются и фиксируются для каждого партнёра.',
    }),
    items: [
      {
        title: t({
          en: 'Commercial conditions',
          hy: 'Առևտրային պայմաններ',
          ru: 'Коммерческие условия',
        }),
        text: t({
          en: 'Pricing structure and margins for partner-delivered work',
          hy: 'Գնագոյացման կառուցվածք և մարժա գործընկերոջ կատարած աշխատանքի համար',
          ru: 'Структура цен и маржа по работам, выполняемым партнёром',
        }),
      },
      {
        title: t({ en: 'Commissions', hy: 'Միջնորդավճարներ', ru: 'Комиссии' }),
        text: t({
          en: 'Referral and sales compensation, where applicable',
          hy: 'Ուղղորդման և վաճառքի վարձատրություն՝ կիրառելի դեպքերում',
          ru: 'Вознаграждение за рекомендации и продажи, где применимо',
        }),
      },
      {
        title: t({ en: 'Confidentiality', hy: 'Գաղտնիություն', ru: 'Конфиденциальность' }),
        text: t({
          en: 'NDAs and handling of client information',
          hy: 'NDA-ներ և հաճախորդի տեղեկատվության հետ աշխատանք',
          ru: 'NDA и обращение с информацией клиента',
        }),
      },
      {
        title: t({ en: 'Responsibilities', hy: 'Պարտականություններ', ru: 'Обязанности' }),
        text: t({
          en: 'Who owns scope, delivery, quality and client communication',
          hy: 'Ով է պատասխանատու ծավալի, մատակարարման, որակի և հաճախորդի հետ հաղորդակցության համար',
          ru: 'Кто отвечает за объём, поставку, качество и общение с клиентом',
        }),
      },
      {
        title: t({
          en: 'Communication model',
          hy: 'Հաղորդակցության մոդել',
          ru: 'Модель коммуникации',
        }),
        text: t({
          en: 'Branded, joint or direct contact with end clients',
          hy: 'Բրենդավորված, համատեղ կամ ուղիղ կապ վերջնական հաճախորդների հետ',
          ru: 'Брендированный, совместный или прямой контакт с конечными клиентами',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default partnerTermsContent;
