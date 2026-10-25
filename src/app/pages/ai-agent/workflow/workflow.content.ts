import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

export type WorkflowTone = 'plain' | 'dark' | 'accent';

const workflowContent = {
  key: 'ai-agent-workflow',
  content: {
    caption: 'workflow / inbound-request',
    badge: t({ en: 'example flow', hy: 'օրինակային հոսք', ru: 'пример потока' }),
    steps: [
      {
        icon: 'mail' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Trigger', hy: 'Գործարկիչ', ru: 'Триггер' }),
        text: t({
          en: 'New request arrives by email or form',
          hy: 'Նոր հարցումը ստացվում է էլ. փոստով կամ ձևով',
          ru: 'Новый запрос приходит по почте или через форму',
        }),
      },
      {
        icon: 'sparkle' satisfies AppIconName,
        tone: 'dark' satisfies WorkflowTone,
        label: t({ en: 'Agent', hy: 'Գործակալ', ru: 'Агент' }),
        text: t({
          en: 'Classify intent and extract key details',
          hy: 'Դասակարգում է մտադրությունը և առանձնացնում հիմնական մանրամասները',
          ru: 'Классифицирует намерение и извлекает ключевые детали',
        }),
      },
      {
        icon: 'database' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Tool', hy: 'Գործիք', ru: 'Инструмент' }),
        text: t({
          en: 'Look up the account in the CRM',
          hy: 'Գտնում է հաշիվը CRM-ում',
          ru: 'Находит аккаунт в CRM',
        }),
      },
      {
        icon: 'git-branch' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Decision', hy: 'Որոշում', ru: 'Решение' }),
        text: t({
          en: 'Route by type, region and priority',
          hy: 'Ուղղորդում ըստ տեսակի, տարածաշրջանի և առաջնահերթության',
          ru: 'Маршрутизирует по типу, региону и приоритету',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        tone: 'accent' satisfies WorkflowTone,
        label: t({ en: 'Human review', hy: 'Մարդկային ստուգում', ru: 'Проверка человеком' }),
        text: t({
          en: 'Approve the drafted reply when needed',
          hy: 'Հաստատում է պատրաստված պատասխանը, երբ անհրաժեշտ է',
          ru: 'Утверждает подготовленный ответ, когда это нужно',
        }),
      },
      {
        icon: 'message-square' satisfies AppIconName,
        tone: 'plain' satisfies WorkflowTone,
        label: t({ en: 'Action', hy: 'Գործողություն', ru: 'Действие' }),
        text: t({
          en: 'Assign owner and notify the team',
          hy: 'Նշանակում է պատասխանատու և տեղեկացնում թիմին',
          ru: 'Назначает ответственного и уведомляет команду',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default workflowContent;
