const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { LocalAccountStore } = require('../../lib/local-account-store');

test('local account store persists accounts, sessions, and per-account progress in its configured data directory', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-'));
  let store;
  let reopened;
  t.after(() => {
    store?.close();
    reopened?.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  store = new LocalAccountStore(directory);
  const user = { id: 'account-a', username: 'learner_a', passwordHash: 'pbkdf2-hash', createdAt: new Date().toISOString() };
  store.createUser(user);
  store.createSession({ tokenHash: 'session-hash', userId: user.id, expiresAt: Date.now() + 10000 });
  store.saveProgress(user.id, { stars: 17 });
  assert.deepEqual(store.getLeaderboardProfiles(), [{ username: user.username, profile: { stars: 17 } }]);

  reopened = new LocalAccountStore(directory);
  assert.equal(reopened.findUserByUsername('learner_a').id, user.id);
  assert.deepEqual(reopened.findSession('session-hash', Date.now()), { id: user.id, username: user.username });
  assert.deepEqual(reopened.getProgress(user.id), { stars: 17 });
  assert.deepEqual(reopened.getLeaderboardProfiles(), [{ username: user.username, profile: { stars: 17 } }]);
  assert.equal(reopened.findSession('session-hash', Date.now() + 20000), null);
});

test('deleting a local account removes its sessions and progress', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-'));
  let store;
  t.after(() => {
    store?.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  store = new LocalAccountStore(directory);
  store.createUser({ id: 'account-a', username: 'learner_a', passwordHash: 'hash', createdAt: new Date().toISOString() });
  store.createSession({ tokenHash: 'session-hash', userId: 'account-a', expiresAt: Date.now() + 10000 });
  store.saveProgress('account-a', { stars: 17 });

  store.deleteAccount('account-a');

  assert.equal(store.findUserById('account-a'), null);
  assert.equal(store.findSession('session-hash', Date.now()), null);
  assert.equal(store.getProgress('account-a'), null);
});

test('imports legacy JSON once and preserves it as a backup', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-migration-'));
  const legacyPath = path.join(directory, 'accounts.json');
  const legacyContents = JSON.stringify({
    users: [{ id: 'legacy-a', username: 'legacy_learner', passwordHash: 'hash', createdAt: '2025-01-01T00:00:00.000Z' }],
    sessions: [{ tokenHash: 'legacy-token', userId: 'legacy-a', expiresAt: Date.now() + 10000 }],
    progress: { 'legacy-a': { stars: 17 } }
  });
  fs.writeFileSync(legacyPath, legacyContents, { encoding: 'utf8', mode: 0o600 });
  let store;
  t.after(() => {
    store?.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  store = new LocalAccountStore(directory);
  assert.equal(store.findUserById('legacy-a').username, 'legacy_learner');
  assert.deepEqual(store.findSession('legacy-token', Date.now()), { id: 'legacy-a', username: 'legacy_learner' });
  assert.deepEqual(store.getProgress('legacy-a'), { stars: 17 });
  assert.equal(fs.readFileSync(legacyPath, 'utf8'), legacyContents);

  store.saveProgress('legacy-a', { stars: 29 });
  store.close();
  store = new LocalAccountStore(directory);
  assert.deepEqual(store.getProgress('legacy-a'), { stars: 29 });
  assert.equal(fs.readFileSync(legacyPath, 'utf8'), legacyContents);
});

test('serializes account creation across store processes', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-concurrent-'));
  const initialized = new LocalAccountStore(directory);
  initialized.close();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const modulePath = JSON.stringify(require.resolve('../../lib/local-account-store'));
  const childScript = `
    const { LocalAccountStore } = require(${modulePath});
    const store = new LocalAccountStore(process.argv[1]);
    const id = process.argv[2];
    store.createUser({ id, username: id, passwordHash: 'hash', createdAt: new Date().toISOString() });
    store.close();
  `;
  const userIds = Array.from({ length: 8 }, (_, index) => `concurrent_${index}`);
  await Promise.all(userIds.map(userId => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', childScript, directory, userId], {
      stdio: ['ignore', 'ignore', 'pipe']
    });
    let errorOutput = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => { errorOutput += chunk; });
    child.once('error', reject);
    child.once('exit', code => code === 0
      ? resolve()
      : reject(new Error(errorOutput || `Store process exited with code ${code}`)));
  })));

  const reopened = new LocalAccountStore(directory);
  try {
    for (const userId of userIds) assert.equal(reopened.findUserById(userId).username, userId);
  } finally {
    reopened.close();
  }
});