import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const partnerModelContent = {
  key: 'partnerships-models',
  content: {
    eyebrow: t({
      en: 'Partnership types',
      hy: 'Գործընկերության տեսակներ',
      ru: 'Типы партнёрства',
    }),
    title: t({
      en: 'Five ways to work together.',
      hy: 'Համագործակցության հինգ եղանակ։',
      ru: 'Пять способов работать вместе.',
    }),
    lead: t({
      en: 'Each partnership is set up individually. The model describes the shape of the collaboration — the specifics are agreed with you.',
      hy: 'Յուրաքանչյուր գործընկերություն կազմակերպվում է անհատապես։ Մոդելը նկարագրում է համագործակցության ձևը, իսկ մանրամասները համաձայնեցվում են ձեզ հետ։',
      ru: 'Каждое партнёрство выстраивается индивидуально. Модель описывает форму сотрудничества — детали согласуются с вами.',
    }),
    typicallyFor: t({ en: 'Typically for', hy: 'Սովորաբար', ru: 'Обычно для' }),
    terms: t({
      en: 'Terms agreed individually',
      hy: 'Պայմանները համաձայնեցվում են անհատապես',
      ru: 'Условия согласуются индивидуально',
    }),
    items: [
      {
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Partnership',
          hy: 'White-label գործընկերություն',
          ru: 'White-label партнёрство',
        }),
        text: t({
          en: 'Nexora engineers deliver projects under your brand, while you own the client relationship and communication.',
          hy: 'Nexora-ի ինժեներները նախագծերն իրականացնում են ձեր բրենդի ներքո, իսկ հաճախորդի հետ հարաբերությունը և հաղորդակցությունը մնում են ձեզ։',
          ru: 'Инженеры Nexora выполняют проекты под вашим брендом, а отношения и коммуникация с клиентом остаются за вами.',
        }),
        audience: t({
          en: 'Agencies and software companies',
          hy: 'Գործակալություններ և ծրագրային ընկերություններ',
          ru: 'Агентства и софтверные компании',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Agency Partnership',
          hy: 'Գործակալական գործընկերություն',
          ru: 'Агентское партнёрство',
        }),
        text: t({
          en: 'A close, ongoing collaboration where we act as your technical delivery team across multiple client projects.',
          hy: 'Սերտ, շարունակական համագործակցություն, որտեղ մենք հանդես ենք գալիս որպես ձեր տեխնիկական մատակարարման թիմ՝ հաճախորդային մի քանի նախագծերում։',
          ru: 'Тесное постоянное сотрудничество, в котором мы выступаем вашей технической командой на нескольких клиентских проектах.',
        }),
        audience: t({
          en: 'Digital and marketing agencies',
          hy: 'Թվային և մարքեթինգային գործակալություններ',
          ru: 'Цифровые и маркетинговые агентства',
        }),
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Referral Partnership',
          hy: 'Ուղղորդման գործընկերություն',
          ru: 'Реферальное партнёрство',
        }),
        text: t({
          en: 'You introduce clients who need engineering work; we take the project from there.',
          hy: 'Դուք ներկայացնում եք հաճախորդներ, որոնց անհրաժեշտ է ինժեներական աշխատանք, իսկ մենք ստանձնում ենք նախագիծը։',
          ru: 'Вы приводите клиентов, которым нужна инженерная работа, а мы берём проект на себя.',
        }),
        audience: t({
          en: 'Consultants and professionals with a relevant network',
          hy: 'Խորհրդատուներ և մասնագետներ՝ համապատասխան ցանցով',
          ru: 'Консультанты и специалисты с профильной сетью контактов',
        }),
      },
      {
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Commission-Based Sales Partnership',
          hy: 'Միջնորդավճարով վաճառքի գործընկերություն',
          ru: 'Партнёрство по продажам с комиссией',
        }),
        text: t({
          en: 'You actively sell Nexora services to your network under agreed commercial conditions.',
          hy: 'Դուք ակտիվորեն վաճառում եք Nexora-ի ծառայությունները ձեր ցանցին՝ համաձայնեցված առևտրային պայմաններով։',
          ru: 'Вы активно продаёте услуги Nexora своей сети на согласованных коммерческих условиях.',
        }),
        audience: t({
          en: 'Independent sales partners',
          hy: 'Անկախ վաճառքի գործընկերներ',
          ru: 'Независимые партнёры по продажам',
        }),
      },
      {
        icon: 'rocket' satisfies AppIconName,
        title: t({
          en: 'Business Development Partnership',
          hy: 'Բիզնեսի զարգացման գործընկերություն',
          ru: 'Партнёрство по развитию бизнеса',
        }),
        text: t({
          en: 'A strategic collaboration to develop new markets, verticals or offerings together.',
          hy: 'Ռազմավարական համագործակցություն՝ նոր շուկաներ, ուղղություններ կամ առաջարկներ միասին զարգացնելու համար։',
          ru: 'Стратегическое сотрудничество для совместного развития новых рынков, вертикалей или предложений.',
        }),
        audience: t({
          en: 'Business development professionals',
          hy: 'Բիզնեսի զարգացման մասնագետներ',
          ru: 'Специалисты по развитию бизнеса',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default partnerModelContent;
