const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createFoodChainsContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {}, querySelectorAll: () => [] };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.activityScores = [];
  context.ProfileManager = {
    recordActivityScore: (...score) => { context.activityScores.push(score); }
  };
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/science/food-chains.js');
  return context;
}

test('food-chain data is sourced and each consumer link points to the organism it eats', () => {
  const context = createFoodChainsContext();
  const chains = Array.from(context.FoodChains.chains);

  assert.equal(context.FoodChains.isValidData(context.FoodChains.chains), true);
  assert.equal(chains.length, 3);
  assert.ok(chains.every(chain =>
    chain.name && chain.description && chain.sourceTitle && chain.sourceUrl.startsWith('https://')
  ));
  for (const chain of chains) {
    assert.equal(chain.organisms[0].role, 'producer');
    chain.organisms.slice(1).forEach((organism, index) => {
      assert.equal(organism.foodSourceId, chain.organisms[index].id);
      assert.notEqual(organism.role, 'producer');
    });
  }

  const invalidChain = JSON.parse(JSON.stringify(chains[0]));
  invalidChain.organisms[1].foodSourceId = 'fox';
  assert.equal(context.FoodChains.isValidData([invalidChain, chains[1]]), false);
  assert.equal(context.FoodChains.isValidData([
    { ...chains[0], sourceUrl: 'http://example.test' },
    chains[1]
  ]), false);
});

test('organism shuffle preserves the chain, and placement moves without duplicates', () => {
  const context = createFoodChainsContext();
  const chain = context.FoodChains.chains[0];
  const chains = Array.from(context.FoodChains.chains);
  const shuffledChains = Array.from(context.FoodChains.shuffleChains(chains, () => 0));
  const organismIds = Array.from(chain.organisms, organism => organism.id);
  const shuffled = Array.from(
    context.FoodChains.shuffleOrganisms(chain, () => 0),
    organism => organism.id
  );
  const firstPlacement = context.FoodChains.moveOrganism(
    Array(organismIds.length).fill(null),
    chain,
    organismIds[0],
    0
  );
  const movedPlacement = context.FoodChains.moveOrganism(firstPlacement, chain, organismIds[0], 2);

  assert.notDeepEqual(shuffledChains.map(item => item.name), chains.map(item => item.name));
  assert.deepEqual([...shuffledChains].sort((a, b) => a.name.localeCompare(b.name)), [...chains].sort((a, b) => a.name.localeCompare(b.name)));
  assert.notDeepEqual(shuffled, organismIds);
  assert.deepEqual([...shuffled].sort(), [...organismIds].sort());
  assert.deepEqual(Array.from(firstPlacement), [organismIds[0], null, null]);
  assert.deepEqual(Array.from(movedPlacement), [null, null, organismIds[0]]);
  assert.equal(context.FoodChains.moveOrganism(movedPlacement, chain, 'unknown', 0), null);
  assert.equal(context.FoodChains.moveOrganism(movedPlacement, chain, organismIds[0], 3), null);
  assert.equal(context.FoodChains.isCompletePlacement(movedPlacement, chain), false);
  assert.equal(context.FoodChains.isCompletePlacement(organismIds, chain), true);
  assert.equal(context.FoodChains.isCompletePlacement([organismIds[0], organismIds[0], organismIds[2]], chain), false);
});

test('incorrect chains identify the producer-to-consumer relationship that is misplaced', () => {
  const context = createFoodChainsContext();
  const chain = context.FoodChains.chains[0];
  const mismatches = Array.from(context.FoodChains.getMismatches(
    ['rabbit', 'grass', 'fox'],
    chain
  ));

  assert.deepEqual(mismatches.map(mismatch => mismatch.position), [1, 2]);
  assert.match(mismatches[0].explanation, /Start with Grass, the producer/);
  assert.match(mismatches[1].explanation, /Rabbit comes next because it gets energy from Grass/);
});

test('Food Chains uses ActivityEngine retry and records completion once across all chains', () => {
  const context = createFoodChainsContext();
  const app = context.app;
  app.startFoodChainsActivity(() => 0);

  assert.equal(app.foodChainsActivityEngine.definition.id, 'science-food-chains');
  assert.equal(app.foodChainsActivityEngine.definition.skillId, 'science_food_chains');
  assert.notDeepEqual(
    app.foodChainsGame.chains.map(chain => chain.name),
    context.FoodChains.chains.map(chain => chain.name)
  );
  assert.equal(app.submitFoodChainAnswer(), false);
  assert.equal(app.foodChainsActivityEngine.status, 'active');

  const firstChain = app.foodChainsGame.chains[0];
  for (const [index, organism] of Array.from(firstChain.organisms).reverse().entries()) {
    app.placeFoodChainOrganism(organism.id, index);
  }
  assert.equal(app.submitFoodChainAnswer(), false);
  assert.ok(app.foodChainsGame.mismatches.length > 0);
  assert.equal(app.clearFoodChain(), true);

  for (let chainIndex = 0; chainIndex < app.foodChainsGame.chains.length; chainIndex++) {
    const chain = app.foodChainsGame.chains[chainIndex];
    for (const [positionIndex, organism] of Array.from(chain.organisms).entries()) {
      app.placeFoodChainOrganism(organism.id, positionIndex);
    }
    assert.equal(app.submitFoodChainAnswer(), true);
    if (chainIndex < app.foodChainsGame.chains.length - 1) {
      assert.equal(app.nextFoodChain(), true);
    } else {
      assert.equal(app.nextFoodChain(), true);
    }
  }

  assert.equal(app.foodChainsGame.complete, true);
  assert.equal(app.foodChainsActivityEngine.status, 'complete');
  assert.equal(app.foodChainsActivityEngine.score, 3);
  assert.equal(app.foodChainsActivityEngine.definition.settings.awardStars, true);
  assert.equal(app.foodChainsActivityEngine.progressRecorded, true);
  assert.equal(context.activityScores.length, 1);
  assert.equal(context.activityScores[0][1], 3);
  assert.equal(context.activityScores[0][2], 3);
  assert.match(context.main.innerHTML, /Food Chains Complete!/);
  assert.equal(app.submitFoodChainAnswer(), false);
  assert.equal(app.nextFoodChain(), false);
  assert.equal(context.activityScores.length, 1);
});
