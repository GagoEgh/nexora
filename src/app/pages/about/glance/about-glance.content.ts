import { t, type Dictionary } from 'intlayer';

const aboutGlanceContent = {
  key: 'about-glance',
  content: {
    title: t({
      en: 'Nexora at a glance',
      hy: 'Nexora-ն՝ համառոտ',
      ru: 'Nexora в кратком обзоре',
    }),
    rows: [
      {
        label: t({ en: 'Focus', hy: 'Մասնագիտացում', ru: 'Специализация' }),
        value: t({
          en: 'Software engineering & AI solutions',
          hy: 'Ծրագրային ապահովման ինժեներիա և AI լուծումներ',
          ru: 'Разработка программного обеспечения и AI-решения',
        }),
      },
      {
        label: t({ en: 'Team', hy: 'Թիմ', ru: 'Команда' }),
        value: t({
          en: 'Senior and Senior+ engineers only',
          hy: 'Բացառապես Senior և Senior+ մակարդակի ինժեներներ',
          ru: 'Исключительно инженеры уровня Senior и Senior+',
        }),
      },
      {
        label: t({ en: 'Markets', hy: 'Շուկաներ', ru: 'Рынки' }),
        value: t({
          en: 'Armenia & international',
          hy: 'Հայաստան և միջազգային շուկաներ',
          ru: 'Армения и международные рынки',
        }),
      },
      {
        label: t({ en: 'Clients', hy: 'Հաճախորդներ', ru: 'Клиенты' }),
        value: t({
          en: 'Startups, SMEs, enterprises, software companies, agencies',
          hy: 'Ստարտափներ, փոքր և միջին ձեռնարկություններ, խոշոր ընկերություններ, ծրագրային ապահովման մշակմամբ զբաղվող ընկերություններ և գործակալություններ',
          ru: 'Стартапы, малый и средний бизнес, крупные компании, разработчики программного обеспечения и агентства',
        }),
      },
      {
        label: t({
          en: 'Engagement',
          hy: 'Համագործակցության ձևաչափեր',
          ru: 'Форматы сотрудничества',
        }),
        value: t({
          en: 'Projects, dedicated teams, partnership, white-label, support',
          hy: 'Առանձին նախագծեր, նվիրված թիմեր, գործընկերություն, white-label լուծումներ և տեխնիկական աջակցություն',
          ru: 'Отдельные проекты, выделенные команды, партнёрство, white-label-решения и техническая поддержка',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default aboutGlanceContent;
