import { t, type Dictionary } from 'intlayer';

const documentMetaContent = {
  key: 'document-meta',
  content: {
    pages: {
      home: {
        title: t({
          en: 'Nexora | Technology development and AI solutions partner',
          hy: 'Nexora | Տեխնոլոգիական լուծումների և AI-ի մշակման գործընկեր',
          ru: 'Nexora | Партнёр по разработке технологических и AI-решений',
        }),
        description: t({
          en: 'Nexora brings together Senior and Senior+ engineering expertise to build custom software, AI-powered solutions, web and mobile applications, and reliable technology infrastructure.',
          hy: 'Nexora-ն համախմբում է Senior և Senior+ մակարդակի ինժեներների փորձը՝ անհատական ծրագրային լուծումներ, AI-ով աշխատող համակարգեր, վեբ և բջջային հավելվածներ ու հուսալի տեխնոլոգիական ենթակառուցվածքներ մշակելու համար։',
          ru: 'Nexora объединяет экспертизу инженеров уровня Senior и Senior+ для разработки заказного ПО, решений на базе AI, веб- и мобильных приложений, а также надёжной технологической инфраструктуры.',
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
          hy: 'Ծրագրային ապահովման և վեբ մշակում, բջջային հավելվածներ, AI ինժեներիա և ավտոմատացում, UI/UX դիզայն, ամպային ենթակառուցվածքներ և DevOps, ինչպես նաև Senior և Senior+ մակարդակի ինժեներներից կազմված մասնագիտացված թիմեր։',
          ru: 'Разработка ПО и веб-решений, мобильные приложения, AI-инженерия и автоматизация, UI/UX-дизайн, облачная инфраструктура и DevOps, а также выделенные команды инженеров уровня Senior и Senior+.',
        }),
      },
      'services/ai_agent': {
        title: t({
          en: 'AI Agents & Business Automation | Nexora',
          hy: 'AI գործակալներ և բիզնեսի ավտոմատացում | Nexora',
          ru: 'AI-агенты и автоматизация бизнеса | Nexora',
        }),
        description: t({
          en: 'AI agents, assistants and workflow automation built into the systems your business already runs on.',
          hy: 'AI գործակալներ, օգնականներ և աշխատանքային գործընթացների ավտոմատացում՝ ինտեգրված այն համակարգերին, որոնք ձեր բիզնեսն արդեն օգտագործում է։',
          ru: 'AI-агенты, ассистенты и автоматизация рабочих процессов, интегрированные в системы, которые уже использует ваш бизнес.',
        }),
      },
      solutions: {
        title: t({ en: 'Solutions | Nexora', hy: 'Լուծումներ | Nexora', ru: 'Решения | Nexora' }),
        description: t({
          en: 'Launch a digital product, modernize a platform, automate operations, introduce AI into workflows or scale engineering capacity with a senior engineering team.',
          hy: 'Գործարկեք թվային պրոդուկտ, արդիականացրեք հարթակը, ավտոմատացրեք բիզնես գործընթացները, ներդրեք AI աշխատանքային հոսքերում կամ ընդլայնեք ինժեներական կարողությունները՝ փորձառու մասնագետներից կազմված թիմի օգնությամբ։',
          ru: 'Запустите цифровой продукт, модернизируйте платформу, автоматизируйте бизнес-процессы, внедрите AI в рабочие процессы или расширьте инженерные возможности с помощью команды опытных специалистов.',
        }),
      },
      about: {
        title: t({ en: 'About | Nexora', hy: 'Մեր մասին | Nexora', ru: 'О нас | Nexora' }),
        description: t({
          en: 'Nexora keeps teams small and senior so that architecture, trade-offs and delivery stay in experienced hands from the first conversation onward.',
          hy: 'Nexora-ն ձևավորում է փոքր թիմեր՝ փորձառու մասնագետներով, որպեսզի ճարտարապետական որոշումները, փոխզիջումների գնահատումը և աշխատանքների իրականացումը հենց առաջին քննարկումից լինեն փորձառու մասնագետների վերահսկողության ներքո։',
          ru: 'Nexora формирует небольшие команды из опытных специалистов, чтобы архитектурные решения, оценка компромиссов и реализация проекта с самого первого обсуждения оставались в руках профессионалов.',
        }),
      },
      'engagement-models': {
        title: t({
          en: 'Engagement Models | Nexora',
          hy: 'Համագործակցության մոդելներ | Nexora',
          ru: 'Форматы сотрудничества | Nexora',
        }),
        description: t({
          en: 'Five ways to collaborate with Nexora: project-based development, dedicated teams, long-term technical partnership, maintenance and support, and white-label execution.',
          hy: 'Nexora-ի հետ համագործակցության հինգ ձևաչափ՝ նախագծային մշակում, մասնագիտացված թիմերի ներգրավում, երկարաժամկետ տեխնիկական գործընկերություն, սպասարկում և աջակցություն, ինչպես նաև white-label մշակում։',
          ru: 'Пять форматов сотрудничества с Nexora: проектная разработка, выделенные команды, долгосрочное техническое партнёрство, сопровождение и поддержка, а также white-label-разработка.',
        }),
      },
      partnerships: {
        title: t({
          en: 'Partnerships | Nexora',
          hy: 'Գործընկերություն | Nexora',
          ru: 'Партнёрство | Nexora',
        }),
        description: t({
          en: 'For agencies, consultants, software companies and sales partners: white-label delivery, referrals and commission-based collaboration. Terms are agreed individually.',
          hy: 'Գործակալությունների, խորհրդատուների, ծրագրային ապահովման ընկերությունների և վաճառքի գործընկերների համար՝ white-label ծառայություններ, հաճախորդների ուղղորդում և միջնորդավճարի հիման վրա համագործակցություն։ Պայմանները համաձայնեցվում են անհատապես։',
          ru: 'Для агентств, консультантов, IT-компаний и партнёров по продажам: white-label-разработка, рекомендации клиентов и сотрудничество на комиссионной основе. Условия согласовываются индивидуально.',
        }),
      },
      contact: {
        title: t({ en: 'Contact | Nexora', hy: 'Կապ | Nexora', ru: 'Контакты | Nexora' }),
        description: t({
          en: 'Start a project or become a partner: get in touch with the Nexora engineering team to discuss the problem you need to solve.',
          hy: 'Սկսեք նոր նախագիծ կամ դարձեք մեր գործընկերը։ Կապվեք Nexora-ի ինժեներական թիմի հետ՝ քննարկելու ձեր լուծման կարիքը և նպատակները։',
          ru: 'Начните проект или станьте партнёром: свяжитесь с инженерной командой Nexora, чтобы обсудить вашу задачу и возможные пути её решения.',
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
          hy: 'Ինչպես է Nexora-ն հավաքում, օգտագործում և պաշտպանում անձնական տվյալները, երբ այցելում եք կայք և կապվում մեզ հետ։',
          ru: 'Как Nexora собирает, использует и защищает персональные данные при посещении сайта и обращении к компании.',
        }),
      },
      'not-found': {
        title: t({
          en: 'Page not found | Nexora',
          hy: 'Էջը չի գտնվել | Nexora',
          ru: 'Страница не найдена | Nexora',
        }),
        description: t({
          en: 'The page you are looking for does not exist or has moved. Continue from the Nexora homepage, services or contact page.',
          hy: 'Ձեր փնտրած էջը գոյություն չունի կամ տեղափոխվել է։ Շարունակեք դիտումը Nexora-ի գլխավոր էջից, ծառայությունների բաժնից կամ կապի էջից։',
          ru: 'Страница, которую вы ищете, не существует или была перемещена. Перейдите на главную страницу Nexora, в раздел услуг или на страницу контактов.',
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
          hy: 'Nexora-ի կայքի և դրա բովանդակության օգտագործման նկատմամբ կիրառվող պայմանները։',
          ru: 'Условия использования сайта Nexora и размещённого на нём контента.',
        }),
      },
    },
    breadcrumbs: {
      home: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
      services: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
      'services/ai_agent': t({
        en: 'AI Agents & Business Automation',
        hy: 'AI գործակալներ և բիզնես գործընթացների ավտոմատացում',
        ru: 'AI-агенты и автоматизация бизнес-процессов',
      }),
      solutions: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
      about: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }),
      'engagement-models': t({
        en: 'Engagement Models',
        hy: 'Համագործակցության ձևաչափեր',
        ru: 'Форматы сотрудничества',
      }),
      partnerships: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
      contact: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
      'privacy-policy': t({
        en: 'Privacy Policy',
        hy: 'Գաղտնիության քաղաքականություն',
        ru: 'Политика конфиденциальности',
      }),
      'terms-of-use': t({
        en: 'Terms of Use',
        hy: 'Օգտագործման պայմաններ',
        ru: 'Условия использования',
      }),
    },
  },
} as const satisfies Dictionary;
export default documentMetaContent;
