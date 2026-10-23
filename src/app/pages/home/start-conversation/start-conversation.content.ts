import { t, type Dictionary } from 'intlayer';

const startConversationContent = {
  key: 'start-conversation',
  content: {
    eyebrow: t({
      en: 'Start a conversation',
      hy: 'Սկսենք զրույցը',
      ru: 'Начнём разговор',
    }),
    title: t({
      en: 'Have a Complex Technical Challenge? Let’s Solve It Together.',
      hy: 'Ունե՞ք բարդ տեխնիկական մարտահրավեր։ Լուծենք այն միասին։',
      ru: 'Есть сложная техническая задача? Решим её вместе.',
    }),
    lead: t({
      en: 'Tell us what you’re building, modernizing or automating. We’ll review the context and propose a practical next step — usually a short discovery conversation.',
      hy: 'Պատմեք, թե ինչ եք կառուցում, արդիականացնում կամ ավտոմատացնում։ Մենք կուսումնասիրենք համատեքստը և կառաջարկենք գործնական հաջորդ քայլ՝ սովորաբար կարճ ծանոթացման զրույց։',
      ru: 'Расскажите, что вы создаёте, модернизируете или автоматизируете. Мы изучим контекст и предложим практичный следующий шаг — обычно короткий ознакомительный разговор.',
    }),
    steps: [
      t({
        en: 'Share your context',
        hy: 'Կիսվեք համատեքստով',
        ru: 'Поделитесь контекстом',
      }),
      t({
        en: 'Discovery conversation',
        hy: 'Ծանոթացման զրույց',
        ru: 'Ознакомительный разговор',
      }),
      t({
        en: 'Proposed approach',
        hy: 'Առաջարկվող մոտեցում',
        ru: 'Предлагаемый подход',
      }),
    ],
    primaryCta: t({
      en: 'Discuss Your Project',
      hy: 'Քննարկենք ձեր նախագիծը',
      ru: 'Обсудить проект',
    }),
    secondaryCta: t({
      en: 'Become a Partner',
      hy: 'Դարձեք գործընկեր',
      ru: 'Стать партнёром',
    }),
  },
} as const satisfies Dictionary;

export default startConversationContent;
