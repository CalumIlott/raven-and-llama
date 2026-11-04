const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createDailyChallengesContext() {
  const context = createBrowserContext();
  context.eval = source => vm.runInContext(source, context);
  context.ProfileManager = {
    account: null,
    currentProfile: { stars: 0, dailyChallenges: { days: {} } },
    getActiveProfile() {
      return this.currentProfile;
    },
    updateProfile(profile) {
      this.currentProfile = profile;
      return Promise.resolve(true);
    }
  };
  context.eval('class App {}; window.app = new App();');
  loadBrowserScripts(context, 'public/js/shared/daily-challenges.js');

  for (const method of [
    'startFractionPizza',
    'startNumberBuilder',
    'startMissingNumber',
    'startSpellingSafari',
    'startSolarSystemActivity',
    'startPlantLifeCycleActivity',
    'startBrainPowerPattern',
    'startBrainPowerMemoryMatch',
    'startBrainPowerCodeBreaker'
  ]) {
    context.app[method] = (...args) => {
      context.app.lastLaunch = { method, args };
    };
  }
  return context;
}

test('daily challenge selection is deterministic, UTC-based, and skips empty pools', () => {
  const context = createDailyChallengesContext();
  const firstDay = new context.Date('2026-03-10T23:59:59.000Z');
  const nextDay = new context.Date('2026-03-11T00:00:00.000Z');
  const firstKey = context.DailyChallenges.getDayKey(firstDay);
  const nextKey = context.DailyChallenges.getDayKey(nextDay);
  const first = Array.from(context.DailyChallenges.selectForDate(firstKey), activity => activity.id);
  const repeated = Array.from(context.DailyChallenges.selectForDate(firstKey), activity => activity.id);
  const categories = Array.from(
    context.DailyChallenges.selectForDate(firstKey),
    activity => activity.subject
  );
  const partial = Array.from(context.DailyChallenges.selectForDate(firstKey, [
    { subject: 'Maths', activities: [] },
    { subject: 'Science', activities: [{ id: 'science-one', title: 'Science One', startMethod: 'startScience', arguments: [] }] }
  ]), activity => activity.id);

  assert.equal(firstKey, '2026-03-10');
  assert.equal(nextKey, '2026-03-11');
  assert.equal(context.DailyChallenges.isValidDayKey('2025-02-30'), false);
  assert.deepEqual(repeated, first);
  assert.equal(first.length, 4);
  assert.deepEqual(categories, ['Maths', 'Spelling', 'Science', 'Brain Power']);
  assert.deepEqual(partial, ['science-one']);
  assert.throws(() => context.DailyChallenges.selectForDate('2025-02-30'), /valid UTC day key/);
  assert.throws(() => context.DailyChallenges.selectForDate(firstKey, {}), /array/);
});

test('incomplete activity implementations do not create an impossible challenge', () => {
  const context = createDailyChallengesContext();
  for (const method of [
    'startFractionPizza',
    'startNumberBuilder',
    'startMissingNumber',
    'startSpellingSafari',
    'startSolarSystemActivity',
    'startPlantLifeCycleActivity',
    'startBrainPowerPattern',
    'startBrainPowerMemoryMatch',
    'startBrainPowerCodeBreaker'
  ]) {
    delete context.app[method];
  }

  const state = context.app.getDailyChallengeState(new context.Date('2026-03-10T12:00:00.000Z'));

  assert.deepEqual(Array.from(state.activities), []);
  assert.equal(state.bonusAwarded, false);
  assert.match(context.app.renderDailyChallenges(new context.Date('2026-03-10T12:00:00.000Z')), /No daily challenges are available/);
});

test('daily progress records partial completion and grants its bonus only once', () => {
  const context = createDailyChallengesContext();
  const date = new context.Date('2026-03-10T12:00:00.000Z');
  const activities = Array.from(context.app.getDailyChallengeState(date).activities);
  const [first, ...remaining] = activities;

  assert.equal(context.app.startDailyChallenge(first.id, date), true);
  assert.equal(context.app.lastLaunch.method, first.startMethod);
  assert.deepEqual(Array.from(context.app.lastLaunch.args), Array.from(first.arguments));
  assert.equal(context.app.startDailyChallenge('unknown-activity', date), false);

  assert.equal(context.app.recordDailyChallengeCompletion({ detail: { id: first.id } }, date), true);
  assert.equal(context.app.recordDailyChallengeCompletion({ detail: { id: first.id } }, date), false);
  let state = context.app.getDailyChallengeState(date);
  assert.equal(state.completedCount, 1);
  assert.equal(state.bonusAwarded, false);
  assert.equal(context.ProfileManager.currentProfile.stars, 0);

  for (const activity of remaining) {
    assert.equal(context.app.recordDailyChallengeCompletion({ detail: { id: activity.id } }, date), true);
  }
  state = context.app.getDailyChallengeState(date);
  assert.equal(state.completedCount, activities.length);
  assert.equal(state.bonusAwarded, true);
  assert.equal(state.bonusStars, 10);
  assert.equal(context.ProfileManager.currentProfile.stars, 10);
  assert.equal(context.app.recordDailyChallengeCompletion({ detail: { id: remaining.at(-1).id } }, date), false);
  assert.equal(context.ProfileManager.currentProfile.stars, 10);
});
