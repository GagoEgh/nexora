import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const businessFlowContent = {
  key: 'about-business-flow',
  content: {
    eyebrow: t({
      en: 'Business-first approach',
      hy: 'Բիզնեսից սկսող մոտեցում',
      ru: 'Подход от бизнеса',
    }),
    title: t({
      en: 'We start with the outcome, then choose the technology.',
      hy: 'Մենք սկսում ենք արդյունքից, հետո ընտրում տեխնոլոգիան։',
      ru: 'Мы начинаем с результата, а технологию выбираем потом.',
    }),
    intro: t({
      en: 'A business goal and its constraints shape the architecture — and the architecture shapes how the system can evolve. We keep that chain explicit so every technical decision can be traced back to a reason.',
      hy: 'Բիզնես նպատակը և դրա սահմանափակումները ձևավորում են ճարտարապետությունը, իսկ ճարտարապետությունը՝ համակարգի զարգացման հնարավորությունները։ Մենք այդ շղթան պահում ենք բացահայտ, որպեսզի յուրաքանչյուր տեխնիկական որոշում հնարավոր լինի հետագծել մինչև իր պատճառը։',
      ru: 'Бизнес-цель и её ограничения формируют архитектуру, а архитектура определяет, как система сможет развиваться. Мы держим эту цепочку явной, чтобы каждое техническое решение можно было проследить до его причины.',
    }),
    steps: [
      {
        icon: 'target' satisfies AppIconName,
        title: t({ en: 'Business goal', hy: 'Բիզնես նպատակ', ru: 'Бизнес-цель' }),
        text: t({
          en: 'What must change, for whom',
          hy: 'Ինչը պետք է փոխվի և ում համար',
          ru: 'Что должно измениться и для кого',
        }),
      },
      {
        icon: 'compass' satisfies AppIconName,
        title: t({ en: 'Constraints', hy: 'Սահմանափակումներ', ru: 'Ограничения' }),
        text: t({
          en: 'Budget, timing, data, compliance',
          hy: 'Բյուջե, ժամկետներ, տվյալներ, համապատասխանություն',
          ru: 'Бюджет, сроки, данные, соответствие требованиям',
        }),
      },
      {
        icon: 'git-branch' satisfies AppIconName,
        title: t({ en: 'Architecture', hy: 'Ճարտարապետություն', ru: 'Архитектура' }),
        text: t({
          en: 'Structure that fits the goal',
          hy: 'Կառուցվածք, որը համապատասխանում է նպատակին',
          ru: 'Структура, которая отвечает цели',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        title: t({ en: 'Delivery', hy: 'Մատակարարում', ru: 'Поставка' }),
        text: t({
          en: 'Iterative, reviewed, tested',
          hy: 'Իտերատիվ, վերանայված, թեստավորված',
          ru: 'Итеративно, с ревью и тестами',
        }),
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({ en: 'Evolution', hy: 'Զարգացում', ru: 'Развитие' }),
        text: t({
          en: 'Support, measure, improve',
          hy: 'Աջակցել, չափել, բարելավել',
          ru: 'Поддержка, измерение, улучшение',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default businessFlowContent;
