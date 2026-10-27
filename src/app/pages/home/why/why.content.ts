import { t, type Dictionary } from 'intlayer';

const whyContent = {
  key: 'why',
  content: {
    eyebrow: t({
      en: 'Why Nexora',
      hy: 'Ինչո՞ւ ընտրել Nexora-ն',
      ru: 'Почему выбирают Nexora',
    }),
    title: t({
      en: 'Senior engineering, applied to real business problems.',
      hy: 'Senior մակարդակի ինժեներական փորձ՝ իրական բիզնես խնդիրների լուծման համար։',
      ru: 'Инженерная экспертиза уровня Senior для решения реальных бизнес-задач.',
    }),
    lead: t({
      en: 'Good software is mostly good decisions. We keep teams small and senior so that architecture, trade-offs and delivery stay in experienced hands from the first conversation onward.',
      hy: 'Որակյալ ծրագրային ապահովման հիմքում ճիշտ որոշումներն են։ Մենք ձևավորում ենք փոքր թիմեր՝ Senior մակարդակի մասնագետներից, որպեսզի ճարտարապետական որոշումները, տեխնիկական փոխզիջումներն ու նախագծի իրականացումը առաջին իսկ քննարկումից մինչև վերջ լինեն փորձառու մասնագետների վերահսկողության ներքո։',
      ru: 'Качественное программное обеспечение начинается с правильных решений. Мы формируем небольшие команды из специалистов уровня Senior, чтобы архитектурные решения, технические компромиссы и реализация проекта с самого первого обсуждения оставались в руках опытных профессионалов.',
    }),
    team: {
      title: t({
        en: 'One team, every discipline',
        hy: 'Մեկ թիմ՝ բոլոր անհրաժեշտ մասնագիտական ուղղություններով',
        ru: 'Одна команда — все необходимые направления экспертизы',
      }),
      disciplinesLabel: t({
        en: 'Disciplines',
        hy: 'Մասնագիտական ուղղություններ',
        ru: 'Направления экспертизы',
      }),
      note: t({
        en: 'Combined per project — only the disciplines the work actually needs.',
        hy: 'Թիմի մասնագիտական ուղղությունները համադրվում են յուրաքանչյուր նախագծի պահանջներին համապատասխան՝ ներգրավելով միայն իսկապես անհրաժեշտ մասնագետներին։',
        ru: 'Состав команды формируется под каждый проект с привлечением только тех специалистов и компетенций, которые действительно необходимы.',
      }),
    },
  },
} as const satisfies Dictionary;

export default whyContent;
