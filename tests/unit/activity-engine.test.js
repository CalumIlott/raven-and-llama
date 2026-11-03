const test = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createEngineContext(overrides = {}) {
  const context = createBrowserContext(overrides);
  loadBrowserScripts(context, 'public/js/vendor/activity-validator.js', 'public/js/shared/activity-engine.js');
  return context;
}

const quizDefinition = {
  version: 1,
  kind: 'quiz',
  id: 'science-basics',
  title: 'Science Basics',
  subject: 'Science',
  settings: { maxHintsPerQuestion: 1, trackProgress: true },
  questions: [
    { id: 'q1', type: 'choice', prompt: 'Choose one', answer: 2, options: [1, 2], hint: 'Think carefully.' },
    { id: 'q2', type: 'order', correctOrder: ['a', 'b'] }
  ]
};

const gameDefinition = {
  version: 1,
  kind: 'game',
  id: 'balloon-pop',
  title: 'Balloon Pop',
  subject: 'Maths',
  settings: { trackProgress: true },
  game: { adapter: 'arcade', gameId: 'balloon-pop', scoreUnit: 'points' }
};

test('validates definitions for quizzes and arcade games', () => {
  const context = createEngineContext();
  const engine = new context.ActivityEngine();

  assert.equal(engine.start(quizDefinition), engine);
  assert.equal(engine.start(gameDefinition).definition.kind, 'game');
});

test('rejects invalid and ambiguous activity definitions', () => {
  const context = createEngineContext();
  const engine = new context.ActivityEngine();

  assert.throws(() => engine.start({ ...quizDefinition, questions: [] }), /Invalid activity definition/);
  assert.throws(() => engine.start({ ...quizDefinition, game: gameDefinition.game }), /Invalid activity definition/);
});

test('validates structured worked examples and audio feedback', () => {
  const context = createEngineContext();
  const engine = new context.ActivityEngine();
  const definition = {
    ...quizDefinition,
    questions: [{
      ...quizDefinition.questions[0],
      feedback: {
        explanation: 'Read the hour hand first.',
        audioHint: 'Start with the shorter hand.',
        workedExample: {
          title: 'Read a clock',
          steps: [{ label: 'Hour', detail: 'Find the shorter hand.' }]
        }
      }
    }]
  };

  assert.equal(engine.start(definition).currentQuestion.feedback.workedExample.steps.length, 1);
  assert.throws(() => engine.start({
    ...definition,
    questions: [{
      ...definition.questions[0],
      feedback: { workedExample: { steps: [{ label: '', detail: 'Missing a step label.' }] } }
    }]
  }), /Invalid activity definition/);
});

test('tracks quiz answers, hints, question state, and completion once', () => {
  const recorded = [];
  const context = createEngineContext({ ProfileManager: {
    recordActivityScore: (...args) => recorded.push(args)
  } });
  const engine = new context.ActivityEngine().start(quizDefinition);

  assert.equal(engine.currentQuestion.id, 'q1');
  assert.equal(engine.useHint(), 'Think carefully.');
  assert.equal(engine.useHint(), null);
  assert.equal(engine.submitAnswer(1), false);
  assert.equal(engine.submitAnswer(2), null);
  assert.equal(engine.nextQuestion(), true);
  assert.equal(engine.currentQuestion.id, 'q2');
  assert.equal(engine.submitAnswer(['a', 'b']), true);
  assert.equal(engine.nextQuestion(), false);
  assert.equal(engine.status, 'complete');
  assert.equal(engine.score, 1);
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0][1], 1);
  assert.equal(recorded[0][2], 2);
});

test('tracks game points and safely completes without a question total', () => {
  const recorded = [];
  const context = createEngineContext({ ProfileManager: {
    recordActivityScore: (...args) => recorded.push(args)
  } });
  const engine = new context.ActivityEngine().start(gameDefinition);

  assert.equal(engine.addScore(12), 12);
  assert.equal(engine.deductScore(20), 0);
  assert.equal(engine.addScore(7), 7);
  assert.equal(engine.complete(), true);
  assert.equal(engine.complete(), false);
  assert.equal(recorded[0][1], 7);
  assert.equal(recorded[0][2], null);
});

test('arcade adapters send real-time score changes through ActivityEngine', () => {
  const recorded = [];
  const context = createEngineContext({
    document: { getElementById: () => null },
    ProfileManager: { recordActivityScore: (...args) => recorded.push(args) }
  });
  loadBrowserScripts(context, 'public/js/mathmasters/arcade-games.js');
  const arcade = context.arcadeEngine;

  arcade.startActivitySession('balloon-pop', 'Balloon Pop');
  arcade.addScore(10, 'score');
  arcade.deductScore(3, 'score');
  arcade.stopGame();

  assert.equal(arcade.score, 7);
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0][0].id, 'arcade-balloon-pop');
  assert.equal(recorded[0][1], 7);
  assert.equal(recorded[0][2], null);
});

test('runs an activity timer and invokes timeout once', () => {
  let intervalCallback;
  let cleared = false;
  const context = createEngineContext({
    setInterval(callback) {
      intervalCallback = callback;
      return 1;
    },
    clearInterval() {
      cleared = true;
    }
  });
  const engine = new context.ActivityEngine().start({
    ...quizDefinition,
    settings: { timeLimitSeconds: 1 }
  });
  let timeouts = 0;

  assert.equal(engine.startTimer(() => timeouts++), true);
  intervalCallback();
  if (!cleared) intervalCallback();
  assert.equal(timeouts, 1);
  assert.equal(cleared, true);
});
