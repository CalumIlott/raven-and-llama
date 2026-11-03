const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadMissingNumber() {
  const context = createBrowserContext({ App: class App {} });
  loadBrowserScripts(context, 'public/js/mathmasters/generators.js', 'public/js/mathmasters/world.js');
  return context;
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('Missing Number sequences use explicit rules, unique answers, and difficulty bounds', () => {
  const context = loadMissingNumber();
  const levels = toPlain(context.MissingNumber.levels);

  for (const [difficulty, level] of Object.entries(levels)) {
    const questions = toPlain(context.MissingNumber.generateQuestions(difficulty, 12));
    const operations = new Set();
    const sequenceKeys = new Set();

    assert.equal(questions.length, 12);
    for (const question of questions) {
      const { operation, ruleValue, missingIndex, values, sequenceKey } = question.data;
      operations.add(operation);
      sequenceKeys.add(sequenceKey);
      assert.equal(question.sequence.length, level.length);
      assert.equal(question.sequence.filter(value => value === null).length, 1);
      assert.equal(question.sequence[missingIndex], null);
      assert.equal(question.answer, values[missingIndex]);
      assert.ok(values.every(value => Number.isInteger(value) && value >= level.min && value <= level.max));
      assert.equal(new Set(question.options).size, 4);
      assert.equal(question.options.filter(value => value === question.answer).length, 1);
      assert.ok(question.options.every(value => value >= level.min && value <= level.max));
      assert.equal(sequenceKey, values.join(','));

      for (let index = 1; index < values.length; index++) {
        if (operation === 'add') assert.equal(values[index], values[index - 1] + ruleValue);
        if (operation === 'subtract') assert.equal(values[index], values[index - 1] - ruleValue);
        if (operation === 'multiply') assert.equal(values[index], values[index - 1] * ruleValue);
        if (operation === 'divide') assert.equal(values[index - 1], values[index] * ruleValue);
      }
      assert.match(question.prompt, /The rule is to/);
    }

    assert.equal(sequenceKeys.size, questions.length);
    assert.deepEqual(
      [...operations].sort(),
      (difficulty === 'easy' ? ['add', 'subtract'] : ['add', 'divide', 'multiply', 'subtract']).sort()
    );
  }
});

test('replaying a Missing Number round excludes the previous sequences', () => {
  const context = loadMissingNumber();
  context.Math.random = () => 0;
  const firstRound = toPlain(context.MissingNumber.generateQuestions('medium', 5));
  const replay = toPlain(context.MissingNumber.generateQuestions(
    'medium',
    5,
    firstRound.map(question => question.data.sequenceKey)
  ));

  assert.equal(new Set(firstRound.map(question => question.data.sequenceKey)).size, 5);
  assert.equal(new Set(replay.map(question => question.data.sequenceKey)).size, 5);
  assert.equal(
    replay.some(question => firstRound.some(previous => previous.data.sequenceKey === question.data.sequenceKey)),
    false
  );
});

test('Missing Number rejects unknown difficulty and invalid quiz limits', () => {
  const context = loadMissingNumber();

  assert.throws(() => context.MissingNumber.generateQuestion('unknown'), /Unknown Missing Number difficulty/);
  assert.throws(() => context.MissingNumber.generateQuestions('easy', 0), /question count must be between/);
  assert.throws(() => context.MissingNumber.generateQuestions('easy', 21), /question count must be between/);
  assert.throws(
    () => context.MissingNumber.generateQuestions('easy', 1, 'not-an-array'),
    /excluded sequence keys must be an array/
  );
});
