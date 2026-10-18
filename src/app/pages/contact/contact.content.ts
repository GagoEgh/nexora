import { t, type Dictionary } from 'intlayer';

const contactContent = {
  key: 'contact',
  content: {
    title: t({ en: 'Contact', hy: 'Կապ', ru: 'Контакты' }),
  },
} satisfies Dictionary;

export default contactContent;
