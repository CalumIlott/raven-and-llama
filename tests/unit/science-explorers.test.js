const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createScienceContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.profile = { stars: 0 };
  context.ProfileManager = {
    getActiveProfile: () => context.profile,
    updateProfile: profile => { context.profile = profile; }
  };
  loadBrowserScripts(context, 'public/js/mathmasters/curriculum.js');
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} }; window.app = new App();');
  loadBrowserScripts(context, 'public/js/science/explorers.js');
  return context;
}

test('science missions have unique IDs and complete answer data', () => {
  const { SCIENCE_MISSIONS: missions } = createScienceContext();

  assert.equal(missions.length, 4);
  assert.equal(new Set(Array.from(missions, mission => mission.id)).size, missions.length);

  for (const mission of missions) {
    assert.ok(mission.title);
    assert.equal(mission.questions.length, 5);
    for (const question of mission.questions) {
      assert.ok(question.prompt);
      assert.ok(question.fact);
      assert.ok(question.choices.length >= 2);
      assert.ok(Number.isInteger(question.answer));
      assert.ok(question.answer >= 0 && question.answer < question.choices.length);
    }
  }
});

test('science mission scores correct answers once and awards stars on completion', () => {
  const context = createScienceContext();
  const mission = context.SCIENCE_MISSIONS[0];
  const app = context.app;

  app.showScienceExplorers();
  assert.match(context.main.innerHTML, /Choose a Mission/);
  app.startScienceMission(mission.id);

  for (const question of Array.from(mission.questions)) {
    app.answerScienceQuestion(question.answer);
    app.answerScienceQuestion(question.answer);
    app.continueScienceMission();
  }

  assert.equal(context.profile.stars, 5);
  assert.match(context.main.innerHTML, /Mission Complete!/);
  app.finishScienceMission();
  assert.equal(context.profile.stars, 5);
});
