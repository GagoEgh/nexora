import { t, type Dictionary } from 'intlayer';

const howWeWorkContent = {
  key: 'how-we-work',
  content: {
    eyebrow: t({ en: 'How we work', hy: 'Ինչպես ենք աշխատում', ru: 'Как мы работаем' }),
    title: t({
      en: 'A clear path from idea to production.',
      hy: 'Հստակ ճանապարհ գաղափարից մինչև արտադրություն։',
      ru: 'Понятный путь от идеи до продакшена.',
    }),
    intro: t({
      en: 'A representative engagement flow. Each project adapts it to its scope, risk and team setup — a way of working, not a rigid contract.',
      hy: 'Համագործակցության բնորոշ ընթացք։ Յուրաքանչյուր նախագիծ այն հարմարեցնում է իր ծավալին, ռիսկերին և թիմի կազմին՝ աշխատելու ձև, ոչ թե կոշտ պայմանագիր։',
      ru: 'Типичный ход сотрудничества. Каждый проект адаптирует его под свой объём, риски и состав команды — это способ работы, а не жёсткий контракт.',
    }),
    steps: [
      {
        title: t({
          en: 'Discover & Understand',
          hy: 'Բացահայտել և հասկանալ',
          ru: 'Исследовать и понять',
        }),
        description: t({
          en: 'Goals, users, constraints and existing systems — clarifying what success looks like before proposing anything.',
          hy: 'Նպատակներ, օգտատերեր, սահմանափակումներ և գործող համակարգեր՝ պարզաբանելով, թե ինչ է հաջողությունը, նախքան որևէ բան առաջարկելը։',
          ru: 'Цели, пользователи, ограничения и существующие системы — прояснение того, что считается успехом, до любых предложений.',
        }),
        outcome: t({
          en: 'Shared problem definition',
          hy: 'Խնդրի ընդհանուր սահմանում',
          ru: 'Общее определение задачи',
        }),
      },
      {
        title: t({ en: 'Define the Solution', hy: 'Սահմանել լուծումը', ru: 'Определить решение' }),
        description: t({
          en: 'Scope, priorities and approach, with trade-offs made explicit so every decision is an informed one.',
          hy: 'Ծավալ, առաջնահերթություններ և մոտեցում՝ բացահայտ փոխզիջումներով, որպեսզի յուրաքանչյուր որոշում լինի գիտակցված։',
          ru: 'Объём, приоритеты и подход с явно обозначенными компромиссами, чтобы каждое решение было осознанным.',
        }),
        outcome: t({ en: 'Scope & approach', hy: 'Ծավալ և մոտեցում', ru: 'Объём и подход' }),
      },
      {
        title: t({ en: 'Design & Architect', hy: 'Նախագծել և ճարտարապետել', ru: 'Спроектировать' }),
        description: t({
          en: 'Interfaces, data models and system architecture designed to hold up as the product grows.',
          hy: 'Ինտերֆեյսներ, տվյալների մոդելներ և համակարգի ճարտարապետություն, որոնք դիմանում են պրոդուկտի աճին։',
          ru: 'Интерфейсы, модели данных и архитектура системы, рассчитанные на рост продукта.',
        }),
        outcome: t({
          en: 'Designs & architecture',
          hy: 'Դիզայն և ճարտարապետություն',
          ru: 'Дизайн и архитектура',
        }),
      },
      {
        title: t({
          en: 'Build & Integrate',
          hy: 'Կառուցել և ինտեգրել',
          ru: 'Разработать и интегрировать',
        }),
        description: t({
          en: 'Iterative development with regular reviews, testing and integration into your existing tools.',
          hy: 'Իտերատիվ մշակում՝ կանոնավոր վերանայումներով, թեստավորմամբ և ինտեգրմամբ ձեր գործող գործիքներին։',
          ru: 'Итеративная разработка с регулярными ревью, тестированием и интеграцией в ваши существующие инструменты.',
        }),
        outcome: t({ en: 'Working software', hy: 'Աշխատող ծրագիր', ru: 'Работающее ПО' }),
      },
      {
        title: t({
          en: 'Deploy & Improve',
          hy: 'Տեղակայել և բարելավել',
          ru: 'Запустить и развивать',
        }),
        description: t({
          en: 'Release, monitor and refine — then keep evolving the product with ongoing support where needed.',
          hy: 'Թողարկում, մոնիթորինգ և կատարելագործում, այնուհետև պրոդուկտի շարունակական զարգացում՝ անհրաժեշտության դեպքում աջակցությամբ։',
          ru: 'Релиз, мониторинг и доработка — затем развитие продукта с поддержкой там, где она нужна.',
        }),
        outcome: t({
          en: 'Live, supported system',
          hy: 'Գործող, աջակցվող համակարգ',
          ru: 'Работающая система с поддержкой',
        }),
      },
    ],
  },
} satisfies Dictionary;

export default howWeWorkContent;
