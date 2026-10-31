const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadProfiles() {
  const context = loadBrowserScripts(
    createBrowserContext(),
    'js/curriculum.js',
    'js/profiles.js'
  );
  return { context, profiles: context.ProfileManager };
}

test('profile normalization supplies safe defaults and resolves known avatars', () => {
  const { profiles } = loadProfiles();
  const normalized = profiles.normalizeProfile({ id: 'learner-1', avatar: 'owl' });

  assert.equal(normalized.id, 'learner-1');
  assert.equal(normalized.name, 'Profile');
  assert.equal(normalized.avatar.id, 'owl');
  assert.equal(normalized.currentBelt, 'white');
  assert.deepEqual(Array.from(normalized.passedBelts), []);
  assert.equal(Object.keys(normalized.skillsProgress).length, 0);
  assert.equal(profiles.getAvatar('unknown').id, 'raven');
  assert.equal(profiles.normalizeProfile(null), null);
});

test('training scores update totals, best score, stars, and training count', () => {
  const { profiles } = loadProfiles();
  const learner = profiles.createProfile('  Morgan  ', 'llama');

  assert.equal(learner.name, 'Morgan');
  profiles.recordTrainingScore('addition', 8, 10);
  profiles.recordTrainingScore('addition', 10, 10);

  const updated = profiles.getActiveProfile();
  const stat = updated.skillsProgress.addition;
  assert.equal(stat.correct, 18);
  assert.equal(stat.total, 20);
  assert.equal(stat.timesTrained, 2);
  assert.equal(stat.bestScore, 10);
  assert.equal(stat.stars, 3);
  assert.equal(updated.stars, 18);
});

test('deleting the active profile creates or selects a remaining profile', () => {
  const { profiles } = loadProfiles();
  const learner = profiles.createProfile('Morgan', 'owl');

  profiles.deleteProfile(learner.id);

  const remaining = profiles.loadProfiles();
  assert.equal(remaining.length, 1);
  assert.notEqual(remaining[0].id, learner.id);
  assert.equal(profiles.getActiveProfile().id, remaining[0].id);
});

test('final belt exam requires stage two and perfect mastery of every belt skill', () => {
  const { context, profiles } = loadProfiles();
  const learner = profiles.createProfile('Morgan', 'owl');

  assert.equal(profiles.canTakeFinalTest('white'), false);

  learner.stage2PassedBelts.push('white');
  learner.skillsProgress = Object.fromEntries(context.BELTS_DATA[0].skills.map(skill => [skill.id, {
    bestScore: 10,
    timesTrained: 1
  }]));
  profiles.updateProfile(learner);
  assert.equal(profiles.canTakeFinalTest('white'), true);

  learner.skillsProgress.white_subitising.bestScore = 9;
  profiles.updateProfile(learner);
  assert.equal(profiles.canTakeFinalTest('white'), false);
});

test('passing all exam stages records graduation, awards, certificate, and next belt', () => {
  const { profiles } = loadProfiles();
  profiles.createProfile('Morgan', 'owl');

  profiles.recordTestPass('white', 1, 8, 10);
  profiles.recordTestPass('white', 2, 9, 10);
  profiles.recordTestPass('white', 3, 8, 8);

  const learner = profiles.getActiveProfile();
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