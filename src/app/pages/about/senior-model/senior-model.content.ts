import { t, type Dictionary } from 'intlayer';

const seniorModelContent = {
  key: 'about-senior-model',
  content: {
    eyebrow: t({
      en: 'Senior & Senior+ only',
      hy: 'Միայն Senior և Senior+',
      ru: 'Только Senior и Senior+',
    }),
    title: t({
      en: 'Experience where the decisions are made.',
      hy: 'Փորձառություն այնտեղ, որտեղ կայացվում են որոշումները։',
      ru: 'Опыт там, где принимаются решения.',
    }),
    lead: t({
      en: 'Many delivery models put a few senior people on top of a large junior team. We work differently: every engineer on a Nexora project is senior or above, so the people writing the code are the people who understand the trade-offs.',
      hy: 'Մատակարարման շատ մոդելներ մի քանի senior մասնագետի դնում են մեծ junior թիմի գլխին։ Մենք աշխատում ենք այլ կերպ՝ Nexora-ի նախագծի յուրաքանչյուր ինժեներ senior է կամ ավելի բարձր, այնպես որ կոդը գրողները հենց այն մարդիկ են, ովքեր հասկանում են փոխզիջումները։',
      ru: 'Многие модели поставки ставят нескольких senior-специалистов над большой junior-командой. Мы работаем иначе: каждый инженер на проекте Nexora — senior или выше, поэтому код пишут те же люди, которые понимают компромиссы.',
    }),
    points: [
      t({
        en: 'Fewer hand-offs between planning and implementation',
        hy: 'Ավելի քիչ փոխանցումներ պլանավորման և իրականացման միջև',
        ru: 'Меньше передач между планированием и реализацией',
      }),
      t({
        en: 'Architecture decisions made by people who build',
        hy: 'Ճարտարապետական որոշումներ՝ կայացված նրանց կողմից, ովքեր կառուցում են',
        ru: 'Архитектурные решения принимают те, кто строит',
      }),
      t({
        en: 'Smaller teams, clearer ownership',
        hy: 'Ավելի փոքր թիմեր, ավելի հստակ պատասխանատվություն',
        ru: 'Меньше команды, яснее зона ответственности',
      }),
    ],
    pyramid: {
      label: t({ en: 'Common pyramid', hy: 'Սովորական բուրգ', ru: 'Обычная пирамида' }),
      senior: t({ en: 'Senior', hy: 'Senior', ru: 'Senior' }),
      junior: t({ en: 'Junior / mid', hy: 'Junior / mid', ru: 'Junior / mid' }),
    },
    nexora: {
      label: t({ en: 'Nexora model', hy: 'Nexora-ի մոդել', ru: 'Модель Nexora' }),
      legend: t({ en: 'Senior & Senior+', hy: 'Senior և Senior+', ru: 'Senior и Senior+' }),
    },
  },
} as const satisfies Dictionary;

export default seniorModelContent;
