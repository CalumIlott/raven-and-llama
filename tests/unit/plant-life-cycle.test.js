const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createPlantLifeCycleContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {}, querySelectorAll: () => [] };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.profile = { stars: 0 };
  context.activityScores = [];
  context.ProfileManager = {
    getActiveProfile: () => context.profile,
    updateProfile: profile => { context.profile = profile; },
    recordActivityScore: (...score) => { context.activityScores.push(score); }
  };
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/science/plant-life-cycle.js');
  return context;
}

function placeSequence(app, sequence) {
  sequence.forEach((stageId, index) => {
    assert.equal(app.placePlantLifeCycleStage(stageId, index), true);
  });
}

test('plant life cycle stages and activity use a stable science skill mapping', () => {
  const context = createPlantLifeCycleContext();
  const stages = Array.from(context.eval('PLANT_LIFE_CYCLE_STAGES'));

  assert.deepEqual(stages.map(stage => stage.id), [
    'seed',
    'germination',
    'seedling',
    'mature-flowering-plant',
    'fruit-and-seed-production',
    'seed-dispersal'
  ]);
  assert.equal(context.eval('PLANT_LIFE_CYCLE_SKILL_ID'), 'science_plant_life_cycle');
  assert.ok(stages.every(stage => stage.name && stage.summary && stage.fact));

  const app = context.app;
  app.startPlantLifeCycleActivity();
  assert.equal(app.plantLifeCycleActivityEngine.definition.id, 'science-plant-life-cycle-order');
  assert.equal(app.plantLifeCycleActivityEngine.definition.skillId, 'science_plant_life_cycle');
  assert.deepEqual(
    Array.from(app.plantLifeCycleGame.stageTray, stage => stage.id).sort(),
    stages.map(stage => stage.id).sort()
  );
});

test('placing a stage moves it without mutating placements or accepting invalid input', () => {
  const context = createPlantLifeCycleContext();
  const empty = Array(6).fill(null);
  const firstPlacement = context.placePlantLifeCycleStage(empty, 'seed', 0);
  const movedPlacement = context.placePlantLifeCycleStage(firstPlacement, 'seed', 3);

  assert.deepEqual(Array.from(firstPlacement), ['seed', null, null, null, null, null]);
  assert.deepEqual(Array.from(movedPlacement), [null, null, null, 'seed', null, null]);
  assert.deepEqual(empty, Array(6).fill(null));
  assert.equal(context.placePlantLifeCycleStage(movedPlacement, 'unknown', 0), null);
  assert.equal(context.placePlantLifeCycleStage(movedPlacement, 'seed', 6), null);
});

test('incomplete and duplicate stage sequences cannot be submitted as complete', () => {
  const context = createPlantLifeCycleContext();

  assert.equal(context.isCompletePlantLifeCyclePlacement(Array(6).fill(null)), false);
  assert.equal(context.isCompletePlantLifeCyclePlacement([
    'seed', 'seed', 'seedling', 'mature-flowering-plant', 'fruit-and-seed-production', 'seed-dispersal'
  ]), false);
  assert.equal(context.isCompletePlantLifeCyclePlacement([
    'seed', 'germination', 'seedling', 'mature-flowering-plant', 'fruit-and-seed-production', 'seed-dispersal'
  ]), true);
});

test('incorrect sequences give stage-relationship feedback and correct retries earn progress once', () => {
  const context = createPlantLifeCycleContext();
  const app = context.app;

  app.startPlantLifeCycleActivity();
  assert.equal(app.submitPlantLifeCycleAnswer(), false);
  assert.equal(app.plantLifeCycleActivityEngine.status, 'active');

  placeSequence(app, [
    'seedling', 'seed', 'germination', 'mature-flowering-plant', 'fruit-and-seed-production', 'seed-dispersal'
  ]);
  assert.equal(app.submitPlantLifeCycleAnswer(), false);
  assert.deepEqual(
    Array.from(app.plantLifeCycleGame.mismatches, mismatch => mismatch.position),
    [1, 2, 3]
  );
  assert.match(context.main.innerHTML, /After seed dispersal, a new cycle begins with Seed/);
  assert.match(context.main.innerHTML, /After Seed, Germination comes next/);
  assert.match(context.main.innerHTML, /After Germination, Seedling comes next, not Germination/);
  assert.equal(app.plantLifeCycleActivityEngine.status, 'active');

  app.placePlantLifeCycleStage('seed', 0);
  app.placePlantLifeCycleStage('germination', 1);
  app.placePlantLifeCycleStage('seedling', 2);
  assert.equal(app.submitPlantLifeCycleAnswer(), true);
  assert.equal(app.plantLifeCycleActivityEngine.status, 'complete');
  assert.equal(app.plantLifeCycleActivityEngine.score, 6);
  assert.equal(app.plantLifeCycleActivityEngine.definition.settings.awardStars, true);
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores.length, 1);
  assert.equal(context.activityScores[0][0].settings.awardStars, true);
  assert.equal(context.activityScores[0][1], 6);
  assert.equal(context.activityScores[0][2], 6);
  assert.match(context.main.innerHTML, /Plant Life Cycle Complete!/);
  assert.equal(app.submitPlantLifeCycleAnswer(), false);
  assert.equal(context.profile.stars, 0);
});
