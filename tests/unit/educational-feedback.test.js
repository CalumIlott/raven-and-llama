const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

test('renders escaped explanations, visual steps, audio hints, and retry actions', () => {
  const context = createBrowserContext();
  loadBrowserScripts(context, 'public/js/shared/educational-feedback.js');

  const markup = context.EducationalFeedback.render({
    id: 'question-feedback',
    correct: false,
    message: '<img src=x onerror=alert(1)>',
    explanation: 'Try a different approach.',
    workedExample: {
      title: 'A < safe example',
      steps: [{ label: 'Step 1', detail: 'Count < carefully.' }]
    },
    audioHint: 'Listen & count.',
    retryAction: 'quiz-retry',
    continueAction: 'quiz-next',
    continueLabel: 'Next'
  });

  assert.match(markup, /id="question-feedback"/);
  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(markup, /<img src=x/);
  assert.match(markup, /educational-feedback__step-number/);
  assert.match(markup, /Count &lt; carefully\./);
  assert.match(markup, /data-action="feedback-speak" data-feedback-speak="Listen &amp; count\."/);
  assert.match(markup, /data-action="quiz-retry"/);
  assert.match(markup, /data-action="quiz-next"/);
});

test('speaks audio hints or reports unavailable browser support', () => {
  const context = createBrowserContext();
  loadBrowserScripts(context, 'public/js/shared/educational-feedback.js');
  const status = { textContent: '' };

  assert.equal(context.EducationalFeedback.speak('Read the short hand.', status), false);
  assert.match(status.textContent, /not available/);

  const spoken = [];
  context.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  context.speechSynthesis = {
    cancel() {},
    speak(utterance) {
      spoken.push(utterance.text);
    }
  };

  assert.equal(context.EducationalFeedback.speak('Read the short hand.', status), true);
  assert.deepEqual(spoken, ['Read the short hand.']);
  assert.equal(status.textContent, 'Playing audio hint.');
});
