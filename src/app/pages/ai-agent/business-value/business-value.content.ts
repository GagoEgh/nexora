import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const businessValueContent = {
  key: 'ai-agent-business-value',
  content: {
    eyebrow: t({
      en: 'Business value',
      hy: 'Բիզնես արժեք',
      ru: 'Ценность для бизнеса',
    }),
    title: t({
      en: 'What changes when the routine runs itself.',
      hy: 'Ինչ է փոխվում, երբ առօրյա գործընթացներն ինքնաշխատ են դառնում։',
      ru: 'Что меняется, когда рутина выполняется сама.',
    }),
    items: [
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Less manual work',
          hy: 'Ավելի քիչ ձեռքով աշխատանք',
          ru: 'Меньше ручной работы',
        }),
        text: t({
          en: 'People spend time on judgement and relationships instead of copying data.',
          hy: 'Մարդիկ ժամանակ են հատկացնում որոշումներին և հարաբերություններին՝ տվյալներ պատճենելու փոխարեն։',
          ru: 'Люди тратят время на решения и отношения, а не на копирование данных.',
        }),
      },
      {
        icon: 'rocket' satisfies AppIconName,
        title: t({
          en: 'Faster response',
          hy: 'Ավելի արագ արձագանք',
          ru: 'Более быстрый отклик',
        }),
        text: t({
          en: 'Requests are triaged and routed as they arrive, not when someone is free.',
          hy: 'Հարցումները դասակարգվում և ուղղորդվում են ստացման պահին, ոչ թե երբ ինչ-որ մեկն ազատվի։',
          ru: 'Запросы сортируются и направляются сразу при поступлении, а не когда кто-то освободится.',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Consistent processes',
          hy: 'Հետևողական գործընթացներ',
          ru: 'Единообразные процессы',
        }),
        text: t({
          en: 'The same steps run the same way, every time, across the team.',
          hy: 'Նույն քայլերը կատարվում են նույն կերպ՝ ամեն անգամ, ամբողջ թիմում։',
          ru: 'Одни и те же шаги выполняются одинаково каждый раз и во всей команде.',
        }),
      },
      {
        icon: 'shield-check' satisfies AppIconName,
        title: t({
          en: 'Visibility and control',
          hy: 'Տեսանելիություն և վերահսկողություն',
          ru: 'Прозрачность и контроль',
        }),
        text: t({
          en: 'Every automated step is logged and reviewable, with humans in the loop where needed.',
          hy: 'Ամեն ինքնաշխատ քայլ գրանցվում է և ենթակա է ստուգման՝ անհրաժեշտության դեպքում մարդկային մասնակցությամբ։',
          ru: 'Каждый автоматизированный шаг логируется и доступен для проверки, а при необходимости в процесс включается человек.',
        }),
      },
    ],
    note: t({
      en: "Outcomes depend on each process and are agreed per project — we don't promise generic percentages.",
      hy: 'Արդյունքները կախված են կոնկրետ գործընթացից և համաձայնեցվում են յուրաքանչյուր նախագծի շրջանակում — մենք ընդհանուր տոկոսներ չենք խոստանում։',
      ru: 'Результаты зависят от конкретного процесса и согласуются по каждому проекту — мы не обещаем универсальных процентов.',
    }),
  },
} as const satisfies Dictionary;

export default businessValueContent;
