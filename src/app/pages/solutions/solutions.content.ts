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
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք զրույցը',
        ru: 'Начнём разговор',
      }),
      title: t({
        en: 'Facing a challenge that isn’t listed?',
        hy: 'Ձեր մարտահրավերը ցանկում չկա՞։',
        ru: 'Не нашли свою задачу в списке?',
      }),
      lead: t({
        en: 'These are common starting points, not a complete list. Describe your situation and we’ll tell you honestly whether and how we can help.',
        hy: 'Սրանք տիպիկ մեկնարկային կետեր են, ոչ թե սպառիչ ցանկ։ Նկարագրեք ձեր իրավիճակը, և մենք անկեղծորեն կասենք՝ արդյոք և ինչպես կարող ենք օգնել։',
        ru: 'Это типичные отправные точки, а не исчерпывающий список. Опишите свою ситуацию — и мы честно скажем, можем ли помочь и как именно.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկենք ձեր նախագիծը',
        ru: 'Обсудить проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ուսումնասիրել մեր ծառայությունները',
        ru: 'Изучить наши услуги',
      }),
    },
  },
} as const satisfies Dictionary;

export default solutionsContent;
