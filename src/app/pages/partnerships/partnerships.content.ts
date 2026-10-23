import { t, type Dictionary } from 'intlayer';

const partnershipsContent = {
  key: 'partnerships',
  content: {
    title: t({ en: 'Partnerships', hy: 'Գործընկերություն', ru: 'Партнёрство' }),
  },
} as const satisfies Dictionary;

export default partnershipsContent;
