import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, normalize, resolve, sep } from 'node:path';
import { argv, exit } from 'node:process';

export const PREFIXED_LOCALES = ['hy', 'ru'];

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function contentTypeOf(filePath) {
  const dot = filePath.lastIndexOf('.');
  const extension = dot === -1 ? '' : filePath.slice(dot).toLowerCase();
  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}

/**
 * @param {string} pathname
 * @returns {string} the 404 document for that path's locale, relative to the root
 */
export function notFoundDocumentFor(pathname) {
  for (const locale of PREFIXED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return `${locale}/not-found/index.html`;
    }
  }
  return 'not-found/index.html';
}

/**
 * @param {string} pathname
 * @returns {string[]} the files to try, in order; empty when the path escapes the root
 */
export function candidatesFor(pathname) {
  const trimmed = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const normalized = trimmed === '' ? '' : normalize(trimmed);
  if (normalized.startsWith('..') || normalized.includes(`..${sep}`)) {
    return [];
  }
  if (normalized === '') {
    return ['index.html'];
  }
  return [normalized, join(normalized, 'index.html')];
}

/**
 * @param {string} root directory the build was written to
 * @param {string} pathname request path
 * @returns {Promise<{ file: string, status: number }>} the file to serve and the status to send
 */
export async function resolveRequest(root, pathname) {
  for (const candidate of candidatesFor(pathname)) {
    const absolute = resolve(root, candidate);
    try {
      const stats = await stat(absolute);
      if (stats.isFile()) {
        return { file: absolute, status: 200 };
      }
    } catch {
      // Try the next candidate, exactly as `try_files` does.
    }
  }
  return { file: resolve(root, notFoundDocumentFor(pathname)), status: 404 };
}

/**
 * @param {string} root directory to serve
 * @param {number} port port to listen on
 * @returns {Promise<number>} process exit code
 */
async function main(root, port) {
  const absoluteRoot = resolve(root);
  try {
    const stats = await stat(resolve(absoluteRoot, 'index.html'));
    if (!stats.isFile()) {
      throw new Error('not a file');
    }
  } catch {
    console.error(`[serve-dist] no index.html under ${absoluteRoot}. Run \`npm run build\` first.`);
    return 1;
  }

  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    void resolveRequest(absoluteRoot, pathname).then(
      ({ file, status }) => {
        const cacheControl = /-[A-Z0-9]{8}\.(?:js|css)$/.test(file)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache';
        res.writeHead(status, {
          'content-type': contentTypeOf(file),
          'cache-control': cacheControl,
        });
        createReadStream(file)
          .on('error', () => res.end())
          .pipe(res);
      },
      (error) => {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
        res.end(`[serve-dist] ${/** @type {Error} */ (error).message}`);
      },
    );
  });

  await new Promise((ready) => server.listen(port, () => ready(undefined)));
  console.log(`[serve-dist] serving ${absoluteRoot} on http://localhost:${port}`);
  return 0;
}

if (import.meta.filename === argv[1]) {
  const code = await main(argv[2] ?? 'dist/nexora/browser', Number(argv[3] ?? 4401));
  if (code !== 0) {
    exit(code);
  }
}
