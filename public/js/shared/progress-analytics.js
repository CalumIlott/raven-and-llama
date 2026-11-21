(function () {
  const MAX_ACTIVITY_HISTORY_ENTRIES = 365;
  const VALID_RANGE_DAYS = new Set([7, 30, 90]);
  const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

  // Maps are intentionally limited to skills with a direct content match in
  // ACARA's Australian Curriculum v9.0 descriptions. These are links to
  // overlapping content, not claims that a belt or activity equals a school year.
  const AUSTRALIAN_CURRICULUM_SOURCES = Object.freeze({
    primaryMaths: Object.freeze({
      title: 'Mathematics F–6 scope and sequence, Years 3–4',
      version: 'Australian Curriculum v9.0',
      url: 'https://www.australiancurriculum.edu.au/media/7160/primary_scope_and_sequence_years_3-4.pdf'
    }),
    year5Decimals: Object.freeze({
      title: 'WS02 – Locating decimals',
      version: 'Australian Curriculum v9.0',
      url: 'https://www.australiancurriculum.edu.au/resources/work-samples/mathematics/year-5/ws02-locating-decimals/'
    })
  });
  const AUSTRALIAN_CURRICULUM_MAPPINGS = Object.freeze({
    green_order: Object.freeze({
      code: 'AC9M3N01',
      yearLevel: 'Year 3',
      title: 'Order natural numbers using place value',
      scopeNote: 'This skill orders numbers to 999, within the descriptor’s broader range.',
      sourceId: 'primaryMaths'
    }),
    blue_balanced_equation: Object.freeze({
      code: 'AC9M4A02',
      yearLevel: 'Year 4',
      title: 'Find unknowns in equivalent addition and subtraction sentences',
      scopeNote: 'This activity practises a subset of the descriptor using inverse operations.',
      sourceId: 'primaryMaths'
    }),
    brown_fraction: Object.freeze({
      code: 'AC9M4N05',
      yearLevel: 'Year 4',
      title: 'Represent fraction families and equivalence',
      scopeNote: 'The activity includes additional improper and mixed fractions beyond this descriptor.',
      sourceId: 'primaryMaths'
    }),
    black_decimal_order: Object.freeze({
      code: 'AC9M5N01',
      yearLevel: 'Year 5',
      title: 'Compare and order decimals using place value',
      scopeNote: 'This skill includes tenths and hundredths as well as the descriptor’s thousandths focus.',
      sourceId: 'year5Decimals'
    })
  });

  function getAustralianCurriculumMapping(skillId) {
    const mapping = AUSTRALIAN_CURRICULUM_MAPPINGS[skillId];
    if (!mapping) return null;
    const source = AUSTRALIAN_CURRICULUM_SOURCES[mapping.sourceId];
    if (!source) return null;
    return {
      code: mapping.code,
      yearLevel: mapping.yearLevel,
      title: mapping.title,
      scopeNote: mapping.scopeNote,
      curriculumVersion: source.version,
      sourceTitle: source.title,
      sourceUrl: source.url
    };
  }

  function isValidDayKey(dayKey) {
    if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
    const [year, month, day] = dayKey.split('-').map(Number);
    if (year < 1970 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  }

  function normalizeActivityHistory(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(sample => {
      if (!sample || typeof sample !== 'object' || Array.isArray(sample) ||
        !isValidDayKey(sample.date) ||
        typeof sample.activityId !== 'string' || !ID_PATTERN.test(sample.activityId) ||
        typeof sample.title !== 'string' || !sample.title.trim() ||
        typeof sample.subject !== 'string' || !sample.subject.trim() ||
        !['quiz', 'game'].includes(sample.kind) ||
        !Number.isFinite(sample.score) || sample.score < 0 ||
        (sample.total !== null &&
          (!Number.isFinite(sample.total) || sample.total <= 0 || sample.score > sample.total)) ||
        (sample.skillId !== null && sample.skillId !== undefined &&
          (typeof sample.skillId !== 'string' || !ID_PATTERN.test(sample.skillId)))) return false;

      const hasCorrectAnswers = sample.correctAnswers !== null && sample.correctAnswers !== undefined;
      const hasTotalAnswers = sample.totalAnswers !== null && sample.totalAnswers !== undefined;
      return hasCorrectAnswers === hasTotalAnswers &&
        (!hasCorrectAnswers ||
          (sample.kind === 'quiz' &&
            Number.isSafeInteger(sample.correctAnswers) && sample.correctAnswers >= 0 &&
            Number.isSafeInteger(sample.totalAnswers) && sample.totalAnswers > 0 &&
            sample.correctAnswers <= sample.totalAnswers));
    }).slice(-MAX_ACTIVITY_HISTORY_ENTRIES).map(sample => ({
      date: sample.date,
      activityId: sample.activityId,
      title: sample.title.trim().slice(0, 100),
      subject: sample.subject.trim().slice(0, 50),
      skillId: typeof sample.skillId === 'string' ? sample.skillId : null,
      kind: sample.kind,
      score: Math.min(1000000000, Math.floor(sample.score * 100) / 100),
      total: Number.isFinite(sample.total) && sample.total > 0
        ? Math.min(1000000000, Math.floor(sample.total * 100) / 100)
        : null,
      correctAnswers: Number.isSafeInteger(sample.correctAnswers) ? sample.correctAnswers : null,
      totalAnswers: Number.isSafeInteger(sample.totalAnswers) ? sample.totalAnswers : null,
      ...(sample.activityId === 'science-virtual-lab' ? {
        kind: 'game', total: null, correctAnswers: null, totalAnswers: null
      } : {})
    }));
  }

  function getCurriculumSkills(belts) {
    return new Map((Array.isArray(belts) ? belts : []).flatMap(belt =>
      Array.isArray(belt.skills)
        ? belt.skills.map(skill => [skill.id, { name: skill.name, beltName: belt.name }])
        : []
    ));
  }

  function aggregateActivityHistory(history, rangeDays = 30, referenceDate = new Date(), belts = window.BELTS_DATA || []) {
    if (!VALID_RANGE_DAYS.has(rangeDays)) {
      throw new TypeError('Progress analytics range must be 7, 30, or 90 days.');
    }
    if (!(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) {
      throw new TypeError('Progress analytics requires a valid reference date.');
    }

    const endDate = referenceDate.toISOString().slice(0, 10);
    const endParts = endDate.split('-').map(Number);
    const startDate = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2] - rangeDays + 1))
      .toISOString().slice(0, 10);
    const samples = normalizeActivityHistory(history)
      .filter(sample => sample.date >= startDate && sample.date <= endDate);
    const subjects = new Map();
    const days = new Map();
    const activities = new Map();
    const curriculumSkills = getCurriculumSkills(belts);

    for (const sample of samples) {
      const subject = subjects.get(sample.subject) || {
        subject: sample.subject,
        attempts: 0,
        correctAnswers: 0,
        totalAnswers: 0
      };
      subject.attempts++;
      if (sample.totalAnswers !== null) {
        subject.correctAnswers += sample.correctAnswers;
        subject.totalAnswers += sample.totalAnswers;
      }
      subjects.set(sample.subject, subject);

      const day = days.get(sample.date) || {
        date: sample.date,
        attempts: 0,
        correctAnswers: 0,
        totalAnswers: 0
      };
      day.attempts++;
      if (sample.totalAnswers !== null) {
        day.correctAnswers += sample.correctAnswers;
        day.totalAnswers += sample.totalAnswers;
      }
      days.set(sample.date, day);

      if (!activities.has(sample.activityId)) {
        const skill = curriculumSkills.get(sample.skillId);
        activities.set(sample.activityId, {
          activityId: sample.activityId,
          title: sample.title,
          subject: sample.subject,
          skillId: sample.skillId,
          skillName: skill?.name || null,
          beltName: skill?.beltName || null,
          australianCurriculum: getAustralianCurriculumMapping(sample.skillId)
        });
      }
    }

    const withAccuracy = value => ({
      ...value,
      accuracy: value.totalAnswers > 0
        ? Math.round(value.correctAnswers / value.totalAnswers * 100)
        : null
    });
    const dayRows = [];
    for (let offset = rangeDays - 1; offset >= 0; offset--) {
      const date = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2] - offset))
        .toISOString().slice(0, 10);
      dayRows.push(withAccuracy(days.get(date) || {
        date,
        attempts: 0,
        correctAnswers: 0,
        totalAnswers: 0
      }));
    }

    return {
      rangeDays,
      startDate,
      endDate,
      sampleCount: samples.length,
      subjects: [...subjects.values()].map(withAccuracy)
        .sort((first, second) => first.subject.localeCompare(second.subject)),
      days: dayRows,
      activities: [...activities.values()].sort((first, second) =>
        first.subject.localeCompare(second.subject) || first.title.localeCompare(second.title)
      )
    };
  }

  window.ProgressAnalytics = Object.freeze({
    MAX_ACTIVITY_HISTORY_ENTRIES,
    getAustralianCurriculumMapping,
    isValidDayKey,
    normalizeActivityHistory,
    aggregateActivityHistory
  });
})();
