const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function loadAccounts(fetchImplementation) {
  const context = loadBrowserScripts(
    createBrowserContext({ fetch: fetchImplementation || (async () => response({}, 401)) }),
    'js/curriculum.js',
    'js/shared/accounts.js'
  );
  return { context, accounts: context.ProfileManager };
}

test('guest progress is available in memory but never saved locally or remotely', async () => {
  let fetchCount = 0;
  const { context, accounts } = loadAccounts(async () => {
    fetchCount++;
    return response({}, 401);
  });
  await accounts.initialize();

  const guest = accounts.getActiveProfile();
  assert.equal(accounts.isAuthenticated(), false);
  assert.equal(guest.id, 'guest');
  assert.equal(guest.name, 'Guest');
  assert.equal(guest.currentBelt, 'white');
  accounts.recordTrainingScore('addition', 8, 10);
  await accounts.flush();

  assert.equal(accounts.getActiveProfile().stars, 8);
  assert.equal(fetchCount, 1);
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('registration and logout switch between one account and unsaved guest mode', async () => {
  const account = { id: 'account-1', username: 'morgan' };
  const profile = { id: account.id, name: account.username, stars: 0, avatar: 'llama' };
  const requests = [];
  const { accounts } = loadAccounts(async (url, options = {}) => {
    requests.push({ url, options });
    if (url === '/api/auth/register') return response({ user: account, profile }, 201);
    if (url === '/api/auth/logout') return response({ ok: true });
    throw new Error(`Unexpected request: ${url}`);
  });

  await accounts.registerAccount('Morgan', 'a secure password 123');
  assert.equal(accounts.isAuthenticated(), true);
  assert.equal(accounts.getActiveProfile().name, 'morgan');
  assert.equal(accounts.getActiveProfile().avatar.id, 'llama');
  await accounts.logout();

  assert.equal(accounts.isAuthenticated(), false);
  assert.equal(accounts.getActiveProfile().name, 'Guest');
  assert.equal(accounts.getActiveProfile().stars, 0);
  assert.deepEqual(requests.map(request => request.url), ['/api/auth/register', '/api/auth/logout']);
});

test('authenticated training updates serialize and save only the active account profile', async () => {
  const account = { id: 'account-2', username: 'riley' };
  const profile = { id: account.id, name: account.username, avatar: 'owl', currentBelt: 'white', skillsProgress: {}, stars: 0 };
  const saved = [];
  const { accounts } = loadAccounts(async (url, options = {}) => {
    if (url === '/api/auth/session') return response({ user: account, profile });
    if (url === '/api/progress' && options.method === 'PUT') {
      const savedProfile = JSON.parse(options.body).profile;
      saved.push(savedProfile);
      return response({ profile: savedProfile });
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  await accounts.initialize();
  accounts.recordTrainingScore('addition', 8, 10);
  accounts.recordTrainingScore('addition', 10, 10);
  await accounts.flush();

  const updated = accounts.getActiveProfile();
  assert.equal(updated.skillsProgress.addition.correct, 18);
  assert.equal(updated.skillsProgress.addition.total, 20);
  assert.equal(updated.skillsProgress.addition.bestScore, 10);
  assert.equal(updated.skillsProgress.addition.stars, 3);
  assert.equal(updated.stars, 18);
  assert.equal(saved.length, 2);
  assert.ok(saved.every(item => item.id === account.id && item.name === account.username));
});

test('session restore loads only the signed-in user and saved progress', async () => {
  const account = { id: 'account-3', username: 'casey' };
  const { accounts } = loadAccounts(async () => response({
    user: account,
    profile: { id: account.id, name: account.username, stars: 42, passedBelts: ['white'] }
  }));
  await accounts.initialize();

  assert.equal(accounts.isAuthenticated(), true);
  assert.equal(accounts.getActiveProfile().id, account.id);
  assert.equal(accounts.getActiveProfile().name, account.username);
  assert.equal(accounts.getActiveProfile().stars, 42);
  assert.deepEqual(Array.from(accounts.loadProfiles(), item => item.id), [account.id]);
});

test('final exam requires stage two and perfect mastery of every belt skill', async () => {
  const { context, accounts } = loadAccounts(async () => response({
    user: { id: 'account-4', username: 'morgan' },
    profile: {}
  }));
  await accounts.initialize();
  const learner = accounts.getActiveProfile();

  assert.equal(accounts.canTakeFinalTest('white'), false);
  learner.stage2PassedBelts.push('white');
  learner.skillsProgress = Object.fromEntries(context.BELTS_DATA[0].skills.map(skill => [skill.id, { bestScore: 10, timesTrained: 1 }]));
  accounts.updateProfile(learner);
  assert.equal(accounts.canTakeFinalTest('white'), true);

  learner.skillsProgress.white_subitising.bestScore = 9;
  accounts.updateProfile(learner);
  assert.equal(accounts.canTakeFinalTest('white'), false);
});

test('passing all exam stages records graduation, awards, certificate, and next belt', async () => {
  const { accounts } = loadAccounts(async (url, options = {}) => {
    if (url === '/api/auth/session') return response({ user: { id: 'account-5', username: 'morgan' }, profile: {} });
    if (url === '/api/progress') return response({ profile: JSON.parse(options.body).profile });
    throw new Error(`Unexpected request: ${url}`);
  });
  await accounts.initialize();

  accounts.recordTestPass('white', 1, 8, 10);
  accounts.recordTestPass('white', 2, 9, 10);
  accounts.recordTestPass('white', 3, 8, 8);
  await accounts.flush();

  const learner = accounts.getActiveProfile();
  assert.deepEqual(Array.from(learner.stage1PassedBelts), ['white']);
  assert.deepEqual(Array.from(learner.stage2PassedBelts), ['white']);
  assert.deepEqual(Array.from(learner.stage3PassedBelts), ['white']);
  assert.deepEqual(Array.from(learner.passedBelts), ['white']);
  assert.equal(learner.currentBelt, 'yellow');
  assert.equal(learner.stars, 100);
  assert.equal(learner.certificates.length, 1);
  assert.equal(learner.certificates[0].beltName, 'White Belt');
  assert.equal(learner.certificates[0].score, '8/8');
});