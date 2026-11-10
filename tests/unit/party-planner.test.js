const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createPartyPlannerContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.document = {
    getElementById: id => id === 'app-main' ? context.main : null,
    querySelectorAll: () => []
  };
  context.activityScores = [];
  context.ProfileManager = {
    recordActivityScore: (...score) => context.activityScores.push(score)
  };
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} navigateToPath() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js', 'public/js/life-skills/party-planner.js');
  return context;
}

test('party catalog has 24 valid items across five categories and four budgeted scenarios', () => {
  const context = createPartyPlannerContext();
  const items = Array.from(context.eval('PARTY_PLANNER_ITEMS'));
  const scenarios = Array.from(context.eval('PARTY_PLANNER_SCENARIOS'));

  assert.equal(context.eval('validatePartyPlannerItems()'), true);
  assert.equal(items.length, 24);
  assert.equal(scenarios.length, 4);
  assert.deepEqual(
    [...new Set(items.map(item => item.category))].sort(),
    ['Decorations', 'Entertainment', 'Food & Drink', 'Gear', 'Venue'].sort()
  );
  assert.deepEqual(
    scenarios.map(scenario => scenario.budgetCents),
    [10000, 15000, 7500, 5000]
  );
  assert.ok(items.every(item =>
    Number.isSafeInteger(item.priceCents) &&
    Number.isSafeInteger(item.maxQuantity) &&
    item.maxQuantity > 0 && item.category
  ));
  assert.equal(context.eval(`validatePartyPlannerItems([
    ...PARTY_PLANNER_ITEMS,
    PARTY_PLANNER_ITEMS[0]
  ])`), false);
});

test('party rounds randomize the scenario, item set, and required targets', () => {
  const context = createPartyPlannerContext();
  const first = context.eval('createPartyPlannerRound(() => 0)');
  const second = context.eval('createPartyPlannerRound(() => 0.99)');

  assert.notEqual(first.scenario.id, second.scenario.id);
  for (const round of [first, second]) {
    const items = Array.from(round.items);
    assert.equal(items.length, 10);
    assert.equal(new Set(items.map(item => item.id)).size, 10);
    assert.ok(items.some(item => item.id === round.scenario.featuredItemId));
    assert.deepEqual(
      PARTY_PLANNER_CATEGORY_COUNTS(items),
      [2, 2, 2, 2, 2]
    );
    const required = items.filter(item => item.requiredQuantity > 0);
    assert.ok(required.length >= 2 && required.length <= 3);
    assert.ok(items.some(item => item.requiredQuantity === 0));
    assert.ok(required.reduce((total, item) => total + item.priceCents * item.requiredQuantity, 0) < round.scenario.budgetCents);
  }
  assert.notDeepEqual(
    Array.from(first.items, item => item.id),
    Array.from(second.items, item => item.id)
  );
  assert.throws(() => context.eval('createPartyPlannerRound(() => 1)'), /between 0 and 1/);
});

test('party plan evaluation accepts under-budget and exact-budget plans but rejects overspending', () => {
  const context = createPartyPlannerContext();
  const round = context.eval('createPartyPlannerRound(() => 0)');
  const items = Array.from(round.items);
  const quantities = Object.fromEntries(items.map(item => [item.id, item.requiredQuantity]));
  const minimumTotal = items.reduce((total, item) => total + item.priceCents * quantities[item.id], 0);
  const evaluate = (plan, budget) => context.eval(
    `evaluatePartyPlan(${JSON.stringify(plan)}, ${budget}, ${JSON.stringify(items)})`
  );
  const exact = evaluate(quantities, minimumTotal);
  const over = evaluate(quantities, Math.max(0, minimumTotal - 1));
  const under = evaluate(quantities, minimumTotal + 1);

  assert.deepEqual({ ...exact, missingItems: Array.from(exact.missingItems) }, {
    valid: true,
    invalidQuantities: false,
    totalCents: minimumTotal,
    remainingCents: 0,
    overBudget: false,
    missingItems: []
  });
  assert.equal(over.totalCents, minimumTotal);
  assert.equal(over.remainingCents, minimumTotal ? -1 : 0);
  assert.equal(over.overBudget, true);
  assert.equal(over.valid, false);
  assert.equal(under.valid, true);
  const invalidNegative = { ...quantities, [items[0].id]: -1 };
  const invalidOverMax = { ...quantities, [items[0].id]: items[0].maxQuantity + 1 };
  assert.equal(evaluate(invalidNegative, round.scenario.budgetCents).invalidQuantities, true);
  assert.equal(evaluate(invalidOverMax, round.scenario.budgetCents).invalidQuantities, true);
  assert.deepEqual(
    Array.from(evaluate(Object.fromEntries(items.map(item => [item.id, 0])), round.scenario.budgetCents).missingItems),
    items.filter(item => item.requiredQuantity > 0).map(item => item.id)
  );
});

test('quantity changes cannot cross zero or the item maximum', () => {
  const context = createPartyPlannerContext();
  const items = Array.from(context.eval('createPartyPlannerRound(() => 0).items'));
  const item = items[0];
  const quantities = context.eval(`createPartyPlannerQuantities(${JSON.stringify(items)})`);
  const increased = context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, '${item.id}', 1, ${JSON.stringify(items)})`);
  const atMax = context.eval(`changePartyPlannerQuantity(${JSON.stringify(increased)}, '${item.id}', 1, ${JSON.stringify(items)})`);
  const decreased = context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, '${item.id}', -1, ${JSON.stringify(items)})`);

  assert.equal(increased[item.id], 1);
  assert.equal(atMax, null);
  assert.equal(decreased, null);
  assert.equal(context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, 'unknown', 1, ${JSON.stringify(items)})`), null);
  assert.equal(context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, '${item.id}', 2, ${JSON.stringify(items)})`), null);
});

test('Plan a Party records a valid completed round through ActivityEngine once', () => {
  const context = createPartyPlannerContext();
  const app = context.app;

  app.startPartyPlanner(() => 0);
  for (const item of app.partyPlannerGame.items) {
    for (let count = 0; count < item.requiredQuantity; count++) {
      app.adjustPartyPlannerQuantity(item.id, 1);
    }
  }
  assert.equal(app.submitPartyPlan(), true);
  assert.equal(app.partyPlannerActivityEngine.definition.id, 'life-skills-plan-party');
  assert.equal(app.partyPlannerActivityEngine.definition.skillId, 'life_skills_budgeting');
  assert.equal(app.partyPlannerActivityEngine.status, 'complete');
  assert.equal(app.partyPlannerActivityEngine.progressRecorded, true);
  assert.equal(context.activityScores.length, 1);
  assert.equal(app.submitPartyPlan(), false);
  assert.equal(context.activityScores.length, 1);
});

function PARTY_PLANNER_CATEGORY_COUNTS(items) {
  return ['Venue', 'Food & Drink', 'Entertainment', 'Gear', 'Decorations']
    .map(category => items.filter(item => item.category === category).length);
}
