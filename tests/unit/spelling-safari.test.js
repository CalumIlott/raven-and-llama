const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadSafari() {
  const context = createBrowserContext();
  context.App = class {};
  return loadBrowserScripts(context, 'public/js/spelling/safari.js');
}

test('Spelling Safari activities have unique ids and at least 100 questions', () => {
  const context = loadSafari();
  const activities = context.SpellingSafari.getActivities();

  assert.equal(activities.length, 4);
  assert.equal(new Set(Array.from(activities, activity => activity.id)).size, activities.length);
  assert.ok(activities.every(activity => activity.questions.length >= 100));
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

test('Jungle Jumble filters rounds by difficulty', () => {
  const safari = loadSafari().SpellingSafari;
  const ranges = {
    easy: answer => answer.length <= 5,
    medium: answer => answer.length >= 6 && answer.length <= 7,
    hard: answer => answer.length >= 8
  };

  for (const [difficulty, matchesDifficulty] of Object.entries(ranges)) {
    const questions = safari.createQuestions('jungle-jumble', 6, difficulty);
    assert.equal(questions.length, 6);
    assert.ok(questions.every(question => matchesDifficulty(question.answer)));
  }
});

test('all Spelling Safari activities apply their selected difficulty', () => {
  const safari = loadSafari().SpellingSafari;

  for (const activity of safari.getActivities()) {
    for (const [difficulty, optionCount] of Object.entries({ easy: 2, medium: 3, hard: 4 })) {
      const questions = safari.createQuestions(activity.id, 6, difficulty);
      assert.equal(questions.length, 6);
      if (activity.type !== 'scramble') {
        assert.ok(questions.every(question => question.options.length === optionCount));
        assert.ok(questions.every(question => question.options.includes(question.answer)));
      }
    }
  }
});

test('Phonics Easy uses accessible picture clues and Medium keeps simple text clues', () => {
  const safari = loadSafari().SpellingSafari;
  const easyQuestions = safari.createQuestions('phonics-trail', 999, 'easy');
  assert.equal(easyQuestions.length, safari.getActivity('phonics-trail').questions.length);
  assert.ok(easyQuestions.every(question => question.pictureClue));

  const context = createBrowserContext();
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.main = { innerHTML: '', dataset: {} };
  context.arena = { innerHTML: '' };
  context.document = {
    getElementById: id => {
      if (id === 'app-main') return context.main;
      if (id === 'safari-arena') return context.arena;
      return null;
    }
  };
  context.App = class {
    rememberModule() {}
    updateHeader() {}
  };
  loadBrowserScripts(context, 'public/js/spelling/safari.js');
  const app = new context.App();
  app.showSpellingSafari();
  assert.equal((context.main.innerHTML.match(/data-action="spelling-start"/g) || []).length, 12);

  app.startSpellingSafari('phonics-trail', 'easy');
  assert.match(context.arena.innerHTML, /spelling-picture-clue[^>]*role="img" aria-label="Picture clue:/);
  assert.doesNotMatch(context.arena.innerHTML, /class="spelling-hint/);
  assert.ok(app.spellingSafariGame.questions.every(question => question.pictureClue));

  app.startSpellingSafari('phonics-trail', 'medium');
  assert.match(context.arena.innerHTML, /class="spelling-hint[^"]*">[^<]+<\/p>/);
  assert.doesNotMatch(context.arena.innerHTML, /spelling-picture-clue/);

  app.startSpellingSafari('phonics-trail', 'hard');
  assert.doesNotMatch(context.arena.innerHTML, /class="spelling-hint/);
});

test('unknown activities and invalid round counts return no questions', () => {
  const context = loadSafari();
  const safari = context.SpellingSafari;

  assert.equal(safari.getActivity('not-an-activity'), null);
  assert.deepEqual(Array.from(safari.createQuestions('not-an-activity')), []);
  assert.deepEqual(Array.from(safari.createQuestions('spelling-sprint', 0)), []);
  assert.deepEqual(Array.from(safari.createQuestions('spelling-sprint', NaN)), []);
  assert.equal(safari.createQuestions('spelling-sprint', 99).length, 99);
  assert.equal(safari.createQuestions('spelling-sprint', 999).length, safari.getActivity('spelling-sprint').questions.length);
});

test('incorrect answer in Spelling Safari does not reveal the correct answer', () => {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.arena = { innerHTML: '' };
  context.document = {
    getElementById: id => {
      if (id === 'app-main') return context.main;
      if (id === 'safari-arena') return context.arena;
      return null;
    }
  };
  context.App = class {
    rememberModule() {}
    updateHeader() {}
  };
  loadBrowserScripts(context, 'public/js/spelling/safari.js');

  const app = new context.App();
  app.startSpellingSafari('spelling-sprint');
  const question = app.spellingSafariGame.questions[0];
  const wrongAnswer = question.options.find(opt => opt.toLowerCase() !== question.answer.toLowerCase());
  app.submitSpellingSafariAnswer(wrongAnswer);

  assert.equal(app.spellingSafariGame.lastAnswerCorrect, false);
  assert.match(context.arena.innerHTML, /spelling-choice[^"]*is-incorrect/);
  assert.match(context.arena.innerHTML, /Not quite! Keep exploring!/);
  assert.doesNotMatch(context.arena.innerHTML, /The answer was/);
});

test('correct multiple-choice answer in Spelling Safari is highlighted green', () => {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
  context.arena = { innerHTML: '' };
  context.document = {
    getElementById: id => {
      if (id === 'app-main') return context.main;
      if (id === 'safari-arena') return context.arena;
      return null;
    }
  };
  context.App = class {
    rememberModule() {}
    updateHeader() {}
  };
  loadBrowserScripts(context, 'public/js/spelling/safari.js');

  const app = new context.App();
  app.startSpellingSafari('spelling-sprint');
  app.submitSpellingSafariAnswer(app.spellingSafariGame.questions[0].answer);

  assert.match(context.arena.innerHTML, /spelling-choice[^"]*is-correct/);
});
