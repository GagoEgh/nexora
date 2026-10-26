import { t, type Dictionary } from 'intlayer';

const longTermContent = {
  key: 'about-long-term',
  content: {
    eyebrow: t({
      en: 'Long-term partnership',
      hy: 'Երկարաժամկետ գործընկերություն',
      ru: 'Долгосрочное партнёрство',
    }),
    title: t({
      en: 'We build systems we’d be comfortable maintaining ourselves.',
      hy: 'Մենք կառուցում ենք համակարգեր, որոնք հարմար կլինեին մեզ՝ ինքներս սպասարկելու համար։',
      ru: 'Мы строим системы, которые нам самим было бы комфортно поддерживать.',
    }),
    body: [
      t({
        en: 'Most software lives far longer than its first release. We design for that: maintainable code, documented decisions and infrastructure that can be handed over or grown.',
        hy: 'Ծրագրերի մեծ մասն ապրում է առաջին թողարկումից շատ ավելի երկար։ Մենք նախագծում ենք հենց դրա համար՝ սպասարկելի կոդ, փաստագրված որոշումներ և ենթակառուցվածք, որը կարելի է փոխանցել կամ զարգացնել։',
        ru: 'Большинство продуктов живёт намного дольше первого релиза. Мы проектируем именно под это: поддерживаемый код, задокументированные решения и инфраструктуру, которую можно передать или развивать.',
      }),
      t({
        en: 'Engagements can continue as ongoing partnerships, with the same engineers evolving the product as the business changes.',
        hy: 'Համագործակցությունը կարող է շարունակվել որպես երկարաժամկետ գործընկերություն՝ նույն ինժեներներով, որոնք զարգացնում են արտադրանքը բիզնեսի փոփոխություններին համընթաց։',
        ru: 'Сотрудничество может продолжаться как долгосрочное партнёрство — те же инженеры развивают продукт вместе с изменениями бизнеса.',
      }),
    ],
  },
} as const satisfies Dictionary;

export default longTermContent;
