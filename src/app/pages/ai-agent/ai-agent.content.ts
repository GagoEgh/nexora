import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';
import type { WorkflowTone } from './workflow/workflow';

const aiAgentContent = {
  key: 'ai-agent',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    breadcrumbServices: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
    title: t({
      en: 'AI Agents & Business Automation',
      hy: 'AI գործակալներ և բիզնես ավտոմատացում',
      ru: 'AI-агенты и автоматизация бизнеса',
    }),
    eyebrow: t({
      en: 'Artificial Intelligence · Service 09',
      hy: 'Արհեստական բանականություն · Ծառայություն 09',
      ru: 'Искусственный интеллект · Услуга 09',
    }),
    lead: t({
      en: 'Automate the repetitive, multi-step work between your systems — with agents that classify, retrieve, decide and act inside clear guardrails.',
      hy: 'Ավտոմատացրեք ձեր համակարգերի միջև կրկնվող, բազմաքայլ աշխատանքը՝ գործակալներով, որոնք դասակարգում, որոնում, որոշում և գործում են հստակ սահմանների ներսում։',
      ru: 'Автоматизируйте повторяющуюся многошаговую работу между вашими системами — с агентами, которые классифицируют, находят, решают и действуют в чётких рамках.',
    }),
    primaryCta: t({
      en: 'Discuss this service',
      hy: 'Քննարկել այս ծառայությունը',
      ru: 'Обсудить услугу',
    }),
    secondaryCta: t({
      en: 'See related solutions',
      hy: 'Տեսնել հարակից լուծումները',
      ru: 'Смотреть связанные решения',
    }),
    workflow: {
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
  },
} as const satisfies Dictionary;

export default aiAgentContent;
