import { t, type Dictionary } from 'intlayer';

const whyContent = {
  key: 'why',
  content: {
    eyebrow: t({ en: 'Why Nexora', hy: 'Ինչու Nexora', ru: 'Почему Nexora' }),
    title: t({
      en: 'Senior engineering, applied to real business problems.',
      hy: 'Senior ինժեներիա՝ կիրառված իրական բիզնես խնդիրների վրա։',
      ru: 'Senior-инженерия, применённая к реальным бизнес-задачам.',
    }),
    lead: t({
      en: 'Good software is mostly good decisions. We keep teams small and senior so that architecture, trade-offs and delivery stay in experienced hands from the first conversation onward.',
      hy: 'Լավ ծրագրային ապահովումը հիմնականում լավ որոշումներ են։ Մենք թիմերը պահում ենք փոքր և senior, որպեսզի ճարտարապետությունը, փոխզիջումները և մատակարարումը առաջին զրույցից սկսած մնան փորձառու ձեռքերում։',
      ru: 'Хорошее ПО — это прежде всего хорошие решения. Мы держим команды небольшими и senior-уровня, чтобы архитектура, компромиссы и поставка с первого разговора оставались в опытных руках.',
    }),
    team: {
      title: t({
        en: 'One team, every discipline',
        hy: 'Մեկ թիմ, բոլոր ուղղությունները',
        ru: 'Одна команда, все дисциплины',
      }),
      disciplinesLabel: t({ en: 'Disciplines', hy: 'Ուղղություններ', ru: 'Дисциплины' }),
      note: t({
        en: 'Combined per project — only the disciplines the work actually needs.',
        hy: 'Համադրվում են ըստ նախագծի՝ միայն այն ուղղությունները, որոնք իրականում անհրաժեշտ են։',
        ru: 'Собираются под проект — только те дисциплины, которые действительно нужны.',
      }),
    },
  },
} as const satisfies Dictionary;

export default whyContent;
