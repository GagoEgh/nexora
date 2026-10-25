import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../core/icons/icons';

const aboutContent = {
  key: 'about',
  content: {
    breadcrumbLabel: t({ en: 'Breadcrumb', hy: 'Նավիգացիոն շղթա', ru: 'Навигационная цепочка' }),
    breadcrumbHome: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
    title: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }),
    eyebrow: t({ en: 'About Nexora', hy: 'Nexora-ի մասին', ru: 'О Nexora' }),
    heading: t({
      en: 'A senior engineering partner for businesses that build with technology.',
      hy: 'Senior ինժեներական գործընկեր այն բիզնեսների համար, որոնք կառուցում են տեխնոլոգիայով։',
      ru: 'Senior-инженерный партнёр для компаний, которые строят на технологиях.',
    }),
    lead: t({
      en: 'Nexora is a technology development and AI solutions company. We help organizations design, build, integrate, deploy, maintain and evolve the digital systems they depend on — with a team made up exclusively of Senior and Senior+ engineers.',
      hy: 'Nexora-ն տեխնոլոգիական մշակման և AI լուծումների ընկերություն է։ Մենք օգնում ենք կազմակերպություններին նախագծել, կառուցել, ինտեգրել, ներդնել, սպասարկել և զարգացնել այն թվային համակարգերը, որոնցից կախված է իրենց աշխատանքը՝ բացառապես Senior և Senior+ ինժեներներից բաղկացած թիմով։',
      ru: 'Nexora — компания технологической разработки и AI-решений. Мы помогаем организациям проектировать, создавать, интегрировать, развёртывать, поддерживать и развивать цифровые системы, на которые они опираются, — командой, состоящей исключительно из Senior и Senior+ инженеров.',
    }),
    glance: {
      title: t({ en: 'Nexora at a glance', hy: 'Nexora-ն համառոտ', ru: 'Nexora вкратце' }),
      rows: [
        {
          label: t({ en: 'Focus', hy: 'Ուղղություն', ru: 'Фокус' }),
          value: t({
            en: 'Software engineering & AI solutions',
            hy: 'Ծրագրային ինժեներիա և AI լուծումներ',
            ru: 'Программная инженерия и AI-решения',
          }),
        },
        {
          label: t({ en: 'Team', hy: 'Թիմ', ru: 'Команда' }),
          value: t({
            en: 'Senior and Senior+ engineers only',
            hy: 'Միայն Senior և Senior+ ինժեներներ',
            ru: 'Только Senior и Senior+ инженеры',
          }),
        },
        {
          label: t({ en: 'Markets', hy: 'Շուկաներ', ru: 'Рынки' }),
          value: t({
            en: 'Armenia & international',
            hy: 'Հայաստան և միջազգային',
            ru: 'Армения и международные рынки',
          }),
        },
        {
          label: t({ en: 'Clients', hy: 'Հաճախորդներ', ru: 'Клиенты' }),
          value: t({
            en: 'Startups, SMEs, enterprises, software companies, agencies',
            hy: 'Ստարտափներ, ՓՄՁ-ներ, խոշոր ընկերություններ, ծրագրային ընկերություններ, գործակալություններ',
            ru: 'Стартапы, МСБ, крупные компании, софтверные компании, агентства',
          }),
        },
        {
          label: t({ en: 'Engagement', hy: 'Համագործակցություն', ru: 'Форматы работы' }),
          value: t({
            en: 'Projects, dedicated teams, partnership, white-label, support',
            hy: 'Նախագծեր, նվիրված թիմեր, գործընկերություն, white-label, աջակցություն',
            ru: 'Проекты, выделенные команды, партнёрство, white-label, поддержка',
          }),
        },
      ],
    },
    philosophy: {
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
  },
} as const satisfies Dictionary;

export default aboutContent;
