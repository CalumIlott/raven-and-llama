const assert = require('node:assert/strict');
const test = require('node:test');
const {
  createBrowserContext,
  loadActivityEngine,
  loadBrowserScripts
} = require('../helpers/load-browser-scripts');

function loadFractionPizza() {
  const context = createBrowserContext({ App: class App {} });
  loadBrowserScripts(context, 'public/js/mathmasters/generators.js');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/fraction-pizza.js');
  return context;
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('Fraction Pizza proper fractions use a valid single-pizza slice model', () => {
  const context = loadFractionPizza();
  context.Math.random = () => 0;

  for (const difficulty of ['easy', 'medium', 'hard']) {
    const question = toPlain(context.FractionPizza.generateQuestion(difficulty));
    assert.equal(question.data.mode, 'proper');
    assert.ok(question.data.numerator > 0);
    assert.ok(question.data.numerator < question.data.denominator);
    assert.equal(question.answer, question.data.numerator);
    assert.equal(question.data.pizzas, 1);
    assert.equal(question.data.targetNumerator, question.data.numerator);
    assert.equal(question.data.targetDenominator, question.data.denominator);
  }
});

test('Fraction Pizza equivalent fractions preserve the target and constructed model', () => {
  const context = loadFractionPizza();
  context.Math.random = () => 0.999999;

  for (const difficulty of ['medium', 'hard']) {
    context.Math.random = () => difficulty === 'medium' ? 0.999999 : 0.5;
    const question = toPlain(context.FractionPizza.generateQuestion(difficulty));
    const { data } = question;
    const multiplier = data.denominator / data.targetDenominator;

    assert.equal(data.mode, 'equivalent');
    assert.ok(multiplier >= 2);
    assert.equal(data.numerator, data.targetNumerator * multiplier);
    assert.equal(question.answer, data.numerator);
    assert.equal(data.pizzas, 1);
    assert.match(question.prompt, /equivalent to/);
    assert.ok(!question.prompt.includes(`${data.numerator}/${data.denominator}`));
  }
});

test('Fraction Pizza mixed numbers include complete pizzas and a proper remainder', () => {
  const context = loadFractionPizza();
  context.Math.random = () => 0.999999;
  const question = toPlain(context.FractionPizza.generateQuestion('hard'));
  const { data } = question;

  assert.equal(data.mode, 'mixed');
  assert.ok(data.whole >= 1 && data.whole <= 2);
  assert.equal(data.pizzas, data.whole + 1);
  assert.ok(data.numerator > 0 && data.numerator < data.denominator);
  assert.equal(question.answer, data.whole * data.denominator + data.numerator);
  assert.equal(data.answer, question.answer);
});

test('Fraction Pizza creates schema-valid quizzes with stable IDs and rejects invalid requests', () => {
  const context = loadFractionPizza();
  const questions = toPlain(context.FractionPizza.generateQuestions('medium', 5));

  assert.deepEqual(questions.map(question => question.id), [
    'fraction-pizza-medium-1',
    'fraction-pizza-medium-2',
    'fraction-pizza-medium-3',
    'fraction-pizza-medium-4',
    'fraction-pizza-medium-5'
  ]);
  assert.doesNotThrow(() => new context.ActivityEngine().startQuiz({
    id: 'fraction-pizza',
    title: 'Fraction Pizza',
    subject: 'Maths',
    skillId: 'brown_fraction',
    questions,
    settings: { trackProgress: true, awardStars: true }
  }));
  assert.throws(() => context.FractionPizza.generateQuestion('unknown'), /Unknown Fraction Pizza difficulty/);
  assert.throws(() => context.FractionPizza.generateQuestions('easy', 0), /question count must be between/);
  assert.throws(() => context.FractionPizza.generateQuestions('easy', 21), /question count must be between/);
});
