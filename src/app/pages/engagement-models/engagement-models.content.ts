import { t, type Dictionary } from 'intlayer';

const engagementModelsPageContent = {
  key: 'engagement-models-page',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({
      en: 'Engagement Models',
      hy: 'Համագործակցության ձևաչափեր',
      ru: 'Форматы сотрудничества',
    }),
    eyebrow: t({
      en: 'Engagement models',
      hy: 'Համագործակցության ձևաչափեր',
      ru: 'Форматы сотрудничества',
    }),
    heading: t({
      en: 'Choose how we work together.',
      hy: 'Ընտրեք ձեզ հարմար համագործակցության ձևաչափը։',
      ru: 'Выберите подходящий формат сотрудничества.',
    }),
    lead: t({
      en: 'Five ways to collaborate. Scope, terms and responsibilities are always agreed individually — nothing on this page is a fixed contract or price list.',
      hy: 'Համագործակցության հինգ տարբերակ։ Աշխատանքի ծավալը, պայմաններն ու պատասխանատվության շրջանակը համաձայնեցվում են անհատապես։ Այս էջում ներկայացված ձևաչափերը չեն ենթադրում նախապես սահմանված պայմանագրային պայմաններ կամ գնացուցակ։',
      ru: 'Пять форматов сотрудничества. Объём работ, условия и зоны ответственности согласовываются индивидуально. Представленные на этой странице форматы не являются фиксированными договорными условиями или прайс-листом.',
    }),
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք քննարկումը',
        ru: 'Начнём обсуждение',
      }),
      title: t({
        en: 'Not sure which model fits?',
        hy: 'Չգիտե՞ք՝ որ ձևաչափն է ձեզ հարմար։',
        ru: 'Не уверены, какой формат вам подойдёт?',
      }),
      lead: t({
        en: 'Tell us about your situation and constraints. We’ll recommend an engagement model — and explain why.',
        hy: 'Պատմեք ձեր նպատակների, իրավիճակի և սահմանափակումների մասին։ Մենք կառաջարկենք ձեզ համապատասխան համագործակցության ձևաչափ և կբացատրենք մեր առաջարկի հիմնավորումը։',
        ru: 'Расскажите о своих целях, задачах и ограничениях. Мы предложим подходящий формат сотрудничества и объясним, почему рекомендуем именно его.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկել ձեր նախագիծը',
        ru: 'Обсудить ваш проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ծանոթանալ մեր ծառայություններին',
        ru: 'Ознакомиться с нашими услугами',
      }),
    },
  },
} as const satisfies Dictionary;

export default engagementModelsPageContent;
