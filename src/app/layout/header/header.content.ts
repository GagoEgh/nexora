import { t, type Dictionary } from 'intlayer';

const headerContent = {
  key: 'header',
  content: {
    brandLink: t({ en: 'Nexora home', hy: 'Nexora գլխավոր էջ', ru: 'Nexora, главная' }),
    navLabel: t({ en: 'Primary', hy: 'Հիմնական', ru: 'Основная' }),
    items: [
      { path: '/', label: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }), chevron: false },
      {
        path: '/services',
        label: t({ en: 'Services', hy: 'Ծառայություններ', ru: 'Услуги' }),
        chevron: true,
      },
      {
        path: '/solutions',
        label: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
        chevron: false,
      },
      { path: '/about', label: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }), chevron: false },
      {
        path: '/partnerships',
        label: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
        chevron: false,
      },
      { path: '/contact', label: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }), chevron: false },
    ],
    language: t({ en: 'Change language', hy: 'Փոխել լեզուն', ru: 'Сменить язык' }),
    cta: t({ en: "Let's Talk", hy: 'Եկեք խոսենք', ru: 'Давайте обсудим' }),
    openMenu: t({ en: 'Open menu', hy: 'Բացել ընտրացանկը', ru: 'Открыть меню' }),
    closeMenu: t({ en: 'Close menu', hy: 'Փակել ընտրացանկը', ru: 'Закрыть меню' }),
  },
} as const satisfies Dictionary;

export default headerContent;
