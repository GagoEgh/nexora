import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';

import { routes } from './app.routes';
import { localeFromLocation } from './core/i18n/locale-routing';
import { provideAppIcons } from './core/icons/provide-app-icons';
import { provideDocumentMeta } from './core/seo/document-meta';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideClientHydration(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideIntlayer(localeFromLocation(globalThis.location?.pathname)),
    provideHttpClient(),
    provideAppIcons(),
    provideDocumentMeta(),
  ],
};
