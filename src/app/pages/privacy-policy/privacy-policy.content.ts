import { t, type Dictionary } from 'intlayer';

const privacyPolicyContent = {
  key: 'privacy-policy',
  content: {
    title: t({
      en: 'Privacy Policy',
      hy: 'Գաղտնիության քաղաքականություն',
      ru: 'Политика конфиденциальности',
    }),
  },
} satisfies Dictionary;

export default privacyPolicyContent;
