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
      hy: 'Համագործակցության հինգ ձևաչափ։',
      ru: 'Пять форматов сотрудничества.',
    }),
    lead: t({
      en: 'Each partnership is set up individually. The model describes the shape of the collaboration — the specifics are agreed with you.',
      hy: 'Յուրաքանչյուր գործընկերություն ձևավորվում է անհատապես։ Ձևաչափը սահմանում է համագործակցության ընդհանուր սկզբունքները, իսկ կոնկրետ պայմանները համաձայնեցվում են ձեզ հետ։',
      ru: 'Каждое партнёрство выстраивается индивидуально. Формат определяет общие принципы сотрудничества, а конкретные условия согласуются с вами.',
    }),
    typicallyFor: t({ en: 'Typically for', hy: 'Ում համար է նախատեսված', ru: 'Для кого подходит' }),
    terms: t({
      en: 'Terms agreed individually',
      hy: 'Անհատապես համաձայնեցվող պայմաններ',
      ru: 'Индивидуально согласуемые условия',
    }),
    items: [
      {
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Partnership',
          hy: 'White-label գործընկերություն',
          ru: 'White-label-партнёрство',
        }),
        text: t({
          en: 'Nexora engineers deliver projects under your brand, while you own the client relationship and communication.',
          hy: 'Nexora-ի ինժեներներն իրականացնում են նախագծերը ձեր ապրանքանիշի ներքո, իսկ հաճախորդների հետ հարաբերություններն ու հաղորդակցությունը վարում եք դուք։',
          ru: 'Инженеры Nexora реализуют проекты под вашим брендом, а отношения с клиентами и коммуникацию с ними ведёте вы.',
        }),
        audience: t({
          en: 'Agencies and software companies',
          hy: 'Գործակալություններ և ծրագրային ապահովման ընկերություններ',
          ru: 'Агентства и компании-разработчики ПО',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Agency Partnership',
          hy: 'Գործակալական գործընկերություն',
          ru: 'Партнёрство с агентствами',
        }),
        text: t({
          en: 'A close, ongoing collaboration where we act as your technical delivery team across multiple client projects.',
          hy: 'Սերտ և շարունակական համագործակցություն, որի շրջանակում մենք հանդես ենք գալիս որպես ձեր տեխնիկական թիմ՝ տարբեր հաճախորդների նախագծերն իրականացնելու համար։',
          ru: 'Тесное и долгосрочное сотрудничество, в рамках которого мы выступаем вашей технической командой и реализуем проекты для разных клиентов.',
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
          hy: 'Հաճախորդների ուղղորդման գործընկերություն',
          ru: 'Партнёрство по привлечению клиентов',
        }),
        text: t({
          en: 'You introduce clients who need engineering work; we take the project from there.',
          hy: 'Դուք մեզ ներկայացնում եք տեխնիկական ծառայությունների կարիք ունեցող հաճախորդների, իսկ մենք ստանձնում ենք նախագծի հետագա իրականացումը։',
          ru: 'Вы знакомите нас с клиентами, которым нужны инженерные услуги, а мы берём на себя дальнейшую реализацию проекта.',
        }),
        audience: t({
          en: 'Consultants and professionals with a relevant network',
          hy: 'Խորհրդատուներ և մասնագետներ՝ համապատասխան գործարար կապերով',
          ru: 'Консультанты и специалисты с подходящими деловыми контактами',
        }),
      },
      {
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Commission-Based Sales Partnership',
          hy: 'Վաճառքի գործընկերություն՝ միջնորդավճարի հիմունքներով',
          ru: 'Партнёрство по продажам на комиссионной основе',
        }),
        text: t({
          en: 'You actively sell Nexora services to your network under agreed commercial conditions.',
          hy: 'Դուք ակտիվորեն առաջարկում և վաճառում եք Nexora-ի ծառայությունները ձեր գործարար կապերին՝ նախապես համաձայնեցված առևտրային պայմաններով։',
          ru: 'Вы активно продвигаете и продаёте услуги Nexora среди своих деловых контактов на заранее согласованных коммерческих условиях.',
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
          hy: 'Ռազմավարական համագործակցություն՝ նոր շուկաներ բացահայտելու, ոլորտային ուղղություններ զարգացնելու և նոր ծառայություններ կամ առաջարկներ միասին ձևավորելու համար։',
          ru: 'Стратегическое сотрудничество для совместного выхода на новые рынки, развития отраслевых направлений и формирования новых предложений.',
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
