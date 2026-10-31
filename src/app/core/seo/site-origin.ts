import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { normalizeOrigin } from '../routing/api-origin';

export interface SeoConfig {
  readonly origin: string;
}

export const SEO_CONFIG: SeoConfig = {
  origin: environment.siteOrigin,
};

export const SITE_ORIGIN = new InjectionToken<string>('SITE_ORIGIN', {
  providedIn: 'root',
  factory: () => {
    const configured = normalizeOrigin(SEO_CONFIG.origin);
    if (configured) {
      return configured;
    }
    return isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).location.origin : '';
  },
});
