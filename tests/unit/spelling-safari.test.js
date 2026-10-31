const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadSafari() {
  const context = createBrowserContext();
  context.App = class {};
  return loadBrowserScripts(context, 'public/js/spelling/safari.js');
}

test('Spelling Safari activities have unique ids and enough questions for a full round', () => {
  const context = loadSafari();
  const activities = context.SpellingSafari.getActivities();

  assert.equal(activities.length, 4);
  assert.equal(new Set(Array.from(activities, activity => activity.id)).size, activities.length);
  assert.ok(activities.every(activity => activity.questions.length >= 6));
});

test('Phonics Trail identifies chick as a young bird', () => {
  const context = loadSafari();
  const activity = context.SpellingSafari.getActivity('phonics-trail');
  const question = activity.questions.find(item => item.prompt === 'ch_ck');

  assert.equal(question.hint, 'A young bird.');
  assert.equal(question.answer, 'i');
});

test('each activity generates six unique answerable questions', () => {
  const context = loadSafari();

  for (const activity of context.SpellingSafari.getActivities()) {
    const questions = context.SpellingSafari.createQuestions(activity.id);
    assert.equal(questions.length, 6, `${activity.id} should generate six questions`);
    assert.equal(new Set(Array.from(questions, question => question.prompt || question.answer)).size, 6);

    for (const question of questions) {
      assert.equal(question.activityId, activity.id);
      assert.equal(question.type, activity.type);
      assert.ok(question.answer);
      if (question.options) assert.ok(question.options.includes(question.answer));
      if (question.type === 'scramble') {
        assert.deepEqual(
          Array.from(question.scramble).sort(),
          Array.from(question.answer).sort()
        );
        assert.notEqual(question.scramble.join(''), question.answer);
      }
    }
  }
});

test('unknown activities and invalid round counts return no questions', () => {
  const context = loadSafari();
  const safari = context.SpellingSafari;

  assert.equal(safari.getActivity('not-an-activity'), null);
  assert.deepEqual(Array.from(safari.createQuestions('not-an-activity')), []);
  assert.deepEqual(Array.from(safari.createQuestions('spelling-sprint', 0)), []);
  assert.deepEqual(Array.from(safari.createQuestions('spelling-sprint', NaN)), []);
  assert.equal(safari.createQuestions('spelling-sprint', 99).length, 8);
});
