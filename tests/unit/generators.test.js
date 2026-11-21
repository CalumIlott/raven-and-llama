const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadGenerator() {
  const context = loadBrowserScripts(
    createBrowserContext(),
    'public/js/mathmasters/curriculum.js',
    'public/js/mathmasters/generators.js'
  );
  return { context, belts: context.BELTS_DATA, generator: context.QuestionGenerator };
}

const BOUNDED_VARIANT_COUNTS = {
  white_subitising: { count: 12, reason: 'six standard dot counts in two fixed layouts' },
  white_recognition: { count: 22, reason: 'the eleven number words matched in both directions' },
  white_partitioning: { count: 35, reason: 'all non-empty ordered splits of totals three to nine' },
  yellow_subitising: { count: 18, reason: 'nine standard frame counts in two question forms' },
  yellow_doubles: { count: 16, reason: 'the eight standard doubles in two question forms' },
  yellow_writing_20: { count: 42, reason: 'the twenty-one numerals matched with words in both directions' },
  yellow_tens_mate: { count: 18, reason: 'the nine number bonds to ten in two question forms' },
  green_halving: { count: 20, reason: 'the ten even numbers through twenty in two question forms' },
};

function seedRandom(context, seed) {
  let state = seed >>> 0;
  const deterministicMath = Object.create(Math);
  deterministicMath.random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  context.Math = deterministicMath;
}

function questionSignature(question) {
  return JSON.stringify(question, (key, value) =>
    ['options', 'timeLimitSeconds', 'beltName', 'skillName', 'testDifficulty'].includes(key) ? undefined : value
  );
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
        } else if (question.type === 'numeric_input' || question.type === 'short_answer') {
          assert.notEqual(question.answer, undefined, `${skill.id} should have an answer`);
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

test('Problem Solving Master specifies the required numeric answer format', () => {
  const { generator } = loadGenerator();
  const originalRandom = Math.random;
  const formats = [];

  try {
    for (const randomValue of [0, 0.4, 0.9]) {
      Math.random = () => randomValue;
      formats.push(generator.genPlatinumProblemSolving().answerFormatHint);
    }
  } finally {
    Math.random = originalRandom;
  }

  assert.match(formats[0], /number of ninjas as digits only/);
  assert.match(formats[1], /number of shurikens as digits only/);
  assert.match(formats[2], /dollars and cents as a decimal, for example 8\.50/);
});

test('Blue Belt balanced equation training can generate an x mystery weight', () => {
  const { context, generator } = loadGenerator();
  const originalRandom = context.Math.random;

  try {
    context.Math.random = () => 0;
    const question = generator.getQuestionForSkill('blue_balanced_equation', 'standard');
    assert.equal(question.type, 'balance_scale');
    assert.equal(question.balanceMode, 'mystery');
    assert.equal(question.title, 'Mystery Weight Solver');
    assert.ok(question.answer >= 4 && question.answer <= 50);
    assert.ok(question.options.includes(question.answer));
  } finally {
    context.Math.random = originalRandom;
  }
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

test('endless belt questions are valid and vary skill categories', () => {
  const { belts, generator } = loadGenerator();

  for (const belt of belts) {
    let previousSkillId = null;
    for (let index = 0; index < 20; index++) {
      const question = generator.generateRandomBeltQuestion(belt.id, 'standard', previousSkillId);
      assert.ok(generator.isValidQuestion(question), `${belt.id} endless question should be answerable`);
      assert.ok(belt.skills.some(skill => skill.id === question.skillId));
      assert.notEqual(question.skillId, previousSkillId, `${belt.id} should not repeat a category consecutively`);
      assert.equal(question.beltName, belt.name);
      previousSkillId = question.skillId;
    }
  }

  assert.equal(generator.isValidQuestion({ type: 'standard_choice', answer: 4, options: [3], timeLimitSeconds: 10 }), false);
});

test('every skill targets 100 unique questions unless its taught facts are finite', () => {
  const { context, belts, generator } = loadGenerator();
  let seed = 20261103;

  for (const belt of belts) {
    for (const skill of belt.skills) {
      seedRandom(context, seed++);
      const variants = new Set();
      for (let attempt = 0; attempt < 5000 && variants.size < 100; attempt++) {
        const question = generator.getQuestionForSkill(skill.id);
        assert.ok(generator.isValidQuestion(question), `${skill.id} should generate valid questions`);
        variants.add(questionSignature(question));
      }

      const bounded = BOUNDED_VARIANT_COUNTS[skill.id];
      if (bounded) {
        assert.equal(variants.size, bounded.count, `${skill.id}: ${bounded.reason}`);
      } else {
        assert.ok(variants.size >= 100, `${skill.id} should generate at least 100 distinct questions`);
      }
    }
  }
});

test('Brown Belt fractions cover 100+ distinct proper, improper, and mixed visual problems', () => {
  const { context, generator } = loadGenerator();
  seedRandom(context, 482021);
  const variants = new Set();
  const modes = new Set();
  const models = new Set();
  const denominators = new Set();

  for (let attempt = 0; attempt < 5000 && variants.size < 100; attempt++) {
    const question = generator.getQuestionForSkill('brown_fraction');
    assert.equal(generator.isValidQuestion(question), true);
    assert.ok(['proper', 'improper', 'mixed'].includes(question.fractionMode));
    assert.ok(['fraction_bar', 'fraction_circles', 'fraction_grid'].includes(question.visualModel));
    assert.ok(question.denominator >= 2 && question.denominator <= 12);
    assert.ok(question.numerator > 0);
    if (question.fractionMode === 'proper') assert.ok(question.numerator < question.denominator);
    if (question.fractionMode !== 'proper') assert.ok(question.numerator > question.denominator);
    if (question.fractionMode === 'mixed') assert.match(question.answer, /^\d+ \d+\/\d+$/);
    else assert.equal(question.answer, `${question.numerator}/${question.denominator}`);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.answer));
    variants.add(questionSignature(question));
    modes.add(question.fractionMode);
    models.add(question.visualModel);
    denominators.add(question.denominator);
  }

  assert.ok(variants.size >= 100);
  assert.deepEqual([...modes].sort(), ['improper', 'mixed', 'proper']);
  assert.deepEqual([...models].sort(), ['fraction_bar', 'fraction_circles', 'fraction_grid']);
  assert.deepEqual([...denominators].sort((a, b) => a - b), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('fraction renderer shows multiple complete units and partial shading in all models', () => {
  const context = loadBrowserScripts(createBrowserContext(), 'public/js/shared/renderers.js');
  const bar = context.VisualRenderers.renderFractionVisual(7, 4, 'fraction_bar');
  const circles = context.VisualRenderers.renderFractionVisual(7, 4, 'fraction_circles');
  const grid = context.VisualRenderers.renderFractionVisual(7, 4, 'fraction_grid');

  for (const html of [bar, circles, grid]) {
    assert.match(html, /Unit 1: 4 of 4 parts shaded/);
    assert.match(html, /Unit 2: 3 of 4 parts shaded/);
    assert.match(html, /2 equal parts per whole|4 equal parts per whole/);
  }
  assert.match(circles, /<circle class="fraction-circle__shading"[^>]*fill="#34d399"/);
  assert.match(circles, /<path class="fraction-circle__shading"[^>]*fill="#34d399"/);
  assert.match(grid, /grid-cols-4/);
});

test('belt question ranges and formats cover the online resource skill descriptions', () => {
  const { generator } = loadGenerator();
  const greenReadings = Array.from({ length: 60 }, () => generator.getQuestionForSkill('green_reading_writing'));
  const greenOrders = Array.from({ length: 30 }, () => generator.getQuestionForSkill('green_order'));
  const brownReadings = Array.from({ length: 60 }, () => generator.getQuestionForSkill('brown_read_write'));
  const brownOrders = Array.from({ length: 60 }, () => generator.getQuestionForSkill('brown_order'));
  const brownRiddles = Array.from({ length: 60 }, () => generator.getQuestionForSkill('brown_renaming'));
  const blackDecimals = Array.from({ length: 20 }, () => generator.getQuestionForSkill('black_decimal_order'));
  const blackFractions = Array.from({ length: 20 }, () => generator.getQuestionForSkill('black_fraction_order'));
  const parsedNumber = question => {
    if (typeof question.answer === 'number') return question.answer;
    return Number(question.prompt.match(/[\d,]+/)?.[0]?.replace(/,/g, ''));
  };

  assert.ok(greenReadings.every(question => parsedNumber(question) >= 0 && parsedNumber(question) <= 999));
  assert.ok(greenOrders.every(question => question.items.every(value => value >= 0 && value <= 999)));
  assert.ok(brownReadings.some(question => parsedNumber(question) > 10000));
  assert.ok(brownReadings.every(question => parsedNumber(question) <= 999999));
  assert.ok(brownOrders.some(question => question.items.some(value => !Number.isInteger(value))));
  assert.ok(brownRiddles.some(question => question.type === 'numeric_input'));
  assert.ok(blackDecimals.every(question => question.items.every(value => Number(value.toFixed(3)) === value)));
  assert.ok(blackFractions.every(question => question.type === 'order_drag'));
});

test('Platinum generators include fraction equivalences and all decimal operations', () => {
  const { generator } = loadGenerator();
  const conversions = Array.from({ length: 180 }, () => generator.getQuestionForSkill('platinum_conversion'));
  const decimalQuestions = Array.from({ length: 180 }, () => generator.getQuestionForSkill('platinum_decimal'));
  const divisionQuestions = Array.from({ length: 180 }, () => generator.getQuestionForSkill('platinum_division'));

  assert.ok(conversions.every(question => generator.isValidQuestion(question)));
  assert.ok(conversions.some(question => /as a fraction/i.test(question.prompt)));
  assert.ok(conversions.some(question => /as a percentage/i.test(question.prompt)));
  assert.ok(conversions.some(question => /as a decimal/i.test(question.prompt)));
  assert.ok(conversions.some(question => /into (metres|kilograms|litres|minutes)/i.test(question.prompt)));
  assert.deepEqual(
    new Set(decimalQuestions.map(question => question.prompt.match(/[+×÷-]/)?.[0])),
    new Set(['+', '-', '×', '÷'])
  );
  assert.ok(divisionQuestions.some(question => Number(question.prompt.match(/^\d+/)?.[0]) >= 1000));
  assert.ok(divisionQuestions.some(question => String(question.answer).includes(' r ') || Number.isInteger(question.answer)));
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
