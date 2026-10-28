import { t, type Dictionary } from 'intlayer';

const overviewContent = {
  key: 'ai-agent-overview',
  content: {
    eyebrow: t({ en: 'Overview', hy: 'Ընդհանուր նկարագիր', ru: 'Обзор' }),
    title: t({
      en: 'Automation that understands context, not just rules.',
      hy: 'Ավտոմատացում, որը հասկանում է ոչ միայն կանոնները, այլև համատեքստը։',
      ru: 'Автоматизация, которая понимает не только правила, но и контекст.',
    }),
    body: t({
      en: 'Many business processes are too variable for simple rules but too repetitive for skilled people to keep doing by hand. AI agents fill that gap: they read unstructured input, look up the context they need, and take the next step in your existing tools.',
      hy: 'Բիզնեսի շատ գործընթացներ չափազանց փոփոխական են պարզ կանոններով կառավարելու համար, բայց միևնույն ժամանակ չափազանց կրկնվող՝ փորձառու մասնագետների կողմից անընդհատ ձեռքով կատարելու համար։ AI գործակալները լրացնում են այս բացը․ դրանք մշակում են չկառուցակարգված տվյալները, գտնում անհրաժեշտ համատեքստը և կատարում հաջորդ քայլը ձեր արդեն օգտագործվող գործիքներում։',
      ru: 'Многие бизнес-процессы слишком вариативны для управления простыми правилами, но при этом слишком однообразны, чтобы специалисты постоянно выполняли их вручную. AI-агенты решают эту задачу: обрабатывают неструктурированные данные, находят необходимый контекст и выполняют следующий шаг с помощью уже используемых вами инструментов.',
    }),
    note: t({
      en: 'We design these automations as engineered systems — with defined inputs, permissions, logging and review points — so they can be tested, monitored and improved like any other software your business depends on.',
      hy: 'Մենք այս ավտոմատացման լուծումները նախագծում ենք որպես ինժեներական համակարգեր՝ հստակ սահմանված մուտքային տվյալներով, հասանելիության իրավունքներով, գործողությունների գրանցմամբ և ստուգման փուլերով։ Սա հնարավորություն է տալիս դրանք փորձարկել, վերահսկել և շարունակաբար բարելավել՝ ինչպես ցանկացած այլ ծրագրային լուծում, որի վրա հիմնվում է ձեր բիզնեսը։',
      ru: 'Мы проектируем такие решения как полноценные инженерные системы — с определёнными входными данными, правами доступа, журналированием и этапами проверки. Это позволяет тестировать их, отслеживать работу и постоянно совершенствовать, как любое другое программное обеспечение, от которого зависит ваш бизнес.',
    }),
  },
} as const satisfies Dictionary;

export default overviewContent;
