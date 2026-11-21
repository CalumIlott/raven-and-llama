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
            focusCount: 0,
            focus() { this.focusCount++; },
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

test('BODMAS Builder targets are solvable with varied 2018 expressions', () => {
  const { context } = loadMathsActivities();
  const { evaluateBodmasExpression, generateBodmasChallenge } = context.MathsActivityGames;
  const targets = new Set();

  for (let attempt = 0; attempt < 1000; attempt++) {
    const challenge = generateBodmasChallenge();
    assert.ok(Math.abs(evaluateBodmasExpression(challenge.expression) - challenge.target) < 1e-9);
    targets.add(challenge.target);
  }

  assert.ok(targets.size >= 100, 'the 2018-digit puzzle should expose at least 100 solvable targets');
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

test('Tens Frame Fill hides the selected-cell count', () => {
  const { context, elements } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'yellow', 'tens-frame-fill');

  assert.doesNotMatch(elements.get('ma-body').innerHTML, /ma-filled-count|of \d+ filled/);
});

test('Balance Scales undo restores removals and clears without crossing questions', () => {
  const { context } = loadMathsActivities();
  const engine = context.arcadeEngine;
  engine.startMathsActivity('arena', 'blue', 'balance-scales');
  const activity = engine.mathsActivity;
  assert.equal(engine.undoBalanceScaleChange(), false);
  engine.addBalanceScaleWeight(5);
  engine.addBalanceScaleWeight(-2);
  engine.removeBalanceScaleWeight(0);
  engine.undoBalanceScaleChange();
  assert.deepEqual(Array.from(activity.balanceWeights), [5, -2]);
  engine.clearBalanceScaleWeights();
  engine.undoBalanceScaleChange();
  assert.deepEqual(Array.from(activity.balanceWeights), [5, -2]);
  engine.undoBalanceScaleChange();
  assert.deepEqual(Array.from(activity.balanceWeights), [5]);
  engine.undoBalanceScaleChange();
  assert.equal(activity.balanceWeights.length, 0);
  engine.addBalanceScaleWeight(1);
  engine.renderNextMathsQuestion();
  assert.equal(activity.balanceHistory.length, 0);
  assert.equal(engine.undoBalanceScaleChange(), false);
});

test('Balance Scales builds the missing side with reusable tactile weights', () => {
  const { context, elements } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'blue', 'balance-scales');

  const activity = context.arcadeEngine.mathsActivity;
  const question = activity.question;
  const body = elements.get('ma-body');
  assert.equal(activity.balanceWeights.length, 0);
  assert.match(body.innerHTML, /balance-scale__beam--left-heavy/);
  assert.match(body.innerHTML, /data-action="arcade-balance-add" data-value="20"/);
  assert.doesNotMatch(body.innerHTML, /data-action="arcade-maths-answer"/);

  let remainder = question.answer;
  for (const value of [20, 10, 5, 2, 1]) {
    while (remainder >= value) {
      context.arcadeEngine.addBalanceScaleWeight(value);
      remainder -= value;
    }
  }
  assert.equal(remainder, 0);
  assert.equal(activity.balanceWeights.reduce((sum, value) => sum + value, 0), question.answer);
  assert.match(body.innerHTML, /balance-scale__beam--balanced/);
  assert.match(body.innerHTML, /The scale is balanced\./);

  // An overshoot can be corrected with a lifting balloon; removing it reverses the effect.
  context.arcadeEngine.addBalanceScaleWeight(2);
  assert.match(body.innerHTML, /balance-scale__beam--right-heavy/);
  context.arcadeEngine.addBalanceScaleWeight(-2);
  assert.match(body.innerHTML, /balance-scale__beam--balanced/);
  assert.match(body.innerHTML, /Remove balloon: subtract 2 units/);
  context.arcadeEngine.removeBalanceScaleWeight(activity.balanceWeights.length - 1);
  assert.match(body.innerHTML, /balance-scale__beam--right-heavy/);
  context.arcadeEngine.removeBalanceScaleWeight(activity.balanceWeights.length - 1);

  const lastWeight = activity.balanceWeights.at(-1);
  context.arcadeEngine.removeBalanceScaleWeight(activity.balanceWeights.length - 1);
  assert.match(body.innerHTML, /balance-scale__beam--left-heavy/);
  context.arcadeEngine.addBalanceScaleWeight(lastWeight);
  context.arcadeEngine.checkBalanceScale();
  assert.equal(activity.round, 1);
});

test('Conversion Match presents separate fraction, decimal, and percent cards', () => {
  const { context, elements } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'platinum', 'conversion-match');

  const html = elements.get('ma-body').innerHTML;
  for (const [side, label] of [['fraction', 'Fractions'], ['decimal', 'Decimals'], ['percent', 'Percents']]) {
    assert.match(html, new RegExp(`data-side="${side}"`));
    assert.match(html, new RegExp(`aria-label="${label}"`));
    assert.equal((html.match(new RegExp(`data-side="${side}"`, 'g')) || []).length, 5);
  }
  assert.doesNotMatch(html, /\d+\.\d+\s*=\s*\d+%/);
});

test('Conversion Match draws from more than 100 exact fraction-decimal-percent values', () => {
  const { context } = loadMathsActivities();
  const pairs = context.MathsActivityGames.createConversionPairs();
  assert.equal(pairs.length, 101);
  assert.equal(new Set(pairs.map(pair => pair.percent)).size, 101);

  for (const pair of pairs) {
    const percentage = Number(pair.percent.slice(0, -1)) / 100;
    const fractionParts = pair.fraction.split('/').map(Number);
    const fractionValue = fractionParts.length === 2 ? fractionParts[0] / fractionParts[1] : fractionParts[0];
    assert.equal(Number(pair.decimal), percentage);
    assert.equal(fractionValue, percentage);
  }
});

test('Array Architect can generate 100 different array dimensions', () => {
  const { context } = loadMathsActivities();
  context.arcadeEngine.startMathsActivity('arena', 'brown', 'array-architect');
  const dimensions = new Set();

  for (let attempt = 0; attempt < 2500; attempt++) {
    context.arcadeEngine.startArrayRound();
    const { rows, columns } = context.arcadeEngine.mathsActivity;
    dimensions.add(`${rows}x${columns}`);
  }

  assert.ok(dimensions.size >= 100, 'the expanded 2-to-11 row and column range should cover 100 arrays');
});

test('Maths activities autofocus text-entry fields', () => {
  const { context, elements } = loadMathsActivities();
  for (const [beltId, activityId, inputId] of [
    ['white', 'number-models', 'ma-stage-answer'],
    ['platinum', 'word-problems', 'ma-answer'],
    ['brown', 'array-architect', 'ma-answer'],
    ['platinum', 'bodmas-builder', 'ma-expression']
  ]) {
    const focusCount = elements.get(inputId)?.focusCount || 0;
    context.arcadeEngine.startMathsActivity('arena', beltId, activityId);
    assert.equal(elements.get(inputId).focusCount, focusCount + 1, `${activityId} should focus its input`);
  }
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
