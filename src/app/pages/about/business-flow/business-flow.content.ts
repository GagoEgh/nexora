import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const businessFlowContent = {
  key: 'about-business-flow',
  content: {
    eyebrow: t({
      en: 'Business-first approach',
      hy: 'Բիզնեսի կարիքներից բխող մոտեցում',
      ru: 'Подход, ориентированный на бизнес',
    }),
    title: t({
      en: 'We start with the outcome, then choose the technology.',
      hy: 'Սկսում ենք ցանկալի արդյունքից, ապա ընտրում համապատասխան տեխնոլոգիաները։',
      ru: 'Сначала определяем желаемый результат, затем выбираем технологии.',
    }),
    intro: t({
      en: 'A business goal and its constraints shape the architecture — and the architecture shapes how the system can evolve. We keep that chain explicit so every technical decision can be traced back to a reason.',
      hy: 'Բիզնեսի նպատակներն ու սահմանափակումները որոշում են համակարգի ճարտարապետությունը, իսկ ճարտարապետությունն ազդում է համակարգի հետագա զարգացման հնարավորությունների վրա։ Մենք հստակ պահում ենք այս կապը, որպեսզի յուրաքանչյուր տեխնիկական որոշում ունենա հիմնավորում և բխի բիզնեսի իրական կարիքներից։',
      ru: 'Бизнес-цели и ограничения определяют архитектуру системы, а архитектура влияет на возможности её дальнейшего развития. Мы сохраняем эту связь прозрачной, чтобы каждое техническое решение имело обоснование и отвечало реальным потребностям бизнеса.',
    }),
    steps: [
      {
        icon: 'target' satisfies AppIconName,
        title: t({ en: 'Business goal', hy: 'Բիզնեսի նպատակ', ru: 'Бизнес-цель' }),
        text: t({
          en: 'What must change, for whom',
          hy: 'Ի՞նչ պետք է փոխվի և ո՞ւմ համար',
          ru: 'Что должно измениться и для кого',
        }),
      },
      {
        icon: 'compass' satisfies AppIconName,
        title: t({ en: 'Constraints', hy: 'Սահմանափակումներ', ru: 'Ограничения' }),
        text: t({
          en: 'Budget, timing, data, compliance',
          hy: 'Բյուջե, ժամկետներ, տվյալներ և պահանջների համապատասխանություն',
          ru: 'Бюджет, сроки, данные и соответствие требованиям',
        }),
      },
      {
        icon: 'git-branch' satisfies AppIconName,
        title: t({
          en: 'Architecture',
          hy: 'Համակարգի ճարտարապետություն',
          ru: 'Архитектура системы',
        }),
        text: t({
          en: 'Structure that fits the goal',
          hy: 'Կառուցվածք՝ համապատասխան բիզնեսի նպատակին',
          ru: 'Архитектура, соответствующая поставленной цели',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        title: t({ en: 'Delivery', hy: 'Մշակում և ներդրում', ru: 'Разработка и внедрение' }),
        text: t({
          en: 'Iterative, reviewed, tested',
          hy: 'Փուլային մշակում, կոդի վերանայում և թեստավորում',
          ru: 'Поэтапная разработка, проверка кода и тестирование',
        }),
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({ en: 'Evolution', hy: 'Շարունակական զարգացում', ru: 'Непрерывное развитие' }),
        text: t({
          en: 'Support, measure, improve',
          hy: 'Աջակցություն, արդյունքների չափում և շարունակական բարելավում',
          ru: 'Поддержка, оценка результатов и постоянное улучшение',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default businessFlowContent;
