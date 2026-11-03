const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadActivityEngine, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadMathsActivities() {
  const elements = new Map();
  const context = createBrowserContext({
    document: {
      getElementById(id) {
        if (!elements.has(id)) {
          const classes = new Set();
          elements.set(id, {
            classList: {
              add(...names) { names.forEach(name => classes.add(name)); },
              remove(...names) { names.forEach(name => classes.delete(name)); }
            },
            classes,
            dataset: {},
            disabled: false,
            innerHTML: '',
            textContent: ''
          });
        }
        return elements.get(id);
      },
      querySelector() { return null; }
    },
    setInterval: () => 1,
    clearInterval() {}
  });
  loadBrowserScripts(context, 'public/js/mathmasters/curriculum.js', 'public/js/shared/renderers.js', 'public/js/mathmasters/generators.js');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/arcade-games.js', 'public/js/mathmasters/activities.js');
  return { context, elements };
}

test('every belt offers interactive activities and all proposed activity types are represented', () => {
  const { context } = loadMathsActivities();
  const catalog = context.MATHS_ACTIVITY_CATALOG;
  assert.deepEqual(Object.keys(catalog).sort(), ['black', 'blue', 'brown', 'green', 'platinum', 'white', 'yellow']);

  const ids = new Set(Object.values(catalog).flatMap(activities => activities.map(activity => activity.id)));
  for (const id of [
    'subitising-snap',
    'tens-mate-match',
    'partition-playground',
    'partition-puzzles',
    'balance-scales',
    'array-architect',
    'decimal-order',
    'bodmas-builder',
    'conversion-match',
    'number-models',
    'tens-frame-fill',
    'fraction-fold',
    'word-problems',
    'renaming-riddles',
    'quick-fire'
  ]) {
    assert.ok(ids.has(id), `${id} should be available from a belt`);
  }
});

test('BODMAS expression checker accepts valid 2018 expressions and rejects invalid digit sets or syntax', () => {
  const { context } = loadMathsActivities();
  const evaluate = context.MathsActivityGames.evaluateBodmasExpression;

  assert.equal(evaluate('20 - 18'), 2);
  assert.equal(evaluate('(2 + 0) * (1 + 8)'), 18);
  assert.ok(Number.isNaN(evaluate('2 + 18')));
  assert.ok(Number.isNaN(evaluate('2 + 0 + 1 + 8; alert(1)')));
  assert.ok(Number.isNaN(evaluate('2 / (1 - 1) + 8 + 0')));
});

test('Number Models reveals each numeral and uses a different value in every round', () => {
  const { context, elements } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'white', 'number-models');

  const activity = context.arcadeEngine.mathsActivity;
  const body = elements.get('ma-body');
  assert.equal(activity.targets.length, 5);
  assert.equal(new Set(activity.targets).size, activity.targets.length);
  assert.ok(activity.targets.every(target => target >= 1 && target <= 10));

  const firstTarget = activity.target;
  context.arcadeEngine.submitNumberModelStage(firstTarget);
  context.arcadeEngine.submitNumberModelStage(firstTarget);
  assert.match(body.innerHTML, new RegExp(`id="ma-number-model-value"[^>]*>${firstTarget}</p>`));
  assert.doesNotMatch(body.innerHTML, /aria-label="The numeral for this quantity">\\?</);

  context.arcadeEngine.advanceNumberModelRound();
  assert.equal(activity.round, 1);
  assert.notEqual(activity.target, firstTarget);
  assert.ok(body.innerHTML.includes('Round 2 / 5'));
});

test('Problem-Solving Steps displays the expected answer format', () => {
  const { context, elements } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'platinum', 'word-problems');

  const originalRandom = Math.random;
  let question;
  try {
    Math.random = () => 0.9;
    question = context.QuestionGenerator.genPlatinumProblemSolving();
  } finally {
    Math.random = originalRandom;
  }
  context.arcadeEngine.renderMathsQuestion(question);

  assert.match(elements.get('ma-body').innerHTML, /Answer format: Enter dollars and cents as a decimal, for example 8\.50/);
  assert.match(elements.get('ma-body').innerHTML, /aria-describedby="ma-answer-format"/);
});

test('every catalogued activity can start a validated, playable game session', () => {
  const { context, elements } = loadMathsActivities();
  context.document.getElementById('arena');
  const arena = elements.get('arena');
  assert.ok(arena);

  for (const [beltId, activities] of Object.entries(context.MATHS_ACTIVITY_CATALOG)) {
    for (const activity of activities) {
      context.arcadeEngine.startMathsActivity('arena', beltId, activity.id);

      assert.equal(context.arcadeEngine.activitySession.definition.kind, 'game', activity.id);
      assert.equal(context.arcadeEngine.activeGame, `maths-${beltId}-${activity.id}`);
      assert.ok(elements.get('ma-body').innerHTML.length > 0, `${activity.id} should render an activity`);
    }
  }
});
