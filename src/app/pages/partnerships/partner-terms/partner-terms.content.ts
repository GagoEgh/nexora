import { t, type Dictionary } from 'intlayer';

const partnerTermsContent = {
  key: 'partnerships-terms',
  content: {
    title: t({
      en: 'Every partnership is agreed individually.',
      hy: 'Յուրաքանչյուր գործընկերության պայմանները համաձայնեցվում են անհատապես։',
      ru: 'Условия каждого партнёрства согласуются индивидуально.',
    }),
    lead: t({
      en: 'We don’t publish fixed commissions or standard contracts. These points are discussed and documented for each partner.',
      hy: 'Մենք չենք սահմանում հրապարակային ֆիքսված միջնորդավճարներ և միասնական պայմանագրային պայմաններ։ Բոլոր մանրամասները քննարկվում և գրավոր ամրագրվում են յուրաքանչյուր գործընկերոջ հետ առանձին։',
      ru: 'Мы не публикуем фиксированные ставки комиссионного вознаграждения и типовые договоры. Все условия обсуждаются с каждым партнёром индивидуально и фиксируются в письменном виде.',
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
          hy: 'Գնագոյացման սկզբունքներն ու գործընկերոջ կողմից իրականացվող աշխատանքների շահութաբերության պայմանները',
          ru: 'Структура ценообразования и маржинальность работ, выполняемых партнёром',
        }),
      },
      {
        title: t({ en: 'Commissions', hy: 'Միջնորդավճարներ', ru: 'Комиссионное вознаграждение' }),
        text: t({
          en: 'Referral and sales compensation, where applicable',
          hy: 'Հաճախորդների ուղղորդման և վաճառքի համար նախատեսված վարձատրությունը՝ համապատասխան դեպքերում',
          ru: 'Вознаграждение за привлечение клиентов и продажи, если применимо',
        }),
      },
      {
        title: t({ en: 'Confidentiality', hy: 'Գաղտնիություն', ru: 'Конфиденциальность' }),
        text: t({
          en: 'NDAs and handling of client information',
          hy: 'Գաղտնիության պահպանման համաձայնագրեր (NDA) և հաճախորդների տեղեկատվության պաշտպանություն',
          ru: 'Соглашения о неразглашении (NDA) и защита информации о клиентах',
        }),
      },
      {
        title: t({
          en: 'Responsibilities',
          hy: 'Պատասխանատվության շրջանակ',
          ru: 'Зоны ответственности',
        }),
        text: t({
          en: 'Who owns scope, delivery, quality and client communication',
          hy: 'Աշխատանքի ծավալի, նախագծի իրականացման, որակի և հաճախորդի հետ հաղորդակցության համար պատասխանատու կողմերի սահմանում',
          ru: 'Распределение ответственности за объём работ, реализацию проекта, качество и коммуникацию с клиентом',
        }),
      },
      {
        title: t({
          en: 'Communication model',
          hy: 'Հաղորդակցության ձևաչափ',
          ru: 'Формат взаимодействия',
        }),
        text: t({
          en: 'Branded, joint or direct contact with end clients',
          hy: 'Վերջնական հաճախորդների հետ հաղորդակցություն՝ ձեր ապրանքանիշի ներքո, համատեղ կամ անմիջական ձևաչափով',
          ru: 'Взаимодействие с конечными клиентами под вашим брендом, совместно или напрямую',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default partnerTermsContent;
