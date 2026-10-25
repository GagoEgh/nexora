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

/** A real, living process to attribute a held lock to. */
let owner = /** @type {import('node:child_process').ChildProcess | undefined} */ (undefined);

/**
 * Puts the sandbox lock into a given state.
 * @param {{ owner?: number | string, age?: 'fresh' | 'aged' }} state
 *   `owner` omitted leaves the owner file absent, as it is between the script's mkdir and its
 *   write. `age: 'aged'` backdates the directory past the staleness fallback.
 */
const placeLock = ({ owner: pid, age = 'fresh' } = {}) => {
  rmSync(lockDir, { recursive: true, force: true });
  mkdirSync(lockDir, { recursive: true });
  if (pid !== undefined) {
    writeFileSync(ownerFile, String(pid));
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
    /another build or test task is running/,
    `the command never ran and no wait was announced; output was: ${output}`,
  );
  return 'waited';
};

before(async () => {
  mkdirSync(dirname(script), { recursive: true });
  copyFileSync(join(HERE, 'intlayer-lock.mjs'), script);
  writeFileSync(
    runner,
    `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(flagFile)}, 'ok');\n`,
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
});
