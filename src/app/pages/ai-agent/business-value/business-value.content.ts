import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const businessValueContent = {
  key: 'ai-agent-business-value',
  content: {
    eyebrow: t({
      en: 'Business value',
      hy: 'Բիզնեսի արժեքը',
      ru: 'Ценность для бизнеса',
    }),
    title: t({
      en: 'What changes when the routine runs itself.',
      hy: 'Ի՞նչ է փոխվում, երբ կրկնվող աշխատանքն ավտոմատացվում է։',
      ru: 'Что меняется, когда рутинные задачи выполняются автоматически.',
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
          hy: 'Աշխատակիցները ժամանակ են հատկացնում որոշումների կայացմանն ու հաճախորդների հետ հարաբերությունների զարգացմանը՝ տվյալները ձեռքով պատճենելու փոխարեն։',
          ru: 'Сотрудники уделяют больше времени принятию решений и работе с клиентами, а не ручному копированию данных.',
        }),
      },
      {
        icon: 'rocket' satisfies AppIconName,
        title: t({
          en: 'Faster response',
          hy: 'Ավելի արագ արձագանք',
          ru: 'Быстрая обработка запросов',
        }),
        text: t({
          en: 'Requests are triaged and routed as they arrive, not when someone is free.',
          hy: 'Հարցումները դասակարգվում և ուղղորդվում են ստանալուն պես՝ առանց աշխատակիցների ազատվելուն սպասելու։',
          ru: 'Запросы классифицируются и направляются ответственным сразу после поступления, не дожидаясь, пока кто-то освободится.',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Consistent processes',
          hy: 'Հետևողական գործընթացներ',
          ru: 'Стабильность процессов',
        }),
        text: t({
          en: 'The same steps run the same way, every time, across the team.',
          hy: 'Գործընթացի նույն քայլերը յուրաքանչյուր անգամ կատարվում են նույն կերպ՝ ամբողջ թիմում ապահովելով միասնական մոտեցում։',
          ru: 'Одни и те же этапы каждый раз выполняются по единым правилам во всей команде.',
        }),
      },
      {
        icon: 'shield-check' satisfies AppIconName,
        title: t({
          en: 'Visibility and control',
          hy: 'Թափանցիկություն և վերահսկողություն',
          ru: 'Прозрачность и контроль',
        }),
        text: t({
          en: 'Every automated step is logged and reviewable, with humans in the loop where needed.',
          hy: 'Ավտոմատացված յուրաքանչյուր քայլ գրանցվում է և կարող է ստուգվել, իսկ անհրաժեշտության դեպքում գործընթացին մասնակցում են նաև աշխատակիցները։',
          ru: 'Каждый этап автоматизации фиксируется и доступен для проверки. При необходимости в процесс включаются сотрудники.',
        }),
      },
    ],
    note: t({
      en: "Outcomes depend on each process and are agreed per project — we don't promise generic percentages.",
      hy: 'Արդյունքները կախված են կոնկրետ գործընթացներից և համաձայնեցվում են յուրաքանչյուր նախագծի շրջանակում։ Մենք չենք խոստանում ընդհանուր կամ չհիմնավորված տոկոսային ցուցանիշներ։',
      ru: 'Результаты зависят от конкретных процессов и согласуются в рамках каждого проекта. Мы не обещаем универсальных или необоснованных процентных показателей.',
    }),
  },
} as const satisfies Dictionary;

export default businessValueContent;
