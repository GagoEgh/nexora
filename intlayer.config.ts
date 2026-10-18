import { type IntlayerConfig, Locales } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.ENGLISH, Locales.ARMENIAN, Locales.RUSSIAN],
    defaultLocale: Locales.ENGLISH,
  },
  routing: {
    mode: 'no-prefix',
    enableProxy: false,
  },
  editor: {
    enabled: false,
  },
};

export default config;
