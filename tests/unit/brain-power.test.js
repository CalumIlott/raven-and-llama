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

function evaluateJson(context, expression) {
  return JSON.parse(JSON.stringify(context.eval(expression)));
}

test('Pattern Recognition provides 100 unique validated rounds per difficulty and samples them randomly', () => {
  const context = createBrainPowerContext();
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const rounds = evaluateJson(context, `createBrainPowerPatternRounds('${difficulty}')`);
    assert.equal(rounds.length, 100);
    assert.equal(context.eval(`validateBrainPowerPatternRounds(createBrainPowerPatternRounds('${difficulty}'))`), true);
    assert.equal(new Set(rounds.map(round => JSON.stringify([round.sequence, round.missingIndex]))).size, 100);
    for (const round of rounds) {
      const answer = round.sequence[round.missingIndex];
      const displayedSequence = evaluateJson(context, `getBrainPowerPatternValues(
        ${JSON.stringify(round)}
      )`).sequence;
      assert.equal(displayedSequence.filter(value => value === null).length, 1);
      assert.equal(round.options.filter(option => option === answer).length, 1);
      assert.equal(new Set(round.options).size, 4);
    }
  }

  const firstSample = evaluateJson(context, "selectBrainPowerPatternRounds('easy', 10, createBrainPowerRandom(12))");
  const repeatedSample = evaluateJson(context, "selectBrainPowerPatternRounds('easy', 10, createBrainPowerRandom(12))");
  const alternateSample = evaluateJson(context, "selectBrainPowerPatternRounds('easy', 10, createBrainPowerRandom(13))");
  assert.equal(firstSample.length, 10);
  assert.deepEqual(firstSample.map(round => round.id), repeatedSample.map(round => round.id));
  assert.notDeepEqual(firstSample.map(round => round.id), alternateSample.map(round => round.id));
  assert.deepEqual(
    new Set(evaluateJson(context, "createBrainPowerPatternRounds('hard').map(round => round.patternType)")),
    new Set(['interleaved-sequences', 'alternating-operations', 'fibonacci-like'])
  );
});

test('Memory Match randomizes 4, 6, or 8 pairs and prevents selecting matched cards again', () => {
  const context = createBrainPowerContext();
  assert.equal(context.eval('validateBrainPowerMemoryPairs()'), true);
  assert.equal(context.eval(`validateBrainPowerMemoryPairs([
    ...BRAIN_POWER_MEMORY_PAIRS,
    BRAIN_POWER_MEMORY_PAIRS[0]
  ])`), false);

  for (const [difficulty, pairCount] of [['easy', 4], ['medium', 6], ['hard', 8]]) {
    const cards = evaluateJson(context, `createBrainPowerMemoryCards(7, '${difficulty}')`);
    const repeatedCards = evaluateJson(context, `createBrainPowerMemoryCards(7, '${difficulty}')`);
    assert.deepEqual(cards.map(card => card.id), repeatedCards.map(card => card.id));
    assert.notDeepEqual(
      cards.map(card => card.pairId),
      evaluateJson(context, `createBrainPowerMemoryCards(8, '${difficulty}')`).map(card => card.pairId)
    );
    assert.equal(cards.length, pairCount * 2);

    let state = evaluateJson(context, `createBrainPowerMemoryState(7, '${difficulty}')`);
    const pairIds = [...new Set(state.cards.map(card => card.pairId))];
    assert.equal(pairIds.length, pairCount);
    for (const pairId of pairIds) {
      state = evaluateJson(context, `selectBrainPowerMemoryCard(
        ${JSON.stringify(state)},
        '${pairId}-symbol'
      )`);
      state = evaluateJson(context, `selectBrainPowerMemoryCard(
        ${JSON.stringify(state)},
        '${pairId}-word'
      )`);
    }
    assert.equal(state.matchedPairIds.length, pairCount);
    assert.equal(state.selectedCardIds.length, 0);

    const afterMatchedSelection = evaluateJson(context, `selectBrainPowerMemoryCard(
      ${JSON.stringify(state)},
      '${pairIds[0]}-symbol'
    )`);
    assert.deepEqual(afterMatchedSelection.matchedPairIds, state.matchedPairIds);
    assert.match(afterMatchedSelection.message, /already matched/);
  }
});

test('Code Breaker generator creates uniquely solvable puzzles with difficulty-specific colors', () => {
  const context = createBrainPowerContext();
  assert.equal(context.eval('validateBrainPowerCodePuzzle()'), true);

  for (const [difficulty, colorCount, codeLength] of [
    ['easy', 3, 3],
    ['medium', 5, 4],
    ['hard', 6, 4]
  ]) {
    const colors = evaluateJson(context, `getBrainPowerCodeColors('${difficulty}')`);
    const puzzle = evaluateJson(context, `generateBrainPowerCodePuzzle(
      '${difficulty}',
      createBrainPowerRandom(27)
    )`);
    assert.equal(colors.length, colorCount);
    assert.equal(puzzle.length, codeLength);
    assert.equal(context.eval(`validateBrainPowerCodePuzzle(
      ${JSON.stringify(puzzle)},
      ${JSON.stringify(colors)}
    )`), true);
    assert.ok(puzzle.clues.every(clue =>
      JSON.stringify(clue.guess) !== JSON.stringify(puzzle.solution)));
  }
  const easyPuzzles = Array.from({ length: 100 }, (_, seed) =>
    evaluateJson(context, `generateBrainPowerCodePuzzle('easy', createBrainPowerRandom(${seed + 1}))`)
  );
  assert.equal(new Set(easyPuzzles.map(puzzle => JSON.stringify(puzzle.clues))).size, 100);
  for (const [difficulty, seed] of [
    ['medium', 4], ['medium', 18], ['medium', 39],
    ['hard', 4], ['hard', 18], ['hard', 39]
  ]) {
    const puzzle = evaluateJson(context, `generateBrainPowerCodePuzzle(
      '${difficulty}',
      createBrainPowerRandom(${seed})
    )`);
    const colors = evaluateJson(context, `getBrainPowerCodeColors('${difficulty}')`);
    assert.equal(context.eval(`validateBrainPowerCodePuzzle(
      ${JSON.stringify(puzzle)},
      ${JSON.stringify(colors)}
    )`), true);
  }

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
  const patternAnswers = evaluateJson(context, 'window.app.brainPowerPatternEngine.definition.questions.map(question => question.answer)');
  assert.equal(patternAnswers.length, 10);
  for (const answer of patternAnswers) {
    assert.equal(app.submitBrainPowerPatternAnswer(answer), true);
  }
  assert.equal(app.brainPowerPatternEngine.status, 'complete');
  assert.equal(app.submitBrainPowerPatternAnswer(10), false);
  assert.equal(context.activityScores.length, 1);

  app.startBrainPowerMemoryMatch('medium');
  const memoryPairIds = evaluateJson(context, 'Array.from(new Set(window.app.brainPowerMemoryGame.cards.map(card => card.pairId)))');
  for (const pairId of memoryPairIds) {
    app.selectBrainPowerMemoryCard(`${pairId}-symbol`);
    app.selectBrainPowerMemoryCard(`${pairId}-word`);
  }
  assert.equal(app.brainPowerMemoryEngine.definition.id, 'brain-power-memory-match');
  assert.equal(app.brainPowerMemoryEngine.status, 'complete');
  assert.equal(app.brainPowerMemoryEngine.definition.game.configuration.pairCount, 6);
  assert.equal(context.activityScores.length, 2);

  app.startBrainPowerCodeBreaker('easy');
  const solution = evaluateJson(context, 'window.app.brainPowerCodeGame.puzzle.solution');
  solution.forEach((color, index) => {
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
