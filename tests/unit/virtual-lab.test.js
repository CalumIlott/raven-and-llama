const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createVirtualLabContext() {
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
  context.eval('class App { updateHeader() {} navigateToPath(path) { this.path = path; } }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/science/virtual-lab.js');
  return context;
}

test('virtual lab exposes only curated deterministic simulations', () => {
  const context = createVirtualLabContext();
  const materials = Array.from(context.eval('VIRTUAL_LAB_MATERIALS'));
  const simulations = Array.from(context.eval('VIRTUAL_LAB_SIMULATIONS'));

  assert.equal(new Set(materials.map(material => material.id)).size, materials.length);
  assert.deepEqual(
    simulations.map(simulation => simulation.materials.slice().sort().join('|')).sort(),
    ['cooling|water', 'ice|warmth', 'sand|water', 'sugar|water']
  );
  assert.ok(simulations.every(simulation => simulation.id && simulation.title && simulation.explanation));
  assert.equal(context.getVirtualLabSimulation(['water', 'sugar']).id, 'sugar-dissolves');
  assert.equal(context.getVirtualLabSimulation(['sugar', 'water']).id, 'sugar-dissolves');
  assert.equal(context.getVirtualLabSimulation(['water', 'ice']), null);
  assert.equal(context.getVirtualLabSimulation(['water', 'water']), null);
  assert.equal(context.getVirtualLabSimulation(['water', 'unknown']), null);
});

test('workspace placements move items without duplicates and reject invalid input', () => {
  const context = createVirtualLabContext();
  const app = context.app;

  app.startVirtualLabActivity();
  assert.equal(app.placeVirtualLabMaterial('water', 0), true);
  assert.equal(app.placeVirtualLabMaterial('water', 1), true);
  assert.deepEqual(Array.from(app.virtualLabGame.slots), [null, 'water']);
  assert.equal(app.placeVirtualLabMaterial('unknown', 0), false);
  assert.equal(app.placeVirtualLabMaterial('water', 2), false);
  assert.equal(app.runVirtualLabSimulation(), false);
  assert.match(context.main.innerHTML, /Place two different items/);
});

test('unsupported combinations stay safe and supported simulations record progress once', () => {
  const context = createVirtualLabContext();
  const app = context.app;

  app.startVirtualLabActivity();
  assert.equal(app.virtualLabActivityEngine.definition.id, 'science-virtual-lab');
  assert.equal(app.virtualLabActivityEngine.definition.skillId, 'science_virtual_lab');
  assert.match(context.main.innerHTML, /computer simulations, not real-world experiment instructions/);

  app.placeVirtualLabMaterial('ice', 0);
  app.placeVirtualLabMaterial('water', 1);
  assert.equal(app.runVirtualLabSimulation(), false);
  assert.equal(app.virtualLabActivityEngine.status, 'active');
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores.length, 0);
  assert.match(context.main.innerHTML, /No authored simulation for this pairing/);
  assert.match(context.main.innerHTML, /The items stay unchanged; no outcome is assumed/);

  app.resetVirtualLabWorkspace();
  app.placeVirtualLabMaterial('sugar', 0);
  app.placeVirtualLabMaterial('water', 1);
  assert.equal(app.runVirtualLabSimulation(), true);
  assert.equal(app.virtualLabActivityEngine.status, 'complete');
  assert.equal(app.virtualLabActivityEngine.score, 4);
  assert.equal(app.virtualLabActivityEngine.definition.settings.awardStars, true);
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores.length, 1);
  assert.equal(context.activityScores[0][0].settings.awardStars, true);
  assert.equal(context.activityScores[0][1], 4);
  assert.equal(context.activityScores[0][2], 4);
  assert.match(context.main.innerHTML, /Sugar dissolves/);

  app.resetVirtualLabWorkspace();
  app.placeVirtualLabMaterial('ice', 0);
  app.placeVirtualLabMaterial('warmth', 1);
  assert.equal(app.runVirtualLabSimulation(), true);
  assert.equal(app.virtualLabActivityEngine.status, 'complete');
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores.length, 1);
  assert.match(context.main.innerHTML, /Ice melts/);
});
