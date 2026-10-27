import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, InjectionToken, PLATFORM_ID, inject } from '@angular/core';

export interface ApiConfig {
  readonly origin: string;
}

export const API_CONFIG: ApiConfig = {
  origin: '',
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const LOCAL_API_PORT = 3000;

export function resolveApiOrigin(configured: string, hostname: string | null): string {
  if (hostname && LOCAL_HOSTS.has(hostname)) {
    return `http://${hostname}:${LOCAL_API_PORT}`;
  }
  return configured.replace(/\/+$/, '');
}

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => {
    const hostname = isPlatformBrowser(inject(PLATFORM_ID))
      ? inject(DOCUMENT).location.hostname
      : null;
    return resolveApiOrigin(API_CONFIG.origin, hostname);
  },
});
