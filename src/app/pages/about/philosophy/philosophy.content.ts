import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const philosophyContent = {
  key: 'about-philosophy',
  content: {
    eyebrow: t({
      en: 'Engineering philosophy',
      hy: 'Ինժեներական սկզբունքներ',
      ru: 'Инженерные принципы',
    }),
    title: t({
      en: 'Good software is mostly good decisions.',
      hy: 'Լավ ծրագրային ապահովման հիմքում ճիշտ որոշումներն են։',
      ru: 'Качественное программное обеспечение начинается с правильных решений.',
    }),
    intro: [
      t({
        en: 'Frameworks change every year. What lasts is the quality of the decisions underneath: how a system is structured, where its boundaries are, what is automated and what is left simple on purpose.',
        hy: 'Ֆրեյմվորքերը տարեցտարի փոխվում են։ Երկարաժամկետ արժեքը որոշվում է դրանց հիմքում ընկած որոշումների որակով՝ ինչպես է կառուցված համակարգը, որտեղ են դրա սահմանները, որ գործընթացներն են ավտոմատացված, և որոնք են միտումնավոր պարզեցված։',
        ru: 'Фреймворки меняются из года в год. Но долгосрочную ценность определяет качество заложенных в основу решений: как устроена система, где проходят её границы, какие процессы автоматизированы, а какие намеренно оставлены простыми.',
      }),
      t({
        en: 'These principles guide every project, whatever the stack.',
        hy: 'Այս սկզբունքներն ուղղորդում են մեր յուրաքանչյուր նախագիծ՝ անկախ ընտրված տեխնոլոգիական փաթեթից։',
        ru: 'Эти принципы лежат в основе каждого нашего проекта независимо от выбранного технологического стека.',
      }),
    ],
    cards: [
      {
        icon: 'search' satisfies AppIconName,
        title: t({
          en: 'Understand before building',
          hy: 'Նախ հասկանալ, ապա մշակել',
          ru: 'Сначала понять, потом разрабатывать',
        }),
        text: t({
          en: 'We clarify the problem, users and constraints before committing to an approach.',
          hy: 'Մինչև լուծման մոտեցում ընտրելը՝ հստակեցնում ենք խնդիրը, օգտատերերի կարիքներն ու սահմանափակումները։',
          ru: 'Прежде чем выбрать подход к решению, мы уточняем задачу, потребности пользователей и существующие ограничения.',
        }),
      },
      {
        icon: 'layers' satisfies AppIconName,
        title: t({
          en: 'Architecture is a business decision',
          hy: 'Ճարտարապետությունը բիզնեսի նպատակներից բխող որոշում է',
          ru: 'Архитектура — решение, обусловленное задачами бизнеса',
        }),
        text: t({
          en: 'Structure is chosen for how the business will grow, not for novelty.',
          hy: 'Համակարգի կառուցվածքն ընտրում ենք՝ հաշվի առնելով բիզնեսի զարգացման հեռանկարները, ոչ թե պարզապես նոր տեխնոլոգիաներ կիրառելու համար։',
          ru: 'Архитектуру выбираем с учётом перспектив развития бизнеса, а не ради использования новых технологий.',
        }),
      },
      {
        icon: 'shield-check' satisfies AppIconName,
        title: t({
          en: 'Quality is designed in',
          hy: 'Որակն ապահովվում է նախագծման փուլից',
          ru: 'Качество закладывается на этапе проектирования',
        }),
        text: t({
          en: 'Reviews, tests and documentation are part of the work, not an afterthought.',
          hy: 'Կոդի վերանայումը, թեստավորումն ու փաստաթղթավորումը մշակման գործընթացի անբաժանելի մասն են, ոչ թե վերջում ավելացվող քայլեր։',
          ru: 'Проверка кода, тестирование и документация — неотъемлемые части процесса разработки, а не задачи, которые откладывают на потом.',
        }),
      },
      {
        icon: 'refresh-cw' satisfies AppIconName,
        title: t({
          en: 'Leave systems better',
          hy: 'Համակարգերը դարձնել ավելի լավը',
          ru: 'Делать системы лучше',
        }),
        text: t({
          en: 'Every change should make the next change easier and safer.',
          hy: 'Յուրաքանչյուր փոփոխություն պետք է հեշտացնի հետագա փոփոխությունները և նվազեցնի դրանց հետ կապված ռիսկերը։',
          ru: 'Каждое изменение должно упрощать последующие доработки и снижать связанные с ними риски.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default philosophyContent;
