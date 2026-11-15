const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function makeContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.ProfileManager = { recordActivityScore() {} };
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} rememberModule() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/history/artifact-detective.js');
  return context;
}

test('artifact cases form a small finite, sourced set with three grounded clues each', () => {
  const context = makeContext();
  const cases = Array.from(context.HistoryArtifactDetective.cases);
  assert.equal(cases.length, 4);
  assert.equal(context.HistoryArtifactDetective.isValid(cases), true);
  assert.ok(cases.every(item => item.clues.length === 3 && item.sourceUrl.startsWith('https://')));
  assert.equal(context.HistoryArtifactDetective.isValid(cases.map((item, index) => index ? item : { ...item, sourceUrl: 'http://invalid.test' })), false);
  assert.equal(new Set(context.HistoryArtifactDetective.shuffle(cases, () => 0).map(item => item.id)).size, 4);
  assert.notDeepEqual(
    Array.from(context.HistoryArtifactDetective.shuffle(cases, () => 0), item => item.id),
    Array.from(context.HistoryArtifactDetective.shuffle(cases, () => 0.99), item => item.id)
  );
});

test('clues gate choices and submitted evidence records one activity score', () => {
  const context = makeContext();
  const app = context.app;
  app.startHistoryArtifactDetective(() => 0);
  assert.equal(app.historyArtifactActivityEngine.definition.questions.length, 4);
  assert.equal(app.chooseHistoryArtifactAnswer('ptolemaic-egypt'), false);
  assert.equal(app.submitHistoryArtifactAnswer(), false);
  for (let index = 0; index < 3; index++) assert.equal(app.revealHistoryArtifactClue(), true);
  const answer = app.historyArtifactCases[0].answer;
  assert.equal(app.chooseHistoryArtifactAnswer(answer), true);
  assert.equal(app.submitHistoryArtifactAnswer(), true);
  assert.equal(app.historyArtifactActivityEngine.score, 1);
  for (let index = 1; index < 4; index++) {
    app.advanceHistoryArtifactCase();
    for (let clue = 0; clue < 3; clue++) app.revealHistoryArtifactClue();
    app.chooseHistoryArtifactAnswer(app.historyArtifactCases[index].answer);
    app.submitHistoryArtifactAnswer();
  }
  app.advanceHistoryArtifactCase();
  assert.equal(app.historyArtifactActivityEngine.status, 'complete');
  assert.equal(app.historyArtifactActivityEngine.score, 4);
});
