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
          hy: 'Մուտքային լիդերի դասակարգում և հարստացում',
          ru: 'Сортировка и обогащение входящих лидов',
        }),
        t({
          en: 'Support ticket classification and routing',
          hy: 'Աջակցության հարցումների դասակարգում և ուղղորդում',
          ru: 'Классификация и маршрутизация обращений в поддержку',
        }),
        t({
          en: 'Invoice and document intake',
          hy: 'Հաշիվների և փաստաթղթերի ընդունում',
          ru: 'Приём счетов и документов',
        }),
        t({
          en: 'Weekly reporting automation',
          hy: 'Շաբաթական հաշվետվությունների ավտոմատացում',
          ru: 'Автоматизация еженедельной отчётности',
        }),
        t({
          en: 'Sales follow-up assistant',
          hy: 'Վաճառքի հետագա կապի օգնական',
          ru: 'Ассистент повторных контактов в продажах',
        }),
        t({
          en: 'Internal approval workflows',
          hy: 'Ներքին հաստատման հոսքեր',
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
        hy: 'Ստեղծված է թիմերի համար, որոնք աշխատում են կրկնվող գործընթացներով։',
        ru: 'Создано для команд, работающих с повторяемыми процессами.',
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
            hy: 'Վաճառք և հաճախորդների սպասարկում',
            ru: 'Продажи и клиентский сервис',
          }),
        },
        {
          icon: 'rocket' satisfies AppIconName,
          label: t({
            en: 'Growing SMEs',
            hy: 'Աճող փոքր և միջին բիզնես',
            ru: 'Растущий малый и средний бизнес',
          }),
        },
        {
          icon: 'layers' satisfies AppIconName,
          label: t({
            en: 'Enterprises with CRM/ERP',
            hy: 'CRM/ERP ունեցող ձեռնարկություններ',
            ru: 'Предприятия с CRM/ERP',
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
        hy: 'Արդիական է նաև ծրագրային ապահովման ընկերությունների համար, որոնք ցանկանում են ավտոմատացման հնարավորություններ ավելացնել իրենց պրոդուկտներում։',
        ru: 'Также актуально для софтверных компаний, которые хотят добавить возможности автоматизации в свои продукты.',
      }),
    },
  },
} as const satisfies Dictionary;

export default audiencesContent;
