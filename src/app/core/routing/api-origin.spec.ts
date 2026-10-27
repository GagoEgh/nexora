import { API_CONFIG, resolveApiOrigin } from './api-origin';

describe('resolveApiOrigin', () => {
  it('ships unconfigured, because no API is deployed yet', () => {
    // `api.nexoratechnology.org` does not resolve and the apex serves only the static site,
    // so a configured origin here would guarantee ERR_NAME_NOT_RESOLVED in production.
    expect(API_CONFIG.origin).toBe('');
  });

  it('uses the configured origin on a deployed host', () => {
    expect(resolveApiOrigin('https://nexoratechnology.org', 'nexoratechnology.org')).toBe(
      'https://nexoratechnology.org',
    );
  });

  it('trims trailing slashes so the request path is not doubled', () => {
    expect(resolveApiOrigin('https://nexoratechnology.org//', 'nexoratechnology.org')).toBe(
      'https://nexoratechnology.org',
    );
  });

  it('always talks to the local API on a developer machine', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      expect(resolveApiOrigin('', host), host).toBe(`http://${host}:3000`);
      // Setting the deployed origin must not point `npm start` at production.
      expect(resolveApiOrigin('https://nexoratechnology.org', host), host).toBe(
        `http://${host}:3000`,
      );
    }
  });

  it('stays empty on any other host, rather than guessing a hostname', () => {
    for (const host of ['nexoratechnology.org', 'www.nexoratechnology.org', 'staging.example']) {
      expect(resolveApiOrigin('', host), host).toBe('');
    }
  });

  it('stays empty while prerendering, where there is no location', () => {
    expect(resolveApiOrigin('', null)).toBe('');
  });
});
