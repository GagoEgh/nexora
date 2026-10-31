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
      hy: '* նշանով նշված դաշտերը պարտադիր են։',
      ru: 'Поля, отмеченные знаком *, обязательны для заполнения.',
    }),
    requiredMark: '*',

    interestLabel: t({
      en: 'I’m interested in',
      hy: 'Ինձ հետաքրքրում է',
      ru: 'Меня интересует',
    }),
    interestOptions: [
      {
        value: 'new-project',
        label: t({
          en: 'A new project',
          hy: 'Նոր նախագիծ',
          ru: 'Новый проект',
        }),
      },
      {
        value: 'dedicated-team',
        label: t({
          en: 'A dedicated team',
          hy: 'Առանձին՝ իմ նախագծին նվիրված թիմ',
          ru: 'Выделенная команда',
        }),
      },
      {
        value: 'partnership',
        label: t({
          en: 'A partnership',
          hy: 'Համագործակցություն',
          ru: 'Партнёрство',
        }),
      },
      {
        value: 'something-else',
        label: t({
          en: 'Something else',
          hy: 'Այլ հարց կամ առաջարկ',
          ru: 'Другой запрос или предложение',
        }),
      },
    ],

    nameLabel: t({
      en: 'Full name',
      hy: 'Անուն և ազգանուն',
      ru: 'Имя и фамилия',
    }),
    namePlaceholder: t({
      en: 'Your full name',
      hy: 'Մուտքագրեք ձեր անունն ու ազգանունը',
      ru: 'Введите имя и фамилию',
    }),

    emailLabel: t({
      en: 'Work email',
      hy: 'Աշխատանքային էլեկտրոնային փոստ',
      ru: 'Рабочая электронная почта',
    }),
    emailPlaceholder: 'name@company.com',

    companyLabel: t({
      en: 'Company name',
      hy: 'Ընկերության անվանումը',
      ru: 'Название компании',
    }),
    companyPlaceholder: t({
      en: 'Company or organization',
      hy: 'Ընկերություն կամ կազմակերպություն',
      ru: 'Компания или организация',
    }),

    serviceLabel: t({
      en: 'Service of interest',
      hy: 'Հետաքրքրող ծառայությունը',
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
        label: t({
          en: 'Design & Product',
          hy: 'Դիզայն և թվային արտադրանք',
          ru: 'Дизайн и цифровые продукты',
        }),
      },
      {
        value: 'software-engineering',
        label: t({
          en: 'Software Engineering',
          hy: 'Ծրագրային ապահովման մշակում',
          ru: 'Разработка программного обеспечения',
        }),
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
          hy: 'Ենթակառուցվածքներ և շահագործում',
          ru: 'Инфраструктура и эксплуатация',
        }),
      },
      {
        value: 'engineering-partnerships',
        label: t({
          en: 'Engineering Partnerships',
          hy: 'Ինժեներական համագործակցություն',
          ru: 'Инженерное партнёрство',
        }),
      },
    ],

    descriptionLabel: t({
      en: 'Project description',
      hy: 'Նախագծի նկարագրությունը',
      ru: 'Описание проекта',
    }),
    descriptionPlaceholder: t({
      en: 'What are you building, modernizing or automating? Share goals, current systems and any constraints.',
      hy: 'Ի՞նչ եք ցանկանում ստեղծել, արդիականացնել կամ ավտոմատացնել։ Ներկայացրեք ձեր նպատակները, ներկայումս օգտագործվող համակարգերը և առկա սահմանափակումները։',
      ru: 'Что вы хотите создать, модернизировать или автоматизировать? Расскажите о целях, используемых системах и возможных ограничениях.',
    }),
    descriptionHint: t({
      en: 'A few sentences is enough to start.',
      hy: 'Սկսելու համար բավական է մի քանի նախադասություն։',
      ru: 'Для начала достаточно нескольких предложений.',
    }),

    timelineLabel: t({
      en: 'Estimated timeline',
      hy: 'Նախագծի իրականացման մոտավոր ժամկետը',
      ru: 'Предполагаемые сроки реализации',
    }),
    timelinePlaceholder: t({
      en: 'Select timeline',
      hy: 'Ընտրեք ժամկետը',
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
        label: t({
          en: 'In 3–6 months',
          hy: '3–6 ամսից',
          ru: 'Через 3–6 месяцев',
        }),
      },
      {
        value: 'planning',
        label: t({
          en: 'Still planning',
          hy: 'Դեռ պլանավորման փուլում է',
          ru: 'Пока на этапе планирования',
        }),
      },
    ],

    budgetLabel: t({
      en: 'Budget range',
      hy: 'Նախատեսված բյուջեն',
      ru: 'Предполагаемый бюджет',
    }),
    budgetPlaceholder: t({
      en: 'Select range',
      hy: 'Ընտրեք բյուջեի միջակայքը',
      ru: 'Выберите диапазон',
    }),
    budgetOptions: [
      {
        value: 'under-10k',
        label: t({
          en: 'Under $10,000',
          hy: 'Մինչև $10,000',
          ru: 'До $10 000',
        }),
      },
      { value: '10-25k', label: '$10,000–$25,000' },
      { value: '25-50k', label: '$25,000–$50,000' },
      { value: '50-100k', label: '$50,000–$100,000' },
      {
        value: 'over-100k',
        label: t({
          en: 'Over $100,000',
          hy: '$100,000-ից ավելի',
          ru: 'Более $100 000',
        }),
      },
      {
        value: 'unsure',
        label: t({
          en: 'Not sure yet',
          hy: 'Դեռ որոշված չէ',
          ru: 'Пока не определён',
        }),
      },
    ],
    optionalHint: t({
      en: 'Optional',
      hy: 'Ոչ պարտադիր',
      ru: 'Необязательно',
    }),

    methodLabel: t({
      en: 'Preferred contact method · optional',
      hy: 'Կապի նախընտրելի եղանակը · ոչ պարտադիր',
      ru: 'Предпочтительный способ связи · необязательно',
    }),
    methodOptions: [
      {
        value: 'email',
        label: t({
          en: 'Email',
          hy: 'Էլեկտրոնային փոստ',
          ru: 'Электронная почта',
        }),
      },
      {
        value: 'phone',
        label: t({
          en: 'Phone',
          hy: 'Հեռախոս',
          ru: 'Телефон',
        }),
      },
      {
        value: 'video',
        label: t({
          en: 'Video call',
          hy: 'Տեսազանգ',
          ru: 'Видеозвонок',
        }),
      },
    ],

    submitLabel: t({
      en: 'Send inquiry',
      hy: 'Ուղարկել հարցումը',
      ru: 'Отправить запрос',
    }),

    errorRequired: t({
      en: 'This field is required.',
      hy: 'Այս դաշտը պարտադիր է։',
      ru: 'Это поле обязательно для заполнения.',
    }),
    errorEmail: t({
      en: 'Enter a valid email address.',
      hy: 'Մուտքագրեք էլեկտրոնային փոստի վավեր հասցե։',
      ru: 'Введите корректный адрес электронной почты.',
    }),

    sentMessage: t({
      en: 'Thanks — your inquiry is on its way.',
      hy: 'Շնորհակալություն։ Ձեր հարցումն ուղարկվել է։',
      ru: 'Спасибо! Ваш запрос отправлен.',
    }),
    notConfiguredMessage: t({
      en: 'Sending isn’t available yet. Please use the contact details listed beside this form.',
      hy: 'Հարցումների ուղարկման հնարավորությունը դեռ հասանելի չէ։ Խնդրում ենք օգտվել ձևի կողքին նշված կապի տվյալներից։',
      ru: 'Отправка запросов пока недоступна. Пожалуйста, воспользуйтесь контактными данными, указанными рядом с формой.',
    }),
    failedMessage: t({
      en: 'Something went wrong. Please try again.',
      hy: 'Սխալ է տեղի ունեցել։ Խնդրում ենք կրկին փորձել։',
      ru: 'Произошла ошибка. Пожалуйста, попробуйте ещё раз.',
    }),
  },
} as const satisfies Dictionary;

export default contactFormContent;
