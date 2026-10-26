import { t, type Dictionary } from 'intlayer';

const modelComparisonContent = {
  key: 'engagement-models-comparison',
  content: {
    eyebrow: t({ en: 'Compare', hy: 'Համեմատություն', ru: 'Сравнение' }),
    title: t({
      en: 'How the models differ.',
      hy: 'Ինչով են տարբերվում մոդելները։',
      ru: 'Чем различаются модели.',
    }),
    lead: t({
      en: 'A qualitative overview. Every engagement is shaped to the situation, so treat this as a starting point for the conversation.',
      hy: 'Որակական ակնարկ։ Յուրաքանչյուր համագործակցություն ձևավորվում է ըստ իրավիճակի, այնպես որ սա դիտարկեք որպես զրույցի մեկնարկային կետ։',
      ru: 'Качественный обзор. Каждое сотрудничество выстраивается под ситуацию, поэтому воспринимайте это как отправную точку для разговора.',
    }),
    note: t({
      en: 'Pricing, availability and contract terms are discussed individually for each engagement.',
      hy: 'Գնագոյացումը, հասանելիությունը և պայմանագրային պայմանները քննարկվում են անհատապես յուրաքանչյուր համագործակցության համար։',
      ru: 'Стоимость, доступность и условия договора обсуждаются индивидуально для каждого сотрудничества.',
    }),
    columns: [
      t({ en: 'Project-Based', hy: 'Նախագծային', ru: 'Проектная' }),
      t({ en: 'Dedicated Team', hy: 'Նվիրված թիմ', ru: 'Выделенная команда' }),
      t({
        en: 'Long-Term Partnership',
        hy: 'Երկարաժամկետ գործընկերություն',
        ru: 'Долгосрочное партнёрство',
      }),
      t({
        en: 'Maintenance & Support',
        hy: 'Սպասարկում և աջակցություն',
        ru: 'Сопровождение и поддержка',
      }),
      t({ en: 'White-Label', hy: 'White-label', ru: 'White-label' }),
    ],
    rows: [
      {
        label: t({ en: 'Scope', hy: 'Ծավալ', ru: 'Объём' }),
        values: [
          t({ en: 'Agreed upfront', hy: 'Համաձայնեցված նախապես', ru: 'Согласован заранее' }),
          t({
            en: 'Evolves with your roadmap',
            hy: 'Զարգանում է ձեր ճանապարհային քարտեզի հետ',
            ru: 'Развивается вместе с вашим роадмапом',
          }),
          t({
            en: 'Evolves over time',
            hy: 'Զարգանում է ժամանակի ընթացքում',
            ru: 'Развивается со временем',
          }),
          t({
            en: 'Agreed responsibilities',
            hy: 'Համաձայնեցված պարտականություններ',
            ru: 'Согласованные обязанности',
          }),
          t({
            en: 'Defined per client project',
            hy: 'Սահմանվում է ըստ հաճախորդի նախագծի',
            ru: 'Определяется под проект клиента',
          }),
        ],
      },
      {
        label: t({ en: 'Team', hy: 'Թիմ', ru: 'Команда' }),
        values: [
          t({
            en: 'Assembled per project',
            hy: 'Հավաքվում է ըստ նախագծի',
            ru: 'Собирается под проект',
          }),
          t({
            en: 'Specialists you direct',
            hy: 'Մասնագետներ, որոնց ղեկավարում եք դուք',
            ru: 'Специалисты под вашим управлением',
          }),
          t({
            en: 'Stable core team',
            hy: 'Կայուն հիմնական թիմ',
            ru: 'Стабильное ядро команды',
          }),
          t({ en: 'Support engineers', hy: 'Աջակցության ինժեներներ', ru: 'Инженеры поддержки' }),
          t({
            en: 'Senior team behind your brand',
            hy: 'Senior թիմ ձեր բրենդի ներքո',
            ru: 'Senior-команда под вашим брендом',
          }),
        ],
      },
      {
        label: t({ en: 'Duration', hy: 'Տևողություն', ru: 'Длительность' }),
        values: [
          t({ en: 'Length of the project', hy: 'Նախագծի տևողությամբ', ru: 'На время проекта' }),
          t({
            en: 'Ongoing, agreed periods',
            hy: 'Շարունակական, համաձայնեցված ժամանակահատվածներ',
            ru: 'Постоянно, согласованными периодами',
          }),
          t({ en: 'Long-term', hy: 'Երկարաժամկետ', ru: 'Долгосрочно' }),
          t({ en: 'Ongoing', hy: 'Շարունակական', ru: 'Постоянно' }),
          t({
            en: 'Per project or ongoing',
            hy: 'Ըստ նախագծի կամ շարունակական',
            ru: 'По проектам или постоянно',
          }),
        ],
      },
      {
        label: t({ en: 'Your role', hy: 'Ձեր դերը', ru: 'Ваша роль' }),
        values: [
          t({
            en: 'Reviews and approvals',
            hy: 'Վերանայումներ և հաստատումներ',
            ru: 'Ревью и утверждения',
          }),
          t({
            en: 'Day-to-day direction',
            hy: 'Ամենօրյա ղեկավարում',
            ru: 'Ежедневное руководство',
          }),
          t({
            en: 'Shared roadmap',
            hy: 'Ընդհանուր ճանապարհային քարտեզ',
            ru: 'Общий роадмап',
          }),
          t({
            en: 'Priorities and escalation',
            hy: 'Առաջնահերթություններ և էսկալացիա',
            ru: 'Приоритеты и эскалация',
          }),
          t({
            en: 'You own the client relationship',
            hy: 'Հաճախորդի հետ հարաբերությունը ձերն է',
            ru: 'Отношения с клиентом принадлежат вам',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default modelComparisonContent;
