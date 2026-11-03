const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createQuestContext() {
  const context = createBrowserContext();
  context.App = function App() {};
  context.app = new context.App();
  context.ProfileManager = {
    currentProfile: { id: 'guest', questProgress: {} },
    getActiveProfile() {
      return this.currentProfile;
    },
    updateProfile(profile) {
      this.currentProfile = profile;
      return Promise.resolve(false);
    }
  };
  loadBrowserScripts(
    context,
    'public/js/shared/achievement-badges.js',
    'public/js/shared/daily-challenges.js'
  );
  for (const method of [
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
  loadBrowserScripts(context, 'public/js/learning/quests.js');
  return context;
}

test('quest catalog has unique IDs, ordered steps, supported activities, and unique badge rewards', () => {
  const context = createQuestContext();
  const { catalog, validateCatalog } = context.LearningQuests;
  const rewardIds = new Set(context.AchievementBadges.catalog.map(badge => badge.id));

  assert.equal(catalog.length, 2);
  assert.equal(validateCatalog(catalog, id => context.DailyChallenges.getActivity(id), rewardIds), true);

  const unknownActivity = JSON.parse(JSON.stringify(catalog));
  unknownActivity[0].steps[0].activityId = 'science-not-a-real-activity';
  assert.throws(
    () => validateCatalog(unknownActivity, id => context.DailyChallenges.getActivity(id), rewardIds),
    /unsupported step/i
  );

  const duplicateStep = JSON.parse(JSON.stringify(catalog));
  duplicateStep[0].steps[1].id = duplicateStep[0].steps[0].id;
  assert.throws(
    () => validateCatalog(duplicateStep, id => context.DailyChallenges.getActivity(id), rewardIds),
    /unsupported step/i
  );
});

test('quest progression accepts only the next step and cannot be duplicated or reordered', () => {
  const { LearningQuests } = createQuestContext();
  const quest = LearningQuests.catalog[0];
  const [first, second] = quest.steps;

  const skipped = LearningQuests.advanceProgress({}, quest.id, second.id);
  assert.equal(skipped.changed, false);
  assert.deepEqual(JSON.parse(JSON.stringify(skipped.progress)), {});

  const started = LearningQuests.advanceProgress({}, quest.id, first.id);
  assert.equal(started.changed, true);
  assert.deepEqual(JSON.parse(JSON.stringify(started.progress[quest.id].completedStepIds)), [first.id]);
  assert.equal(LearningQuests.advanceProgress(started.progress, quest.id, first.id).changed, false);

  const completed = LearningQuests.advanceProgress(started.progress, quest.id, second.id);
  assert.equal(completed.changed, true);
  assert.equal(completed.completed, true);
  assert.deepEqual(JSON.parse(JSON.stringify(completed.progress[quest.id].completedStepIds)), [first.id, second.id]);
  assert.equal(LearningQuests.advanceProgress(completed.progress, quest.id, first.id).changed, false);
});

test('only the launched activity can advance a quest and each completion is recorded once', () => {
  const context = createQuestContext();
  const quest = context.LearningQuests.catalog[0];
  const [first, second] = quest.steps;

  assert.equal(context.app.startLearningQuestStep(quest.id), true);
  assert.equal(context.app.lastLaunch.method, 'startSolarSystemActivity');
  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: second.activityId } }), false);
  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: first.activityId } }), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.ProfileManager.currentProfile.questProgress[quest.id].completedStepIds)),
    [first.id]
  );

  assert.equal(context.app.startLearningQuestStep(quest.id), true);
  assert.equal(context.app.lastLaunch.method, 'startPlantLifeCycleActivity');
  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: first.activityId } }), false);
  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: second.activityId } }), true);
  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: second.activityId } }), false);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.ProfileManager.currentProfile.questProgress[quest.id].completedStepIds)),
    [first.id, second.id]
  );
  assert.equal(context.app.startLearningQuestStep(quest.id), false);
});

test('quest completion cannot be saved to a different profile than the one that started it', () => {
  const context = createQuestContext();
  const quest = context.LearningQuests.catalog[0];
  const first = quest.steps[0];

  assert.equal(context.app.startLearningQuestStep(quest.id), true);
  context.ProfileManager.currentProfile = { id: 'another-account', questProgress: {} };

  assert.equal(context.app.recordLearningQuestCompletion({ detail: { id: first.activityId } }), false);
  assert.deepEqual(context.ProfileManager.currentProfile.questProgress, {});
});
