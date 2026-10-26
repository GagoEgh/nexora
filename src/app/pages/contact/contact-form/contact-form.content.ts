import { t, type Dictionary } from 'intlayer';

const contactFormContent = {
  key: 'contact-form',
  content: {
    title: t({
      en: 'Tell us about your project',
      hy: 'Պատմեք ձեր նախագծի մասին',
      ru: 'Расскажите о своём проекте',
    }),
    requiredNote: t({
      en: 'Fields marked * are required.',
      hy: '* նշված դաշտերը պարտադիր են։',
      ru: 'Поля, отмеченные *, обязательны.',
    }),
    requiredMark: '*',

    interestLabel: t({ en: 'I’m interested in', hy: 'Ինձ հետաքրքրում է', ru: 'Меня интересует' }),
    interestOptions: [
      {
        value: 'new-project',
        label: t({ en: 'A new project', hy: 'Նոր նախագիծ', ru: 'Новый проект' }),
      },
      {
        value: 'dedicated-team',
        label: t({ en: 'A dedicated team', hy: 'Նվիրված թիմ', ru: 'Выделенная команда' }),
      },
      {
        value: 'partnership',
        label: t({ en: 'A partnership', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
      },
      {
        value: 'something-else',
        label: t({ en: 'Something else', hy: 'Այլ բան', ru: 'Что-то другое' }),
      },
    ],

    nameLabel: t({ en: 'Full name', hy: 'Անուն ազգանուն', ru: 'Имя и фамилия' }),
    namePlaceholder: t({
      en: 'Your full name',
      hy: 'Ձեր անուն ազգանունը',
      ru: 'Ваше имя и фамилия',
    }),

    emailLabel: t({ en: 'Work email', hy: 'Աշխատանքային էլ. փոստ', ru: 'Рабочая эл. почта' }),
    emailPlaceholder: 'name@company.com',

    companyLabel: t({ en: 'Company name', hy: 'Ընկերության անվանում', ru: 'Название компании' }),
    companyPlaceholder: t({
      en: 'Company or organization',
      hy: 'Ընկերություն կամ կազմակերպություն',
      ru: 'Компания или организация',
    }),

    serviceLabel: t({
      en: 'Service of interest',
      hy: 'Հետաքրքրող ծառայություն',
      ru: 'Интересующая услуга',
    }),
    servicePlaceholder: t({
      en: 'Select a service',
      hy: 'Ընտրեք ծառայություն',
      ru: 'Выберите услугу',
    }),
    serviceOptions: [
      {
        value: 'design-product',
        label: t({ en: 'Design & Product', hy: 'Դիզայն և պրոդուկտ', ru: 'Дизайн и продукт' }),
      },
      {
        value: 'software-engineering',
        label: t({ en: 'Software Engineering', hy: 'Ծրագրային ինժեներիա', ru: 'Разработка ПО' }),
      },
      {
        value: 'artificial-intelligence',
        label: t({
          en: 'Artificial Intelligence',
          hy: 'Արհեստական բանականություն',
          ru: 'Искусственный интеллект',
        }),
      },
      {
        value: 'infrastructure-operations',
        label: t({
          en: 'Infrastructure & Operations',
          hy: 'Ենթակառուցվածք և շահագործում',
          ru: 'Инфраструктура и эксплуатация',
        }),
      },
      {
        value: 'engineering-partnerships',
        label: t({
          en: 'Engineering Partnerships',
          hy: 'Ինժեներական գործընկերություն',
          ru: 'Инженерное партнёрство',
        }),
      },
    ],

    descriptionLabel: t({
      en: 'Project description',
      hy: 'Նախագծի նկարագրություն',
      ru: 'Описание проекта',
    }),
    descriptionPlaceholder: t({
      en: 'What are you building, modernizing or automating? Share goals, current systems and any constraints.',
      hy: 'Ի՞նչ եք կառուցում, արդիականացնում կամ ավտոմատացնում։ Կիսվեք նպատակներով, ներկայիս համակարգերով և սահմանափակումներով։',
      ru: 'Что вы создаёте, модернизируете или автоматизируете? Поделитесь целями, текущими системами и ограничениями.',
    }),
    descriptionHint: t({
      en: 'A few sentences is enough to start.',
      hy: 'Սկսելու համար մի քանի նախադասությունը բավական է։',
      ru: 'Для начала достаточно нескольких предложений.',
    }),

    timelineLabel: t({ en: 'Estimated timeline', hy: 'Մոտավոր ժամկետ', ru: 'Примерные сроки' }),
    timelinePlaceholder: t({
      en: 'Select timeline',
      hy: 'Ընտրեք ժամկետ',
      ru: 'Выберите срок',
    }),
    timelineOptions: [
      {
        value: 'asap',
        label: t({
          en: 'As soon as possible',
          hy: 'Հնարավորինս շուտ',
          ru: 'Как можно скорее',
        }),
      },
      {
        value: '1-3-months',
        label: t({
          en: 'Within 1–3 months',
          hy: '1–3 ամսվա ընթացքում',
          ru: 'В течение 1–3 месяцев',
        }),
      },
      {
        value: '3-6-months',
        label: t({ en: 'In 3–6 months', hy: '3–6 ամսից', ru: 'Через 3–6 месяцев' }),
      },
      {
        value: 'planning',
        label: t({ en: 'Still planning', hy: 'Դեռ պլանավորում ենք', ru: 'Пока планируем' }),
      },
    ],

    budgetLabel: t({ en: 'Budget range', hy: 'Բյուջեի միջակայք', ru: 'Бюджетный диапазон' }),
    budgetPlaceholder: t({ en: 'Select range', hy: 'Ընտրեք միջակայք', ru: 'Выберите диапазон' }),
    budgetOptions: [
      {
        value: 'under-10k',
        label: t({ en: 'Under $10,000', hy: 'Մինչև $10,000', ru: 'До $10 000' }),
      },
      { value: '10-25k', label: '$10,000–$25,000' },
      { value: '25-50k', label: '$25,000–$50,000' },
      { value: '50-100k', label: '$50,000–$100,000' },
      {
        value: 'over-100k',
        label: t({ en: 'Over $100,000', hy: '$100,000-ից ավել', ru: 'Более $100 000' }),
      },
      { value: 'unsure', label: t({ en: 'Not sure yet', hy: 'Դեռ հստակ չէ', ru: 'Пока не знаю' }) },
    ],
    optionalHint: t({ en: 'Optional', hy: 'Ըստ ցանկության', ru: 'Необязательно' }),

    methodLabel: t({
      en: 'Preferred contact method · optional',
      hy: 'Նախընտրելի կապի եղանակ · ըստ ցանկության',
      ru: 'Предпочтительный способ связи · необязательно',
    }),
    methodOptions: [
      { value: 'email', label: t({ en: 'Email', hy: 'Էլ. փոստ', ru: 'Эл. почта' }) },
      { value: 'phone', label: t({ en: 'Phone', hy: 'Հեռախոս', ru: 'Телефон' }) },
      { value: 'video', label: t({ en: 'Video call', hy: 'Տեսազանգ', ru: 'Видеозвонок' }) },
    ],

    consentBefore: t({
      en: 'I agree to the processing of my data as described in the',
      hy: 'Համաձայն եմ իմ տվյալների մշակմանը, ինչպես նկարագրված է',
      ru: 'Я согласен на обработку моих данных, как описано в',
    }),
    privacyLabel: t({
      en: 'Privacy Policy',
      hy: 'Գաղտնիության քաղաքականությունում',
      ru: 'Политике конфиденциальности',
    }),
    sentenceEnd: '.',

    submitLabel: t({ en: 'Send inquiry', hy: 'Ուղարկել հարցումը', ru: 'Отправить запрос' }),
    noteBefore: t({
      en: 'Your details are used only to respond to this inquiry. See our',
      hy: 'Ձեր տվյալները օգտագործվում են միայն այս հարցմանը պատասխանելու համար։ Տեսեք մեր',
      ru: 'Ваши данные используются только для ответа на этот запрос. Смотрите нашу',
    }),

    errorRequired: t({
      en: 'This field is required.',
      hy: 'Այս դաշտը պարտադիր է։',
      ru: 'Это поле обязательно.',
    }),
    errorEmail: t({
      en: 'Enter a valid email address.',
      hy: 'Մուտքագրեք վավեր էլ. փոստի հասցե։',
      ru: 'Введите корректный адрес эл. почты.',
    }),
    errorConsent: t({
      en: 'Please accept the Privacy Policy to continue.',
      hy: 'Շարունակելու համար ընդունեք գաղտնիության քաղաքականությունը։',
      ru: 'Чтобы продолжить, примите политику конфиденциальности.',
    }),

    sentMessage: t({
      en: 'Thanks — your inquiry is on its way.',
      hy: 'Շնորհակալություն՝ ձեր հարցումն ուղարկվել է։',
      ru: 'Спасибо — ваш запрос отправлен.',
    }),
    notConfiguredMessage: t({
      en: 'Sending isn’t available yet. Please use the contact details listed beside this form.',
      hy: 'Ուղարկումը դեռ հասանելի չէ։ Խնդրում ենք օգտվել այս ձևի կողքին նշված կոնտակտային տվյալներից։',
      ru: 'Отправка пока недоступна. Воспользуйтесь контактными данными рядом с этой формой.',
    }),
    failedMessage: t({
      en: 'Something went wrong. Please try again.',
      hy: 'Ինչ-որ բան սխալ գնաց։ Խնդրում ենք փորձել կրկին։',
      ru: 'Что-то пошло не так. Попробуйте снова.',
    }),
  },
} as const satisfies Dictionary;

export default contactFormContent;
