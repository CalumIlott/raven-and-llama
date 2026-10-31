const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadGameEngine(sessionValues = new Map()) {
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
    sessionStorage: {
      getItem(key) {
        return sessionValues.has(key) ? sessionValues.get(key) : null;
      },
      setItem(key, value) {
        sessionValues.set(key, String(value));
      },
      removeItem(key) {
        sessionValues.delete(key);
      }
    },
    app: { currentView: '', showTimesTables() {} },
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
  return { context, engine: context.gameEngine, elements, delayedCallbacks, sessionValues };
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

test('finite quiz sessions resume their saved question after reload', () => {
  const sessionValues = new Map();
  const questions = [
    { type: 'standard_choice', prompt: '2 × 2 = ?', answer: 4, options: [3, 4], timeLimitSeconds: 20 },
    { type: 'standard_choice', prompt: '3 × 3 = ?', answer: 9, options: [8, 9], timeLimitSeconds: 20 }
  ];
  const first = loadGameEngine(sessionValues);

  first.engine.startCustomQuiz('Mixed Timetables Sprint', questions, true);
  first.engine.currentIndex = 1;
  first.engine.score = 1;
  first.engine.timeLeft = 12;
  first.engine.saveSession();

  const resumed = loadGameEngine(sessionValues);
  assert.equal(resumed.engine.restoreSession(), true);
  assert.equal(resumed.engine.currentIndex, 1);
  assert.equal(resumed.engine.score, 1);
  assert.equal(resumed.engine.timeLeft, 12);
  assert.match(resumed.elements.get('game-arena').innerHTML, /3 × 3 = \?/);
  assert.equal(resumed.context.app.currentView, 'game');

  resumed.engine.exitGame();
  assert.equal(sessionValues.size, 0);
});
