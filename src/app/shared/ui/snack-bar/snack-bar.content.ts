import { t, type Dictionary } from 'intlayer';

const snackBarContent = {
  key: 'snack-bar',
  content: {
    dismiss: t({ en: 'Dismiss', hy: 'Փակել', ru: 'Закрыть' }),
  },
} satisfies Dictionary;

export default snackBarContent;
