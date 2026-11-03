const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createScienceContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.profile = { stars: 0 };
  context.activityScores = [];
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.ProfileManager = {
    getActiveProfile: () => context.profile,
    getSubjectDifficulty: () => 'medium',
    updateProfile: profile => { context.profile = profile; },
    recordActivityScore: (...score) => { context.activityScores.push(score); }
  };
  loadBrowserScripts(context, 'public/js/mathmasters/curriculum.js');
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/science/explorers.js');
  return context;
}

test('science missions have unique IDs and complete answer data', () => {
  const { SCIENCE_MISSIONS: missions } = createScienceContext();

  assert.equal(missions.length, 4);
  assert.equal(new Set(Array.from(missions, mission => mission.id)).size, missions.length);

  for (const mission of missions) {
    assert.ok(mission.title);
    assert.ok(mission.questions.length >= 100);
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

  const sessionQuestions = Array.from(app.scienceGame.mission.questions);
  assert.equal(sessionQuestions.length, 5);
  for (const question of sessionQuestions) {
    app.answerScienceQuestion(question.answer);
    app.answerScienceQuestion(question.answer);
    app.continueScienceMission();
  }

  assert.equal(context.profile.stars, 5);
  assert.equal(context.activityScores.length, 1);
  assert.equal(context.activityScores[0][0].id, `science-${mission.id}`);
  assert.equal(context.activityScores[0][1], 5);
  assert.equal(context.activityScores[0][2], 5);
  assert.match(context.main.innerHTML, /Mission Complete!/);
  app.finishScienceMission();
  assert.equal(context.profile.stars, 5);
});

test('science missions randomly select 5 questions per quiz session', () => {
  const context = createScienceContext();
  const mission = context.SCIENCE_MISSIONS[0];
  const app = context.app;

  app.startScienceMission(mission.id);
  assert.equal(app.scienceGame.mission.questions.length, 5);
  for (const q of app.scienceGame.mission.questions) {
    assert.ok(mission.questions.some(item => item.prompt === q.prompt));
  }
});

test('science missions offer three difficulty levels with increasing answer choices', () => {
  const context = createScienceContext();
  const app = context.app;
  app.showScienceExplorers();
  assert.equal((context.main.innerHTML.match(/data-action="science-start"/g) || []).length, 12);
  assert.match(context.main.innerHTML, /data-profile-recommended="true"/);

  for (const [difficulty, choiceCount] of Object.entries({ easy: 2, medium: 3, hard: 4 })) {
    app.startScienceMission(context.SCIENCE_MISSIONS[0].id, difficulty);
    assert.equal(app.scienceGame.difficulty, difficulty);
    assert.ok(app.scienceGame.mission.questions.every(question => question.choices.length === choiceCount));
    for (const question of app.scienceGame.mission.questions) {
      assert.equal(question.choices[question.answer], context.SCIENCE_MISSIONS[0].questions
        .find(item => item.prompt === question.prompt).choices[
          context.SCIENCE_MISSIONS[0].questions.find(item => item.prompt === question.prompt).answer
        ]);
    }
  }
});

test('science missions use the profile tier by default and honor an explicit difficulty choice', () => {
  const context = createScienceContext();
  const app = context.app;
  const missionId = context.SCIENCE_MISSIONS[0].id;

  app.startScienceMission(missionId);
  assert.equal(app.scienceGame.difficulty, 'medium');

  app.startScienceMission(missionId, 'hard');
  assert.equal(app.scienceGame.difficulty, 'hard');
});

test('incorrect answer does not reveal the correct answer or fact in feedback', () => {
  const context = createScienceContext();
  const mission = context.SCIENCE_MISSIONS[0];
  const app = context.app;

  app.startScienceMission(mission.id);
  const currentQuestion = app.scienceGame.mission.questions[0];
  const wrongChoice = (currentQuestion.answer + 1) % currentQuestion.choices.length;
  app.answerScienceQuestion(wrongChoice);

  assert.equal(app.scienceGame.lastAnswerCorrect, false);
  assert.match(context.main.innerHTML, /science-choice[^"]*is-incorrect/);
  assert.match(context.main.innerHTML, /Not quite! Keep exploring!/);
  assert.doesNotMatch(context.main.innerHTML, /The answer is/);
  assert.doesNotMatch(context.main.innerHTML, new RegExp(currentQuestion.fact));
  assert.match(context.main.innerHTML, /data-action="science-retry"/);

  app.retryScienceQuestion();
  assert.equal(app.scienceGame.answered, false);
  app.answerScienceQuestion(currentQuestion.answer);
  assert.equal(app.scienceGame.lastAnswerCorrect, true);
  assert.equal(app.scienceActivityEngine.score, 1);
});

test('science mission highlights the selected correct answer in green', () => {
  const context = createScienceContext();
  const app = context.app;

  app.startScienceMission(context.SCIENCE_MISSIONS[0].id);
  app.answerScienceQuestion(app.scienceGame.mission.questions[0].answer);

  assert.match(context.main.innerHTML, /science-choice[^"]*is-correct/);
});
