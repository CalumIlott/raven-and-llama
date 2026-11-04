const DAILY_CHALLENGE_BONUS_STARS = 10;
const DAILY_CHALLENGE_HISTORY_LIMIT = 31;
const DAILY_CHALLENGE_POOLS = [
  {
    subject: 'Maths',
    activities: [
      { id: 'fraction-pizza', title: 'Fraction Pizza', startMethod: 'startFractionPizza', arguments: ['medium'] },
      { id: 'maths-number-builder', title: 'Number Builder', startMethod: 'startNumberBuilder', arguments: ['medium'] },
      { id: 'maths-missing-number', title: 'Missing Number', startMethod: 'startMissingNumber', arguments: ['medium'] }
    ]
  },
  {
    subject: 'Spelling',
    activities: [
      { id: 'spelling-spelling-sprint', title: 'Spelling Sprint', startMethod: 'startSpellingSafari', arguments: ['spelling-sprint'] },
      { id: 'spelling-phonics-trail', title: 'Phonics Trail', startMethod: 'startSpellingSafari', arguments: ['phonics-trail'] },
      { id: 'spelling-word-explorer', title: 'Word Explorer', startMethod: 'startSpellingSafari', arguments: ['word-explorer'] },
      { id: 'spelling-jungle-jumble', title: 'Jungle Jumble', startMethod: 'startSpellingSafari', arguments: ['jungle-jumble'] }
    ]
  },
  {
    subject: 'Science',
    activities: [
      { id: 'science-solar-system-order', title: 'Build a Solar System', startMethod: 'startSolarSystemActivity', arguments: [] },
      { id: 'science-plant-life-cycle-order', title: 'Plant Life Cycle', startMethod: 'startPlantLifeCycleActivity', arguments: [] }
    ]
  },
  {
    subject: 'Brain Power',
    activities: [
      { id: 'brain-power-pattern-recognition', title: 'Pattern Recognition', startMethod: 'startBrainPowerPattern', arguments: [] },
      { id: 'brain-power-memory-match', title: 'Memory Match', startMethod: 'startBrainPowerMemoryMatch', arguments: [] },
      { id: 'brain-power-code-breaker', title: 'Code Breaker', startMethod: 'startBrainPowerCodeBreaker', arguments: [] }
    ]
  }
];

function isDailyChallengeDayKey(dayKey) {
  if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
  const [year, month, day] = dayKey.split('-').map(Number);
  if (year < 1970 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function getDailyChallengeDayKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('Daily Challenges requires a valid date.');
  }
  return date.toISOString().slice(0, 10);
}

function hashDailyChallengeKey(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function selectDailyChallengeActivities(dayKey, pools = DAILY_CHALLENGE_POOLS) {
  if (!isDailyChallengeDayKey(dayKey)) throw new TypeError('Daily Challenges requires a valid UTC day key.');
  if (!Array.isArray(pools)) throw new TypeError('Daily Challenge pools must be an array.');

  return pools.flatMap(pool => {
    if (!pool || typeof pool.subject !== 'string' || !Array.isArray(pool.activities)) return [];
    const activities = pool.activities.filter(activity =>
      activity && typeof activity.id === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(activity.id) &&
      typeof activity.title === 'string' && typeof activity.startMethod === 'string' &&
      Array.isArray(activity.arguments)
    );
    if (!activities.length) return [];
    const selected = activities[hashDailyChallengeKey(`${dayKey}:${pool.subject}`) % activities.length];
    return [{ ...selected, subject: pool.subject }];
  });
}

function getDailyChallengeActivity(activityId) {
  for (const pool of DAILY_CHALLENGE_POOLS) {
    const activity = pool.activities.find(candidate => candidate.id === activityId);
    if (activity) return { ...activity, subject: pool.subject };
  }
  return null;
}

function ensureDailyChallengeDay(profile, dayKey, app) {
  if (!isDailyChallengeDayKey(dayKey)) throw new TypeError('Daily Challenges requires a valid UTC day key.');
  if (!profile.dailyChallenges || typeof profile.dailyChallenges !== 'object') {
    profile.dailyChallenges = { days: {} };
  }
  if (!profile.dailyChallenges.days || typeof profile.dailyChallenges.days !== 'object') {
    profile.dailyChallenges.days = {};
  }

  let changed = false;
  let day = profile.dailyChallenges.days[dayKey];
  if (!day) {
    const activities = selectDailyChallengeActivities(dayKey).filter(activity =>
      typeof app[activity.startMethod] === 'function'
    );
    day = {
      activityIds: activities.map(activity => activity.id),
      completedActivityIds: [],
      bonusAwarded: false
    };
    profile.dailyChallenges.days[dayKey] = day;
    changed = true;
  }

  const availableIds = new Set(DAILY_CHALLENGE_POOLS.flatMap(pool =>
    pool.activities
      .filter(activity => typeof app[activity.startMethod] === 'function')
      .map(activity => activity.id)
  ));
  const activityIds = Array.isArray(day.activityIds)
    ? day.activityIds.filter(id => availableIds.has(id))
    : [];
  const completedActivityIds = Array.isArray(day.completedActivityIds)
    ? day.completedActivityIds.filter(id => activityIds.includes(id))
    : [];
  if (activityIds.length !== day.activityIds?.length ||
    completedActivityIds.length !== day.completedActivityIds?.length) {
    day.activityIds = activityIds;
    day.completedActivityIds = completedActivityIds;
    changed = true;
  }

  const dayKeys = Object.keys(profile.dailyChallenges.days)
    .filter(isDailyChallengeDayKey)
    .sort();
  for (const expiredKey of dayKeys.slice(0, Math.max(0, dayKeys.length - DAILY_CHALLENGE_HISTORY_LIMIT))) {
    delete profile.dailyChallenges.days[expiredKey];
    changed = true;
  }
  return { day, changed };
}

Object.assign(App.prototype, {
  getDailyChallengeState(date = new Date()) {
    const dayKey = getDailyChallengeDayKey(date);
    const profile = ProfileManager.getActiveProfile();
    const { day, changed } = ensureDailyChallengeDay(profile, dayKey, this);
    if (changed && ProfileManager.account) ProfileManager.updateProfile(profile);
    const completed = new Set(day.completedActivityIds);
    const activities = day.activityIds
      .map(getDailyChallengeActivity)
      .filter(activity => activity && typeof this[activity.startMethod] === 'function')
      .map(activity => ({ ...activity, completed: completed.has(activity.id) }));
    return {
      dayKey,
      activities,
      completedCount: activities.filter(activity => activity.completed).length,
      bonusAwarded: day.bonusAwarded,
      bonusStars: DAILY_CHALLENGE_BONUS_STARS
    };
  },

  renderDailyChallenges(date = new Date()) {
    const state = this.getDailyChallengeState(date);
    const status = !state.activities.length
      ? 'No daily challenges are available right now.'
      : state.bonusAwarded
        ? `All ${state.activities.length} challenges complete. You earned ${state.bonusStars} bonus stars!`
        : `${state.completedCount} of ${state.activities.length} challenges complete. Finish them all for ${state.bonusStars} bonus stars.`;
    return `
      <section id="daily-challenges" class="rounded-3xl border border-cyan-700/60 bg-slate-900/80 p-5 sm:p-7 shadow-xl" data-day-key="${state.dayKey}" aria-labelledby="daily-challenges-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-cyan-300">A fresh set every day · UTC</p>
            <h2 id="daily-challenges-title" class="mt-1 font-ninja text-2xl font-bold text-white">Daily Challenges</h2>
            <p class="mt-1 text-sm text-slate-300">Try one activity from each learning area. Your daily set changes at midnight UTC.</p>
          </div>
          <p id="daily-challenges-status" class="text-sm font-semibold text-amber-200" role="status" aria-live="polite">${status}</p>
        </div>
        ${state.activities.length
          ? `<ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              ${state.activities.map(activity => `
                <li class="rounded-2xl border border-slate-700 bg-slate-950/60 p-4" data-daily-challenge="${activity.id}">
                  <p class="text-xs font-bold uppercase tracking-wide text-cyan-300">${activity.subject}</p>
                  <h3 class="mt-1 font-bold text-white">${activity.title}</h3>
                  <p class="mt-1 min-h-10 text-sm text-slate-300">${activity.completed ? 'Completed today.' : 'Complete this activity to make progress.'}</p>
                  <button type="button" data-action="daily-challenge-start" data-challenge-id="${activity.id}" class="mt-3 w-full rounded-xl bg-cyan-700 px-4 py-2 font-bold text-white hover:bg-cyan-600">
                    ${activity.completed ? 'Play again' : 'Start challenge'}
                  </button>
                </li>
              `).join('')}
            </ul>`
          : '<p class="mt-4 text-sm text-slate-300">Please check back later.</p>'}
      </section>
    `;
  },

  startDailyChallenge(activityId, date = new Date()) {
    const state = this.getDailyChallengeState(date);
    const activity = state.activities.find(candidate => candidate.id === activityId);
    if (!activity) return false;
    this[activity.startMethod](...activity.arguments);
    return true;
  },

  recordDailyChallengeCompletion(event, date = new Date()) {
    const activityId = event?.detail?.id;
    if (typeof activityId !== 'string') return false;
    const profile = ProfileManager.getActiveProfile();
    const { day } = ensureDailyChallengeDay(profile, getDailyChallengeDayKey(date), this);
    if (!day.activityIds.includes(activityId) ||
      day.completedActivityIds.includes(activityId)) return false;

    day.completedActivityIds.push(activityId);
    const completedAll = day.activityIds.length > 0 &&
      day.activityIds.every(id => day.completedActivityIds.includes(id));
    if (completedAll && !day.bonusAwarded) {
      day.bonusAwarded = true;
      profile.stars += DAILY_CHALLENGE_BONUS_STARS;
    }
    ProfileManager.updateProfile(profile);
    return true;
  }
});

window.DailyChallenges = Object.freeze({
  bonusStars: DAILY_CHALLENGE_BONUS_STARS,
  getDayKey: getDailyChallengeDayKey,
  getActivity: getDailyChallengeActivity,
  isValidDayKey: isDailyChallengeDayKey,
  selectForDate: selectDailyChallengeActivities
});

window.addEventListener('raven-llama:activity-completed', event => {
  window.app?.recordDailyChallengeCompletion(event);
});
