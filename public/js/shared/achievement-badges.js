(function () {
  const RULE_TYPES = new Set(['activity-count', 'mastered-skill-count', 'belt-graduation-count']);
  const catalog = Object.freeze([
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'You completed your first Learning Centre activity.',
      icon: '🌱',
      criteria: 'Complete one Learning Centre activity.',
      rule: Object.freeze({ type: 'activity-count', threshold: 1 })
    },
    {
      id: 'activity-explorer',
      name: 'Activity Explorer',
      description: 'You tried a range of Learning Centre activities.',
      icon: '🧭',
      criteria: 'Complete five different Learning Centre activities.',
      rule: Object.freeze({ type: 'activity-count', threshold: 5 })
    },
    {
      id: 'skill-master',
      name: 'Skill Master',
      description: 'You reached a perfect score while training a curriculum skill.',
      icon: '⭐',
      criteria: 'Train a curriculum skill and score 10/10.',
      rule: Object.freeze({ type: 'mastered-skill-count', threshold: 1 })
    },
    {
      id: 'curriculum-graduate',
      name: 'Curriculum Graduate',
      description: 'You graduated from a Maths Masters belt.',
      icon: '🥋',
      criteria: 'Pass a Maths Masters belt.',
      rule: Object.freeze({ type: 'belt-graduation-count', threshold: 1 })
    }
  ].map(badge => Object.freeze(badge)));

  function validateCatalog(badges) {
    if (!Array.isArray(badges) || badges.length === 0) {
      throw new TypeError('Badge catalog must be a non-empty array.');
    }
    const ids = new Set();
    for (const badge of badges) {
      if (!badge || typeof badge !== 'object' ||
        typeof badge.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(badge.id) ||
        ids.has(badge.id) ||
        typeof badge.name !== 'string' || badge.name.trim().length === 0 ||
        typeof badge.description !== 'string' || badge.description.trim().length === 0 ||
        typeof badge.icon !== 'string' || badge.icon.trim().length === 0 ||
        typeof badge.criteria !== 'string' || badge.criteria.trim().length === 0 ||
        !badge.rule || !RULE_TYPES.has(badge.rule.type) ||
        !Number.isSafeInteger(badge.rule.threshold) || badge.rule.threshold < 1) {
        throw new TypeError('Badge catalog contains an invalid or duplicate entry.');
      }
      ids.add(badge.id);
    }
    return true;
  }

  function countPlayedActivities(profile) {
    const activityProgress = profile?.activityProgress;
    if (!activityProgress || typeof activityProgress !== 'object' || Array.isArray(activityProgress)) return 0;
    return Object.entries(activityProgress).filter(([id, stat]) =>
      /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id) &&
      stat && typeof stat === 'object' && Number.isSafeInteger(stat.timesPlayed) && stat.timesPlayed > 0
    ).length;
  }

  function countMasteredSkills(profile) {
    const skillsProgress = profile?.skillsProgress;
    if (!skillsProgress || typeof skillsProgress !== 'object' || Array.isArray(skillsProgress)) return 0;
    return Object.values(skillsProgress).filter(stat =>
      stat && typeof stat === 'object' &&
      Number.isSafeInteger(stat.timesTrained) && stat.timesTrained > 0 &&
      Number.isFinite(stat.bestScore) && stat.bestScore >= 10
    ).length;
  }

  function countGraduatedBelts(profile) {
    const beltIds = new Set((window.BELTS_DATA || []).map(belt => belt.id));
    return Array.isArray(profile?.passedBelts)
      ? new Set(profile.passedBelts.filter(id => beltIds.has(id))).size
      : 0;
  }

  function evaluateRule(rule, profile) {
    switch (rule.type) {
      case 'activity-count':
        return countPlayedActivities(profile) >= rule.threshold;
      case 'mastered-skill-count':
        return countMasteredSkills(profile) >= rule.threshold;
      case 'belt-graduation-count':
        return countGraduatedBelts(profile) >= rule.threshold;
      default:
        throw new TypeError(`Unsupported badge rule: ${rule.type}`);
    }
  }

  function deriveEarnedIds(profile, badges = catalog) {
    validateCatalog(badges);
    return badges.filter(badge => evaluateRule(badge.rule, profile)).map(badge => badge.id);
  }

  function normalizeEarnedIds(existing, profile) {
    const derived = new Set(deriveEarnedIds(profile));
    const validIds = new Set(catalog.map(badge => badge.id));
    const previous = Array.isArray(existing)
      ? existing.filter(id => typeof id === 'string' && validIds.has(id) && derived.has(id))
      : [];
    return [...new Set([...previous, ...derived])];
  }

  validateCatalog(catalog);
  window.AchievementBadges = Object.freeze({
    catalog,
    validateCatalog,
    deriveEarnedIds,
    normalizeEarnedIds
  });
})();
