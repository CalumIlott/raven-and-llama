const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadNumberBuilder() {
  const context = createBrowserContext({ App: class App {} });
  loadBrowserScripts(context, 'public/js/mathmasters/generators.js', 'public/js/mathmasters/world.js');
  return context;
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('Number Builder creates unique ascending and descending integer sequences within each range', () => {
  const context = loadNumberBuilder();
  const random = context.Math.random;

  for (const [difficulty, level] of Object.entries(context.NumberBuilder.levels)) {
    for (const [randomValue, direction] of [[0, 1], [0.999999, -1]]) {
      context.Math.random = () => randomValue;
      const question = toPlain(context.NumberBuilder.generateQuestion(difficulty, 0));
      const values = question.correctOrder;

      assert.equal(values.length, level.length);
      assert.equal(new Set(values).size, values.length);
      assert.ok(values.every(value => Number.isInteger(value) && value >= level.min && value <= level.max));
      assert.ok(values.slice(1).every((value, index) => (value - values[index]) * direction > 0));
      assert.deepEqual([...question.options].sort((a, b) => a - b), [...values].sort((a, b) => a - b));
      assert.equal(question.data.direction, direction === 1 ? 'ascending' : 'descending');
      assert.match(question.prompt, direction === 1 ? /smallest to largest/ : /largest to smallest/);
    }
  }

  context.Math.random = random;
});

test('Number Builder creates a fixed quiz with stable question IDs and validated limits', () => {
  const context = loadNumberBuilder();
  const questions = toPlain(context.NumberBuilder.generateQuestions('medium', 5));

  assert.equal(questions.length, 5);
  assert.deepEqual(questions.map(question => question.id), [
    'number-builder-q1',
    'number-builder-q2',
    'number-builder-q3',
    'number-builder-q4',
    'number-builder-q5'
  ]);
  assert.ok(questions.every(question => question.correctOrder.length === 5));
  assert.throws(() => context.NumberBuilder.generateQuestion('unknown', 0), /Unknown Number Builder difficulty/);
  assert.throws(() => context.NumberBuilder.generateQuestions('easy', 0), /question count must be between/);
  assert.throws(() => context.NumberBuilder.generateQuestions('easy', 21), /question count must be between/);
});
