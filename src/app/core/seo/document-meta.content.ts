import { t, type Dictionary } from 'intlayer';

const documentMetaContent = {
  key: 'document-meta',
  content: {
    pages: {
      home: {
        title: t({
          en: 'Nexora | Technology development and AI solutions partner',
          hy: 'Nexora | Տեխնոլոգիական մշակման և AI լուծումների գործընկեր',
          ru: 'Nexora | Партнёр по разработке технологий и AI-решений',
        }),
        description: t({
          en: 'Nexora brings together Senior and Senior+ engineering expertise to build custom software, AI-powered solutions, web and mobile applications, and reliable technology infrastructure.',
          hy: 'Nexora-ն միավորում է Senior և Senior+ ինժեներական փորձը՝ ստեղծելու անհատական ծրագրային ապահովում, AI լուծումներ, վեբ և մոբայլ հավելվածներ և հուսալի տեխնոլոգիական ենթակառուցվածք։',
          ru: 'Nexora объединяет инженерную экспертизу уровня Senior и Senior+, чтобы создавать заказное ПО, решения на основе AI, веб- и мобильные приложения и надёжную технологическую инфраструктуру.',
        }),
      },
      services: {
        title: t({
          en: 'Services | Nexora',
          hy: 'Ծառայություններ | Nexora',
          ru: 'Услуги | Nexora',
        }),
        description: t({
          en: 'Software and web development, mobile applications, AI engineering and automation, UI/UX design, cloud infrastructure and DevOps, and dedicated engineering teams from Senior and Senior+ engineers.',
          hy: 'Ծրագրային և վեբ մշակում, մոբայլ հավելվածներ, AI ինժեներիա և ավտոմատացում, UI/UX դիզայն, ամպային ենթակառուցվածք և DevOps, նվիրված ինժեներական թիմեր՝ Senior և Senior+ ինժեներներից։',
          ru: 'Разработка ПО и веб-решений, мобильные приложения, AI-инженерия и автоматизация, UI/UX-дизайн, облачная инфраструктура и DevOps, выделенные инженерные команды из инженеров уровня Senior и Senior+.',
        }),
      },
      'services/ai_agent': {
        title: t({
          en: 'AI Agents & Business Automation | Nexora',
          hy: 'AI գործակալներ և բիզնես ավտոմատացում | Nexora',
          ru: 'AI-агенты и автоматизация бизнеса | Nexora',
        }),
        description: t({
          en: 'AI agents, assistants and workflow automation built into the systems your business already runs on.',
          hy: 'AI գործակալներ, օգնականներ և աշխատանքային հոսքերի ավտոմատացում՝ ներդրված այն համակարգերի մեջ, որոնց վրա արդեն աշխատում է ձեր բիզնեսը։',
          ru: 'AI-агенты, ассистенты и автоматизация процессов, встроенные в системы, на которых уже работает ваш бизнес.',
        }),
      },
      solutions: {
        title: t({ en: 'Solutions | Nexora', hy: 'Լուծումներ | Nexora', ru: 'Решения | Nexora' }),
        description: t({
          en: 'Launch a digital product, modernize a platform, automate operations, introduce AI into workflows or scale engineering capacity with a senior engineering team.',
          hy: 'Թողարկեք թվային պրոդուկտ, արդիականացրեք հարթակը, ավտոմատացրեք գործընթացները, ներդրեք AI աշխատանքային հոսքերում կամ ընդլայնեք ինժեներական հզորությունը senior ինժեներական թիմի հետ։',
          ru: 'Запустите цифровой продукт, модернизируйте платформу, автоматизируйте процессы, внедрите AI в рабочие процессы или масштабируйте инженерные ресурсы с senior-командой.',
        }),
      },
      about: {
        title: t({ en: 'About | Nexora', hy: 'Մեր մասին | Nexora', ru: 'О нас | Nexora' }),
        description: t({
          en: 'Nexora keeps teams small and senior so that architecture, trade-offs and delivery stay in experienced hands from the first conversation onward.',
          hy: 'Nexora-ն թիմերը պահում է փոքր և senior, որպեսզի ճարտարապետությունը, փոխզիջումները և մատակարարումը առաջին զրույցից սկսած մնան փորձառու ձեռքերում։',
          ru: 'Nexora держит команды небольшими и senior-уровня, чтобы архитектура, компромиссы и поставка с первого разговора оставались в опытных руках.',
        }),
      },
      partnerships: {
        title: t({
          en: 'Partnerships | Nexora',
          hy: 'Գործընկերություն | Nexora',
          ru: 'Партнёрство | Nexora',
        }),
        description: t({
          en: 'Scoped projects, dedicated specialists, white-label execution or ongoing support: engagement models that follow your situation. Become a Nexora partner.',
          hy: 'Սահմանված նախագծեր, նվիրված մասնագետներ, white-label կատարում կամ շարունակական աջակցություն՝ համագործակցության մոդելներ, որոնք հետևում են ձեր իրավիճակին։ Դարձեք Nexora-ի գործընկեր։',
          ru: 'Проекты с фиксированным объёмом, выделенные специалисты, white-label исполнение или постоянная поддержка: модели сотрудничества, которые подстраиваются под вашу ситуацию. Станьте партнёром Nexora.',
        }),
      },
      contact: {
        title: t({ en: 'Contact | Nexora', hy: 'Կապ | Nexora', ru: 'Контакты | Nexora' }),
        description: t({
          en: 'Start a project or become a partner: get in touch with the Nexora engineering team to discuss the problem you need to solve.',
          hy: 'Սկսեք նախագիծ կամ դարձեք գործընկեր՝ կապվեք Nexora-ի ինժեներական թիմի հետ՝ քննարկելու այն խնդիրը, որը պետք է լուծեք։',
          ru: 'Начните проект или станьте партнёром: свяжитесь с инженерной командой Nexora, чтобы обсудить задачу, которую нужно решить.',
        }),
      },
      'privacy-policy': {
        title: t({
          en: 'Privacy Policy | Nexora',
          hy: 'Գաղտնիության քաղաքականություն | Nexora',
          ru: 'Политика конфиденциальности | Nexora',
        }),
        description: t({
          en: 'How Nexora collects, uses and protects personal data when you use the website and get in touch.',
          hy: 'Ինչպես է Nexora-ն հավաքում, օգտագործում և պաշտպանում անձնական տվյալները, երբ օգտվում եք կայքից և կապվում մեզ հետ։',
          ru: 'Как Nexora собирает, использует и защищает персональные данные, когда вы пользуетесь сайтом и связываетесь с нами.',
        }),
      },
      'terms-of-use': {
        title: t({
          en: 'Terms of Use | Nexora',
          hy: 'Օգտագործման պայմաններ | Nexora',
          ru: 'Условия использования | Nexora',
        }),
        description: t({
          en: 'The terms that apply to using the Nexora website and its content.',
          hy: 'Պայմանները, որոնք կիրառվում են Nexora-ի կայքի և դրա բովանդակության օգտագործման նկատմամբ։',
          ru: 'Условия, которые применяются к использованию сайта Nexora и его содержимого.',
        }),
      },
    },
  },
} as const satisfies Dictionary;

export default documentMetaContent;
