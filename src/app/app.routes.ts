import { Routes } from '@angular/router';
import type { DocumentMetaRouteData } from './core/seo/document-meta';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    data: { meta: 'home' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
    data: { meta: 'services' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'solutions',
    loadComponent: () => import('./pages/solutions/solutions').then((m) => m.Solutions),
    data: { meta: 'solutions' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    data: { meta: 'about' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'partnerships',
    loadComponent: () => import('./pages/partnerships/partnerships').then((m) => m.Partnerships),
    data: { meta: 'partnerships' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    data: { meta: 'contact' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),
    data: { meta: 'privacy-policy' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('./pages/terms-of-use/terms-of-use').then((m) => m.TermsOfUse),
    data: { meta: 'terms-of-use' } satisfies DocumentMetaRouteData,
  },
  { path: '**', redirectTo: '' },
];
