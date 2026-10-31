const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadGenerator() {
  const context = loadBrowserScripts(
    createBrowserContext(),
    'js/curriculum.js',
    'js/generators.js'
  );
  return { belts: context.BELTS_DATA, generator: context.QuestionGenerator };
}

test('every curriculum skill generates valid standard and hard questions', () => {
  const { belts, generator } = loadGenerator();

  for (const belt of belts) {
    for (const skill of belt.skills) {
      for (const difficulty of ['standard', 'hard']) {
        const question = generator.getQuestionForSkill(skill.id, difficulty);
        assert.ok(question && typeof question === 'object', `${skill.id} should generate a question`);
        assert.ok(Number.isFinite(question.timeLimitSeconds) && question.timeLimitSeconds > 0);

        if (question.type === 'order_drag') {
          assert.ok(question.correctOrder.length > 1);
          assert.equal(question.items.length, question.correctOrder.length);
        } else {
          assert.notEqual(question.answer, undefined, `${skill.id} should have an answer`);
          assert.ok(Array.isArray(question.options) && question.options.length > 0);
          assert.ok(
            question.options.some(option => String(option).trim().toLowerCase() === String(question.answer).trim().toLowerCase()),
            `${skill.id} should include the answer among its options`
          );
        }
      }
    }
  }
});

test('generated choices are unique, include the correct answer, and respect negative policy', () => {
  const { generator } = loadGenerator();

  for (const correct of [0, 7, 2.5]) {
    const choices = generator.generateChoices(correct, 4, 4);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.ok(choices.includes(correct));
    assert.ok(choices.every(choice => choice >= 0));
  }

  const negativeChoices = generator.generateChoices(-4, 4, 4, true);
  assert.ok(negativeChoices.includes(-4));
});

test('shuffle returns a permutation without mutating its input', () => {
  const { generator } = loadGenerator();
  const input = [1, 2, 3, 4, 5];
  const shuffled = generator.shuffle(input);

  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...shuffled].sort(), input);
  assert.notStrictEqual(shuffled, input);
});

test('belt tests return the requested question count with answerable questions', () => {
  const { belts, generator } = loadGenerator();

  for (const belt of belts) {
    const questions = generator.generateBeltTest(belt.id, 'standard', 8);
    assert.equal(questions.length, 8, `${belt.id} test should generate eight questions`);
    assert.ok(questions.every(question => question.beltName === belt.name));
    assert.ok(questions.every(question => question.answer !== undefined || question.type === 'order_drag'));
  }
});

test('unique question generation stops at the requested count and removes duplicates', () => {
  const { generator } = loadGenerator();
  let next = 0;
  const questions = generator.generateUniqueQuestions(() => ({
    type: 'standard_choice',
    prompt: `Question ${next++}`,
    answer: next
  }), 6);

  assert.equal(questions.length, 6);
  assert.equal(new Set(questions.map(question => question.prompt)).size, 6);
});