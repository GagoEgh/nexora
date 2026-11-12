import { t, type Dictionary } from 'intlayer';

const aboutProductContent = {
  key: 'about-glance',
  content: {
    title: t({
      en: 'Nexora at a glance',
      hy: 'Nexora-ն՝ համառոտ',
      ru: 'Nexora в кратком обзоре',
    }),
    rows: [
      {
        label: t({ en: 'Our work', hy: 'Մեր աշխատանքը', ru: 'Наша работа' }),
        value: t({
          en: 'Web and mobile apps, business systems, e-commerce, and AI solutions.',
          hy: 'Վեբ, բջջային, բիզնես և AI լուծումներ։',
          ru: 'Веб- и мобильная разработка, бизнес-системы и AI.',
        }),
      },
      {
        label: t({
          en: 'Project Categories',
          hy: 'Իրականացված նախագծերի ուղղություններ',
          ru: 'Сферы проектов',
        }),
        value: t({
          en: 'E-commerce, healthcare, finance, SaaS, automotive, marketing, entertainment, and business automation.',
          hy: 'E-commerce, healthcare, finance, SaaS, automotive, marketing, entertainment և automation։',
          ru: 'E-commerce, медицина, финансы, SaaS, маркетинг, развлечения и автоматизация бизнеса.',
        }),
      },
      {
        label: t({ en: 'Solutions We Build', hy: 'Մեր IT լուծումները', ru: 'Наши IT-решения' }),
        value: t({
          en: 'Web platforms, business systems, data solutions, and AI.',
          hy: 'Վեբ հարթակներ, բիզնես համակարգեր և AI լուծումներ։',
          ru: 'Веб-платформы, бизнес-системы, API и AI-решения.',
        }),
      },
      {
        label: t({ en: 'Technology Approach', hy: 'Մեր մոտեցումը', ru: 'Наш подход' }),
        value: t({
          en: 'Performance, scalability, security, and seamless user experience.',
          hy: 'Արագություն, անվտանգություն և հարմարավետություն։',
          ru: 'Скорость, надёжность, безопасность и удобство.',
        }),
      },
      {
        label: t({
          en: 'Project Scope',
          hy: 'Նախագծերի շրջանակ',
          ru: 'Масштаб проектов',
        }),
        value: t({
          en: 'From websites to custom software and advanced digital products.',
          hy: 'Կայքերից մինչև անհատական ծրագրային լուծումներ։',
          ru: 'От сайтов до сложных IT-продуктов.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default aboutProductContent;
