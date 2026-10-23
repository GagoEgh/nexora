/**
 * Runs a command under an exclusive, cross-process lock.
 *
 * `ng build`, `ng test` and `ng serve` all load the Intlayer esbuild plugin, which regenerates
 * the dictionaries and the type declarations in `intlayer-types/` before the first build. The
 * plugin offers no way to skip that step, so two of these tasks running at once each rewrite the
 * module augmentation while the other's compiler is reading it: `DeclaredLocales` widens from the
 * three declared locales to Intlayer's full locale union and the dictionaries degrade to `any`,
 * which surfaces as type errors that look like defects in `src`.
 *
 * Holding a lock for the whole command serializes the tasks instead, so running them in parallel
 * is slower but correct rather than fast and wrong.
 *
 * Usage: node scripts/intlayer-lock.mjs <command> [args...]
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LOCK_DIR = join(ROOT, 'node_modules', '.cache', 'intlayer-task.lock');
const OWNER_FILE = join(LOCK_DIR, 'owner');
const POLL_MS = 250;
/** A lock older than this is assumed to be a crashed run and is taken over. */
const STALE_MS = 20 * 60 * 1000;

const isRunning = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
};

/** Whether the current lock was left behind by a process that is gone or wedged. */
const isStale = () => {
  try {
    if (Date.now() - statSync(LOCK_DIR).mtimeMs > STALE_MS) {
      return true;
    }
    const pid = Number.parseInt(readFileSync(OWNER_FILE, 'utf8'), 10);
    return Number.isInteger(pid) && !isRunning(pid);
  } catch {
    // The lock vanished or was half-written while we looked: treat it as free.
    return true;
  }
};

const acquire = async () => {
  mkdirSync(dirname(LOCK_DIR), { recursive: true });
  let waiting = false;
  for (;;) {
    try {
      // mkdir is atomic across processes, which is what makes this a lock.
      mkdirSync(LOCK_DIR);
      writeFileSync(OWNER_FILE, String(process.pid));
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      if (isStale()) {
        rmSync(LOCK_DIR, { recursive: true, force: true });
        continue;
      }
      if (!waiting) {
        waiting = true;
        process.stderr.write('[intlayer-lock] another build or test task is running, waiting…\n');
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  }
};

const release = () => rmSync(LOCK_DIR, { recursive: true, force: true });

const [command, ...args] = process.argv.slice(2);
if (!command) {
  process.stderr.write('usage: node scripts/intlayer-lock.mjs <command> [args...]\n');
  process.exit(2);
}

await acquire();

let released = false;
const releaseOnce = () => {
  if (!released) {
    released = true;
    release();
  }
};
process.on('exit', releaseOnce);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    releaseOnce();
    process.exit(1);
  });
}

const child = spawn(command, args, { stdio: 'inherit', shell: true });
child.on('error', (error) => {
  process.stderr.write(`[intlayer-lock] ${error.message}\n`);
  releaseOnce();
  process.exit(1);
});
child.on('close', (code, signal) => {
  releaseOnce();
  process.exit(signal ? 1 : (code ?? 0));
});
