import { t, type Dictionary } from 'intlayer';

const solutionsContent = {
  key: 'solutions',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
    eyebrow: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
    heading: t({
      en: 'Start from the problem, not the technology.',
      hy: 'Սկսեք խնդրից, ոչ թե տեխնոլոգիայից։',
      ru: 'Начинайте с задачи, а не с технологии.',
    }),
    lead: t({
      en: 'Eight business challenges we help companies solve — each mapped to the services and engagement models that address it.',
      hy: 'Ութ բիզնես մարտահրավեր, որոնք օգնում ենք լուծել ընկերություններին՝ յուրաքանչյուրը կապված համապատասխան ծառայությունների և համագործակցության մոդելների հետ։',
      ru: 'Восемь бизнес-задач, которые мы помогаем решать, — каждая связана с услугами и моделями сотрудничества, которые её закрывают.',
    }),
  },
} as const satisfies Dictionary;

export default solutionsContent;
