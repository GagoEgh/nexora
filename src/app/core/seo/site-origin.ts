import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, InjectionToken, PLATFORM_ID, inject } from '@angular/core';

export interface SeoConfig {
  readonly origin: string;
}

export const SEO_CONFIG: SeoConfig = {
  origin: 'https://nexoratechnology.org',
};

export const SITE_ORIGIN = new InjectionToken<string>('SITE_ORIGIN', {
  providedIn: 'root',
  factory: () => {
    const configured = SEO_CONFIG.origin.replace(/\/+$/, '');
    if (configured) {
      return configured;
    }
    return isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).location.origin : '';
  },
});
