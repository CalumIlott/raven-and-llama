const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createBrainPowerContext() {
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
  context.eval('class App { updateHeader() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/brain-power/brain-power.js');
  return context;
}

test('pattern rounds use one answer and follow their stated number rules', () => {
  const context = createBrainPowerContext();
  const valid = context.eval('validateBrainPowerPatternRounds()');
  const rounds = Array.from(context.eval('BRAIN_POWER_PATTERN_ROUNDS'));

  assert.equal(valid, true);
  assert.equal(context.eval(`validateBrainPowerMemoryPairs()`), true);
  for (const round of rounds) {
    const values = context.eval(`getBrainPowerPatternValues(BRAIN_POWER_PATTERN_ROUNDS.find(item => item.id === '${round.id}'))`);
    const expected = round.start + round.step * round.missingIndex;
    assert.equal(values.answer, expected);
    assert.equal(values.sequence.filter(value => value === null).length, 1);
    assert.equal(round.options.filter(value => value === expected).length, 1);
  }
  assert.equal(context.eval(`validateBrainPowerPatternRounds([{
    ...BRAIN_POWER_PATTERN_ROUNDS[0],
    options: [10, 10, 12]
  }])`), false);
  assert.equal(context.eval(`validateBrainPowerMemoryPairs([
    ...BRAIN_POWER_MEMORY_PAIRS,
    BRAIN_POWER_MEMORY_PAIRS[0]
  ])`), false);
});

test('Memory Match is deterministic and prevents selecting matched cards again', () => {
  const context = createBrainPowerContext();
  const cards = Array.from(context.eval('createBrainPowerMemoryCards(7)'), card => card.id);
  const repeatedCards = Array.from(context.eval('createBrainPowerMemoryCards(7)'), card => card.id);
  let state = context.eval('createBrainPowerMemoryState(7)');

  assert.deepEqual(cards, repeatedCards);
  for (const pair of Array.from(context.eval('BRAIN_POWER_MEMORY_PAIRS'))) {
    state = context.eval(`selectBrainPowerMemoryCard(
      ${JSON.stringify(state)},
      '${pair.id}-symbol'
    )`);
    state = context.eval(`selectBrainPowerMemoryCard(
      ${JSON.stringify(state)},
      '${pair.id}-word'
    )`);
  }
  assert.equal(state.matchedPairIds.length, 4);
  assert.equal(state.selectedCardIds.length, 0);

  const afterMatchedSelection = context.eval(`selectBrainPowerMemoryCard(
    ${JSON.stringify(state)},
    'sun-symbol'
  )`);
  assert.deepEqual(Array.from(afterMatchedSelection.matchedPairIds), Array.from(state.matchedPairIds));
  assert.match(afterMatchedSelection.message, /already matched/);
});

test('Code Breaker clues have one solution and duplicate colors are counted only once', () => {
  const context = createBrainPowerContext();
  assert.equal(context.eval('validateBrainPowerCodePuzzle()'), true);

  const duplicateFeedback = context.eval(`getBrainPowerCodeFeedback(
    ['ruby', 'ruby', 'sapphire'],
    ['sapphire', 'sapphire', 'ruby']
  )`);
  assert.deepEqual({ ...duplicateFeedback }, { exact: 0, misplaced: 2 });
});

test('all three Brain Power activities record completion through ActivityEngine once', () => {
  const context = createBrainPowerContext();
  const app = context.app;

  app.startBrainPowerPattern();
  assert.equal(app.brainPowerPatternEngine.definition.id, 'brain-power-pattern-recognition');
  for (const round of Array.from(context.eval('BRAIN_POWER_PATTERN_ROUNDS'))) {
    assert.equal(app.submitBrainPowerPatternAnswer(round.start + round.step * round.missingIndex), true);
  }
  assert.equal(app.brainPowerPatternEngine.status, 'complete');
  assert.equal(app.submitBrainPowerPatternAnswer(10), false);
  assert.equal(context.activityScores.length, 1);

  app.startBrainPowerMemoryMatch();
  for (const pair of Array.from(context.eval('BRAIN_POWER_MEMORY_PAIRS'))) {
    app.selectBrainPowerMemoryCard(`${pair.id}-symbol`);
    app.selectBrainPowerMemoryCard(`${pair.id}-word`);
  }
  assert.equal(app.brainPowerMemoryEngine.definition.id, 'brain-power-memory-match');
  assert.equal(app.brainPowerMemoryEngine.status, 'complete');
  assert.equal(context.activityScores.length, 2);

  app.startBrainPowerCodeBreaker();
  ['ruby', 'sapphire', 'emerald'].forEach((color, index) => {
    assert.equal(app.selectBrainPowerCodeColor(index, color), true);
  });
  assert.equal(app.submitBrainPowerCodeGuess(), true);
  assert.equal(app.brainPowerCodeEngine.definition.id, 'brain-power-code-breaker');
  assert.equal(app.brainPowerCodeEngine.definition.skillId, 'logic_code_breaker');
  assert.equal(app.brainPowerCodeEngine.status, 'complete');
  assert.equal(app.submitBrainPowerCodeGuess(), false);
  assert.equal(context.activityScores.length, 3);
  assert.ok(context.activityScores.every(([definition]) => definition.settings.trackProgress));
});
