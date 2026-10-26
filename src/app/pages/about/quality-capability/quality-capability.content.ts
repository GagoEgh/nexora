import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const qualityCapabilityContent = {
  key: 'about-quality',
  content: {
    practices: {
      eyebrow: t({
        en: 'Quality mindset',
        hy: 'Որակի մտածելակերպ',
        ru: 'Подход к качеству',
      }),
      title: t({
        en: 'Practices built into the work.',
        hy: 'Պրակտիկաներ, որոնք ներդրված են հենց աշխատանքի մեջ։',
        ru: 'Практики, встроенные в саму работу.',
      }),
      note: t({
        en: 'Applied in proportion to each project’s size and risk.',
        hy: 'Կիրառվում են յուրաքանչյուր նախագծի ծավալին և ռիսկին համապատասխան։',
        ru: 'Применяются соразмерно масштабу и рискам каждого проекта.',
      }),
      items: [
        {
          icon: 'git-branch' satisfies AppIconName,
          label: t({
            en: 'Architecture reviews',
            hy: 'Ճարտարապետության վերանայումներ',
            ru: 'Ревью архитектуры',
          }),
        },
        {
          icon: 'code' satisfies AppIconName,
          label: t({
            en: 'Code review on every change',
            hy: 'Կոդի վերանայում յուրաքանչյուր փոփոխության դեպքում',
            ru: 'Ревью кода при каждом изменении',
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
            hy: 'Կենդանի փաստաթղթեր',
            ru: 'Живая документация',
          }),
        },
        {
          icon: 'shield-check' satisfies AppIconName,
          label: t({
            en: 'Security by default',
            hy: 'Անվտանգություն ըստ լռելյայնի',
            ru: 'Безопасность по умолчанию',
          }),
        },
        {
          icon: 'server' satisfies AppIconName,
          label: t({ en: 'Observability', hy: 'Դիտելիություն', ru: 'Наблюдаемость' }),
        },
      ],
    },
    disciplines: {
      eyebrow: t({
        en: 'End-to-end capability',
        hy: 'Ամբողջական հնարավորություններ',
        ru: 'Полный цикл',
      }),
      title: t({
        en: 'Every discipline a project needs, in one team.',
        hy: 'Նախագծին անհրաժեշտ բոլոր ուղղությունները՝ մեկ թիմում։',
        ru: 'Все дисциплины, которые нужны проекту, в одной команде.',
      }),
      note: t({
        en: 'Disciplines are combined per project — so a single team can carry a product from first sketch to production support.',
        hy: 'Ուղղությունները համադրվում են ըստ նախագծի՝ որպեսզի մեկ թիմը կարողանա արտադրանքը տանել առաջին էսքիզից մինչև արդյունաբերական աջակցություն։',
        ru: 'Дисциплины комбинируются под проект — так одна команда ведёт продукт от первого эскиза до поддержки в продакшене.',
      }),
      items: [
        t({ en: 'UI/UX design', hy: 'UI/UX դիզայն', ru: 'UI/UX-дизайн' }),
        t({ en: 'Frontend', hy: 'Frontend', ru: 'Frontend' }),
        t({ en: 'Backend & APIs', hy: 'Backend և API-ներ', ru: 'Backend и API' }),
        t({ en: 'Mobile', hy: 'Մոբայլ', ru: 'Мобильная разработка' }),
        t({ en: 'AI engineering', hy: 'AI ինժեներիա', ru: 'AI-инженерия' }),
        t({ en: 'Cloud & DevOps', hy: 'Ամպ և DevOps', ru: 'Облако и DevOps' }),
        t({ en: 'QA', hy: 'QA', ru: 'QA' }),
        t({
          en: 'Solution architecture',
          hy: 'Լուծումների ճարտարապետություն',
          ru: 'Архитектура решений',
        }),
        t({
          en: 'Technical leadership',
          hy: 'Տեխնիկական առաջնորդություն',
          ru: 'Техническое лидерство',
        }),
        t({ en: 'Maintenance', hy: 'Սպասարկում', ru: 'Поддержка' }),
      ],
    },
  },
} as const satisfies Dictionary;

export default qualityCapabilityContent;
