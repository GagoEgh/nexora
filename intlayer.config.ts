import { type IntlayerConfig, Locales } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.ENGLISH, Locales.ARMENIAN, Locales.RUSSIAN],
    defaultLocale: Locales.ENGLISH,
  },
  routing: {
    mode: 'prefix-no-default',
    enableProxy: false,
  },
  editor: {
    enabled: false,
  },
  system: {
    // Generated declarations must live outside a dot-directory: Angular's esbuild dev server
    // ignores `<workspace>/**/.*/**` in its watcher, so types written to the default
    // `.intlayer/types` never invalidate its TypeScript cache and a key added to a dictionary
    // stays unknown to template type-checking until `ng serve` restarts.
    typesDir: 'intlayer-types',
    moduleAugmentationDir: 'intlayer-types',
  },
};

export default config;
