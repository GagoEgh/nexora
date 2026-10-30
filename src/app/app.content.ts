import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'app',
  content: {
    skipToContent: t({
      en: 'Skip to content',
      hy: 'Անցնել բովանդակությանը',
      ru: 'Перейти к содержимому',
    }),
  },
} as const satisfies Dictionary;

export default appContent;
