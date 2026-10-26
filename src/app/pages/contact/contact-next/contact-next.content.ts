import { t, type Dictionary } from 'intlayer';

const contactNextContent = {
  key: 'contact-next',
  content: {
    eyebrow: t({
      en: 'What happens next',
      hy: 'Ինչ է լինելու հետո',
      ru: 'Что будет дальше',
    }),
    title: t({
      en: 'What happens after you send an inquiry',
      hy: 'Ինչ է տեղի ունենում հարցումն ուղարկելուց հետո',
      ru: 'Что происходит после отправки запроса',
    }),
    steps: [
      {
        title: t({
          en: 'We review your inquiry',
          hy: 'Մենք ուսումնասիրում ենք ձեր հարցումը',
          ru: 'Мы изучаем ваш запрос',
        }),
        text: t({
          en: 'A member of the team reads the context you’ve shared.',
          hy: 'Թիմի անդամը կարդում է ձեր կիսված համատեքստը։',
          ru: 'Член команды читает предоставленный вами контекст.',
        }),
      },
      {
        title: t({
          en: 'We reply to arrange a conversation',
          hy: 'Մենք պատասխանում ենք՝ զրույց կազմակերպելու համար',
          ru: 'Мы отвечаем, чтобы договориться о разговоре',
        }),
        text: t({
          en: 'Usually a short call to understand goals and constraints.',
          hy: 'Սովորաբար կարճ զանգ՝ նպատակներն ու սահմանափակումները հասկանալու համար։',
          ru: 'Обычно короткий звонок, чтобы понять цели и ограничения.',
        }),
      },
      {
        title: t({
          en: 'We suggest next steps',
          hy: 'Մենք առաջարկում ենք հետագա քայլերը',
          ru: 'Мы предлагаем следующие шаги',
        }),
        text: t({
          en: 'An approach, an engagement model, or an honest “not a fit”.',
          hy: 'Մոտեցում, համագործակցության մոդել կամ ազնիվ «չի համապատասխանում»։',
          ru: 'Подход, модель сотрудничества или честное «не подходит».',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default contactNextContent;
