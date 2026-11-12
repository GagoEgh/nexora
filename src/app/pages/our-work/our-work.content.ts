import { t, type Dictionary } from 'intlayer';

const ourWorkContent = {
  key: 'about',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Our works', hy: 'Մեր աշխատանքները', ru: 'Наши работы' }),
    eyebrow: t({ en: 'Selected projects', hy: 'Ընտրված նախագծեր', ru: 'Избранные проекты' }),
    heading: t({
      en: 'Our Work. Digital Solutions in Action',
      hy: 'Մեր աշխատանքը Թվային լուծումները գործողության մեջ',
      ru: 'Наша работа. Цифровые решения в действии',
    }),
    lead: t({
      en: 'Explore the websites, applications, and artificial intelligence-powered solutions we have created to help businesses innovate, operate efficiently, and grow.',
      hy: 'Ուսումնասիրեք մեր ստեղծած կայքերը, հավելվածներն ու արհեստական բանականության վրա հիմնված լուծումները, որոնք օգնում են ընկերություններին նորարարել, արդյունավետ գործել և զարգանալ։',
      ru: 'Изучите веб-сайты, приложения и решения на основе искусственного интеллекта, которые мы создали, чтобы помочь компаниям внедрять инновации, эффективно работать и развиваться.',
    }),
  },
} as const satisfies Dictionary;

export default ourWorkContent;
