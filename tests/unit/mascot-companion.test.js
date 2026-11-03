const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { createBrowserContext, loadActivityEngine, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createMascotContext() {
  const dispatchedEvents = [];
  const context = createBrowserContext({
    CustomEvent: class {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
      return true;
    }
  });
  vm.runInContext('class App {}; window.app = new App();', context);
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/shared/mascot-companion.js');
  return { context, dispatchedEvents };
}

test('provides guidance for known pages and a safe default for new pages', () => {
  const { context } = createMascotContext();

  assert.match(context.MascotCompanion.guidanceForPage('science-lab').title, /Science Lab/);
  assert.match(context.MascotCompanion.guidanceForPage('future-page').instructions, /one step at a time/);
});

test('rejects hints that contain an answer while allowing non-revealing clues', () => {
  const { context } = createMascotContext();

  assert.equal(context.MascotCompanion.hintRevealsAnswer(
    { answer: 'Mercury' },
    'Look for the planet closest to the Sun.'
  ), false);
  assert.equal(context.MascotCompanion.hintRevealsAnswer(
    { answer: 'Mercury' },
    'The answer is Mercury.'
  ), true);
  assert.equal(context.MascotCompanion.hintRevealsAnswer(
    { answer: 1, options: ['Venus', 'Mercury'] },
    'Mercury is shown in this clue.'
  ), true);
});

test('emits one completion event and clears the active activity reference', () => {
  const { context, dispatchedEvents } = createMascotContext();
  const engine = new context.ActivityEngine().startQuiz({
    id: 'mascot-quiz',
    title: 'Mascot Quiz',
    subject: 'Science',
    questions: [{
      id: 'question-1',
      prompt: 'Choose a planet.',
      options: ['Earth', 'Mars'],
      answer: 'Earth'
    }],
    settings: { trackProgress: false }
  });

  assert.equal(context.activeActivityEngine, engine);
  assert.equal(engine.submitAnswer('Earth'), true);
  assert.equal(engine.nextQuestion(), false);
  assert.equal(engine.status, 'complete');
  assert.equal(context.activeActivityEngine, null);
  assert.equal(dispatchedEvents.length, 1);
  assert.equal(dispatchedEvents[0].type, 'raven-llama:activity-completed');
  assert.deepEqual(JSON.parse(JSON.stringify(dispatchedEvents[0].detail)), {
    id: 'mascot-quiz',
    title: 'Mascot Quiz',
    score: 1
  });
  assert.equal(engine.complete(), false);
  assert.equal(dispatchedEvents.length, 1);
});

test('clears the active activity reference when an activity is cancelled', () => {
  const { context, dispatchedEvents } = createMascotContext();
  const engine = new context.ActivityEngine().startQuiz({
    id: 'mascot-cancel',
    title: 'Cancelable Quiz',
    subject: 'Science',
    questions: [{ id: 'question-1', prompt: 'Choose.', answer: 'yes' }],
    settings: { trackProgress: false }
  });

  assert.equal(engine.cancel(), true);
  assert.equal(context.activeActivityEngine, null);
  assert.equal(dispatchedEvents.length, 0);
});
