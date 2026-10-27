import { t, type Dictionary } from 'intlayer';

const notFoundContent = {
  key: 'not-found',
  content: {
    diagramLabel: t({
      en: 'The requested link could not be resolved',
      hy: 'Հարցված հղումը չհաջողվեց բացել',
      ru: 'Запрошенную ссылку не удалось открыть',
    }),
    requestedLink: '/your-link',
    missingLabel: t({ en: 'page not found', hy: 'էջը չի գտնվել', ru: 'страница не найдена' }),

    eyebrow: t({ en: 'Error 404', hy: 'Սխալ 404', ru: 'Ошибка 404' }),
    heading: t({
      en: 'This page doesn’t exist — or it has moved.',
      hy: 'Այս էջը գոյություն չունի կամ տեղափոխվել է։',
      ru: 'Этой страницы не существует — или она была перемещена.',
    }),
    lead: t({
      en: 'The link may be outdated, or the page may have changed during an update. Here are a few good places to continue.',
      hy: 'Հղումը կարող է հնացած լինել, կամ էջը կարող է փոխվել թարմացման ընթացքում։ Ահա մի քանի լավ տեղ՝ շարունակելու համար։',
      ru: 'Ссылка могла устареть, или страница могла измениться во время обновления. Вот несколько подходящих мест, чтобы продолжить.',
    }),

    primaryCta: t({ en: 'Back to homepage', hy: 'Վերադառնալ գլխավոր', ru: 'На главную' }),
    secondaryCta: t({ en: 'Browse services', hy: 'Դիտել ծառայությունները', ru: 'Смотреть услуги' }),

    linksLabel: t({
      en: 'Popular pages',
      hy: 'Հանրաճանաչ էջեր',
      ru: 'Популярные страницы',
    }),
    links: [
      { path: '/solutions', label: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }) },
      { path: '/about', label: t({ en: 'About Nexora', hy: 'Nexora-ի մասին', ru: 'О Nexora' }) },
      {
        path: '/engagement-models',
        label: t({
          en: 'Engagement models',
          hy: 'Համագործակցության մոդելներ',
          ru: 'Модели сотрудничества',
        }),
      },
      {
        path: '/partnerships',
        label: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
      },
      { path: '/contact', label: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }) },
    ],
  },
} as const satisfies Dictionary;

export default notFoundContent;
