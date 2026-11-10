const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadRecommendations() {
  return loadBrowserScripts(createBrowserContext(), 'public/js/shared/recommendations.js').LearningRecommendations;
}

function emptyProfile(overrides = {}) {
  return {
    schoolYear: 3,
    subjectYears: {},
    activityHistory: [],
    activityProgress: {},
    dailyChallenges: { days: {} },
    ...overrides
  };
}

function sample(overrides = {}) {
  return {
    date: '2026-11-10',
    activityId: 'fraction-pizza',
    title: 'Fraction Pizza',
    subject: 'Maths',
    skillId: 'brown_fraction',
    kind: 'quiz',
    score: 1,
    total: 5,
    correctAnswers: 1,
    totalAnswers: 5,
    ...overrides
  };
}

const referenceDate = new Date('2026-11-10T12:00:00Z');

test('recommendation catalog has unique valid activities and launch methods', () => {
  const recommendations = loadRecommendations();
  const catalog = recommendations.getCatalog();

  assert.ok(catalog.length >= 12);
  assert.equal(new Set(catalog.map(activity => activity.activityId)).size, catalog.length);
  assert.ok(catalog.every(activity => activity.title && activity.subject && activity.startMethod));
});

test('recent quiz accuracy below 70 percent ranks first with an explainable reason', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    activityHistory: [
      sample(),
      sample({ date: '2026-11-09', score: 2, correctAnswers: 2 }),
      sample({ activityId: 'maths-number-builder', skillId: 'green_order', title: 'Number Builder', score: 5, correctAnswers: 5, totalAnswers: 5 })
    ]
  });

  const result = recommendations.recommend(profile, { referenceDate });

  assert.equal(result[0].activityId, 'fraction-pizza');
  assert.deepEqual(JSON.parse(JSON.stringify(result[0].signal)), {
    type: 'low-accuracy', accuracy: 30, correct: 3, total: 10
  });
  assert.match(result[0].reason, /30% correct/);
});

test('high accuracy is not treated as a practice gap and recent games are not scored as quizzes', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    activityHistory: [
      sample({ correctAnswers: 5, totalAnswers: 5 }),
      sample({ activityId: 'brain-power-pattern-recognition', skillId: 'logic_pattern_recognition', kind: 'game', correctAnswers: null, totalAnswers: null, score: 40, total: null })
    ]
  });

  const result = recommendations.recommend(profile, { referenceDate });

  assert.equal(result.find(item => item.activityId === 'fraction-pizza'), undefined);
  assert.equal(result.find(item => item.activityId === 'brain-power-pattern-recognition'), undefined);
});

test('identical inputs produce the same tie order and exactly 70 percent is not low accuracy', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    activityHistory: [sample({ correctAnswers: 7, totalAnswers: 10 })]
  });

  const first = recommendations.recommend(profile, { referenceDate }).map(item => item.activityId);
  const second = recommendations.recommend(profile, { referenceDate }).map(item => item.activityId);

  assert.deepEqual(first, second);
  assert.equal(first.includes('fraction-pizza'), false);
});

test('practice older than seven days is recommended using dates without treating a game score as accuracy', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    activityHistory: [sample({
      date: '2026-11-02',
      kind: 'game',
      score: 25,
      total: null,
      correctAnswers: null,
      totalAnswers: null
    })]
  });

  const result = recommendations.recommend(profile, { referenceDate });
  const pizza = result.find(item => item.activityId === 'fraction-pizza');

  assert.deepEqual(JSON.parse(JSON.stringify(pizza.signal)), { type: 'due', daysSincePractice: 8 });
  assert.match(pizza.reason, /8 days since you practised Fraction Pizza/);
});

test('sparse profiles get a capped, subject-diverse year-appropriate fallback', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({ schoolYear: 1, subjectYears: { maths: 9, english: 1 } });

  const result = recommendations.recommend(profile, { referenceDate });

  assert.equal(result.length, 3);
  assert.equal(new Set(result.map(item => item.subject)).size, 3);
  assert.deepEqual(Array.from(result, item => item.activityId), [
    'fraction-pizza', 'spelling-spelling-sprint', 'science-solar-system-order'
  ]);
  assert.equal(result[0].difficulty, 'hard');
  assert.equal(result[1].difficulty, 'easy');
  assert.match(result[0].reason, /not tried Fraction Pizza yet/);
});

test('malformed and future history is ignored and missing accuracy is not a failure', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    activityHistory: [
      sample({ date: '2026-02-30' }),
      sample({ date: '2026-11-11' }),
      sample({ correctAnswers: null, totalAnswers: null }),
      sample({ activityId: '../../account', correctAnswers: 0, totalAnswers: 5 })
    ]
  });

  const result = recommendations.recommend(profile, { referenceDate });

  assert.equal(result.find(item => item.activityId === 'fraction-pizza'), undefined);
});

test('unavailable and already completed today activities are excluded', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile({
    dailyChallenges: {
      days: {
        '2026-11-10': { completedActivityIds: ['fraction-pizza', 'spelling-spelling-sprint'] }
      }
    }
  });

  const result = recommendations.recommend(profile, {
    referenceDate,
    isAvailable: activity => activity.startMethod !== 'startHistoryTimelineActivity'
  });

  const ids = result.map(item => item.activityId);
  assert.equal(ids.includes('fraction-pizza'), false);
  assert.equal(ids.includes('spelling-spelling-sprint'), false);
  assert.equal(ids.includes('history-timeline-sequence'), false);
});

test('recommendations stay isolated to the profile passed to the engine', () => {
  const recommendations = loadRecommendations();
  const struggling = emptyProfile({ activityHistory: [sample()] });
  const confident = emptyProfile({ activityHistory: [sample({ correctAnswers: 5 })] });

  const strugglingResult = recommendations.recommend(struggling, { referenceDate });
  const confidentResult = recommendations.recommend(confident, { referenceDate });

  assert.equal(strugglingResult.find(item => item.activityId === 'fraction-pizza').signal.type, 'low-accuracy');
  assert.equal(confidentResult.find(item => item.activityId === 'fraction-pizza'), undefined);
});

test('no eligible candidates returns a neutral empty result and invalid dates are rejected', () => {
  const recommendations = loadRecommendations();
  const profile = emptyProfile();

  assert.deepEqual(Array.from(recommendations.recommend(profile, { referenceDate, catalog: [] })), []);
  assert.throws(() => recommendations.recommend(profile, { referenceDate: new Date('invalid') }), /valid reference date/);
});
