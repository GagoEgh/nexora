import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  EnvironmentProviders,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';

import { routes } from './app.routes';
import { localeFromLocation } from './core/i18n/locale-routing';
import { provideAppIcons } from './core/icons/provide-app-icons';
import { provideDocumentMeta } from './core/seo/document-meta';
import { provideContactForm } from './pages/contact/contact.providers';

export function provideAppRouter(): EnvironmentProviders {
  return provideRouter(
    routes,
    withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    withComponentInputBinding(),
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideClientHydration(),
    provideAppRouter(),
    provideIntlayer(localeFromLocation(globalThis.location?.pathname)),
    provideHttpClient(),
    provideAppIcons(),
    provideDocumentMeta(),

    provideContactForm(),
  ],
};
