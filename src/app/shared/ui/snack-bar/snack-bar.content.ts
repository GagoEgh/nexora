import { t, type Dictionary } from 'intlayer';

const snackBarContent = {
  key: 'snack-bar',
  content: {
    dismiss: t({ en: 'Dismiss', hy: 'Փակել', ru: 'Закрыть' }),
  },
} as const satisfies Dictionary;

export default snackBarContent;
