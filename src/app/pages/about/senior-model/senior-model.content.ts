import { t, type Dictionary } from 'intlayer';

const seniorModelContent = {
  key: 'about-senior-model',
  content: {
    eyebrow: t({
      en: 'Senior & Senior+ only',
      hy: 'Միայն Senior և Senior+ մակարդակի մասնագետներ',
      ru: 'Только специалисты уровня Senior и Senior+',
    }),
    title: t({
      en: 'Experience where the decisions are made.',
      hy: 'Փորձառություն՝ որոշումների կայացման մակարդակում։',
      ru: 'Опыт на уровне принятия решений.',
    }),
    lead: t({
      en: 'Many delivery models put a few senior people on top of a large junior team. We work differently: every engineer on a Nexora project is senior or above, so the people writing the code are the people who understand the trade-offs.',
      hy: 'Համագործակցության շատ մոդելներում մի քանի Senior մասնագետներ ղեկավարում են մեծ Junior թիմեր։ Nexora-ում մենք աշխատում ենք այլ կերպ․ մեր յուրաքանչյուր նախագծում ներգրավված ինժեներ ունի առնվազն Senior մակարդակ, ուստի կոդը գրող մասնագետներն իրենք են գնահատում տեխնիկական տարբերակների առավելություններն ու փոխզիջումները։',
      ru: 'Во многих моделях разработки небольшая группа Senior-специалистов руководит большой командой Junior-разработчиков. В Nexora мы работаем иначе: каждый инженер проекта имеет уровень Senior или выше, поэтому код пишут специалисты, которые сами понимают преимущества, ограничения и компромиссы принимаемых технических решений.',
    }),
    points: [
      t({
        en: 'Fewer hand-offs between planning and implementation',
        hy: 'Ավելի քիչ միջանկյալ փոխանցումներ՝ պլանավորումից մինչև իրականացում',
        ru: 'Меньше промежуточных передач задач от планирования к реализации',
      }),
      t({
        en: 'Architecture decisions made by people who build',
        hy: 'Ճարտարապետական որոշումները կայացնում են հենց լուծումները մշակող մասնագետները',
        ru: 'Архитектурные решения принимают сами специалисты, которые реализуют их на практике',
      }),
      t({
        en: 'Smaller teams, clearer ownership',
        hy: 'Փոքր թիմեր և պատասխանատվության հստակ բաշխում',
        ru: 'Небольшие команды и чёткое распределение ответственности',
      }),
    ],
    pyramid: {
      label: t({
        en: 'Common pyramid',
        hy: 'Տարածված թիմային մոդել',
        ru: 'Типичная модель команды',
      }),
      senior: t({ en: 'Senior', hy: 'Senior', ru: 'Senior' }),
      junior: t({ en: 'Junior / mid', hy: 'Junior / Mid', ru: 'Junior / Mid' }),
    },
    nexora: {
      label: t({ en: 'Nexora model', hy: 'Nexora-ի մոդել', ru: 'Модель Nexora' }),
      legend: t({ en: 'Senior & Senior+', hy: 'Senior և Senior+', ru: 'Senior и Senior+' }),
    },
  },
} as const satisfies Dictionary;

export default seniorModelContent;
