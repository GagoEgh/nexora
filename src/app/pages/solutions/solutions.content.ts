import { t, type Dictionary } from 'intlayer';

const solutionsContent = {
  key: 'solutions',
  content: {
    title: t({ en: 'Solutions', hy: 'Լուծումներ', ru: 'Решения' }),
  },
} as const satisfies Dictionary;

export default solutionsContent;
