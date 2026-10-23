import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const expertiseContent = {
  key: 'expertise',
  content: {
    eyebrow: t({ en: 'What we do', hy: 'Ինչ ենք անում', ru: 'Чем мы занимаемся' }),
    title: t({
      en: 'End-to-end engineering, under one roof.',
      hy: 'Ամբողջական ինժեներիա՝ մեկ հարկի տակ։',
      ru: 'Инженерия полного цикла под одной крышей.',
    }),
    intro: t({
      en: 'Six capability areas that can work on their own or together within a single project — from first interface sketch to production infrastructure.',
      hy: 'Վեց ուղղություն, որոնք կարող են աշխատել առանձին կամ միասին մեկ նախագծի շրջանակում՝ առաջին ինտերֆեյսի էսքիզից մինչև արտադրական ենթակառուցվածք։',
      ru: 'Шесть направлений, которые работают по отдельности или вместе в рамках одного проекта — от первого эскиза интерфейса до production-инфраструктуры.',
    }),
    viewAll: t({
      en: 'View all 15 services',
      hy: 'Դիտել բոլոր 15 ծառայությունները',
      ru: 'Все 15 услуг',
    }),
    explore: t({ en: 'Explore service', hy: 'Ծանոթանալ ծառայությանը', ru: 'Подробнее об услуге' }),
    services: [
      {
        icon: 'code' satisfies AppIconName,
        title: t({
          en: 'Software & Web Development',
          hy: 'Ծրագրային և վեբ մշակում',
          ru: 'Разработка ПО и веб-решений',
        }),
        description: t({
          en: 'Custom platforms, web applications and integrations engineered around how your business actually operates.',
          hy: 'Անհատական հարթակներ, վեբ հավելվածներ և ինտեգրումներ՝ կառուցված ձեր բիզնեսի իրական աշխատանքի շուրջ։',
          ru: 'Заказные платформы, веб-приложения и интеграции, спроектированные вокруг того, как реально работает ваш бизнес.',
        }),
      },
      {
        icon: 'smartphone' satisfies AppIconName,
        title: t({
          en: 'Mobile Applications',
          hy: 'Մոբայլ հավելվածներ',
          ru: 'Мобильные приложения',
        }),
        description: t({
          en: 'iOS, Android and cross-platform apps for customers and internal teams, connected to the systems behind them.',
          hy: 'iOS, Android և կրոսպլատֆորմ հավելվածներ հաճախորդների և ներքին թիմերի համար՝ միացված դրանց հետևում գտնվող համակարգերին։',
          ru: 'iOS-, Android- и кроссплатформенные приложения для клиентов и внутренних команд, связанные со стоящими за ними системами.',
        }),
      },
      {
        icon: 'sparkle' satisfies AppIconName,
        title: t({
          en: 'AI Engineering & Automation',
          hy: 'AI ինժեներիա և ավտոմատացում',
          ru: 'AI-инженерия и автоматизация',
        }),
        description: t({
          en: 'Assistants, agents, retrieval and workflow automation built into real processes — designed to be measurable and controllable.',
          hy: 'Օգնականներ, գործակալներ, որոնում և աշխատահոսքերի ավտոմատացում՝ ներկառուցված իրական գործընթացներում, չափելի և կառավարելի։',
          ru: 'Ассистенты, агенты, поиск и автоматизация рабочих процессов, встроенные в реальные процессы — измеримые и управляемые.',
        }),
      },
      {
        icon: 'pen-tool' satisfies AppIconName,
        title: t({ en: 'UI/UX Design', hy: 'UI/UX դիզայն', ru: 'UI/UX-дизайн' }),
        description: t({
          en: 'Research-led interfaces, prototypes and design systems that make complex products clear to use.',
          hy: 'Հետազոտության վրա հիմնված ինտերֆեյսներ, նախատիպեր և դիզայն համակարգեր, որոնք բարդ պրոդուկտները դարձնում են պարզ օգտագործման համար։',
          ru: 'Интерфейсы, прототипы и дизайн-системы на основе исследований, которые делают сложные продукты понятными в использовании.',
        }),
      },
      {
        icon: 'cloud' satisfies AppIconName,
        title: t({
          en: 'Cloud Infrastructure & DevOps',
          hy: 'Ամպային ենթակառուցվածք և DevOps',
          ru: 'Облачная инфраструктура и DevOps',
        }),
        description: t({
          en: 'Servers, cloud environments, CI/CD and monitoring that make releases routine instead of risky.',
          hy: 'Սերվերներ, ամպային միջավայրեր, CI/CD և մոնիթորինգ, որոնք թողարկումները դարձնում են սովորական, ոչ թե ռիսկային։',
          ru: 'Серверы, облачные среды, CI/CD и мониторинг, благодаря которым релизы становятся рутиной, а не риском.',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Engineering Teams',
          hy: 'Նվիրված ինժեներական թիմեր',
          ru: 'Выделенные инженерные команды',
        }),
        description: t({
          en: 'Senior specialists who join your roadmap and work inside your processes, tools and communication.',
          hy: 'Senior մասնագետներ, որոնք միանում են ձեր ճանապարհային քարտեզին և աշխատում ձեր գործընթացների, գործիքների և հաղորդակցության ներսում։',
          ru: 'Senior-специалисты, которые присоединяются к вашему роадмапу и работают внутри ваших процессов, инструментов и коммуникации.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default expertiseContent;
