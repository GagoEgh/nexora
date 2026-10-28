import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const problemsContent = {
  key: 'ai-agent-problems',
  content: {
    eyebrow: t({
      en: 'Problems we solve',
      hy: 'Խնդիրներ, որոնց լուծում ենք տալիս',
      ru: 'Проблемы, которые мы решаем',
    }),
    title: t({
      en: 'Where manual work slows the business down.',
      hy: 'Երբ ձեռքով աշխատանքը դանդաղեցնում է բիզնեսի զարգացումը։',
      ru: 'Когда ручная работа замедляет развитие бизнеса.',
    }),
    intro: t({
      en: 'Typical situations where agents and automation create real leverage.',
      hy: 'Բնորոշ իրավիճակներ, որոնցում AI գործակալներն ու ավտոմատացումը շոշափելի արդյունք են ապահովում։',
      ru: 'Типичные ситуации, в которых AI-агенты и автоматизация дают ощутимый результат.',
    }),
    items: [
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Data copied by hand',
          hy: 'Տվյալների ձեռքով փոխանցում',
          ru: 'Ручной перенос данных',
        }),
        text: t({
          en: 'Teams move information between email, CRM and spreadsheets manually — slow and error-prone.',
          hy: 'Թիմերը ձեռքով են փոխանցում տվյալները էլեկտրոնային փոստի, CRM համակարգի և աղյուսակների միջև, ինչը դանդաղեցնում է աշխատանքը և մեծացնում սխալների հավանականությունը։',
          ru: 'Команды вручную переносят данные между электронной почтой, CRM и таблицами. Это замедляет работу и повышает вероятность ошибок.',
        }),
      },
      {
        icon: 'mail' satisfies AppIconName,
        title: t({
          en: 'Requests wait in inboxes',
          hy: 'Հարցումները կուտակվում են փոստարկղերում',
          ru: 'Запросы накапливаются в почтовых ящиках',
        }),
        text: t({
          en: 'Inbound leads and tickets sit in shared inboxes until someone has time to triage them.',
          hy: 'Պոտենցիալ հաճախորդների հայտերն ու աջակցության հարցումները մնում են ընդհանուր փոստարկղերում, մինչև աշխատակիցը ժամանակ գտնի դրանք դասակարգելու և ուղղորդելու համար։',
          ru: 'Заявки от потенциальных клиентов и обращения в поддержку остаются в общих почтовых ящиках, пока у сотрудника не появится время их классифицировать и распределить.',
        }),
      },
      {
        icon: 'file-text' satisfies AppIconName,
        title: t({
          en: 'Documents in every format',
          hy: 'Տարբեր ձևաչափերով փաստաթղթեր',
          ru: 'Документы в разных форматах',
        }),
        text: t({
          en: 'Invoices, contracts and forms arrive differently each time and need manual checking.',
          hy: 'Հաշիվները, պայմանագրերն ու ձևաթղթերը ստացվում են տարբեր ձևաչափերով և պահանջում ձեռքով ստուգում։',
          ru: 'Счета, договоры и формы поступают в разных форматах и требуют ручной проверки.',
        }),
      },
      {
        icon: 'layout-dashboard' satisfies AppIconName,
        title: t({
          en: 'Reporting by hand',
          hy: 'Հաշվետվությունների ձեռքով պատրաստում',
          ru: 'Ручная подготовка отчётов',
        }),
        text: t({
          en: 'Weekly numbers depend on someone pulling data together from several tools.',
          hy: 'Շաբաթական հաշվետվությունների պատրաստումը կախված է նրանից, թե որքան արագ աշխատակիցը կհավաքի տվյալները տարբեր գործիքներից։',
          ru: 'Подготовка еженедельных отчётов зависит от того, насколько быстро сотрудник сможет собрать данные из нескольких инструментов.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default problemsContent;
