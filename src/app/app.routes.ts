import { Routes } from '@angular/router';
import { matchLocalePrefix, syncLocaleWithUrl } from './core/i18n/locale-routing';
import { AI_AGENT_SEGMENT } from './core/routing/paths';
import type { DocumentMetaRouteData } from './core/seo/document-meta';

const pages: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    data: { meta: 'home' } satisfies DocumentMetaRouteData,
  },
  {
    path: 'services',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/services/services').then((m) => m.Services),
        data: { meta: 'services' } satisfies DocumentMetaRouteData,
      },
      {
        path: AI_AGENT_SEGMENT,
        loadComponent: () => import('./pages/ai-agent/ai-agent').then((m) => m.AiAgent),
        data: { meta: 'services/ai_agent' } satisfies DocumentMetaRouteData,
      },
    ],
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
    path: 'engagement-models',
    loadComponent: () =>
      import('./pages/engagement-models/engagement-models').then((m) => m.EngagementModelsPage),
    data: { meta: 'engagement-models' } satisfies DocumentMetaRouteData,
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
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    data: { meta: 'not-found' } satisfies DocumentMetaRouteData,
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    data: { meta: 'not-found' } satisfies DocumentMetaRouteData,
  },
];

export const routes: Routes = [
  {
    path: ':locale',
    canMatch: [matchLocalePrefix],
    canActivate: [syncLocaleWithUrl],
    children: pages,
  },
  { path: '', canActivate: [syncLocaleWithUrl], children: pages },
];
