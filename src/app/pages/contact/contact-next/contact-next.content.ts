import { t, type Dictionary } from 'intlayer';

const contactNextContent = {
  key: 'contact-next',
  content: {
    eyebrow: t({
      en: 'What happens next',
      hy: 'Ի՞նչ է լինելու հաջորդիվ',
      ru: 'Что будет дальше',
    }),
    title: t({
      en: 'What happens after you send an inquiry',
      hy: 'Ի՞նչ է տեղի ունենում հարցումն ուղարկելուց հետո',
      ru: 'Что происходит после отправки запроса',
    }),
    steps: [
      {
        title: t({
          en: 'We review your inquiry',
          hy: 'Ուսումնասիրում ենք ձեր հարցումը',
          ru: 'Мы изучаем ваш запрос',
        }),
        text: t({
          en: 'A member of the team reads the context you’ve shared.',
          hy: 'Մեր թիմի անդամներից մեկը ծանոթանում է ձեր ներկայացրած տեղեկություններին և նախագծի մանրամասներին։',
          ru: 'Один из участников нашей команды изучает предоставленную вами информацию и детали проекта.',
        }),
      },
      {
        title: t({
          en: 'We reply to arrange a conversation',
          hy: 'Կապ ենք հաստատում՝ քննարկում կազմակերպելու համար',
          ru: 'Связываемся с вами, чтобы договориться о встрече',
        }),
        text: t({
          en: 'Usually a short call to understand goals and constraints.',
          hy: 'Սովորաբար կազմակերպում ենք կարճ զանգ՝ ձեր նպատակներն ու սահմանափակումները հասկանալու համար։',
          ru: 'Обычно это короткий звонок, чтобы лучше понять ваши цели и ограничения.',
        }),
      },
      {
        title: t({
          en: 'We suggest next steps',
          hy: 'Առաջարկում ենք հետագա քայլերը',
          ru: 'Предлагаем дальнейшие шаги',
        }),
        text: t({
          en: 'An approach, an engagement model, or an honest “not a fit”.',
          hy: 'Առաջարկում ենք համապատասխան լուծում, համագործակցության ձևաչափ կամ անկեղծորեն հայտնում, եթե մեր հնարավորությունները չեն համապատասխանում ձեր կարիքներին։',
          ru: 'Предлагаем подходящее решение, формат сотрудничества или честно сообщаем, если наши возможности не соответствуют вашим задачам.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default contactNextContent;
