/**
 * Behavioural tests for the cross-process lock in `intlayer-lock.mjs`.
 *
 * The lock decides whether to honour or steal an existing lock, and getting that wrong is
 * expensive in both directions: stealing a live owner's lock lets two Intlayer builds rewrite
 * `intlayer-types/` at once, while honouring a crashed owner's lock wedges every later task.
 * Both branches are therefore covered here, including the two that used to be wrong — an aged
 * lock whose owner is still alive, and a lock caught between its mkdir and its owner write.
 *
 * The script derives its lock directory from its own location, so the suite copies it into a
 * sandbox and exercises that copy. Nothing here can reach the repository's real lock.
 *
 * Run with `npm run test:scripts`.
 */
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Mirrors `STALE_MS` in the script under test. */
const STALE_MS = 20 * 60 * 1000;
/** An mtime comfortably past the staleness fallback. */
const AGED = new Date(Date.now() - 2 * STALE_MS);
/** The script polls every 250ms, so this is ample to observe that it chose to wait. */
const WAIT_MS = 2500;
/** Long enough for a sandboxed `node` to start, acquire and exit. */
const ACQUIRE_MS = 20_000;
/** No process owns this, so `process.kill(pid, 0)` reports it as gone. */
const DEAD_PID = 999_999;

const sandbox = mkdtempSync(join(tmpdir(), 'intlayer-lock-test-'));
const script = join(sandbox, 'scripts', 'intlayer-lock.mjs');
const lockDir = join(sandbox, 'node_modules', '.cache', 'intlayer-task.lock');
const ownerFile = join(lockDir, 'owner');
const flagFile = join(sandbox, 'ran.flag');
const runner = join(sandbox, 'ran.mjs');
const serveRunner = join(sandbox, 'serve.mjs');
/** Where the sandboxed script looks for Intlayer's generation state. */
const preparedFile = join(sandbox, '.intlayer', 'cache', 'intlayer-prepared.lock');

/** A real, living process to attribute a held lock to. */
let owner = /** @type {import('node:child_process').ChildProcess | undefined} */ (undefined);

/**
 * Puts the sandbox lock into a given state.
 * @param {{ owner?: number | string, task?: string, age?: 'fresh' | 'aged' }} state
 *   `owner` omitted leaves the owner file absent, as it is between the script's mkdir and its
 *   write. `task` omitted leaves the task file absent, as an older lock would.
 *   `age: 'aged'` backdates the directory past the staleness fallback.
 */
const placeLock = ({ owner: pid, task, age = 'fresh' } = {}) => {
  rmSync(lockDir, { recursive: true, force: true });
  mkdirSync(lockDir, { recursive: true });
  if (pid !== undefined) {
    writeFileSync(ownerFile, String(pid));
  }
  if (task !== undefined) {
    writeFileSync(join(lockDir, 'task'), task);
  }
  if (age === 'aged') {
    utimesSync(lockDir, AGED, AGED);
  }
};

/**
 * Runs the wrapper over a command that drops a marker file, and reports which branch it took.
 *
 * The wrapper spawns with `shell: true`, so the runner path is pre-quoted to survive a sandbox
 * path containing spaces.
 * @param {number} timeoutMs
 * @returns {'acquired' | 'waited'}
 */
const attempt = (timeoutMs) => {
  rmSync(flagFile, { force: true });
  const result = spawnSync(process.execPath, [script, 'node', `"${runner}"`], {
    encoding: 'utf8',
    timeout: timeoutMs,
  });

  if (existsSync(flagFile)) {
    return 'acquired';
  }

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  assert.match(
    output,
    /\[intlayer-lock\] waiting for /,
    `the command never ran and no wait was announced; output was: ${output}`,
  );
  return 'waited';
};

/** Raw output from an attempt, for asserting what the wait notice says. */
const noticeFor = (/** @type {number} */ timeoutMs) => {
  rmSync(flagFile, { force: true });
  const result = spawnSync(process.execPath, [script, 'node', `"${runner}"`], {
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
};

/** The wrapper polls for the generation marker every 250ms; ample to observe the release. */
const WATCH_RELEASE_MS = 8000;

/**
 * Runs the wrapper over a child that mimics a dev server: it writes Intlayer's "done" marker
 * and then keeps running. `tail` lands on the command line, which is what the wrapper reads to
 * decide whether the task watches or is one-shot.
 * @param {string} tail
 */
const startWatchTask = (tail) => {
  rmSync(preparedFile, { force: true });
  mkdirSync(dirname(preparedFile), { recursive: true });
  return spawn(process.execPath, [script, 'node', `"${serveRunner}"`, tail], { stdio: 'ignore' });
};

/**
 * @param {number} timeoutMs
 * @param {boolean} present What to wait for: the lock appearing, or going away again.
 */
const lockBecomes = async (present, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(lockDir) === present) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
};

/**
 * Waits for the task to take the lock before asking whether it gives it back, so that a wrapper
 * still starting up is never mistaken for one that has already released.
 * @param {number} timeoutMs
 */
const lockGoneWithin = async (timeoutMs) => {
  assert.equal(await lockBecomes(true, timeoutMs), true, 'the task never took the lock');
  return lockBecomes(false, timeoutMs);
};

before(async () => {
  mkdirSync(dirname(script), { recursive: true });
  copyFileSync(join(HERE, 'intlayer-lock.mjs'), script);
  writeFileSync(
    runner,
    `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(flagFile)}, 'ok');\n`,
  );
  writeFileSync(
    serveRunner,
    [
      "import { mkdirSync, writeFileSync } from 'node:fs';",
      "import { dirname } from 'node:path';",
      `const target = ${JSON.stringify(preparedFile)};`,
      'mkdirSync(dirname(target), { recursive: true });',
      "const state = { version: '9.7.0', timestamp: Date.now(), status: 'done', pid: process.pid };",
      'writeFileSync(target, JSON.stringify(state));',
      'setTimeout(() => {}, 60000);',
      '',
    ].join('\n'),
  );

  owner = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 120000)'], { stdio: 'ignore' });
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.ok(owner.pid, 'could not start a process to own the test lock');
});

after(() => {
  owner?.kill();
  rmSync(sandbox, { recursive: true, force: true });
});

describe('intlayer-lock', () => {
  it('acquires immediately when no lock exists', () => {
    rmSync(lockDir, { recursive: true, force: true });
    assert.equal(attempt(ACQUIRE_MS), 'acquired');
  });

  it('releases the lock once the command exits', () => {
    rmSync(lockDir, { recursive: true, force: true });
    assert.equal(attempt(ACQUIRE_MS), 'acquired');
    assert.equal(existsSync(lockDir), false, 'the lock outlived the command it guarded');
  });

  it('waits while a live owner holds the lock', () => {
    placeLock({ owner: owner?.pid });
    assert.equal(attempt(WAIT_MS), 'waited');
  });

  it('keeps waiting for a live owner however old the lock is', () => {
    // A dev server holds the lock for as long as it runs. Age must never condemn it: this is
    // the case that previously stole the lock and let two Intlayer builds overlap.
    placeLock({ owner: owner?.pid, age: 'aged' });
    assert.equal(attempt(WAIT_MS), 'waited');
  });

  it('names the holding task and its pid while waiting', () => {
    placeLock({ owner: owner?.pid, task: 'ng e2e' });
    const notice = noticeFor(2500);
    assert.match(notice, /waiting for ng e2e/);
    assert.match(notice, new RegExp(`pid ${owner?.pid}`));
  });

  it('falls back to a generic description when the task file is absent', () => {
    placeLock({ owner: owner?.pid });
    assert.match(noticeFor(2500), /waiting for another build or test task/);
  });

  it('takes over when the owner is gone', () => {
    placeLock({ owner: DEAD_PID });
    assert.equal(attempt(ACQUIRE_MS), 'acquired');
  });

  it('takes over an aged lock whose owner is gone', () => {
    placeLock({ owner: DEAD_PID, age: 'aged' });
    assert.equal(attempt(ACQUIRE_MS), 'acquired');
  });

  it('waits out a lock whose owner file has not been written yet', () => {
    // The script mkdirs the lock and then writes the owner, so a competitor can arrive in
    // between and find no owner to check. A lock that young is honoured rather than stolen.
    placeLock({});
    assert.equal(attempt(WAIT_MS), 'waited');
  });

  it('takes over an unidentifiable lock once it ages out', () => {
    // No owner to test for liveness, so the age fallback is all that is left; without it a
    // crash between the mkdir and the write would wedge every later task permanently.
    placeLock({ age: 'aged' });
    assert.equal(attempt(ACQUIRE_MS), 'acquired');
  });

  it('waits while the owner file is unparseable but recent', () => {
    placeLock({ owner: 'not-a-pid' });
    assert.equal(attempt(WAIT_MS), 'waited');
  });

  /**
   * A dev server generates once and then watches. Holding the lock for the rest of its life is
   * what wedged `npm test` and `npm run build` behind it, so a watch task hands the lock back
   * as soon as Intlayer reports the shared files are written.
   */
  it('releases the lock once a watch task has generated, while it keeps running', async () => {
    rmSync(lockDir, { recursive: true, force: true });
    const watcher = startWatchTask('serve');
    try {
      assert.equal(await lockGoneWithin(WATCH_RELEASE_MS), true);
      assert.equal(watcher.exitCode, null, 'the watch task should still be running');
    } finally {
      watcher.kill();
    }
  });

  /** `ng test --watch=false` is a one-shot run, so it must keep the lock for its duration. */
  it('keeps the lock for a one-shot task even when its arguments mention --watch', async () => {
    rmSync(lockDir, { recursive: true, force: true });
    const watcher = startWatchTask('--watch=false');
    try {
      assert.equal(await lockGoneWithin(WATCH_RELEASE_MS), false);
      assert.equal(existsSync(lockDir), true, 'a one-shot task released the lock early');
    } finally {
      watcher.kill();
    }
  });
});
