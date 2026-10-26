import { t, type Dictionary } from 'intlayer';

const aboutGlanceContent = {
  key: 'about-glance',
  content: {
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
} as const satisfies Dictionary;

export default aboutGlanceContent;
