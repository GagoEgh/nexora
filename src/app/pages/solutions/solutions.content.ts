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
      hy: 'Բիզնեսի ութ մարտահրավեր, որոնց հաղթահարման հարցում օգնում ենք ընկերություններին՝ յուրաքանչյուրի համար առաջարկելով համապատասխան ծառայություններ և համագործակցության մոդելներ։',
      ru: 'Восемь бизнес-задач, которые мы помогаем решать компаниям. Для каждой задачи подобраны подходящие услуги и модели сотрудничества.',
    }),
    conversation: {
      eyebrow: t({
        en: 'Start a conversation',
        hy: 'Սկսենք քննարկումը',
        ru: 'Начнём обсуждение',
      }),
      title: t({
        en: 'Facing a challenge that isn’t listed?',
        hy: 'Ձեր խնդիրը ցանկում ներառվա՞ծ չէ։',
        ru: 'Не нашли свою задачу в списке?',
      }),
      lead: t({
        en: 'These are common starting points, not a complete list. Describe your situation and we’ll tell you honestly whether and how we can help.',
        hy: 'Սրանք տարածված խնդիրներ են, որոնցից կարելի է սկսել, բայց ցանկը սպառիչ չէ։ Նկարագրեք ձեր իրավիճակը, և մենք անկեղծորեն կասենք՝ արդյոք կարող ենք օգնել և ինչ ձևով։',
        ru: 'Это типичные отправные точки, а не исчерпывающий список. Опишите свою ситуацию, и мы честно расскажем, можем ли мы помочь и каким образом.',
      }),
      primaryCta: t({
        en: 'Discuss Your Project',
        hy: 'Քննարկել ձեր նախագիծը',
        ru: 'Обсудить ваш проект',
      }),
      secondaryCta: t({
        en: 'Explore Our Services',
        hy: 'Ծանոթանալ մեր ծառայություններին',
        ru: 'Ознакомиться с нашими услугами',
      }),
    },
  },
} as const satisfies Dictionary;

export default solutionsContent;
