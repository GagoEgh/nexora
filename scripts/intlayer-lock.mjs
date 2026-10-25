import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LOCK_DIR = join(ROOT, 'node_modules', '.cache', 'intlayer-task.lock');
const OWNER_FILE = join(LOCK_DIR, 'owner');
const TASK_FILE = join(LOCK_DIR, 'task');
const POLL_MS = 250;
/** How often the wait notice repeats, so a long block stays visible. */
const NOTICE_MS = 30 * 1000;
const STALE_MS = 20 * 60 * 1000;

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

/**
 * Describes the current holder for the wait notice. Without this the message names no task, so
 * a blocked dev server looks like a hang rather than a queue.
 */
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
      // mkdir is atomic across processes, which is what makes this a lock.
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

const [command, ...args] = process.argv.slice(2);
if (!command) {
  process.stderr.write('usage: node scripts/intlayer-lock.mjs <command> [args...]\n');
  process.exit(2);
}

await acquire([command, ...args].join(' '));

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
