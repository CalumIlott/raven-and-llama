const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createEcosystemContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {}, querySelector: () => null };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.brandWordmark = () => 'Raven & Llama';
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} navigateToPath(path) { this.lastPath = path; } }; window.app = new App();');
  loadBrowserScripts(context, 'public/js/science/ecosystem-sandbox.js');
  return context;
}

test('ecosystem sandbox defines a four-level pond food web and five-day goal', () => {
  const sandbox = createEcosystemContext().EcosystemSandbox;
  const state = sandbox.createState();

  assert.deepEqual(Array.from(sandbox.species, species => species.id), ['algae', 'tadpoles', 'fish', 'kingfishers']);
  assert.equal(sandbox.days, 5);
  assert.equal(sandbox.maxPopulation, 12);
  assert.deepEqual({ ...state.populations }, { algae: 12, tadpoles: 3, fish: 2, kingfishers: 1 });
  assert.equal(sandbox.isGoalReached(state), false);
});

test('population controls only accept known species and one-step changes within limits', () => {
  const sandbox = createEcosystemContext().EcosystemSandbox;
  const start = { algae: 12, tadpoles: 3, fish: 2, kingfishers: 1 };
  const lower = sandbox.adjustPopulation(start, 'algae', -1);

  assert.deepEqual({ ...lower }, { algae: 11, tadpoles: 3, fish: 2, kingfishers: 1 });
  assert.equal(start.algae, 12, 'adjustment returns a new population object');
  assert.equal(sandbox.adjustPopulation(start, 'algae', 1).algae, 12);
  assert.equal(sandbox.adjustPopulation({ ...start, algae: 0 }, 'algae', -1).algae, 0);
  assert.equal(sandbox.adjustPopulation(start, 'unknown', 1), null);
  assert.equal(sandbox.adjustPopulation(start, 'algae', 2), null);
});

test('one simulated day applies the documented food-web rules and stays within bounds', () => {
  const sandbox = createEcosystemContext().EcosystemSandbox;
  const firstDay = sandbox.advanceDay({ algae: 12, tadpoles: 3, fish: 2, kingfishers: 1 });

  assert.deepEqual({ ...firstDay }, { algae: 11, tadpoles: 3, fish: 2, kingfishers: 1 });
  assert.deepEqual({ ...sandbox.advanceDay(firstDay) }, { algae: 10, tadpoles: 3, fish: 2, kingfishers: 1 });
  assert.deepEqual({ ...sandbox.advanceDay({ algae: 1, tadpoles: 12, fish: 0, kingfishers: 0 }) }, {
    algae: 0, tadpoles: 12, fish: 1, kingfishers: 0
  });
  assert.equal(sandbox.advanceDay({ algae: -1, tadpoles: 0, fish: 0, kingfishers: 0 }), null);
});

test('five stable days reach the challenge goal while a collapsed group blocks it', () => {
  const context = createEcosystemContext();
  const app = context.app;
  app.showScienceEcosystemSandbox();

  assert.equal(app.currentView, 'science-ecosystem');
  assert.equal(app.lastPath, '/learning-centre/science/ecosystem');
  for (let day = 0; day < 5; day += 1) app.advanceScienceEcosystemDay();
  assert.equal(context.EcosystemSandbox.isGoalReached(app.ecosystemSandboxGame), true);
  assert.match(context.main.innerHTML, /Goal reached!/);

  app.resetScienceEcosystemSandbox();
  app.adjustScienceEcosystemPopulation('kingfishers', -1);
  for (let day = 0; day < 5; day += 1) app.advanceScienceEcosystemDay();
  assert.equal(context.EcosystemSandbox.isGoalReached(app.ecosystemSandboxGame), false);
  assert.match(context.main.innerHTML, /At least one group disappeared/);
});

test('population timeline records day changes and replaces a point after same-day adjustments', () => {
  const context = createEcosystemContext();
  const app = context.app;
  app.showScienceEcosystemSandbox();

  assert.equal(app.ecosystemSandboxGame.timeline.length, 1);
  assert.equal(app.ecosystemSandboxGame.timeline[0].populations.algae, 12);
  app.adjustScienceEcosystemPopulation('algae', -1);
  assert.equal(app.ecosystemSandboxGame.timeline.length, 1);
  assert.equal(app.ecosystemSandboxGame.timeline[0].populations.algae, 11);

  app.advanceScienceEcosystemDay();
  assert.equal(app.ecosystemSandboxGame.timeline.length, 2);
  assert.equal(app.ecosystemSandboxGame.timeline[1].day, 1);
  assert.equal(app.ecosystemSandboxGame.timeline[1].populations.algae, 10);
  app.adjustScienceEcosystemPopulation('fish', 1);
  assert.equal(app.ecosystemSandboxGame.timeline.length, 2);
  assert.equal(app.ecosystemSandboxGame.timeline[1].populations.fish, 3);
  assert.match(context.main.innerHTML, /ecosystem-timeline__point--fish[^>]*data-day="1" data-population="3"/);

  app.resetScienceEcosystemSandbox();
  assert.equal(app.ecosystemSandboxGame.timeline.length, 1);
  assert.equal(app.ecosystemSandboxGame.timeline[0].day, 0);
});
