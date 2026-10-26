import { t, type Dictionary } from 'intlayer';

const modelFaqContent = {
  key: 'engagement-models-faq',
  content: {
    eyebrow: t({ en: 'Questions', hy: 'Հարցեր', ru: 'Вопросы' }),
    title: t({
      en: 'Common questions about working together.',
      hy: 'Հաճախ տրվող հարցեր համագործակցության մասին։',
      ru: 'Частые вопросы о совместной работе.',
    }),
    items: [
      {
        question: t({
          en: 'Can we change the model later?',
          hy: 'Կարո՞ղ ենք հետագայում փոխել մոդելը։',
          ru: 'Можно ли сменить модель позже?',
        }),
        answer: t({
          en: 'Yes, by mutual agreement. An engagement can be restructured as needs change — for example, a project moving into ongoing support after launch.',
          hy: 'Այո՝ փոխադարձ համաձայնությամբ։ Համագործակցությունը կարող է վերակառուցվել կարիքների փոփոխությանը զուգընթաց՝ օրինակ, նախագիծը գործարկումից հետո կարող է անցնել շարունակական աջակցության։',
          ru: 'Да, по взаимному согласию. Сотрудничество можно перестроить по мере изменения потребностей — например, проект после запуска переходит в постоянную поддержку.',
        }),
      },
      {
        question: t({
          en: 'Can models be combined?',
          hy: 'Կարո՞ղ են մոդելները համակցվել։',
          ru: 'Можно ли комбинировать модели?',
        }),
        answer: t({
          en: 'Yes. Models are often combined — a project-based build moving into maintenance and support, or a dedicated team working alongside a long-term partnership.',
          hy: 'Այո։ Մոդելները հաճախ համակցվում են՝ նախագծային մշակումն անցնում է սպասարկման և աջակցության, կամ նվիրված թիմն աշխատում է երկարաժամկետ գործընկերության կողքին։',
          ru: 'Да. Модели часто сочетаются: проектная разработка переходит в сопровождение и поддержку, а выделенная команда работает рядом с долгосрочным партнёрством.',
        }),
      },
      {
        question: t({
          en: 'How is pricing set?',
          hy: 'Ինչպե՞ս է սահմանվում գինը։',
          ru: 'Как формируется стоимость?',
        }),
        answer: t({
          en: 'Pricing, availability and contract terms are discussed individually for each engagement, once the scope, the team and the expected duration are clear.',
          hy: 'Գնագոյացումը, հասանելիությունը և պայմանագրային պայմանները քննարկվում են անհատապես յուրաքանչյուր համագործակցության համար՝ երբ պարզ են ծավալը, թիմը և սպասվող տևողությունը։',
          ru: 'Стоимость, доступность и условия договора обсуждаются индивидуально для каждого сотрудничества — когда понятны объём, состав команды и ожидаемая длительность.',
        }),
      },
      {
        question: t({
          en: 'How do we start?',
          hy: 'Ինչպե՞ս սկսել։',
          ru: 'Как мы начинаем?',
        }),
        answer: t({
          en: 'With a conversation about your situation. From there we agree the scope, the roles involved and the model that fits, before any work begins.',
          hy: 'Ձեր իրավիճակի մասին զրույցով։ Այնուհետև մինչ աշխատանքը սկսելը համաձայնեցնում ենք ծավալը, ներգրավված դերերը և հարմար մոդելը։',
          ru: 'С разговора о вашей ситуации. Затем, до начала работ, мы согласуем объём, состав ролей и подходящую модель.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default modelFaqContent;
