import { t, type Dictionary } from 'intlayer';

const aboutContent = {
  key: 'about',
  content: {
    title: t({ en: 'About', hy: 'Մեր մասին', ru: 'О нас' }),
  },
} as const satisfies Dictionary;

export default aboutContent;
