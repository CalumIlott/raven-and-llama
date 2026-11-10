(function () {
  const MAX_RECOMMENDATIONS = 3;
  const RECENT_WINDOW_DAYS = 30;
  const PRACTICE_GAP_DAYS = 7;
  const LOW_ACCURACY_PERCENT = 70;
  const MIN_RECENT_ANSWERS = 3;
  const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
  const SUBJECT_DIFFICULTY_KEYS = new Set(['maths', 'science', 'english']);

  const CATALOG = Object.freeze([
    { activityId: 'fraction-pizza', title: 'Fraction Pizza', subject: 'Maths', skillId: 'brown_fraction', difficultySubject: 'maths', startMethod: 'startFractionPizza', arguments: [] },
    { activityId: 'maths-number-builder', title: 'Number Builder', subject: 'Maths', skillId: 'green_order', difficultySubject: 'maths', startMethod: 'startNumberBuilder', arguments: [] },
    { activityId: 'maths-missing-number', title: 'Missing Number', subject: 'Maths', skillId: 'maths_missing_number', difficultySubject: 'maths', startMethod: 'startMissingNumber', arguments: [] },
    { activityId: 'spelling-spelling-sprint', title: 'Spelling Sprint', subject: 'Spelling', skillId: 'spelling_spelling_sprint', difficultySubject: 'english', startMethod: 'startSpellingSafari', arguments: ['spelling-sprint'] },
    { activityId: 'spelling-phonics-trail', title: 'Phonics Trail', subject: 'Spelling', skillId: 'spelling_phonics_trail', difficultySubject: 'english', startMethod: 'startSpellingSafari', arguments: ['phonics-trail'] },
    { activityId: 'spelling-word-explorer', title: 'Word Explorer', subject: 'Spelling', skillId: 'spelling_word_explorer', difficultySubject: 'english', startMethod: 'startSpellingSafari', arguments: ['word-explorer'] },
    { activityId: 'spelling-jungle-jumble', title: 'Jungle Jumble', subject: 'Spelling', skillId: 'spelling_jungle_jumble', difficultySubject: 'english', startMethod: 'startSpellingSafari', arguments: ['jungle-jumble'] },
    { activityId: 'science-solar-system-order', title: 'Build a Solar System', subject: 'Science', skillId: 'science_solar_system_order', startMethod: 'startSolarSystemActivity', arguments: [] },
    { activityId: 'science-plant-life-cycle-order', title: 'Plant Life Cycle', subject: 'Science', skillId: 'science_plant_life_cycle', startMethod: 'startPlantLifeCycleActivity', arguments: [] },
    { activityId: 'brain-power-pattern-recognition', title: 'Pattern Recognition', subject: 'Brain Power', skillId: 'logic_pattern_recognition', schoolYearDifficulty: true, startMethod: 'startBrainPowerPattern', arguments: [] },
    { activityId: 'brain-power-memory-match', title: 'Memory Match', subject: 'Brain Power', skillId: 'logic_memory_match', schoolYearDifficulty: true, startMethod: 'startBrainPowerMemoryMatch', arguments: [] },
    { activityId: 'brain-power-code-breaker', title: 'Code Breaker', subject: 'Brain Power', skillId: 'logic_code_breaker', schoolYearDifficulty: true, startMethod: 'startBrainPowerCodeBreaker', arguments: [] },
    { activityId: 'geography-flag-detective', title: 'Flag Detective', subject: 'Geography & The World', skillId: null, startMethod: 'startGeographyFlagDetective', arguments: [] },
    { activityId: 'geography-capital-cities', title: 'Capital Cities', subject: 'Geography & The World', skillId: null, startMethod: 'startGeographyCapitalCities', arguments: [] },
    { activityId: 'history-timeline-sequence', title: 'History Timeline', subject: 'History & Discovery', skillId: 'history_event_chronology', startMethod: 'startHistoryTimelineActivity', arguments: [] },
    { activityId: 'life-skills-plan-party', title: 'Plan a Party', subject: 'Life Skills', skillId: 'life_skills_budgeting', startMethod: 'startPartyPlanner', arguments: [] }
  ].map(activity => Object.freeze({ ...activity, arguments: Object.freeze([...activity.arguments]) })));

  function isValidDayKey(dayKey) {
    if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
    const [year, month, day] = dayKey.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return year >= 1970 && date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function utcDayDistance(laterDay, earlierDay) {
    return Math.floor((Date.parse(`${laterDay}T00:00:00Z`) - Date.parse(`${earlierDay}T00:00:00Z`)) / 86400000);
  }

  function normalizeHistory(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(sample => sample && typeof sample === 'object' && !Array.isArray(sample) &&
      isValidDayKey(sample.date) && typeof sample.activityId === 'string' && ID_PATTERN.test(sample.activityId) &&
      ['quiz', 'game'].includes(sample.kind) &&
      (sample.skillId === null || sample.skillId === undefined ||
        (typeof sample.skillId === 'string' && ID_PATTERN.test(sample.skillId))) &&
      (sample.correctAnswers === null || sample.correctAnswers === undefined ||
        (Number.isSafeInteger(sample.correctAnswers) && sample.correctAnswers >= 0)) &&
      (sample.totalAnswers === null || sample.totalAnswers === undefined ||
        (Number.isSafeInteger(sample.totalAnswers) && sample.totalAnswers > 0)) &&
      ((sample.correctAnswers === null || sample.correctAnswers === undefined) ===
        (sample.totalAnswers === null || sample.totalAnswers === undefined)) &&
      (sample.correctAnswers === null || sample.correctAnswers === undefined ||
        (sample.kind === 'quiz' && sample.correctAnswers <= sample.totalAnswers)));
  }

  function isValidCatalogActivity(activity) {
    return activity && typeof activity === 'object' &&
      typeof activity.activityId === 'string' && ID_PATTERN.test(activity.activityId) &&
      typeof activity.title === 'string' && activity.title.trim() &&
      typeof activity.subject === 'string' && activity.subject.trim() &&
      (activity.skillId === null || (typeof activity.skillId === 'string' && ID_PATTERN.test(activity.skillId))) &&
      typeof activity.startMethod === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(activity.startMethod) &&
      Array.isArray(activity.arguments) &&
      (activity.difficultySubject === undefined || SUBJECT_DIFFICULTY_KEYS.has(activity.difficultySubject)) &&
      (activity.schoolYearDifficulty === undefined || activity.schoolYearDifficulty === true);
  }

  function getSchoolYear(profile, subject) {
    const subjectYear = profile?.subjectYears?.[subject];
    if (Number.isInteger(subjectYear) && subjectYear >= 0 && subjectYear <= 12) return subjectYear;
    const globalYear = profile?.schoolYear;
    return Number.isInteger(globalYear) && globalYear >= 0 && globalYear <= 12 ? globalYear : 3;
  }

  function getDifficulty(year) {
    if (year <= 2) return 'easy';
    if (year <= 6) return 'medium';
    return 'hard';
  }

  function matchingSamples(activity, history) {
    return history.filter(sample => sample.activityId === activity.activityId ||
      (activity.skillId && sample.skillId === activity.skillId));
  }

  function recommendationReason(activity, signal) {
    if (signal.type === 'low-accuracy') {
      return `Recent ${activity.title} practice is ${signal.accuracy}% correct. Try again to build confidence.`;
    }
    if (signal.type === 'due') {
      return signal.daysSincePractice === null
        ? `Your older ${activity.title} record has no recent results yet. Try it again to see how you are going.`
        : `It has been ${signal.daysSincePractice} days since you practised ${activity.title}. Revisit it to keep it fresh.`;
    }
    return `You have not tried ${activity.title} yet. Explore something new in ${activity.subject}.`;
  }

  function recommend(profile, options = {}) {
    const referenceDate = options.referenceDate || new Date();
    if (!(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) {
      throw new TypeError('Recommendations require a valid reference date.');
    }
    const today = referenceDate.toISOString().slice(0, 10);
    const recentStart = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(),
      referenceDate.getUTCDate() - RECENT_WINDOW_DAYS + 1)).toISOString().slice(0, 10);
    const history = normalizeHistory(profile?.activityHistory);
    const activityProgress = profile?.activityProgress && typeof profile.activityProgress === 'object' &&
      !Array.isArray(profile.activityProgress) ? profile.activityProgress : {};
    const completedToday = new Set(Array.isArray(profile?.dailyChallenges?.days?.[today]?.completedActivityIds)
      ? profile.dailyChallenges.days[today].completedActivityIds.filter(id => typeof id === 'string' && ID_PATTERN.test(id))
      : []);
    const catalog = Array.isArray(options.catalog) ? options.catalog : CATALOG;
    const seenIds = new Set();
    const candidates = catalog.filter(activity => {
      if (!isValidCatalogActivity(activity) || seenIds.has(activity.activityId) || completedToday.has(activity.activityId)) return false;
      seenIds.add(activity.activityId);
      return typeof options.isAvailable !== 'function' || options.isAvailable(activity) === true;
    });

    const ranked = candidates.map((activity, catalogOrder) => {
      const samples = matchingSamples(activity, history).filter(sample => sample.date <= today);
      const recentSamples = samples.filter(sample => sample.date >= recentStart && sample.kind === 'quiz' &&
        Number.isSafeInteger(sample.correctAnswers) && Number.isSafeInteger(sample.totalAnswers));
      const correct = recentSamples.reduce((sum, sample) => sum + sample.correctAnswers, 0);
      const total = recentSamples.reduce((sum, sample) => sum + sample.totalAnswers, 0);
      const accuracy = total ? Math.round(correct / total * 100) : null;
      const lastPracticeDate = samples.reduce((latest, sample) => !latest || sample.date > latest ? sample.date : latest, null);
      const legacyPlayed = Number.isFinite(activityProgress[activity.activityId]?.timesPlayed) &&
        activityProgress[activity.activityId].timesPlayed > 0;
      const daysSincePractice = lastPracticeDate ? utcDayDistance(today, lastPracticeDate) : null;
      let signal;
      if (accuracy !== null && total >= MIN_RECENT_ANSWERS && accuracy < LOW_ACCURACY_PERCENT) {
        signal = { type: 'low-accuracy', accuracy, correct, total };
      } else if ((daysSincePractice !== null && daysSincePractice > PRACTICE_GAP_DAYS) ||
        (!lastPracticeDate && legacyPlayed)) {
        signal = { type: 'due', daysSincePractice };
      } else if (!lastPracticeDate && !legacyPlayed) {
        signal = { type: 'new' };
      } else {
        signal = null;
      }

      const yearSubject = activity.difficultySubject || null;
      const year = yearSubject ? getSchoolYear(profile, yearSubject) : getSchoolYear(profile, null);
      const difficulty = activity.difficultySubject || activity.schoolYearDifficulty ? getDifficulty(year) : null;
      return {
        activityId: activity.activityId,
        title: activity.title.trim(),
        subject: activity.subject.trim(),
        skillId: activity.skillId || null,
        startMethod: activity.startMethod,
        arguments: [...activity.arguments],
        difficulty,
        difficultySubject: activity.difficultySubject || null,
        signal,
        reason: signal ? recommendationReason(activity, signal) : null,
        _catalogOrder: catalogOrder,
        _priority: signal?.type === 'low-accuracy' ? 0 : signal?.type === 'due' ? 1 : signal?.type === 'new' ? 2 : 3,
        _accuracy: signal?.type === 'low-accuracy' ? signal.accuracy : 101,
        _gap: signal?.type === 'due' ? (signal.daysSincePractice ?? RECENT_WINDOW_DAYS + 1) : 0
      };
    }).filter(item => item.signal);

    ranked.sort((first, second) => first._priority - second._priority ||
      (first._priority === 0 ? first._accuracy - second._accuracy : 0) ||
      second._gap - first._gap || first._catalogOrder - second._catalogOrder);

    const selected = [];
    const usedSubjects = new Set();
    for (const item of ranked) {
      if (selected.length >= MAX_RECOMMENDATIONS) break;
      if (usedSubjects.has(item.subject)) continue;
      selected.push(item);
      usedSubjects.add(item.subject);
    }
    if (selected.length < MAX_RECOMMENDATIONS) {
      for (const item of ranked) {
        if (selected.length >= MAX_RECOMMENDATIONS) break;
        if (selected.some(existing => existing.activityId === item.activityId)) continue;
        selected.push(item);
      }
    }

    return selected.map(({ _catalogOrder, _priority, _accuracy, _gap, ...item }) => item);
  }

  function getCatalog() {
    return CATALOG.map(activity => ({ ...activity, arguments: [...activity.arguments] }));
  }

  window.LearningRecommendations = Object.freeze({
    MAX_RECOMMENDATIONS,
    RECENT_WINDOW_DAYS,
    PRACTICE_GAP_DAYS,
    LOW_ACCURACY_PERCENT,
    MIN_RECENT_ANSWERS,
    getCatalog,
    recommend
  });
})();
