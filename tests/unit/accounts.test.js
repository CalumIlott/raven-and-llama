const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function loadAccounts(fetchImplementation) {
  const context = createBrowserContext({ fetch: fetchImplementation || (async () => response({}, 401)) });
  context.App = function App() {};
  context.app = { updateHeader() {}, refreshCurrentView() {} };
  loadBrowserScripts(
    context,
    'public/js/mathmasters/curriculum.js',
    'public/js/shared/progress-analytics.js',
    'public/js/shared/accounts.js',
    'public/js/shared/achievement-badges.js',
    'public/js/shared/cosmetic-shop.js',
    'public/js/shared/daily-challenges.js',
    'public/js/learning/quests.js'
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
  assert.equal(guest.theme, 'light');
  assert.equal(guest.schoolYear, 3);
  assert.deepEqual(Array.from(guest.spellingLists), []);
  assert.equal(guest.activeSpellingListId, null);
  assert.deepEqual({ ...guest.subjectYears }, {});
  assert.equal(guest.currentBelt, 'white');
  accounts.recordTrainingScore('addition', 8, 10);
  const guestList = { id: 'guest-week', name: 'This Week', words: ['quokka'] };
  const dayKey = new Date().toISOString().slice(0, 10);
  const dailyChallenges = {
    days: {
      [dayKey]: {
        activityIds: ['fraction-pizza'],
        completedActivityIds: [],
        bonusAwarded: false
      }
    }
  };
  const questProgress = {
    'stellar-expedition': { completedStepIds: ['solar-system-order'] }
  };
  assert.equal(await accounts.updateProfile({
    ...guest,
    spellingLists: [guestList],
    activeSpellingListId: guestList.id,
    dailyChallenges,
    questProgress
  }), false);
  await accounts.flush();

  assert.equal(accounts.getActiveProfile().stars, 8);
  assert.deepEqual(JSON.parse(JSON.stringify(accounts.getActiveProfile().spellingLists)), [guestList]);
  assert.deepEqual(JSON.parse(JSON.stringify(accounts.getActiveProfile().dailyChallenges)), dailyChallenges);
  assert.deepEqual(JSON.parse(JSON.stringify(accounts.getActiveProfile().questProgress)), questProgress);
  assert.equal(accounts.getActiveProfile().activeSpellingListId, guestList.id);
  assert.equal(fetchCount, 1);
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
  assert.equal(context.localStorage.getItem(accounts.GUEST_THEME_KEY), null);
});

test('guest achievement badges and quest rewards derive from progress and remain memory only', async () => {
  const { context, accounts } = loadAccounts();
  await accounts.initialize();

  const guest = accounts.getActiveProfile();
  await accounts.updateProfile({
    ...guest,
    activityProgress: {
      'science-water-cycle': {
        title: 'Water Cycle',
        subject: 'Science Lab',
        kind: 'quiz',
        scoreUnit: 'questions',
        bestScore: 1,
        bestTotal: 1,
        correct: 1,
        total: 1,
        correctAnswers: 1,
        totalAnswers: 1,
        timesPlayed: 1
      }
    },
    questProgress: {
      'stellar-expedition': {
        completedStepIds: ['solar-system-order', 'plant-life-cycle-order']
      }
    },
    earnedBadges: ['activity-explorer', 'first-steps', 'stellar-explorer', 'unknown-badge']
  });

  assert.deepEqual(Array.from(accounts.getActiveProfile().earnedBadges), ['first-steps', 'stellar-explorer']);
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('spelling lists are normalized and validated with bounded unique entries', () => {
  const { accounts } = loadAccounts();
  const list = { id: 'week-one', name: 'Week One', words: ['quokka', 'mother-in-law'] };

  assert.equal(accounts.validateSpellingLists([list]), null);
  assert.deepEqual(JSON.parse(JSON.stringify(accounts.normalizeProfile({
    spellingLists: [list],
    activeSpellingListId: 'deleted-list'
  }).spellingLists)), [list]);
  assert.equal(accounts.normalizeProfile({
    spellingLists: [list],
    activeSpellingListId: 'deleted-list'
  }).activeSpellingListId, null);
  assert.match(accounts.validateSpellingLists([{ ...list, words: ['quokka', ' QUOKKA '] }]), /unique/i);
  assert.match(accounts.validateSpellingLists([{ ...list, words: [''] }]), /blank/i);
  assert.match(accounts.validateSpellingLists([{ ...list, words: ['x'.repeat(101)] }]), /100 characters/i);
});

test('daily challenge profile normalization keeps only valid bounded UTC completion records', () => {
  const { accounts } = loadAccounts();
  const profile = accounts.normalizeProfile({
    dailyChallenges: {
      days: {
        '2026-03-10': {
          activityIds: ['fraction-pizza', 'brain-power-pattern-recognition'],
          completedActivityIds: ['fraction-pizza'],
          bonusAwarded: false
        },
        '2025-02-30': {
          activityIds: ['maths-number-builder'],
          completedActivityIds: [],
          bonusAwarded: false
        },
        '2026-03-11': {
          activityIds: ['science-solar-system-order'],
          completedActivityIds: ['unknown-activity'],
          bonusAwarded: false
        }
      }
    }
  });

  assert.deepEqual(JSON.parse(JSON.stringify(profile.dailyChallenges)), {
    days: {
      '2026-03-10': {
        activityIds: ['fraction-pizza', 'brain-power-pattern-recognition'],
        completedActivityIds: ['fraction-pizza'],
        bonusAwarded: false
      }
    }
  });
});

test('profile normalization validates subject-specific years and inherits the global year', async () => {
  const account = { id: 'year-account', username: 'year_user' };
  const { accounts } = loadAccounts(async () => response({
    user: account,
    profile: {
      schoolYear: 4,
      subjectYears: { maths: 3, science: 0, unknown: 2, english: '5' }
    }
  }));
  await accounts.initialize();

  const profile = accounts.getActiveProfile();
  assert.equal(profile.schoolYear, 4);
  assert.deepEqual({ ...profile.subjectYears }, { maths: 3, science: 0 });
  assert.equal(accounts.getSubjectYear('maths'), 3);
  assert.equal(accounts.getSubjectYear('science'), 0);
  assert.equal(accounts.getSubjectYear('english'), 4);
  assert.equal(accounts.getSubjectDifficulty('maths'), 'medium');
  assert.equal(accounts.getSubjectDifficulty('science'), 'easy');
  assert.equal(accounts.getSubjectDifficulty('english'), 'medium');
  assert.equal(accounts.getSchoolYearLabel(0), 'Foundation');

  for (const [year, difficulty] of [[2, 'easy'], [3, 'medium'], [6, 'medium'], [7, 'hard'], [12, 'hard']]) {
    accounts.getActiveProfile().schoolYear = year;
    assert.equal(accounts.getSubjectDifficulty('english'), difficulty);
  }
});

test('account theme is restored, applied, and saved without local storage', async () => {
  const classes = new Set(['dark']);
  const document = {
    documentElement: {
      classList: {
        toggle(name, force) {
          if (force) classes.add(name);
          else classes.delete(name);
        }
      }
    }
  };
  const account = { id: 'theme-account', username: 'theme_user' };
  const savedThemes = [];
  const { context, accounts } = loadAccounts(async (url, options = {}) => {
    if (url === '/api/auth/session') return response({ user: account, profile: { theme: 'light' } });
    if (url === '/api/progress' && options.method === 'PUT') {
      const profile = JSON.parse(options.body).profile;
      savedThemes.push(profile.theme);
      return response({ profile });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  context.document = document;

  await accounts.initialize();
  assert.equal(accounts.getActiveProfile().theme, 'light');
  assert.equal(classes.has('theme-light'), true);
  assert.equal(classes.has('dark'), false);

  await accounts.setTheme('dark');
  assert.deepEqual(savedThemes, ['dark']);
  assert.equal(classes.has('dark'), true);
  assert.equal(classes.has('theme-light'), false);
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('guest theme is saved separately and restored without persisting progress', async () => {
  const { context, accounts } = loadAccounts(async () => response({}, 401));
  await accounts.initialize();
  assert.equal(accounts.getActiveProfile().theme, 'light');

  assert.equal(await accounts.setTheme('dark'), true);
  assert.equal(accounts.getActiveProfile().theme, 'dark');
  assert.equal(context.localStorage.getItem('raven_llama_guest_theme'), 'dark');
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);

  accounts.setGuest();
  assert.equal(accounts.getActiveProfile().theme, 'dark');
  assert.equal(await accounts.setTheme('light'), true);
  assert.equal(context.localStorage.getItem('raven_llama_guest_theme'), 'light');
  accounts.setGuest();
  assert.equal(accounts.getActiveProfile().theme, 'light');
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('registration and logout switch between one account and unsaved guest mode', async () => {
  const account = { id: 'account-1', username: 'morgan' };
  const profile = { id: account.id, name: account.username, stars: 0, avatar: 'llama' };
  const requests = [];
  const { context, accounts } = loadAccounts(async (url, options = {}) => {
    requests.push({ url, options });
    if (url === '/api/auth/register') return response({ user: account, profile }, 201);
    if (url === '/api/auth/logout') return response({ ok: true });
    throw new Error(`Unexpected request: ${url}`);
  });

  let discardedSessions = 0;
  context.gameEngine = { discardSessionForAccountChange() { discardedSessions++; } };
  accounts.setGuest();
  await accounts.registerAccount('Morgan', 'a secure password 123');
  assert.equal(accounts.isAuthenticated(), true);
  assert.equal(accounts.getActiveProfile().name, 'morgan');
  assert.equal(accounts.getActiveProfile().avatar.id, 'llama');
  await accounts.logout();

  assert.equal(accounts.isAuthenticated(), false);
  assert.equal(accounts.getActiveProfile().name, 'Guest');
  assert.equal(accounts.getActiveProfile().stars, 0);
  assert.equal(discardedSessions, 2);
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

test('activity scores preserve skill and answer metrics, award configured stars, and leave skill progress alone', async () => {
  const { accounts } = loadAccounts(async () => response({}, 401));
  await accounts.initialize();

  const activity = {
    id: 'time-hours',
    title: 'O’Clock & Half Past',
    subject: 'Life Skills',
    kind: 'quiz',
    skillId: 'life_skills_time_reading',
    settings: { awardStars: true }
  };
  accounts.recordActivityScore(activity, 8, 10, { correctAnswers: 4, totalAnswers: 5 });
  accounts.recordActivityScore(activity, 6, 10, { correctAnswers: 3, totalAnswers: 5 });

  const profile = accounts.getActiveProfile();
  assert.deepEqual({ ...profile.activityProgress['time-hours'] }, {
    title: 'O’Clock & Half Past',
    subject: 'Life Skills',
    skillId: 'life_skills_time_reading',
    kind: 'quiz',
    scoreUnit: 'questions',
    bestScore: 8,
    bestTotal: 10,
    correct: 14,
    total: 20,
    correctAnswers: 7,
    totalAnswers: 10,
    timesPlayed: 2
  });
  assert.equal(profile.stars, 14);
  assert.deepEqual({ ...profile.skillsProgress }, {});
  assert.deepEqual(Array.from(profile.activityHistory, entry => ({
    activityId: entry.activityId,
    subject: entry.subject,
    correctAnswers: entry.correctAnswers,
    totalAnswers: entry.totalAnswers
  })), [
    { activityId: 'time-hours', subject: 'Life Skills', correctAnswers: 4, totalAnswers: 5 },
    { activityId: 'time-hours', subject: 'Life Skills', correctAnswers: 3, totalAnswers: 5 }
  ]);
  assert.equal(profile.activityHistory.length, 2);
});

test('activity history is capped and remains memory-only for guests', async () => {
  const { context, accounts } = loadAccounts(async () => response({}, 401));
  await accounts.initialize();

  const activity = {
    id: 'memory-check',
    title: 'Memory Check',
    subject: 'Brain Power',
    kind: 'game',
    game: { scoreUnit: 'points' },
    settings: { awardStars: false }
  };
  for (let index = 0; index < 370; index++) {
    accounts.recordActivityScore(activity, index);
  }

  assert.equal(accounts.getActiveProfile().activityHistory.length, 365);
  assert.equal(accounts.getActiveProfile().activityHistory.at(-1).activityId, 'memory-check');
  await accounts.flush();
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('endless high scores keep the best valid score for each belt and timetables', async () => {
  const { accounts } = loadAccounts(async () => response({}, 401));
  await accounts.initialize();

  accounts.recordEndlessHighScore('white', 8);
  accounts.recordEndlessHighScore('white', 5);
  accounts.recordEndlessHighScore('timetables', 12);
  accounts.recordEndlessHighScore('unknown', 99);
  accounts.recordEndlessHighScore('yellow', Number.NaN);

  assert.deepEqual({ ...accounts.getActiveProfile().endlessHighScores }, { white: 8, timetables: 12 });
});

test('profile normalization drops invalid endless high score values', async () => {
  const { accounts } = loadAccounts(async () => response({
    user: { id: 'account-6', username: 'jordan' },
    profile: { endlessHighScores: { white: 7, yellow: '9', unknown: 12, timetables: 4 } }
  }));
  await accounts.initialize();

  assert.deepEqual({ ...accounts.getActiveProfile().endlessHighScores }, { white: 7, timetables: 4 });
});

test('last module is restored only from an allowlisted account preference', async () => {
  const { accounts } = loadAccounts(async () => response({
    user: { id: 'account-7', username: 'jordan' },
    profile: { lastModule: 'timetables' }
  }));
  await accounts.initialize();

  assert.equal(accounts.getActiveProfile().lastModule, 'timetables');
  assert.equal(accounts.normalizeProfile({ lastModule: '/private/path' }).lastModule, null);
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