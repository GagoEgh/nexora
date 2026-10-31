import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  basePath,
  checkDocument,
  expectedLocaleHrefs,
  pagePathFromFile,
} from './verify-prerender.mjs';

/**
 * The checker's logic, exercised without a build. The artifact check itself is
 * `npm run verify:prerender`, which needs `dist/` and so cannot run here.
 */
describe('verify-prerender', () => {
  it('derives a page path from a prerendered file path', () => {
    assert.equal(pagePathFromFile('index.html'), '/');
    assert.equal(pagePathFromFile('about/index.html'), '/about');
    assert.equal(pagePathFromFile('hy/about/index.html'), '/hy/about');
    assert.equal(pagePathFromFile('services\\ai_agent\\index.html'), '/services/ai_agent');
  });

  it('strips the locale prefix, and only a real one', () => {
    assert.equal(basePath('/about'), '/about');
    assert.equal(basePath('/hy/about'), '/about');
    assert.equal(basePath('/ru'), '/');
    assert.equal(basePath('/'), '/');
    // `/running` must not be read as the `ru` prefix plus `nning`.
    assert.equal(basePath('/running'), '/running');
  });

  it('names the three locale hrefs a page must offer', () => {
    assert.deepEqual(expectedLocaleHrefs('/'), ['/', '/hy', '/ru']);
    assert.deepEqual(expectedLocaleHrefs('/about'), ['/about', '/hy/about', '/ru/about']);
    assert.deepEqual(expectedLocaleHrefs('/ru/about'), ['/about', '/hy/about', '/ru/about']);
  });

  const page = ({
    services = '<a class="header__link" data-services-pending href="/services">Services</a>',
    pill = '<a class="header__lang" href="#footer-languages" data-lang-pending>EN</a>',
    languages = ['/', '/hy', '/ru'],
  } = {}) =>
    [
      '<a class="app__skip" href="#main-content">Skip to content</a>',
      services,
      pill,
      '<main id="main-content"></main>',
      '<div id="footer-languages">',
      ...languages.map((href) => `<a class="footer__language" href="${href}">x</a>`),
      '</div>',
    ].join('');

  it('passes a document that is navigable without JavaScript', () => {
    assert.deepEqual(checkDocument(page(), '/'), []);
  });

  it('rejects a Services fallback that is still a button', () => {
    const problems = checkDocument(
      page({ services: '<button class="header__link" data-services-pending>Services</button>' }),
      '/',
    );
    assert.equal(problems.length, 1);
    assert.match(problems[0], /expected 1 anchor Services fallback, found 0/);
  });

  it('rejects a language pill that is still a button', () => {
    const problems = checkDocument(
      page({ pill: '<button class="header__lang" data-lang-pending>EN</button>' }),
      '/',
    );
    assert.deepEqual(problems, ['the header language pill is not an anchor']);
  });

  it('rejects locale links that point at the wrong page', () => {
    // The regression this guards: hrefs built from a stale `router.url` keep pointing at
    // whichever page was rendered first.
    const problems = checkDocument(page({ languages: ['/', '/hy', '/ru'] }), '/about');
    assert.equal(problems.length, 1);
    assert.match(problems[0], /expected \["\/about","\/hy\/about","\/ru\/about"\]/);
  });

  it('rejects a missing locale link', () => {
    const problems = checkDocument(page({ languages: ['/', '/hy'] }), '/');
    assert.equal(problems.length, 1);
    assert.match(problems[0], /footer locale links are \["\/","\/hy"\]/);
  });

  it('rejects a skip link with no target', () => {
    const problems = checkDocument(page().replace(' id="main-content"', ''), '/');
    assert.deepEqual(problems, [
      'nothing carries id="main-content", so the skip link lands nowhere',
    ]);
  });

  it('does not confuse a class that merely contains the name', () => {
    // `header__link--active` must not be matched as `header__link`.
    const problems = checkDocument(
      page({ services: '<a class="header__link--active" data-services-pending href="/x">S</a>' }),
      '/',
    );
    assert.match(problems[0], /found 0/);
  });
});
