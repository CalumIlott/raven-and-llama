const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadGameEngine() {
  const elements = new Map();
  const delayedCallbacks = [];
  const context = createBrowserContext({
    document: {
      getElementById(id) {
        if (!elements.has(id)) {
          elements.set(id, {
            classList: { add() {}, remove() {} },
            dataset: {},
            style: {},
            innerHTML: '',
            textContent: ''
          });
        }
        return elements.get(id);
      }
    },
    setInterval: () => 1,
    clearInterval() {},
    setTimeout(callback) {
      delayedCallbacks.push(callback);
      return delayedCallbacks.length;
    }
  });
  loadBrowserScripts(
    context,
    'public/js/mathmasters/curriculum.js',
    'public/js/mathmasters/generators.js',
    'public/js/mathmasters/game-engine.js'
  );
  return { context, engine: context.gameEngine, elements, delayedCallbacks };
}

test('endless timer gets shorter every five questions and stops at ten seconds', () => {
  const { engine } = loadGameEngine();

  assert.equal(engine.getEndlessTimeLimit(0), 22);
  assert.equal(engine.getEndlessTimeLimit(4), 22);
  assert.equal(engine.getEndlessTimeLimit(5), 21);
  assert.equal(engine.getEndlessTimeLimit(10), 20);
  assert.equal(engine.getEndlessTimeLimit(100), 12);
});

test('endless sessions keep generating validated questions without a fixed question count', () => {
  const { engine, elements, delayedCallbacks } = loadGameEngine();
  const makeQuestion = () => ({
    type: 'standard_choice',
    prompt: '2 + 2 = ?',
    answer: 4,
    options: [3, 4, 5, 6],
    timeLimitSeconds: 20
  });

  engine.startEndlessQuiz('White Belt Endless', makeQuestion, 'white', { beltId: 'white' });
  assert.equal(engine.totalQuestions, Infinity);
  assert.match(elements.get('game-arena').innerHTML, /Question 1 • Endless/);

  engine.evaluateAnswer(true, 4);
  delayedCallbacks.shift()();
  assert.equal(engine.endlessQuestionCount, 1);
  assert.equal(engine.score, 1);
  assert.match(elements.get('game-arena').innerHTML, /Question 2 • Endless/);
});
