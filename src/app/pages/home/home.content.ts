import { t, type Dictionary } from 'intlayer';

const homeContent = {
  key: 'home',
  content: {
    title: t({ en: 'Home', hy: 'Գլխավոր', ru: 'Главная' }),
  },
} satisfies Dictionary;

export default homeContent;
