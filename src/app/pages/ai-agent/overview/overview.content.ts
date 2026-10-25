import { t, type Dictionary } from 'intlayer';

const overviewContent = {
  key: 'ai-agent-overview',
  content: {
    eyebrow: t({ en: 'Overview', hy: 'Ակնարկ', ru: 'Обзор' }),
    title: t({
      en: 'Automation that understands context, not just rules.',
      hy: 'Ավտոմատացում, որը հասկանում է համատեքստը, ոչ միայն կանոնները։',
      ru: 'Автоматизация, которая понимает контекст, а не только правила.',
    }),
    body: t({
      en: 'Many business processes are too variable for simple rules but too repetitive for skilled people to keep doing by hand. AI agents fill that gap: they read unstructured input, look up the context they need, and take the next step in your existing tools.',
      hy: 'Շատ բիզնես գործընթացներ չափազանց փոփոխական են պարզ կանոնների համար, բայց չափազանց կրկնվող՝ որակյալ մասնագետների կողմից ձեռքով կատարվելու համար։ AI գործակալները լրացնում են այդ բացը՝ նրանք կարդում են ոչ կառուցվածքային տվյալները, գտնում անհրաժեշտ համատեքստը և կատարում հաջորդ քայլը ձեր առկա գործիքներում։',
      ru: 'Многие бизнес-процессы слишком изменчивы для простых правил, но слишком повторяемы, чтобы квалифицированные люди выполняли их вручную. AI-агенты закрывают этот разрыв: они читают неструктурированные данные, находят нужный контекст и делают следующий шаг в ваших существующих инструментах.',
    }),
    note: t({
      en: 'We design these automations as engineered systems — with defined inputs, permissions, logging and review points — so they can be tested, monitored and improved like any other software your business depends on.',
      hy: 'Մենք նախագծում ենք այս ավտոմատացումները որպես ինժեներական համակարգեր՝ սահմանված մուտքերով, թույլտվություններով, գրանցամատյաններով և ստուգման կետերով, որպեսզի դրանք կարողանան փորձարկվել, վերահսկվել և բարելավվել ինչպես ցանկացած այլ ծրագիր, որի վրա հենվում է ձեր բիզնեսը։',
      ru: 'Мы проектируем такие автоматизации как инженерные системы — с заданными входами, правами доступа, логированием и точками проверки — чтобы их можно было тестировать, отслеживать и улучшать, как любое другое ПО, на которое опирается ваш бизнес.',
    }),
  },
} as const satisfies Dictionary;

export default overviewContent;
