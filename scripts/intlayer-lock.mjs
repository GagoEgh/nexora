import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LOCK_DIR = join(ROOT, 'node_modules', '.cache', 'intlayer-task.lock');
const OWNER_FILE = join(LOCK_DIR, 'owner');
const TASK_FILE = join(LOCK_DIR, 'task');
const POLL_MS = 250;
const NOTICE_MS = 30 * 1000;
const STALE_MS = 20 * 60 * 1000;
const PREPARED_FILE = join(ROOT, '.intlayer', 'cache', 'intlayer-prepared.lock');
const WATCH_COMMAND = /(?:^|\s)(?:serve|e2e)(?:\s|$)|--watch(?:=true)?(?:\s|$)/;
const GENERATION_TIMEOUT_MS = 3 * 60 * 1000;

/** @param {number} pid */
const isRunning = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return /** @type {NodeJS.ErrnoException} */ (error).code === 'EPERM';
  }
};

const isStale = () => {
  let pid = Number.NaN;
  try {
    pid = Number.parseInt(readFileSync(OWNER_FILE, 'utf8'), 10);
  } catch {
    // Unreadable owner: fall through to the age fallback below.
  }

  if (Number.isInteger(pid)) {
    return !isRunning(pid);
  }

  try {
    return Date.now() - statSync(LOCK_DIR).mtimeMs > STALE_MS;
  } catch {
    // The lock vanished while we looked: treat it as free.
    return true;
  }
};

const describeHolder = () => {
  const read = (/** @type {string} */ file) => {
    try {
      return readFileSync(file, 'utf8').trim();
    } catch {
      return '';
    }
  };

  const task = read(TASK_FILE) || 'another build or test task';
  const pid = read(OWNER_FILE) || '?';
  let held = '';
  try {
    const minutes = Math.floor((Date.now() - statSync(LOCK_DIR).mtimeMs) / 60000);
    held = minutes > 0 ? `, held ${minutes}m` : '';
  } catch {
    // The lock vanished while we looked; the next poll will take it.
  }
  return `${task} (pid ${pid}${held})`;
};

/** @param {string} task */
const acquire = async (task) => {
  mkdirSync(dirname(LOCK_DIR), { recursive: true });
  let waiting = 0;
  for (;;) {
    try {
      mkdirSync(LOCK_DIR);
      writeFileSync(OWNER_FILE, String(process.pid));
      writeFileSync(TASK_FILE, task);
      return;
    } catch (error) {
      if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'EEXIST') {
        throw error;
      }
      if (isStale()) {
        rmSync(LOCK_DIR, { recursive: true, force: true });
        continue;
      }
      const now = Date.now();
      if (now - waiting >= NOTICE_MS) {
        waiting = now;
        process.stderr.write(`[intlayer-lock] waiting for ${describeHolder()}…\n`);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  }
};

const release = () => rmSync(LOCK_DIR, { recursive: true, force: true });

/** @param {number} since Milliseconds; generation that predates the spawn does not count. */
const generatedSince = (since) => {
  try {
    const state = JSON.parse(readFileSync(PREPARED_FILE, 'utf8'));
    return state.status === 'done' && Number(state.timestamp) >= since;
  } catch {
    // Absent, half-written, or from an Intlayer that no longer writes it: not done yet.
    return false;
  }
};

/**
 * Waits for the watch task's own Intlayer generation to finish.
 *
 * The lock exists to stop two Intlayer runs rewriting `.intlayer/` and `intlayer-types/` at
 * once, and that overlap is only possible while one is generating. A dev server generates once
 * at startup and then sits watching, so holding the lock for its whole life blocked every later
 * `npm test` and `npm run build` behind it. Waiting for the marker instead keeps the startup
 * window exclusive and then lets go.
 *
 * @param {number} since
 */
const waitForGeneration = async (since) => {
  const deadline = Date.now() + GENERATION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (generatedSince(since)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  return false;
};

const [command, ...args] = process.argv.slice(2);
if (!command) {
  process.stderr.write('usage: node scripts/intlayer-lock.mjs <command> [args...]\n');
  process.exit(2);
}

const task = [command, ...args].join(' ');
await acquire(task);

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

const startedAt = Date.now();
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

if (WATCH_COMMAND.test(task)) {
  const settled = await waitForGeneration(startedAt);
  if (!released) {
    process.stderr.write(
      settled
        ? '[intlayer-lock] dictionaries generated; releasing the lock so builds and tests can run\n'
        : '[intlayer-lock] no generation marker after 3m; releasing the lock rather than blocking\n',
    );
    releaseOnce();
  }
}
