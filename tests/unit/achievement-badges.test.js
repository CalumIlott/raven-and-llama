const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadBadges() {
  return loadBrowserScripts(
    createBrowserContext(),
    'public/js/mathmasters/curriculum.js',
    'public/js/shared/achievement-badges.js'
  ).AchievementBadges;
}

test('badge catalog has unique stable IDs, descriptions, icons, and explicit rules', () => {
  const badges = loadBadges();

  assert.equal(badges.validateCatalog(badges.catalog), true);
  assert.equal(new Set(badges.catalog.map(badge => badge.id)).size, badges.catalog.length);
  assert.ok(badges.catalog.every(badge => badge.name && badge.description && badge.icon && badge.criteria && badge.rule));
  assert.throws(() => badges.validateCatalog([...badges.catalog, { ...badges.catalog[0] }]), /invalid or duplicate/i);
  assert.throws(() => badges.validateCatalog([{ ...badges.catalog[0], rule: { type: 'client-selected', threshold: 1 } }]), /invalid or duplicate/i);
});

test('badges derive from historical activity, topic mastery, and curriculum progress', () => {
  const badges = loadBadges();
  const profile = {
    activityProgress: {
      'science-water-cycle': { timesPlayed: 2 },
      'maths-number-builder': { timesPlayed: 1 },
      'history-timeline-builder': { timesPlayed: 1 },
      'geography-capital-cities': { timesPlayed: 1 },
      'brain-power-memory-match': { timesPlayed: 1 }
    },
    skillsProgress: {
      white_addition: { timesTrained: 1, bestScore: 10 }
    },
    passedBelts: ['white']
  };

  assert.deepEqual(Array.from(badges.deriveEarnedIds(profile)), [
    'first-steps',
    'activity-explorer',
    'skill-master',
    'curriculum-graduate'
  ]);
});

test('badge normalization rejects unknown, unsupported, and duplicate awards', () => {
  const badges = loadBadges();
  const profile = {
    activityProgress: { 'science-water-cycle': { timesPlayed: 1 } },
    skillsProgress: {},
    passedBelts: []
  };

  assert.deepEqual(Array.from(badges.normalizeEarnedIds([
    'first-steps',
    'first-steps',
    'activity-explorer',
    'not-a-badge'
  ], profile)), ['first-steps']);
  assert.deepEqual(Array.from(badges.normalizeEarnedIds(['curriculum-graduate'], {})), []);
});
