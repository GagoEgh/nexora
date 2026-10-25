import { t, type Dictionary } from 'intlayer';

export type CapabilitiesTone = 'neutral' | 'accent';

const capabilitiesContent = {
  key: 'ai-agent-capabilities',
  content: {
    eyebrow: t({
      en: 'Capabilities & deliverables',
      hy: 'Հնարավորություններ և արդյունքներ',
      ru: 'Возможности и результаты',
    }),
    title: t({
      en: 'What we build, and what you receive.',
      hy: 'Ինչ ենք կառուցում և ինչ եք ստանում։',
      ru: 'Что мы создаём и что вы получаете.',
    }),
    panels: [
      {
        tone: 'neutral' satisfies CapabilitiesTone,
        title: t({ en: 'Capabilities', hy: 'Հնարավորություններ', ru: 'Возможности' }),
        items: [
          t({
            en: 'Lead handling and qualification',
            hy: 'Լիդերի մշակում և որակավորում',
            ru: 'Обработка и квалификация лидов',
          }),
          t({
            en: 'CRM workflow automation',
            hy: 'CRM հոսքերի ավտոմատացում',
            ru: 'Автоматизация процессов в CRM',
          }),
          t({
            en: 'Document processing and data extraction',
            hy: 'Փաստաթղթերի մշակում և տվյալների արդյունահանում',
            ru: 'Обработка документов и извлечение данных',
          }),
          t({
            en: 'Intelligent routing and assignment',
            hy: 'Խելացի ուղղորդում և նշանակում',
            ru: 'Интеллектуальная маршрутизация и назначение',
          }),
          t({
            en: 'Notifications and escalations',
            hy: 'Ծանուցումներ և էսկալացիաներ',
            ru: 'Уведомления и эскалации',
          }),
          t({
            en: 'Automated reporting',
            hy: 'Ավտոմատացված հաշվետվություններ',
            ru: 'Автоматические отчёты',
          }),
          t({
            en: 'Multi-step agent orchestration',
            hy: 'Բազմաքայլ գործակալների նվագախմբում',
            ru: 'Оркестрация многошаговых агентов',
          }),
        ],
      },
      {
        tone: 'accent' satisfies CapabilitiesTone,
        title: t({ en: 'Deliverables', hy: 'Արդյունքներ', ru: 'Результаты' }),
        items: [
          t({
            en: 'Process map and automation design',
            hy: 'Գործընթացների քարտեզ և ավտոմատացման նախագիծ',
            ru: 'Карта процессов и дизайн автоматизации',
          }),
          t({
            en: 'Working agents and automations in your environment',
            hy: 'Աշխատող գործակալներ և ավտոմատացումներ ձեր միջավայրում',
            ru: 'Работающие агенты и автоматизации в вашей среде',
          }),
          t({
            en: 'Integrations with your existing tools',
            hy: 'Ինտեգրումներ ձեր առկա գործիքների հետ',
            ru: 'Интеграции с вашими текущими инструментами',
          }),
          t({
            en: 'Guardrails, logging and human-review steps',
            hy: 'Սահմանափակումներ, գրանցամատյաններ և մարդկային ստուգման քայլեր',
            ru: 'Ограничения, логирование и шаги проверки человеком',
          }),
          t({
            en: 'Documentation and team handover',
            hy: 'Փաստաթղթավորում և թիմին փոխանցում',
            ru: 'Документация и передача команде',
          }),
          t({
            en: 'Monitoring and iteration plan',
            hy: 'Մոնիտորինգ և կատարելագործման պլան',
            ru: 'Мониторинг и план доработок',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;

export default capabilitiesContent;
