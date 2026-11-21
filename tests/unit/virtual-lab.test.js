const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

test('guided investigation enforces prediction and addition order without duplicate rewards', () => {
  const context = createVirtualLabContext();
  const app = context.app;
  app.startVirtualLabActivity();
  assert.equal(app.advanceVirtualLabInvestigation(), false);
  app.startVirtualLabInvestigation();
  assert.equal(app.advanceVirtualLabInvestigation(), false);
  assert.equal(app.predictVirtualLabInvestigation('invalid'), false);
  assert.equal(app.predictVirtualLabInvestigation('unchanged'), true);
  assert.equal(app.advanceVirtualLabInvestigation(), true);
  assert.deepEqual(Array.from(app.virtualLabGame.slots), ['vinegar', null]);
  assert.equal(context.activityScores.length, 0);
  assert.equal(app.advanceVirtualLabInvestigation(), true);
  assert.equal(app.virtualLabGame.result.id, 'baking-soda-vinegar');
  assert.equal(app.virtualLabGame.investigation.stage, 'observe');
  assert.equal(context.activityScores.length, 1);
  assert.equal(app.advanceVirtualLabInvestigation(), false);
  app.startVirtualLabInvestigation();
  app.predictVirtualLabInvestigation('bubbles');
  app.advanceVirtualLabInvestigation();
  app.advanceVirtualLabInvestigation();
  assert.equal(context.activityScores.length, 1);
});

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

test('virtual lab exposes a valid sourced catalog of at least 15 unique simulations', () => {
  const context = createVirtualLabContext();
  const { materials, simulations, isValidCatalog, getSimulation } = context.VirtualLab;

  assert.ok(materials.length >= 10);
  assert.ok(simulations.length >= 15);
  assert.equal(new Set(materials.map(material => material.id)).size, materials.length);
  assert.equal(new Set(simulations.map(simulation => simulation.id)).size, simulations.length);
  assert.equal(isValidCatalog(materials, simulations), true);
  assert.ok(simulations.every(simulation => /^https:\/\//.test(simulation.sourceUrl)));
  assert.ok(simulations.every(simulation => simulation.sourceTitle && simulation.title && simulation.explanation));
  for (const simulation of simulations) {
    assert.equal(getSimulation(simulation.materials).id, simulation.id);
    assert.equal(getSimulation(simulation.materials.slice().reverse()).id, simulation.id);
  }
  assert.equal(getSimulation(['baking-soda', 'vinegar']).id, 'baking-soda-vinegar');
  assert.equal(getSimulation(['iron-sand-mixture', 'magnet']).id, 'iron-sand-separation');
  assert.equal(getSimulation(['salt-water', 'filter-paper']).id, 'salt-water-filtration');
  assert.equal(getSimulation(['water', 'ice']), null);
  assert.equal(getSimulation(['water', 'water']), null);
  assert.equal(getSimulation(['water', 'unknown']), null);
  assert.equal(isValidCatalog(materials, [...simulations, { ...simulations[0], id: 'duplicate-pair' }]), false);
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

test('unsupported combinations stay safe and filters isolate item categories', () => {
  const context = createVirtualLabContext();
  const app = context.app;

  app.startVirtualLabActivity();
  assert.equal(app.virtualLabActivityEngine.definition.id, 'science-virtual-lab');
  assert.equal(app.virtualLabActivityEngine.definition.skillId, 'science_virtual_lab');
  assert.match(context.main.innerHTML, /computer simulations, not real-world experiment instructions/);
  assert.equal(app.filterVirtualLabMaterials('Prepared mixture'), true);
  assert.match(context.main.innerHTML, /Iron and sand mixture/);
  assert.doesNotMatch(context.main.innerHTML, /Gentle warmth/);
  assert.equal(app.filterVirtualLabMaterials('invalid'), false);
  assert.equal(app.filterVirtualLabMaterials('all'), true);

  app.placeVirtualLabMaterial('ice', 0);
  app.placeVirtualLabMaterial('water', 1);
  assert.equal(app.runVirtualLabSimulation(), false);
  assert.equal(app.virtualLabActivityEngine.status, 'active');
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores.length, 0);
  assert.match(context.main.innerHTML, /No authored simulation for this pairing/);
  assert.match(context.main.innerHTML, /The items stay unchanged; no outcome is assumed/);
});

test('every authored simulation runs deterministically and records progress once', () => {
  const context = createVirtualLabContext();
  const app = context.app;
  app.startVirtualLabActivity();

  for (const simulation of context.VirtualLab.simulations) {
    app.resetVirtualLabWorkspace();
    app.placeVirtualLabMaterial(simulation.materials[0], 0);
    app.placeVirtualLabMaterial(simulation.materials[1], 1);
    assert.equal(app.runVirtualLabSimulation(), true, simulation.id);
    assert.equal(app.virtualLabGame.result.id, simulation.id);
    assert.equal(app.virtualLabGame.result.sourceUrl, simulation.sourceUrl);
    assert.equal(context.activityScores.length, 1);
    assert.ok(context.main.innerHTML.includes(simulation.title));
    assert.match(context.main.innerHTML, /data-virtual-lab-scene=/);
  }
  assert.equal(app.virtualLabActivityEngine.status, 'complete');
  assert.equal(context.profile.stars, 0);
  assert.equal(context.activityScores[0][0].settings.awardStars, true);
  assert.equal(context.activityScores[0][1], 4);
  assert.equal(context.activityScores[0][2], null);
  assert.equal(context.activityScores[0][0].kind, 'game');
  assert.equal(context.activityScores[0][3], null);
});

test('guided lab only places the material appropriate to the current step', () => {
  const context = createVirtualLabContext();
  const app = context.app;
  app.startVirtualLabActivity();
  app.startVirtualLabInvestigation();
  assert.equal(app.selectVirtualLabInvestigationMaterial('vinegar'), false);
  app.predictVirtualLabInvestigation('bubbles');
  assert.equal(app.placeSelectedVirtualLabInvestigationMaterial(), false);
  assert.equal(app.selectVirtualLabInvestigationMaterial('baking-soda'), false);
  assert.equal(app.selectVirtualLabInvestigationMaterial('vinegar'), true);
  assert.equal(app.placeVirtualLabInvestigationMaterial('baking-soda'), false);
  assert.equal(app.placeVirtualLabInvestigationMaterial('vinegar'), true);
  assert.equal(app.virtualLabGame.investigation.stage, 'add');
  assert.equal(app.selectVirtualLabInvestigationMaterial('vinegar'), false);
  assert.equal(app.selectVirtualLabInvestigationMaterial('baking-soda'), true);
  assert.equal(app.placeVirtualLabInvestigationMaterial('baking-soda'), true);
  assert.equal(app.virtualLabGame.investigation.stage, 'observe');
  assert.equal(app.placeVirtualLabInvestigationMaterial('baking-soda'), false);
});

test('using the step button clears any previously selected material', () => {
  const context = createVirtualLabContext();
  const app = context.app;
  app.startVirtualLabActivity();
  app.startVirtualLabInvestigation();
  app.predictVirtualLabInvestigation('bubbles');
  app.selectVirtualLabInvestigationMaterial('vinegar');
  app.advanceVirtualLabInvestigation();
  assert.equal(app.virtualLabGame.investigation.stage, 'add');
  assert.equal(app.virtualLabGame.investigation.selectedMaterial, null);
  assert.equal(app.placeSelectedVirtualLabInvestigationMaterial(), false);
});