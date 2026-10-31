const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { LocalAccountStore } = require('../../lib/local-account-store');

test('local account store persists accounts, sessions, and per-account progress in its configured data directory', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const store = new LocalAccountStore(directory);
  const user = { id: 'account-a', username: 'learner_a', passwordHash: 'pbkdf2-hash', createdAt: new Date().toISOString() };
  store.createUser(user);
  store.createSession({ tokenHash: 'session-hash', userId: user.id, expiresAt: Date.now() + 10000 });
  store.saveProgress(user.id, { stars: 17 });

  const reopened = new LocalAccountStore(directory);
  assert.equal(reopened.findUserByUsername('learner_a').id, user.id);
  assert.deepEqual(reopened.findSession('session-hash', Date.now()), { id: user.id, username: user.username });
  assert.deepEqual(reopened.getProgress(user.id), { stars: 17 });
  assert.deepEqual(reopened.getLeaderboardProfiles(), [{ username: user.username, profile: { stars: 17 } }]);
  assert.equal(reopened.findSession('session-hash', Date.now() + 20000), null);
});

test('deleting a local account removes its sessions and progress', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-accounts-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const store = new LocalAccountStore(directory);
  store.createUser({ id: 'account-a', username: 'learner_a', passwordHash: 'hash', createdAt: new Date().toISOString() });
  store.createSession({ tokenHash: 'session-hash', userId: 'account-a', expiresAt: Date.now() + 10000 });
  store.saveProgress('account-a', { stars: 17 });

  store.deleteAccount('account-a');

  assert.equal(store.findUserById('account-a'), null);
  assert.equal(store.findSession('session-hash', Date.now()), null);
  assert.equal(store.getProgress('account-a'), null);
});