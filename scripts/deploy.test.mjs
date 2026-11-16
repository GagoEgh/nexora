import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  REFUSED_ROOTS,
  missingRoutes,
  parseRemoteRoot,
  parseTarget,
  publishScript,
  rollbackScript,
  routeFileFor,
  tarArgs,
} from './deploy.mjs';

const ORIGIN = 'https://example.test';

/**
 * A sitemap holding exactly the given paths.
 *
 * @param {...string} paths
 * @returns {string}
 */
function sitemap(...paths) {
  const entries = paths.map((path) => `  <url><loc>${ORIGIN}${path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${entries}\n</urlset>\n`;
}

describe('parseTarget', () => {
  it('accepts user@host and a bare host', () => {
    assert.equal(parseTarget('deploy@nexoratechnology.org'), 'deploy@nexoratechnology.org');
    assert.equal(parseTarget('nexoratechnology.org'), 'nexoratechnology.org');
  });

  it('requires a target rather than defaulting to one', () => {
    assert.throws(() => parseTarget(undefined), /target is required/);
    assert.throws(() => parseTarget(''), /target is required/);
  });

  it('rejects anything a shell would read as syntax', () => {
    for (const hostile of [
      'host; rm -rf /',
      'host$(whoami)',
      'host`id`',
      'host && curl evil.test',
      '-oProxyCommand=curl evil.test',
      'user@host /extra',
    ]) {
      assert.throws(() => parseTarget(hostile), /plain user@host/, hostile);
    }
  });
});

describe('parseRemoteRoot', () => {
  it('accepts an ordinary web root and drops a trailing slash', () => {
    assert.equal(parseRemoteRoot('/srv/nexora'), '/srv/nexora');
    assert.equal(parseRemoteRoot('/srv/nexora/'), '/srv/nexora');
  });

  it('refuses system directories, because publishing replaces them wholesale', () => {
    for (const root of REFUSED_ROOTS) {
      assert.throws(() => parseRemoteRoot(root), /refusing to deploy into/, root);
    }
  });

  it('refuses a root that is relative, traversing, or shell syntax', () => {
    for (const root of ['srv/nexora', '/srv/../etc', '/srv//nexora', '/srv/$(id)', '/srv/a;b']) {
      assert.throws(() => parseRemoteRoot(root), /absolute path without/, root);
    }
  });
});

describe('routeFileFor', () => {
  it('maps a route to the file nginx resolves it to', () => {
    assert.equal(routeFileFor('/'), 'index.html');
    assert.equal(routeFileFor('/about'), 'about/index.html');
    assert.equal(routeFileFor('/our_work/fairwell'), 'our_work/fairwell/index.html');
    assert.equal(routeFileFor('/ru/our_work/fairwell'), 'ru/our_work/fairwell/index.html');
  });

  it('is indifferent to a trailing slash, as try_files is', () => {
    assert.equal(routeFileFor('/about/'), 'about/index.html');
  });
});

describe('missingRoutes', () => {
  it('passes when the artifact serves every URL the sitemap promises', () => {
    const files = new Set(['index.html', 'about/index.html', 'our_work/fairwell/index.html']);
    assert.deepEqual(
      missingRoutes(sitemap('/', '/about', '/our_work/fairwell'), ORIGIN, files),
      [],
    );
  });

  it('catches the production state: a sitemap promising products the build lacks', () => {
    const files = new Set(['index.html', 'our_work/index.html']);
    assert.deepEqual(
      missingRoutes(
        sitemap('/', '/our_work', '/our_work/fairwell', '/ru/our_work/fairwell'),
        ORIGIN,
        files,
      ),
      [`${ORIGIN}/our_work/fairwell`, `${ORIGIN}/ru/our_work/fairwell`],
    );
  });

  it('ignores URLs belonging to another origin', () => {
    const xml = sitemap('/about').replace(ORIGIN, 'https://other.test');
    assert.deepEqual(missingRoutes(xml, ORIGIN, new Set()), []);
  });

  it('tolerates whitespace inside <loc>, which a formatter may introduce', () => {
    const xml = `<urlset><url><loc>\n  ${ORIGIN}/about\n</loc></url></urlset>`;
    assert.deepEqual(missingRoutes(xml, ORIGIN, new Set()), [`${ORIGIN}/about`]);
  });

  it('matches an origin given with a trailing slash', () => {
    assert.deepEqual(missingRoutes(sitemap('/about'), `${ORIGIN}/`, new Set()), [
      `${ORIGIN}/about`,
    ]);
  });
});

describe('tarArgs', () => {
  it('packs the directory contents, not the directory itself', () => {
    assert.deepEqual(tarArgs('dist/nexora/browser'), [
      '-czf',
      '-',
      '-C',
      'dist/nexora/browser',
      '.',
    ]);
  });

  it('writes to stdout so the stream can be piped into ssh', () => {
    assert.equal(tarArgs('x')[1], '-');
  });
});

describe('publishScript', () => {
  it('unpacks into a staging directory before touching the live one', () => {
    const script = publishScript('/srv/nexora');
    assert.ok(
      script.indexOf("tar -xzf - -C '/srv/nexora.new'") < script.indexOf("mv '/srv/nexora'"),
      'the new release must be complete before the old one is moved aside',
    );
  });

  it('swaps with mv, which is atomic within a filesystem', () => {
    const script = publishScript('/srv/nexora');
    assert.match(script, /mv '\/srv\/nexora' '\/srv\/nexora\.prev'/);
    assert.match(script, /mv '\/srv\/nexora\.new' '\/srv\/nexora'/);
  });

  it('refuses to swap an archive that unpacked without an index.html', () => {
    assert.match(publishScript('/srv/nexora'), /test -f '\/srv\/nexora\.new\/index\.html'/);
  });

  it('fails early and legibly when the parent directory is not writable', () => {
    const script = publishScript('/srv/nexora');
    assert.match(script, /if \[ ! -w '\/srv' \]; then/);
    assert.match(script, /exit 13/);
    assert.ok(
      script.indexOf('-w') < script.indexOf('rm -rf'),
      'the permission check must precede any mutation',
    );
  });

  it('handles a root directly beneath /', () => {
    assert.match(publishScript('/nexora'), /if \[ ! -w '\/' \]; then/);
  });

  it('tolerates a first deploy, where no live directory exists yet', () => {
    assert.match(publishScript('/srv/nexora'), /if \[ -d '\/srv\/nexora' \]; then mv /);
  });

  it('aborts on the first failing command', () => {
    assert.match(publishScript('/srv/nexora'), /^set -e$/m);
  });
});

describe('rollbackScript', () => {
  it('restores the previous release over the live root', () => {
    assert.match(rollbackScript('/srv/nexora'), /cp -a '\/srv\/nexora\.prev' '\/srv\/nexora'/);
  });

  it('refuses to run when no snapshot exists, rather than emptying the site', () => {
    assert.match(rollbackScript('/srv/nexora'), /test -d '\/srv\/nexora\.prev'/);
  });

  it('keeps the rejected release for inspection instead of deleting it', () => {
    assert.match(rollbackScript('/srv/nexora'), /mv '\/srv\/nexora' '\/srv\/nexora\.failed'/);
  });

  it('copies rather than moves the snapshot, so it can be run twice', () => {
    const script = rollbackScript('/srv/nexora');
    assert.match(script, /cp -a '\/srv\/nexora\.prev'/);
    assert.doesNotMatch(script, /mv '\/srv\/nexora\.prev'/);
  });
});
