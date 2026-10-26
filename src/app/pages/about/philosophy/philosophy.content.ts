import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const philosophyContent = {
  key: 'about-philosophy',
  content: {
    eyebrow: t({
      en: 'Engineering philosophy',
      hy: 'Ինժեներական փիլիսոփայություն',
      ru: 'Инженерная философия',
    }),
    title: t({
      en: 'Good software is mostly good decisions.',
      hy: 'Լավ ծրագրակազմը հիմնականում լավ որոշումներ են։',
      ru: 'Хорошее ПО — это прежде всего хорошие решения.',
    }),
    intro: [
      t({
        en: 'Frameworks change every year. What lasts is the quality of the decisions underneath: how a system is structured, where its boundaries are, what is automated and what is left simple on purpose.',
        hy: 'Ֆրեյմվորքերը փոխվում են ամեն տարի։ Մնում է դրանց տակ ընկած որոշումների որակը՝ ինչպես է կառուցված համակարգը, որտեղ են նրա սահմանները, ինչն է ավտոմատացված և ինչը դիտավորյալ պարզ է թողնված։',
        ru: 'Фреймворки меняются каждый год. Остаётся качество решений под ними: как устроена система, где проходят её границы, что автоматизировано и что намеренно оставлено простым.',
      }),
      t({
        en: 'These principles guide every project, whatever the stack.',
        hy: 'Այս սկզբունքներն առաջնորդում են յուրաքանչյուր նախագիծ՝ անկախ տեխնոլոգիական փաթեթից։',
        ru: 'Эти принципы направляют каждый проект, независимо от стека.',
      }),
    ],
    cards: [
      {
        icon: 'search' satisfies AppIconName,
        title: t({
          en: 'Understand before building',
          hy: 'Հասկանալ նախքան կառուցելը',
          ru: 'Понять до того, как строить',
        }),
        text: t({
          en: 'We clarify the problem, users and constraints before committing to an approach.',
          hy: 'Մենք հստակեցնում ենք խնդիրը, օգտատերերին և սահմանափակումները՝ նախքան մոտեցում ընտրելը։',
          ru: 'Мы проясняем задачу, пользователей и ограничения до выбора подхода.',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Architecture is a business decision',
          hy: 'Ճարտարապետությունը բիզնես որոշում է',
          ru: 'Архитектура — это бизнес-решение',
        }),
        text: t({
          en: 'Structure is chosen for how the business will grow, not for novelty.',
          hy: 'Կառուցվածքն ընտրվում է ըստ բիզնեսի աճի, ոչ թե նորույթի համար։',
          ru: 'Структура выбирается под рост бизнеса, а не ради новизны.',
        }),
      },
      {
        icon: 'shield-check' satisfies AppIconName,
        title: t({
          en: 'Quality is designed in',
          hy: 'Որակը ներդրվում է նախագծման փուլում',
          ru: 'Качество закладывается в проект',
        }),
        text: t({
          en: 'Reviews, tests and documentation are part of the work, not an afterthought.',
          hy: 'Վերանայումները, թեստերը և փաստաթղթերը աշխատանքի մասն են, ոչ թե հետագա հավելում։',
          ru: 'Ревью, тесты и документация — часть работы, а не дополнение к ней.',
        }),
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Leave systems better',
          hy: 'Թողնել համակարգերն ավելի լավ վիճակում',
          ru: 'Оставлять системы лучше',
        }),
        text: t({
          en: 'Every change should make the next change easier and safer.',
          hy: 'Յուրաքանչյուր փոփոխություն պետք է հաջորդը դարձնի ավելի հեշտ և ապահով։',
          ru: 'Каждое изменение должно делать следующее проще и безопаснее.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default philosophyContent;
