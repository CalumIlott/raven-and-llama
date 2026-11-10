import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAccountRequest } from '../../lib/account-api.mjs';

class MemoryAccountStore {
  users = [];
  sessions = [];
  progress = new Map();

  async createUser(user) {
    if (this.users.some(candidate => candidate.username === user.username)) {
      const error = new Error('Duplicate username');
      error.code = 'USERNAME_TAKEN';
      throw error;
    }
    this.users.push({ ...user });
  }

  async findUserByUsername(username) {
    return this.users.find(user => user.username === username) || null;
  }

  async findUserById(id) {
    return this.users.find(user => user.id === id) || null;
  }

  async createSession(session) {
    this.sessions.push({ ...session });
  }

  async findSession(tokenHash, now) {
    const session = this.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > now);
    return session ? this.findUserById(session.userId) : null;
  }

  async deleteSession(tokenHash) {
    this.sessions = this.sessions.filter(session => session.tokenHash !== tokenHash);
  }

  async deleteSessionsForUser(userId) {
    this.sessions = this.sessions.filter(session => session.userId !== userId);
  }

  async updatePassword(userId, passwordHash) {
    const user = await this.findUserById(userId);
    user.passwordHash = passwordHash;
  }

  async deleteAccount(userId) {
    this.users = this.users.filter(user => user.id !== userId);
    this.progress.delete(userId);
    await this.deleteSessionsForUser(userId);
  }

  async getProgress(userId) {
    return this.progress.get(userId) || null;
  }

  async getLeaderboardProfiles() {
    return this.users
      .filter(user => this.progress.has(user.id))
      .map(user => ({ username: user.username, profile: this.progress.get(user.id) }));
  }

  async saveProgress(userId, value) {
    this.progress.set(userId, structuredClone(value));
  }
}

async function request(store, path, method = 'GET', body, cookie, origin = 'https://dojo.example') {
  const headers = { Origin: origin };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  return handleAccountRequest(new Request(`https://dojo.example${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  }), store);
}

function sessionCookie(response) {
  return response.headers.get('set-cookie').split(';', 1)[0];
}

test('registration validates input, creates a private account, and issues a secure session', async () => {
  const store = new MemoryAccountStore();
  const invalid = await request(store, '/api/auth/register', 'POST', {
    username: 'ab',
    password: 'short'
  });
  assert.equal(invalid.status, 400);

  const response = await request(store, '/api/auth/register', 'POST', {
    username: 'Jordan_1',
    password: 'long password 123'
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.user.username, 'jordan_1');
  assert.equal(result.profile.name, 'jordan_1');
  assert.equal(JSON.stringify(result).includes('passwordHash'), false);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(response.headers.get('set-cookie'), /Secure/);
  assert.notEqual(store.users[0].passwordHash, 'long password 123');

  const duplicate = await request(store, '/api/auth/register', 'POST', {
    username: 'JORDAN_1',
    password: 'long password 123'
  });
  assert.equal(duplicate.status, 409);
});

test('progress reset requires the authenticated session and preserves only account settings', async () => {
  const store = new MemoryAccountStore();
  const first = await request(store, '/api/auth/register', 'POST', {
    username: 'reset_owner',
    password: 'a secure password 123'
  });
  const firstData = await first.json();
  const firstCookie = sessionCookie(first);
  const second = await request(store, '/api/auth/register', 'POST', {
    username: 'reset_other',
    password: 'another secure password 123'
  });
  const secondCookie = sessionCookie(second);
  const saved = {
    ...firstData.profile,
    avatar: 'llama',
    theme: 'dark',
    schoolYear: 8,
    subjectYears: { maths: 4, science: 2 },
    soundEnabled: false,
    ownedCosmetics: ['sunrise-frame'],
    equippedCosmetic: 'sunrise-frame',
    stars: 45,
    skillsProgress: { green_order: { correct: 4, total: 5, bestScore: 8, timesTrained: 2, stars: 3 } },
    activityProgress: { 'science-virtual-lab': { title: 'Virtual Laboratory', subject: 'Science Lab', skillId: 'science_virtual_lab', kind: 'quiz', scoreUnit: 'questions', bestScore: 4, bestTotal: 4, correct: 4, total: 4, correctAnswers: 4, totalAnswers: 4, timesPlayed: 1 } },
    spellingLists: [{ id: 'week-one', name: 'Week One', words: ['quokka'] }],
    activityHistory: [{ date: '2026-11-10', activityId: 'science-virtual-lab', title: 'Virtual Laboratory', subject: 'Science Lab', skillId: 'science_virtual_lab', kind: 'quiz', score: 4, total: 4, correctAnswers: 4, totalAnswers: 4 }]
  };
  await store.saveProgress(firstData.user.id, saved);
  const otherData = await second.json();
  await store.saveProgress(otherData.user.id, { ...otherData.profile, stars: 9 });

  assert.equal((await request(store, '/api/progress/reset', 'POST', { confirmation: 'RESET PROGRESS' })).status, 401);
  const missingConfirmation = await request(store, '/api/progress/reset', 'POST', { confirmation: 'reset progress' }, firstCookie);
  assert.equal(missingConfirmation.status, 400);

  const reset = await request(store, '/api/progress/reset', 'POST', { confirmation: 'RESET PROGRESS' }, firstCookie);
  assert.equal(reset.status, 200);
  const resetProfile = (await reset.json()).profile;
  assert.equal(resetProfile.name, 'reset_owner');
  assert.equal(resetProfile.stars, 0);
  assert.deepEqual(resetProfile.skillsProgress, {});
  assert.deepEqual(resetProfile.activityProgress, {});
  assert.deepEqual(resetProfile.activityHistory, []);
  assert.deepEqual(resetProfile.spellingLists, []);
  assert.equal(resetProfile.avatar, 'llama');
  assert.equal(resetProfile.theme, 'dark');
  assert.equal(resetProfile.schoolYear, 8);
  assert.deepEqual(resetProfile.subjectYears, { maths: 4, science: 2 });
  assert.equal(resetProfile.soundEnabled, false);
  assert.deepEqual(resetProfile.ownedCosmetics, ['sunrise-frame']);
  assert.equal(resetProfile.equippedCosmetic, 'sunrise-frame');
  const firstRead = await request(store, '/api/progress', 'GET', undefined, firstCookie);
  const secondRead = await request(store, '/api/progress', 'GET', undefined, secondCookie);
  assert.equal((await firstRead.json()).profile.stars, 0);
  assert.equal((await secondRead.json()).profile.stars, 9);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, firstCookie)).status, 200);
});

test('rejects oversized streamed bodies without a content length', async () => {
  const store = new MemoryAccountStore();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(65536));
      controller.enqueue(new Uint8Array(65537));
      controller.close();
    }
  });
  const request = new Request('https://dojo.example/api/auth/register', {
    method: 'POST',
    headers: { Origin: 'https://dojo.example' },
    body,
    duplex: 'half'
  });

  const response = await handleAccountRequest(request, store);

  assert.equal(response.status, 413);
  assert.equal(store.users.length, 0);
});

test('accounts can only read and update their own progress', async () => {
  const store = new MemoryAccountStore();
  const first = await request(store, '/api/auth/register', 'POST', { username: 'learner_one', password: 'a secure password 123' });
  const second = await request(store, '/api/auth/register', 'POST', { username: 'learner_two', password: 'another secure pass 123' });
  const firstCookie = sessionCookie(first);
  const secondCookie = sessionCookie(second);
  const firstData = await first.json();
  const dayKey = new Date().toISOString().slice(0, 10);
  const dailyChallenges = {
    days: {
      [dayKey]: {
        activityIds: ['fraction-pizza', 'spelling-spelling-sprint'],
        completedActivityIds: ['fraction-pizza'],
        bonusAwarded: false
      }
    }
  };

  const save = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...firstData.profile,
      stars: 15,
      passedBelts: ['white'],
      schoolYear: 4,
      subjectYears: { maths: 3, science: 2, english: 0, invalid: 5 },
      spellingLists: [{ id: 'week-one', name: 'Week One', words: ['quokka', 'mother-in-law'] }],
      activeSpellingListId: 'week-one',
      endlessHighScores: { white: 8, timetables: 12, unknown: 99, yellow: '10' },
      earnedBadges: ['activity-explorer', 'unknown-badge'],
      questProgress: {
        'stellar-expedition': {
          completedStepIds: ['solar-system-order', 'plant-life-cycle-order']
        }
      },
      skillsProgress: {
        white_addition: { bestScore: 10, timesTrained: 1 }
      },
      dailyChallenges,
      activityProgress: {
        'science-water-cycle': {
          title: 'Water Cycle',
          subject: 'Science Lab',
          skillId: 'science_water_cycle',
          kind: 'quiz',
          scoreUnit: 'questions',
          bestScore: 4,
          bestTotal: 5,
          correct: 4,
          total: 5,
          correctAnswers: 4,
          totalAnswers: 5,
          timesPlayed: 1
        },
        'invalid id': { title: '<script>', subject: 'Maths', kind: 'game', bestScore: 9, timesPlayed: 1 }
      },
      activityHistory: [{
        date: dayKey,
        activityId: 'science-water-cycle',
        title: 'Water Cycle',
        subject: 'Science Lab',
        skillId: 'science_water_cycle',
        kind: 'quiz',
        score: 4,
        total: 5,
        correctAnswers: 4,
        totalAnswers: 5
      }]
    }
  }, firstCookie);
  assert.equal(save.status, 200);

  const firstRead = await request(store, '/api/progress', 'GET', undefined, firstCookie);
  const secondRead = await request(store, '/api/progress', 'GET', undefined, secondCookie);
  const firstProfile = (await firstRead.json()).profile;
  const secondProfile = (await secondRead.json()).profile;
  assert.equal(firstProfile.stars, 15);
  assert.equal(firstProfile.schoolYear, 4);
  assert.deepEqual(firstProfile.subjectYears, { maths: 3, science: 2, english: 0 });
  assert.deepEqual(firstProfile.spellingLists, [
    { id: 'week-one', name: 'Week One', words: ['quokka', 'mother-in-law'] }
  ]);
  assert.equal(firstProfile.activeSpellingListId, 'week-one');
  assert.deepEqual(firstProfile.endlessHighScores, { white: 8, timetables: 12 });
  assert.deepEqual(firstProfile.dailyChallenges, dailyChallenges);
  assert.deepEqual(firstProfile.questProgress, {
    'stellar-expedition': {
      completedStepIds: ['solar-system-order', 'plant-life-cycle-order']
    }
  });
  assert.deepEqual(firstProfile.earnedBadges, [
    'first-steps',
    'skill-master',
    'curriculum-graduate',
    'stellar-explorer'
  ]);
  assert.deepEqual(firstProfile.activityProgress, {
    'science-water-cycle': {
      title: 'Water Cycle',
      subject: 'Science Lab',
      skillId: 'science_water_cycle',
      kind: 'quiz',
      scoreUnit: 'questions',
      bestScore: 4,
      bestTotal: 5,
      correct: 4,
      total: 5,
      correctAnswers: 4,
      totalAnswers: 5,
      timesPlayed: 1
    }
  });
  assert.deepEqual(firstProfile.activityHistory, [{
    date: dayKey,
    activityId: 'science-water-cycle',
    title: 'Water Cycle',
    subject: 'Science Lab',
    skillId: 'science_water_cycle',
    kind: 'quiz',
    score: 4,
    total: 5,
    correctAnswers: 4,
    totalAnswers: 5
  }]);
  assert.equal(secondProfile.stars, 0);
  assert.equal(secondProfile.schoolYear, 3);
  assert.deepEqual(secondProfile.subjectYears, {});
  assert.deepEqual(secondProfile.spellingLists, []);
  assert.equal(secondProfile.activeSpellingListId, null);
  assert.deepEqual(secondProfile.endlessHighScores, {});
  assert.deepEqual(secondProfile.dailyChallenges, { days: {} });
  assert.deepEqual(secondProfile.questProgress, {});
  assert.deepEqual(secondProfile.earnedBadges, []);
  assert.deepEqual(secondProfile.activityProgress, {});
  assert.deepEqual(secondProfile.activityHistory, []);

  const reset = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...firstProfile,
      earnedBadges: ['activity-explorer'],
      passedBelts: [],
      skillsProgress: {},
      activityProgress: {}
    }
  }, firstCookie);
  assert.equal(reset.status, 200);
  assert.deepEqual((await reset.json()).profile.earnedBadges, [
    'first-steps',
    'skill-master',
    'curriculum-graduate',
    'stellar-explorer'
  ]);

  const anonymousRead = await request(store, '/api/progress');
  assert.equal(anonymousRead.status, 401);
  const oldList = await request(store, '/api/profiles');
  assert.equal(oldList.status, 404);
});

test('cosmetic purchases use server prices, preserve ownership, and are idempotent', async () => {
  const store = new MemoryAccountStore();
  const registration = await request(store, '/api/auth/register', 'POST', {
    username: 'cosmetic_owner',
    password: 'a secure password 123'
  });
  const account = await registration.json();
  const cookie = sessionCookie(registration);

  assert.equal((await request(store, '/api/cosmetics/purchase', 'POST', {
    cosmeticId: 'sunrise-frame'
  })).status, 401);
  assert.equal((await request(store, '/api/cosmetics/purchase', 'POST', {
    cosmeticId: 'unknown-frame'
  }, cookie)).status, 400);
  assert.equal((await request(store, '/api/cosmetics/purchase', 'POST', {
    cosmeticId: 'sunrise-frame'
  }, cookie)).status, 409);

  await store.saveProgress(account.user.id, { ...account.profile, stars: 20 });
  const purchase = await request(store, '/api/cosmetics/purchase', 'POST', {
    cosmeticId: 'sunrise-frame',
    price: 0,
    stars: 1000
  }, cookie);
  assert.equal(purchase.status, 200);
  const purchased = await purchase.json();
  assert.equal(purchased.purchased, true);
  assert.equal(purchased.profile.stars, 15);
  assert.deepEqual(purchased.profile.ownedCosmetics, ['sunrise-frame']);
  assert.equal(purchased.profile.equippedCosmetic, null);

  const retry = await request(store, '/api/cosmetics/purchase', 'POST', {
    cosmeticId: 'sunrise-frame'
  }, cookie);
  assert.equal(retry.status, 200);
  const retried = await retry.json();
  assert.equal(retried.purchased, false);
  assert.equal(retried.reason, 'already-owned');
  assert.equal(retried.profile.stars, 15);

  const forgedOwnership = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...retried.profile,
      ownedCosmetics: ['galaxy-frame'],
      equippedCosmetic: 'sunrise-frame'
    }
  }, cookie);
  assert.equal(forgedOwnership.status, 200);
  assert.deepEqual((await forgedOwnership.json()).profile.ownedCosmetics, ['sunrise-frame']);

  const equipUnowned = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...retried.profile,
      ownedCosmetics: ['galaxy-frame'],
      equippedCosmetic: 'galaxy-frame'
    }
  }, cookie);
  assert.equal(equipUnowned.status, 400);
});

test('progress rejects invalid, duplicate, and oversized spelling-list data', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', {
    username: 'spelling_owner',
    password: 'a secure password 123'
  });
  const cookie = sessionCookie(registered);
  const profile = (await registered.json()).profile;
  const validList = { id: 'week-one', name: 'Week One', words: ['quokka'] };
  const invalidLists = [
    [{ ...validList, name: '  ' }],
    [{ ...validList, words: [''] }],
    [{ ...validList, words: ['quokka', ' QUOKKA '] }],
    [{ ...validList, words: ['a'.repeat(101)] }],
    [{ ...validList, words: Array.from({ length: 51 }, (_, index) => `word-${index}`) }],
    [{ ...validList, id: 'invalid id' }],
    [{ ...validList }, { ...validList }],
    [{ ...validList, name: 'Week One' }, { ...validList, id: 'week-two', name: ' week one ' }],
    Array.from({ length: 11 }, (_, index) => ({ ...validList, id: `week-${index}`, name: `Week ${index}` }))
  ];

  for (const spellingLists of invalidLists) {
    const response = await request(store, '/api/progress', 'PUT', {
      profile: { ...profile, spellingLists, activeSpellingListId: spellingLists[0]?.id || null }
    }, cookie);
    assert.equal(response.status, 400);
  }

  const staleSelection = await request(store, '/api/progress', 'PUT', {
    profile: { ...profile, spellingLists: [validList], activeSpellingListId: 'deleted-list' }
  }, cookie);
  assert.equal(staleSelection.status, 400);
});

test('progress rejects malformed daily challenge days and completion records', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', {
    username: 'daily_owner',
    password: 'a secure password 123'
  });
  const cookie = sessionCookie(registered);
  const profile = (await registered.json()).profile;
  const dayKey = new Date().toISOString().slice(0, 10);
  const day = {
    activityIds: ['fraction-pizza', 'brain-power-pattern-recognition'],
    completedActivityIds: ['fraction-pizza'],
    bonusAwarded: false
  };
  const invalidDailyChallenges = [
    { days: { '2025-02-30': day } },
    { days: { [dayKey]: { ...day, activityIds: ['fraction-pizza', 'fraction-pizza'] } } },
    { days: { [dayKey]: { ...day, activityIds: ['unknown-activity'] } } },
    { days: { [dayKey]: { ...day, completedActivityIds: ['unknown-activity'] } } },
    { days: { [dayKey]: { ...day, bonusAwarded: true } } },
    { days: { [dayKey]: { ...day, activityIds: Array.from({ length: 5 }, (_, index) => `activity-${index}`) } } },
    {
      days: Object.fromEntries(Array.from({ length: 32 }, (_, index) => {
        const key = new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10);
        return [key, day];
      }))
    }
  ];

  for (const dailyChallenges of invalidDailyChallenges) {
    const response = await request(store, '/api/progress', 'PUT', {
      profile: { ...profile, dailyChallenges }
    }, cookie);
    assert.equal(response.status, 400);
  }
});

test('progress validates bounded activity history before account persistence', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', {
    username: 'analytics_owner',
    password: 'a secure password 123'
  });
  const cookie = sessionCookie(registered);
  const profile = (await registered.json()).profile;
  const validEntry = {
    date: new Date().toISOString().slice(0, 10),
    activityId: 'science-water-cycle',
    title: 'Water Cycle',
    subject: 'Science Lab',
    skillId: 'science_water_cycle',
    kind: 'quiz',
    score: 4,
    total: 5,
    correctAnswers: 4,
    totalAnswers: 5
  };
  const invalidHistories = [
    [{ ...validEntry, date: '2025-02-30' }],
    [{ ...validEntry, activityId: 'invalid id' }],
    [{ ...validEntry, correctAnswers: 6 }],
    [{ ...validEntry, kind: 'game' }],
    [{ ...validEntry, total: 0 }],
    Array.from({ length: 366 }, () => validEntry)
  ];

  for (const activityHistory of invalidHistories) {
    const response = await request(store, '/api/progress', 'PUT', {
      profile: { ...profile, activityHistory }
    }, cookie);
    assert.equal(response.status, 400);
  }

  const saved = await request(store, '/api/progress', 'PUT', {
    profile: { ...profile, activityHistory: [validEntry] }
  }, cookie);
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).profile.activityHistory, [validEntry]);
});

test('quest progress accepts ordered known steps and cannot be skipped or reset', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', {
    username: 'quest_owner',
    password: 'a secure password 123'
  });
  const cookie = sessionCookie(registered);
  const profile = (await registered.json()).profile;
  const partialQuestProgress = {
    'stellar-expedition': { completedStepIds: ['solar-system-order'] }
  };
  const saved = await request(store, '/api/progress', 'PUT', {
    profile: { ...profile, questProgress: partialQuestProgress }
  }, cookie);
  assert.equal(saved.status, 200);
  const savedProfile = (await saved.json()).profile;

  const invalidQuestProgress = [
    { 'unknown-quest': { completedStepIds: ['solar-system-order'] } },
    { 'stellar-expedition': { completedStepIds: ['plant-life-cycle-order'] } },
    { 'stellar-expedition': { completedStepIds: ['solar-system-order', 'solar-system-order'] } },
    { 'brain-power-trail': { completedStepIds: ['pattern-recognition', 'code-breaker'] } },
    {}
  ];
  for (const questProgress of invalidQuestProgress) {
    const response = await request(store, '/api/progress', 'PUT', {
      profile: { ...savedProfile, questProgress }
    }, cookie);
    assert.equal(response.status, 400);
  }
});

test('leaderboards expose only the top ten usernames and scoped scores', async () => {
  const store = new MemoryAccountStore();
  for (let index = 0; index < 12; index++) {
    const response = await request(store, '/api/auth/register', 'POST', {
      username: `learner_${String(index).padStart(2, '0')}`,
      password: 'a secure password 123'
    });
    const { user, profile } = await response.json();
    await store.saveProgress(user.id, {
      ...profile,
      stars: index + 1,
      skillsProgress: {
        white_addition: { bestScore: index },
        timetable_practice: { bestScore: 33 - index }
      }
    });
  }

  const overall = await request(store, '/api/leaderboards?scope=all');
  const overallData = await overall.json();
  assert.equal(overall.status, 200);
  assert.equal(overallData.entries.length, 10);
  assert.deepEqual(overallData.entries[0], { username: 'learner_11', score: 12 });
  assert.deepEqual(Object.keys(overallData.entries[0]).sort(), ['score', 'username']);

  const belt = await request(store, '/api/leaderboards?scope=belt:white');
  assert.deepEqual((await belt.json()).entries[0], { username: 'learner_10', score: 10 });
  const timesTables = await request(store, '/api/leaderboards?scope=times_tables');
  assert.deepEqual((await timesTables.json()).entries[0], { username: 'learner_00', score: 33 });
  assert.equal((await request(store, '/api/leaderboards?scope=accounts')).status, 400);
  assert.equal((await request(store, '/api/leaderboards')).status, 400);
});

test('theme and last-module preferences persist independently on each account', async () => {
  const store = new MemoryAccountStore();
  const first = await request(store, '/api/auth/register', 'POST', { username: 'theme_one', password: 'a secure password 123' });
  const second = await request(store, '/api/auth/register', 'POST', { username: 'theme_two', password: 'another secure pass 123' });
  const firstCookie = sessionCookie(first);
  const secondCookie = sessionCookie(second);
  const firstProfile = (await first.json()).profile;

  const update = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...firstProfile,
      theme: 'light',
      lastModule: 'timetables',
      schoolYear: 5,
      subjectYears: { maths: 3, science: 2 }
    }
  }, firstCookie);
  const updatedProfile = (await update.json()).profile;
  assert.equal(updatedProfile.theme, 'light');
  assert.equal(updatedProfile.lastModule, 'timetables');
  assert.equal(updatedProfile.schoolYear, 5);
  assert.deepEqual(updatedProfile.subjectYears, { maths: 3, science: 2 });

  const firstSession = await request(store, '/api/auth/session', 'GET', undefined, firstCookie);
  const secondSession = await request(store, '/api/auth/session', 'GET', undefined, secondCookie);
  const firstRestoredProfile = (await firstSession.json()).profile;
  const secondRestoredProfile = (await secondSession.json()).profile;
  assert.equal(firstRestoredProfile.theme, 'light');
  assert.equal(firstRestoredProfile.lastModule, 'timetables');
  assert.equal(firstRestoredProfile.schoolYear, 5);
  assert.deepEqual(firstRestoredProfile.subjectYears, { maths: 3, science: 2 });
  assert.equal(secondRestoredProfile.theme, 'light');
  assert.equal(secondRestoredProfile.lastModule, null);
  assert.equal(secondRestoredProfile.schoolYear, 3);
  assert.deepEqual(secondRestoredProfile.subjectYears, {});

  const invalidTheme = await request(store, '/api/progress', 'PUT', {
    profile: {
      ...firstProfile,
      theme: 'system',
      lastModule: '/private/path',
      schoolYear: 99,
      subjectYears: { maths: '2', unknown: 6 }
    }
  }, firstCookie);
  const invalidPreferenceProfile = (await invalidTheme.json()).profile;
  assert.equal(invalidPreferenceProfile.theme, 'light');
  assert.equal(invalidPreferenceProfile.lastModule, 'timetables');
  assert.equal(invalidPreferenceProfile.schoolYear, 5);
  assert.deepEqual(invalidPreferenceProfile.subjectYears, {});
});

test('login uses a generic credential error and logout revokes the session', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', { username: 'learner', password: 'correct horse battery 42' });
  const wrongPassword = await request(store, '/api/auth/login', 'POST', { username: 'learner', password: 'incorrect password' });
  const unknownUser = await request(store, '/api/auth/login', 'POST', { username: 'nobody', password: 'incorrect password' });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownUser.status, 401);
  assert.deepEqual(await wrongPassword.json(), await unknownUser.json());

  const cookie = sessionCookie(registered);
  const session = await request(store, '/api/auth/session', 'GET', undefined, cookie);
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.username, 'learner');

  const logout = await request(store, '/api/auth/logout', 'POST', {}, cookie);
  assert.equal(logout.status, 200);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, cookie)).status, 401);
});

test('password changes rotate sessions and account deletion removes private data', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', { username: 'delete_me', password: 'current password 123' });
  const cookie = sessionCookie(registered);

  const changed = await request(store, '/api/auth/password', 'POST', {
    currentPassword: 'current password 123',
    newPassword: 'replacement password 456'
  }, cookie);
  assert.equal(changed.status, 200);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, cookie)).status, 401);
  const newCookie = sessionCookie(changed);
  const login = await request(store, '/api/auth/login', 'POST', { username: 'delete_me', password: 'replacement password 456' });
  assert.equal(login.status, 200);

  const deleted = await request(store, '/api/auth/account', 'DELETE', { password: 'replacement password 456' }, sessionCookie(login));
  assert.equal(deleted.status, 200);
  assert.equal(store.users.length, 0);
  assert.equal(store.progress.size, 0);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, newCookie)).status, 401);
});

test('cross-origin state-changing requests are rejected', async () => {
  const store = new MemoryAccountStore();
  const response = await request(store, '/api/auth/register', 'POST', {
    username: 'origin_test',
    password: 'origin test password 12'
  }, undefined, 'https://attacker.example');
  assert.equal(response.status, 403);
  assert.equal(store.users.length, 0);
});

test('malformed origins are rejected without processing mutations', async () => {
  const store = new MemoryAccountStore();
  const response = await request(store, '/api/auth/register', 'POST', {
    username: 'malformed_origin',
    password: 'malformed origin test 123'
  }, undefined, 'not a valid origin');

  assert.equal(response.status, 403);
  assert.equal(store.users.length, 0);
});

test('auth rate limits reject validated attempts before account work', async () => {
  const store = new MemoryAccountStore();
  const denied = await handleAccountRequest(new Request('https://dojo.example/api/auth/register', {
    method: 'POST',
    headers: { Origin: 'https://dojo.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'rate_limited', password: 'a secure password 123' })
  }), store, { rateLimit: async () => false });

  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get('retry-after'), '60');
  assert.equal(store.users.length, 0);
});
