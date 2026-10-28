import { t, type Dictionary } from 'intlayer';

export type CapabilitiesTone = 'neutral' | 'accent';

const capabilitiesContent = {
  key: 'ai-agent-capabilities',
  content: {
    eyebrow: t({
      en: 'Capabilities & deliverables',
      hy: 'Հնարավորություններ և մատուցվող արդյունքներ',
      ru: 'Возможности и результаты работы',
    }),
    title: t({
      en: 'What we build, and what you receive.',
      hy: 'Ինչ ենք ստեղծում և ինչ եք ստանում։',
      ru: 'Что мы создаём и что вы получаете.',
    }),
    panels: [
      {
        tone: 'neutral' satisfies CapabilitiesTone,
        title: t({ en: 'Capabilities', hy: 'Հնարավորություններ', ru: 'Возможности' }),
        items: [
          t({
            en: 'Lead handling and qualification',
            hy: 'Պոտենցիալ հաճախորդների հայտերի մշակում և որակավորում',
            ru: 'Обработка и квалификация потенциальных клиентов',
          }),
          t({
            en: 'CRM workflow automation',
            hy: 'CRM համակարգում աշխատանքային գործընթացների ավտոմատացում',
            ru: 'Автоматизация рабочих процессов в CRM',
          }),
          t({
            en: 'Document processing and data extraction',
            hy: 'Փաստաթղթերի մշակում և դրանցից տվյալների դուրսբերում',
            ru: 'Обработка документов и извлечение данных',
          }),
          t({
            en: 'Intelligent routing and assignment',
            hy: 'Խելացի ուղղորդում և առաջադրանքների բաշխում',
            ru: 'Интеллектуальная маршрутизация и распределение задач',
          }),
          t({
            en: 'Notifications and escalations',
            hy: 'Ծանուցումներ և խնդիրների փոխանցում պատասխանատու մասնագետներին',
            ru: 'Уведомления и передача сложных вопросов ответственным специалистам',
          }),
          t({
            en: 'Automated reporting',
            hy: 'Հաշվետվությունների ավտոմատ կազմում',
            ru: 'Автоматическое формирование отчётов',
          }),
          t({
            en: 'Multi-step agent orchestration',
            hy: 'AI գործակալների բազմափուլ աշխատանքի համակարգում',
            ru: 'Координация многоэтапной работы AI-агентов',
          }),
        ],
      },
      {
        tone: 'accent' satisfies CapabilitiesTone,
        title: t({ en: 'Deliverables', hy: 'Մատուցվող արդյունքներ', ru: 'Что вы получаете' }),
        items: [
          t({
            en: 'Process map and automation design',
            hy: 'Գործընթացների քարտեզ և ավտոմատացման լուծման նախագիծ',
            ru: 'Карта процессов и проект автоматизации',
          }),
          t({
            en: 'Working agents and automations in your environment',
            hy: 'Ձեր միջավայրում ներդրված և գործող AI գործակալներ ու ավտոմատացումներ',
            ru: 'Работающие AI-агенты и автоматизированные процессы, развёрнутые в вашей среде',
          }),
          t({
            en: 'Integrations with your existing tools',
            hy: 'Ինտեգրումներ ձեր արդեն օգտագործվող գործիքների և համակարգերի հետ',
            ru: 'Интеграции с используемыми вами инструментами и системами',
          }),
          t({
            en: 'Guardrails, logging and human-review steps',
            hy: 'Անվտանգության սահմանափակումներ, գործողությունների գրանցում և մարդկային ստուգման փուլեր',
            ru: 'Ограничения безопасности, журналирование действий и этапы проверки человеком',
          }),
          t({
            en: 'Documentation and team handover',
            hy: 'Տեխնիկական փաստաթղթավորում և լուծման փոխանցում ձեր թիմին',
            ru: 'Техническая документация и передача решения вашей команде',
          }),
          t({
            en: 'Monitoring and iteration plan',
            hy: 'Մոնիթորինգի և շարունակական բարելավման պլան',
            ru: 'План мониторинга и последующего совершенствования',
          }),
        ],
      },
    ],
  },
} as const satisfies Dictionary;
export default capabilitiesContent;
