import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const qualityCapabilityContent = {
  key: 'about-quality',
  content: {
    practices: {
      eyebrow: t({
        en: 'Quality mindset',
        hy: 'Որակի ապահովման սկզբունքներ',
        ru: 'Принципы обеспечения качества',
      }),
      title: t({
        en: 'Practices built into the work.',
        hy: 'Որակի ապահովման պրակտիկաները՝ մշակման գործընթացի անբաժանելի մաս։',
        ru: 'Практики обеспечения качества — неотъемлемая часть разработки.',
      }),
      note: t({
        en: 'Applied in proportion to each project’s size and risk.',
        hy: 'Կիրառվում են յուրաքանչյուր նախագծի ծավալին և ռիսկերի մակարդակին համապատասխան։',
        ru: 'Применяются с учётом масштаба и уровня рисков каждого проекта.',
      }),
      items: [
        {
          icon: 'git-branch' satisfies AppIconName,
          label: t({
            en: 'Architecture reviews',
            hy: 'Ճարտարապետական լուծումների վերանայում',
            ru: 'Анализ и проверка архитектурных решений',
          }),
        },
        {
          icon: 'code' satisfies AppIconName,
          label: t({
            en: 'Code review on every change',
            hy: 'Կոդի յուրաքանչյուր փոփոխության վերանայում',
            ru: 'Проверка кода при каждом изменении',
          }),
        },
        {
          icon: 'shield-check' satisfies AppIconName,
          label: t({
            en: 'Automated testing',
            hy: 'Ավտոմատացված թեստավորում',
            ru: 'Автоматизированное тестирование',
          }),
        },
        {
          icon: 'file-text' satisfies AppIconName,
          label: t({
            en: 'Living documentation',
            hy: 'Մշտապես թարմացվող փաստաթղթեր',
            ru: 'Актуальная документация',
          }),
        },
        {
          icon: 'shield-check' satisfies AppIconName,
          label: t({
            en: 'Security by default',
            hy: 'Անվտանգություն՝ ի սկզբանե',
            ru: 'Безопасность по умолчанию',
          }),
        },
        {
          icon: 'server' satisfies AppIconName,
          label: t({
            en: 'Observability',
            hy: 'Համակարգի դիտարկելիություն',
            ru: 'Наблюдаемость системы',
          }),
        },
      ],
    },
    disciplines: {
      eyebrow: t({
        en: 'End-to-end capability',
        hy: 'Ամբողջական մշակման հնարավորություններ',
        ru: 'Комплексная экспертиза на всех этапах',
      }),
      title: t({
        en: 'Every discipline a project needs, in one team.',
        hy: 'Նախագծին անհրաժեշտ բոլոր մասնագիտական ուղղությունները՝ մեկ թիմում։',
        ru: 'Все необходимые проекту компетенции — в одной команде.',
      }),
      note: t({
        en: 'Disciplines are combined per project — so a single team can carry a product from first sketch to production support.',
        hy: 'Մասնագիտական ուղղությունները համադրվում են՝ ըստ նախագծի կարիքների, որպեսզի մեկ թիմը կարողանա ուղեկցել արտադրանքի ստեղծումը՝ առաջին էսքիզից մինչև գործարկում և հետագա տեխնիկական սպասարկում։',
        ru: 'Состав компетенций подбирается под задачи проекта, чтобы одна команда могла сопровождать продукт от первых эскизов до запуска и дальнейшей технической поддержки.',
      }),
      items: [
        t({ en: 'UI/UX design', hy: 'UI/UX դիզայն', ru: 'UI/UX-дизайн' }),
        t({ en: 'Frontend', hy: 'Frontend մշակում', ru: 'Frontend-разработка' }),
        t({
          en: 'Backend & APIs',
          hy: 'Backend և API-ների մշակում',
          ru: 'Backend-разработка и API',
        }),
        t({
          en: 'Mobile',
          hy: 'Բջջային հավելվածների մշակում',
          ru: 'Разработка мобильных приложений',
        }),
        t({ en: 'AI engineering', hy: 'AI լուծումների ինժեներիա', ru: 'Разработка AI-решений' }),
        t({
          en: 'Cloud & DevOps',
          hy: 'Ամպային ենթակառուցվածքներ և DevOps',
          ru: 'Облачная инфраструктура и DevOps',
        }),
        t({ en: 'QA', hy: 'Որակի ապահովում (QA)', ru: 'Обеспечение качества (QA)' }),
        t({
          en: 'Solution architecture',
          hy: 'Լուծումների ճարտարապետություն',
          ru: 'Архитектура решений',
        }),
        t({
          en: 'Technical leadership',
          hy: 'Տեխնիկական ղեկավարում',
          ru: 'Техническое руководство',
        }),
        t({ en: 'Maintenance', hy: 'Տեխնիկական սպասարկում', ru: 'Техническое сопровождение' }),
      ],
    },
  },
} as const satisfies Dictionary;

export default qualityCapabilityContent;
