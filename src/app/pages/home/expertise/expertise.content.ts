import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const expertiseContent = {
  key: 'expertise',
  content: {
    eyebrow: t({
      en: 'What we do',
      hy: 'Ինչ ենք մենք անում',
      ru: 'Чем мы занимаемся',
    }),
    title: t({
      en: 'End-to-end engineering, under one roof.',
      hy: 'Ինժեներական լուծումների ամբողջական ցիկլ՝ մեկ թիմում։',
      ru: 'Полный цикл инженерной разработки — в одной команде.',
    }),
    intro: t({
      en: 'Six capability areas that can work on their own or together within a single project — from first interface sketch to production infrastructure.',
      hy: 'Վեց մասնագիտական ուղղություն, որոնք կարող են գործել առանձին կամ համատեղ՝ մեկ նախագծի շրջանակում՝ ինտերֆեյսի առաջին էսքիզից մինչև արտադրական ենթակառուցվածքի պատրաստումն ու գործարկումը։',
      ru: 'Шесть направлений экспертизы, которые можно использовать по отдельности или объединить в рамках одного проекта — от первого эскиза интерфейса до готовой к эксплуатации инфраструктуры.',
    }),
    viewAll: t({
      en: 'View all 15 services',
      hy: 'Դիտել բոլոր 15 ծառայությունները',
      ru: 'Все 15 услуг',
    }),
    explore: t({
      en: 'Explore service',
      hy: 'Ծանոթանալ ծառայությանը',
      ru: 'Подробнее об услуге',
    }),
    services: [
      {
        icon: 'code' satisfies AppIconName,
        title: t({
          en: 'Software & Web Development',
          hy: 'Ծրագրային ապահովման և վեբ մշակում',
          ru: 'Разработка программного обеспечения и веб-решений',
        }),
        description: t({
          en: 'Custom platforms, web applications and integrations engineered around how your business actually operates.',
          hy: 'Անհատական հարթակներ, վեբ հավելվածներ և ինտեգրումներ՝ նախագծված ձեր բիզնեսի իրական գործընթացներին համապատասխան։',
          ru: 'Разрабатываем индивидуальные платформы, веб-приложения и интеграции с учётом реальных бизнес-процессов вашей компании.',
        }),
      },
      {
        icon: 'smartphone' satisfies AppIconName,
        title: t({
          en: 'Mobile Applications',
          hy: 'Բջջային հավելվածների մշակում',
          ru: 'Разработка мобильных приложений',
        }),
        description: t({
          en: 'iOS, Android and cross-platform apps for customers and internal teams, connected to the systems behind them.',
          hy: 'iOS, Android և բազմահարթակ հավելվածներ հաճախորդների ու ներքին թիմերի համար՝ ինտեգրված անհրաժեշտ համակարգերի հետ։',
          ru: 'Разрабатываем приложения для iOS, Android и нескольких платформ одновременно — для клиентов и внутренних команд, с интеграцией в необходимые системы.',
        }),
      },
      {
        icon: 'sparkle' satisfies AppIconName,
        title: t({
          en: 'AI Engineering & Automation',
          hy: 'AI լուծումների մշակում և ավտոմատացում',
          ru: 'Разработка AI-решений и автоматизация',
        }),
        description: t({
          en: 'Assistants, agents, retrieval and workflow automation built into real processes — designed to be measurable and controllable.',
          hy: 'Օգնականներ, AI գործակալներ, տվյալների որոնման մեխանիզմներ և աշխատանքային գործընթացների ավտոմատացում՝ ներդրված իրական բիզնես գործընթացներում և նախագծված այնպես, որ դրանց արդյունքները հնարավոր լինի չափել ու կառավարել։',
          ru: 'Создаём AI-ассистентов и агентов, системы поиска и автоматизации рабочих процессов, интегрируя их в реальные бизнес-процессы с возможностью измерять результаты и контролировать работу.',
        }),
      },
      {
        icon: 'pen-tool' satisfies AppIconName,
        title: t({
          en: 'UI/UX Design',
          hy: 'UI/UX դիզայն',
          ru: 'UI/UX-дизайн',
        }),
        description: t({
          en: 'Research-led interfaces, prototypes and design systems that make complex products clear to use.',
          hy: 'Հետազոտությունների վրա հիմնված ինտերֆեյսներ, նախատիպեր և դիզայն համակարգեր, որոնք բարդ թվային արտադրանքները դարձնում են հասկանալի և հարմար օգտագործման համար։',
          ru: 'Создаём интерфейсы, прототипы и дизайн-системы на основе исследований, делая сложные цифровые продукты понятными и удобными для пользователей.',
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
          hy: 'Սերվերներ, ամպային միջավայրեր, CI/CD և մոնիթորինգ՝ ծրագրային թարմացումներն ու թողարկումները դարձնելու կանխատեսելի, կանոնավոր և անվտանգ։',
          ru: 'Настраиваем серверы, облачные среды, CI/CD и мониторинг, чтобы выпуск обновлений и новых версий был предсказуемым, регулярным и безопасным.',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Engineering Teams',
          hy: 'Ձեր նախագծին նվիրված ինժեներական թիմեր',
          ru: 'Выделенные инженерные команды',
        }),
        description: t({
          en: 'Senior specialists who join your roadmap and work inside your processes, tools and communication.',
          hy: 'Senior մակարդակի մասնագետներ, որոնք միանում են ձեր նախագծի զարգացման ծրագրին և աշխատում ձեր գործընթացներին, գործիքներին ու հաղորդակցման ձևաչափին համապատասխան։',
          ru: 'Senior-специалисты, которые подключаются к развитию вашего продукта и работают в соответствии с вашей дорожной картой, внутренними процессами, инструментами и правилами коммуникации.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default expertiseContent;
