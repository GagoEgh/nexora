import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const audiencesContent = {
  key: 'ai-agent-audiences',
  content: {
    projects: {
      eyebrow: t({
        en: 'Typical projects',
        hy: 'Բնորոշ նախագծեր',
        ru: 'Типичные проекты',
      }),
      title: t({
        en: 'What these engagements usually look like.',
        hy: 'Ինչպիսին են սովորաբար այս նախագծերը։',
        ru: 'Как обычно выглядят такие проекты.',
      }),
      items: [
        t({
          en: 'Inbound lead triage and enrichment',
          hy: 'Մուտքային վաճառքի հայտերի դասակարգում և տվյալների լրացում',
          ru: 'Квалификация и обогащение данных по входящим лидам',
        }),
        t({
          en: 'Support ticket classification and routing',
          hy: 'Աջակցության հարցումների դասակարգում և ուղղորդում',
          ru: 'Классификация и маршрутизация обращений в службу поддержки',
        }),
        t({
          en: 'Invoice and document intake',
          hy: 'Հաշիվների և փաստաթղթերի ընդունում ու մշակում',
          ru: 'Приём и обработка счетов и документов',
        }),
        t({
          en: 'Weekly reporting automation',
          hy: 'Շաբաթական հաշվետվությունների կազմման ավտոմատացում',
          ru: 'Автоматизация подготовки еженедельной отчётности',
        }),
        t({
          en: 'Sales follow-up assistant',
          hy: 'Վաճառքի գործընթացում հետադարձ կապի օգնական',
          ru: 'Ассистент для последующих контактов с потенциальными клиентами',
        }),
        t({
          en: 'Internal approval workflows',
          hy: 'Ներքին համաձայնեցման գործընթացներ',
          ru: 'Внутренние процессы согласования',
        }),
      ],
    },
    fit: {
      eyebrow: t({
        en: "Who it's for",
        hy: 'Ում համար է',
        ru: 'Для кого это',
      }),
      title: t({
        en: 'Built for teams that run on repeatable processes.',
        hy: 'Թիմերի համար, որոնց աշխատանքը հիմնված է կրկնվող գործընթացների վրա։',
        ru: 'Для команд, чья работа основана на повторяющихся процессах.',
      }),
      chips: [
        {
          icon: 'briefcase' satisfies AppIconName,
          label: t({
            en: 'Operations teams',
            hy: 'Գործառնական թիմեր',
            ru: 'Операционные команды',
          }),
        },
        {
          icon: 'users' satisfies AppIconName,
          label: t({
            en: 'Sales & customer success',
            hy: 'Վաճառքի և հաճախորդների հաջողության թիմեր',
            ru: 'Команды продаж и развития отношений с клиентами',
          }),
        },
        {
          icon: 'rocket' satisfies AppIconName,
          label: t({
            en: 'Growing SMEs',
            hy: 'Աճող փոքր և միջին ձեռնարկություններ',
            ru: 'Растущие малые и средние предприятия',
          }),
        },
        {
          icon: 'layers' satisfies AppIconName,
          label: t({
            en: 'Enterprises with CRM/ERP',
            hy: 'CRM/ERP համակարգեր օգտագործող ընկերություններ',
            ru: 'Компании, использующие CRM/ERP',
          }),
        },
        {
          icon: 'layout-dashboard' satisfies AppIconName,
          label: t({
            en: 'SaaS companies',
            hy: 'SaaS ընկերություններ',
            ru: 'SaaS-компании',
          }),
        },
        {
          icon: 'tag' satisfies AppIconName,
          label: t({
            en: 'Digital agencies',
            hy: 'Թվային գործակալություններ',
            ru: 'Цифровые агентства',
          }),
        },
      ],
      note: t({
        en: 'Also relevant for software companies that want to add automation features to their own products.',
        hy: 'Հարմար է նաև ծրագրային ապահովում մշակող ընկերությունների համար, որոնք ցանկանում են իրենց արտադրանքներում ներդնել ավտոմատացման հնարավորություններ։',
        ru: 'Также подходит компаниям-разработчикам ПО, которые хотят добавить функции автоматизации в собственные продукты.',
      }),
    },
  },
} as const satisfies Dictionary;

export default audiencesContent;
