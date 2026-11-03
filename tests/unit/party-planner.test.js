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

function exactBudgetQuantities() {
  return {
    venue: 1,
    snacks: 1,
    activity: 1,
    cake: 1,
    invitations: 2,
    decorations: 0
  };
}

test('party items use positive integer-cent prices and bounded required quantities', () => {
  const context = createPartyPlannerContext();
  const items = Array.from(context.eval('PARTY_PLANNER_ITEMS'));

  assert.equal(context.eval('validatePartyPlannerItems()'), true);
  assert.ok(items.every(item =>
    Number.isSafeInteger(item.priceCents) &&
    Number.isSafeInteger(item.maxQuantity) &&
    item.requiredQuantity <= item.maxQuantity
  ));
  assert.equal(context.eval(`validatePartyPlannerItems([
    ...PARTY_PLANNER_ITEMS,
    PARTY_PLANNER_ITEMS[0]
  ])`), false);
});

test('party plan evaluation accepts under-budget and exact-budget plans but rejects overspending', () => {
  const context = createPartyPlannerContext();
  const evaluate = quantities => context.eval(`evaluatePartyPlan(${JSON.stringify(quantities)})`);
  const exact = evaluate(exactBudgetQuantities());
  const over = evaluate({ ...exactBudgetQuantities(), invitations: 3 });
  const under = evaluate({ venue: 1, snacks: 1, activity: 1, cake: 0, invitations: 0, decorations: 0 });

  assert.deepEqual({ ...exact, missingItems: Array.from(exact.missingItems) }, {
    valid: true,
    invalidQuantities: false,
    totalCents: 10000,
    remainingCents: 0,
    overBudget: false,
    missingItems: []
  });
  assert.equal(over.totalCents, 10500);
  assert.equal(over.remainingCents, -500);
  assert.equal(over.overBudget, true);
  assert.equal(over.valid, false);
  assert.equal(under.totalCents, 6500);
  assert.equal(under.valid, true);
  assert.equal(context.eval(`evaluatePartyPlan(
    { ...createPartyPlannerQuantities(), venue: -1 }
  ).invalidQuantities`), true);
  assert.equal(context.eval(`evaluatePartyPlan(
    { ...createPartyPlannerQuantities(), invitations: 9 }
  ).invalidQuantities`), true);
  assert.deepEqual(
    Array.from(evaluate({ venue: 0, snacks: 1, activity: 1, cake: 0, invitations: 0, decorations: 0 }).missingItems),
    ['venue']
  );
});

test('quantity changes cannot cross zero or the item maximum', () => {
  const context = createPartyPlannerContext();
  const quantities = context.eval('createPartyPlannerQuantities()');
  const increased = context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, 'venue', 1)`);
  const atMax = context.eval(`changePartyPlannerQuantity(${JSON.stringify(increased)}, 'venue', 1)`);
  const decreased = context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, 'venue', -1)`);

  assert.equal(increased.venue, 1);
  assert.equal(atMax, null);
  assert.equal(decreased, null);
  assert.equal(context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, 'unknown', 1)`), null);
  assert.equal(context.eval(`changePartyPlannerQuantity(${JSON.stringify(quantities)}, 'venue', 2)`), null);
});

test('Plan a Party records a valid completed round through ActivityEngine once', () => {
  const context = createPartyPlannerContext();
  const app = context.app;

  app.startPartyPlanner();
  for (const [itemId, quantity] of Object.entries(exactBudgetQuantities())) {
    for (let count = 0; count < quantity; count++) app.adjustPartyPlannerQuantity(itemId, 1);
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
