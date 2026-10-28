import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

export type WorkflowTone = 'plain' | 'dark' | 'accent';

const workflowContent = {
  key: 'ai-agent-workflow',
  content: {
    caption: 'workflow / inbound-request',
    badge: t({
      en: 'example flow',
      hy: 'աշխատանքի օրինակելի հոսք',
      ru: 'пример рабочего процесса',
    }),
    steps: [
      {
        icon: 'mail' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Trigger', hy: 'Գործարկման իրադարձություն', ru: 'Триггер' }),
        text: t({
          en: 'New request arrives by email or form',
          hy: 'Նոր հարցում է ստացվում էլեկտրոնային փոստով կամ ձևաթղթի միջոցով',
          ru: 'Поступает новый запрос по электронной почте или через форму',
        }),
      },
      {
        icon: 'sparkle' satisfies AppIconName,
        tone: 'dark' satisfies WorkflowTone,
        label: t({ en: 'Agent', hy: 'AI գործակալ', ru: 'AI-агент' }),
        text: t({
          en: 'Classify intent and extract key details',
          hy: 'Որոշում է հարցման նպատակը և առանձնացնում կարևոր մանրամասները',
          ru: 'Определяет цель запроса и извлекает ключевые данные',
        }),
      },
      {
        icon: 'database' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Tool', hy: 'Գործիք', ru: 'Инструмент' }),
        text: t({
          en: 'Look up the account in the CRM',
          hy: 'CRM համակարգում գտնում է հաճախորդի հաշիվը',
          ru: 'Находит учётную запись клиента в CRM',
        }),
      },
      {
        icon: 'git-branch' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Decision', hy: 'Որոշման կայացում', ru: 'Принятие решения' }),
        text: t({
          en: 'Route by type, region and priority',
          hy: 'Ուղղորդում է հարցումը՝ ըստ տեսակի, տարածաշրջանի և առաջնահերթության',
          ru: 'Направляет запрос с учётом типа, региона и приоритета',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        tone: 'accent' satisfies WorkflowTone,
        label: t({ en: 'Human review', hy: 'Մարդու կողմից ստուգում', ru: 'Проверка человеком' }),
        text: t({
          en: 'Approve the drafted reply when needed',
          hy: 'Անհրաժեշտության դեպքում հաստատում է նախապատրաստված պատասխանը',
          ru: 'При необходимости сотрудник утверждает подготовленный ответ',
        }),
      },
      {
        icon: 'message-square' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Action', hy: 'Գործողություն', ru: 'Действие' }),
        text: t({
          en: 'Assign owner and notify the team',
          hy: 'Նշանակում է պատասխանատու աշխատակցին և տեղեկացնում թիմին',
          ru: 'Назначает ответственного сотрудника и уведомляет команду',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default workflowContent;
