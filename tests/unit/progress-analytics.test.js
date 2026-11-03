const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadAnalytics() {
  const context = createBrowserContext();
  loadBrowserScripts(
    context,
    'public/js/mathmasters/curriculum.js',
    'public/js/shared/progress-analytics.js'
  );
  return context.ProgressAnalytics;
}

function sample(overrides = {}) {
  return {
    date: '2026-03-10',
    activityId: 'science-water-cycle',
    title: 'Water Cycle',
    subject: 'Science Lab',
    skillId: 'science_water_cycle',
    kind: 'quiz',
    score: 4,
    total: 5,
    correctAnswers: 4,
    totalAnswers: 5,
    ...overrides
  };
}

test('normalizes bounded activity history and removes invalid or identifying fields', () => {
  const analytics = loadAnalytics();
  const history = Array.from({ length: 367 }, (_, index) =>
    sample({ activityId: `activity-${index}`, prompt: 'private answer text' })
  );
  history[5] = sample({ date: '2025-02-30' });

  const normalized = analytics.normalizeActivityHistory(history);

  assert.equal(normalized.length, 365);
  assert.equal(normalized[0].activityId, 'activity-1');
  assert.equal(normalized.at(-1).activityId, 'activity-366');
  assert.equal(Object.hasOwn(normalized[0], 'prompt'), false);
  assert.equal(normalized[0].correctAnswers, 4);
});

test('aggregates selected date ranges by subject and date and resolves configured skills only', () => {
  const analytics = loadAnalytics();
  const result = analytics.aggregateActivityHistory([
    sample(),
    sample({
      activityId: 'maths-fractions',
      title: 'Fraction Practice',
      subject: 'Maths',
      skillId: 'brown_fraction',
      score: 1,
      total: 1,
      correctAnswers: 2,
      totalAnswers: 3
    }),
    sample({ date: '2026-03-03', activityId: 'old-activity' }),
    sample({ date: '2026-03-11', activityId: 'future-activity' })
  ], 7, new Date('2026-03-10T12:00:00.000Z'));

  assert.equal(result.sampleCount, 2);
  assert.equal(result.startDate, '2026-03-04');
  assert.equal(result.endDate, '2026-03-10');
  assert.deepEqual(JSON.parse(JSON.stringify(result.subjects.map(item => ({
    subject: item.subject,
    attempts: item.attempts,
    accuracy: item.accuracy
  })))), [
    { subject: 'Maths', attempts: 1, accuracy: 67 },
    { subject: 'Science Lab', attempts: 1, accuracy: 80 }
  ]);
  assert.equal(result.days.length, 7);
  assert.equal(result.days.at(-1).attempts, 2);
  assert.equal(result.activities.find(item => item.activityId === 'maths-fractions').skillName, 'Fraction Master');
  assert.equal(result.activities.find(item => item.activityId === 'science-water-cycle').australianCurriculum, null);
});

test('returns explicit empty range buckets and rejects unsupported ranges', () => {
  const analytics = loadAnalytics();
  const result = analytics.aggregateActivityHistory([], 30, new Date('2026-03-10T00:00:00.000Z'));

  assert.equal(result.sampleCount, 0);
  assert.equal(result.subjects.length, 0);
  assert.equal(result.days.length, 30);
  assert.equal(result.days.every(day => day.attempts === 0 && day.accuracy === null), true);
  assert.throws(() => analytics.aggregateActivityHistory([], 14), /7, 30, or 90/);
});
