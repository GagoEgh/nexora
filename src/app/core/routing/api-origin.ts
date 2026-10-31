import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export function normalizeOrigin(configured: string): string {
  return configured.replace(/\/+$/, '');
}

export function isUsableOrigin(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  return (
    (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
    parsed.host !== '' &&
    !parsed.search &&
    !parsed.hash
  );
}

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => {
    const configured = normalizeOrigin(environment.apiOrigin);
    return isUsableOrigin(configured) ? configured : '';
  },
});
