import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const problemsContent = {
  key: 'ai-agent-problems',
  content: {
    eyebrow: t({
      en: 'Problems we solve',
      hy: 'Խնդիրներ, որոնք լուծում ենք',
      ru: 'Задачи, которые мы решаем',
    }),
    title: t({
      en: 'Where manual work slows the business down.',
      hy: 'Երբ ձեռքով աշխատանքը դանդաղեցնում է բիզնեսը։',
      ru: 'Когда ручная работа замедляет бизнес.',
    }),
    intro: t({
      en: 'Typical situations where agents and automation create real leverage.',
      hy: 'Բնորոշ իրավիճակներ, որտեղ գործակալները և ավտոմատացումը տալիս են իրական արդյունք։',
      ru: 'Типичные ситуации, где агенты и автоматизация дают реальный эффект.',
    }),
    items: [
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Data copied by hand',
          hy: 'Ձեռքով պատճենվող տվյալներ',
          ru: 'Данные копируются вручную',
        }),
        text: t({
          en: 'Teams move information between email, CRM and spreadsheets manually — slow and error-prone.',
          hy: 'Թիմերը ձեռքով են տեղափոխում տեղեկությունը էլ. փոստի, CRM-ի և աղյուսակների միջև՝ դանդաղ և սխալների հակված։',
          ru: 'Команды вручную переносят информацию между почтой, CRM и таблицами — медленно и с ошибками.',
        }),
      },
      {
        icon: 'mail' satisfies AppIconName,
        title: t({
          en: 'Requests wait in inboxes',
          hy: 'Հարցումները սպասում են փոստարկղերում',
          ru: 'Запросы ждут в почте',
        }),
        text: t({
          en: 'Inbound leads and tickets sit in shared inboxes until someone has time to triage them.',
          hy: 'Մուտքային լիդերն ու հարցումները մնում են ընդհանուր փոստարկղերում, մինչև ինչ-որ մեկը ժամանակ գտնի դրանք դասակարգելու։',
          ru: 'Входящие лиды и обращения лежат в общих ящиках, пока у кого-то не появится время их разобрать.',
        }),
      },
      {
        icon: 'file-text' satisfies AppIconName,
        title: t({
          en: 'Documents in every format',
          hy: 'Փաստաթղթեր՝ ամեն ձևաչափով',
          ru: 'Документы в разных форматах',
        }),
        text: t({
          en: 'Invoices, contracts and forms arrive differently each time and need manual checking.',
          hy: 'Հաշիվները, պայմանագրերը և ձևերը ամեն անգամ գալիս են տարբեր ձևաչափով և պահանջում ձեռքով ստուգում։',
          ru: 'Счета, договоры и формы каждый раз приходят по-разному и требуют ручной проверки.',
        }),
      },
      {
        icon: 'layout-dashboard' satisfies AppIconName,
        title: t({
          en: 'Reporting by hand',
          hy: 'Ձեռքով հաշվետվություններ',
          ru: 'Отчёты вручную',
        }),
        text: t({
          en: 'Weekly numbers depend on someone pulling data together from several tools.',
          hy: 'Շաբաթական ցուցանիշները կախված են նրանից, թե ինչպես է ինչ-որ մեկը տվյալները հավաքում մի քանի գործիքներից։',
          ru: 'Еженедельные цифры зависят от того, как кто-то собирает данные из нескольких инструментов.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default problemsContent;
