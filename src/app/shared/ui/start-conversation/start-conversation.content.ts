import { t, type Dictionary } from 'intlayer';

const startConversationContent = {
  key: 'start-conversation',
  content: {
    eyebrow: t({
      en: 'Start a conversation',
      hy: 'Սկսենք քննարկումը',
      ru: 'Начнём обсуждение',
    }),
    title: t({
      en: 'Have a Complex Technical Challenge? Let’s Solve It Together.',
      hy: 'Ունե՞ք բարդ տեխնիկական խնդիր։ Եկեք լուծենք այն միասին։',
      ru: 'Столкнулись со сложной технической задачей? Давайте решим её вместе.',
    }),
    lead: t({
      en: 'Tell us what you’re building, modernizing or automating. We’ll review the context and propose a practical next step — usually a short discovery conversation.',
      hy: 'Պատմեք մեզ, թե ինչ եք մշակում, արդիականացնում կամ ավտոմատացնում։ Մենք կուսումնասիրենք ձեր կարիքներն ու իրավիճակը և կառաջարկենք գործնական հաջորդ քայլ՝ սովորաբար կարճ նախնական քննարկում։',
      ru: 'Расскажите, что вы разрабатываете, модернизируете или автоматизируете. Мы изучим ваши задачи и контекст, а затем предложим практический следующий шаг — обычно короткую ознакомительную встречу.',
    }),
    steps: [
      t({
        en: 'Share your context',
        hy: 'Ներկայացրեք ձեր խնդիրը',
        ru: 'Расскажите о своей задаче',
      }),
      t({
        en: 'Discovery conversation',
        hy: 'Նախնական քննարկում',
        ru: 'Первичная консультация',
      }),
      t({
        en: 'Proposed approach',
        hy: 'Առաջարկվող լուծում',
        ru: 'Предлагаемый план действий',
      }),
    ],
    primaryCta: t({
      en: 'Discuss Your Project',
      hy: 'Քննարկել ձեր նախագիծը',
      ru: 'Обсудить ваш проект',
    }),
    secondaryCta: t({
      en: 'Become a Partner',
      hy: 'Դառնալ գործընկեր',
      ru: 'Стать партнёром',
    }),
  },
} as const satisfies Dictionary;

export default startConversationContent;
