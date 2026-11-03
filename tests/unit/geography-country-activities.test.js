const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadActivityEngine, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createGeographyActivityContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.document = {
    getElementById: id => id === 'app-main' ? context.main : null
  };
  context.activityScores = [];
  context.ProfileManager = {
    recordActivityScore: (...score) => context.activityScores.push(score)
  };
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} rememberModule(module, path) { this.rememberedModule = module; this.rememberedPath = path; } }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(
    context,
    'public/js/geography/country-data.js',
    'public/js/geography/world-map.js',
    'public/js/geography/country-activities.js'
  );
  return context;
}

test('flag and capital rounds use unique countries and unambiguous answer choices', () => {
  const context = createGeographyActivityContext();
  const countries = Array.from(context.GeographyWorld.countries);

  for (const mode of ['flags', 'capitals']) {
    const round = context.GeographyCountryActivities.generateQuestions(countries, mode, () => 0.37);
    const answerField = mode === 'flags' ? 'name' : 'capital';
    assert.equal(round.questions.length, 5);
    assert.equal(new Set(round.countryIds).size, round.countryIds.length);
    assert.equal(round.questions.length, round.countryIds.length);
    for (const [index, question] of round.questions.entries()) {
      const country = countries.find(record => record.id === round.countryIds[index]);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices.map(choice => choice.toLocaleLowerCase())).size, 4);
      assert.ok(question.answer >= 0 && question.answer < question.choices.length);
      assert.equal(question.choices[question.answer], country[answerField]);
    }
  }
});

test('incomplete and ambiguous country records are excluded from the relevant round', () => {
  const context = createGeographyActivityContext();
  const countries = [
    { id: 'first', name: 'First', flag: 'A', capital: 'Alpha' },
    { id: 'missing-flag', name: 'Second', flag: '', capital: 'Beta' },
    { id: 'ambiguous-flag', name: 'Third', flag: 'A', capital: 'Gamma' },
    { id: 'fourth', name: 'Fourth', flag: 'D', capital: 'Delta' }
  ];
  const flagRound = context.GeographyCountryActivities.generateQuestions(countries, 'flags');
  const capitalRound = context.GeographyCountryActivities.generateQuestions(countries, 'capitals');

  assert.deepEqual(Array.from(flagRound.questions), []);
  assert.deepEqual(Array.from(capitalRound.countryIds).sort(), ['first', 'fourth', 'missing-flag', 'ambiguous-flag'].sort());
  assert.throws(
    () => context.GeographyCountryActivities.generateQuestions(countries, 'unknown'),
    /Unknown geography activity mode/
  );
});

test('both activities support retries and record completed rounds once', () => {
  const context = createGeographyActivityContext();
  const app = context.app;
  const activities = [
    {
      start: () => app.startGeographyFlagDetective(),
      id: 'geography-flag-detective',
      path: '/learning-centre/geography/flag-detective'
    },
    {
      start: () => app.startGeographyCapitalCities(),
      id: 'geography-capital-cities',
      path: '/learning-centre/geography/capital-cities'
    }
  ];

  for (const [activityIndex, activity] of activities.entries()) {
    assert.equal(activity.start(), true);
    assert.equal(app.rememberedPath, activity.path);
    const engine = app.geographyCountryQuizEngine;
    assert.equal(engine.definition.id, activity.id);

    while (engine.status === 'active') {
      const answer = engine.currentQuestion.answer;
      const wrongAnswer = (answer + 1) % engine.currentQuestion.choices.length;
      assert.equal(app.answerGeographyCountryQuestion(wrongAnswer), false);
      assert.equal(engine.answered, true);
      assert.equal(app.retryGeographyCountryQuestion(), true);
      assert.equal(engine.answered, false);
      assert.equal(app.answerGeographyCountryQuestion(answer), true);
      app.advanceGeographyCountryQuestion();
    }

    assert.equal(engine.status, 'complete');
    assert.equal(engine.score, 5);
    assert.equal(engine.progressRecorded, true);
    assert.equal(context.activityScores.length, activityIndex + 1);
    assert.equal(app.advanceGeographyCountryQuestion(), false);
    assert.equal(context.activityScores.length, activityIndex + 1);
  }
});
