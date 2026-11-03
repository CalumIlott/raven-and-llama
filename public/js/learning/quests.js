const LEARNING_QUEST_CATALOG = Object.freeze([
  Object.freeze({
    id: 'stellar-expedition',
    title: 'Solar System Explorer',
    description: 'Build a picture of our place in space, then discover how living things grow.',
    rewardId: 'stellar-explorer',
    steps: Object.freeze([
      Object.freeze({
        id: 'solar-system-order',
        title: 'Build a Solar System',
        instruction: 'Place the planets in order from the Sun.',
        activityId: 'science-solar-system-order'
      }),
      Object.freeze({
        id: 'plant-life-cycle-order',
        title: 'Explore a Plant Life Cycle',
        instruction: 'Put the stages of a plant life cycle in order.',
        activityId: 'science-plant-life-cycle-order'
      })
    ])
  }),
  Object.freeze({
    id: 'brain-power-trail',
    title: 'Brain Power Trail',
    description: 'Notice a pattern, sharpen your memory, and crack a code.',
    rewardId: 'brain-trailblazer',
    steps: Object.freeze([
      Object.freeze({
        id: 'pattern-recognition',
        title: 'Spot a Pattern',
        instruction: 'Complete a challenging number pattern.',
        activityId: 'brain-power-pattern-recognition'
      }),
      Object.freeze({
        id: 'memory-match',
        title: 'Train Your Memory',
        instruction: 'Find each matching pair.',
        activityId: 'brain-power-memory-match'
      }),
      Object.freeze({
        id: 'code-breaker',
        title: 'Break a Code',
        instruction: 'Use the clues to discover the hidden code.',
        activityId: 'brain-power-code-breaker'
      })
    ])
  })
]);

function isQuestId(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
}

function validateLearningQuestCatalog(quests, resolveActivity, rewardIds) {
  if (!Array.isArray(quests) || quests.length === 0 || typeof resolveActivity !== 'function') {
    throw new TypeError('Learning Quest catalog requires quests and an activity resolver.');
  }
  const questIds = new Set();
  const rewardSet = new Set();
  for (const quest of quests) {
    if (!quest || typeof quest !== 'object' ||
      !isQuestId(quest.id) || questIds.has(quest.id) ||
      typeof quest.title !== 'string' || !quest.title.trim() ||
      typeof quest.description !== 'string' || !quest.description.trim() ||
      !isQuestId(quest.rewardId) || rewardSet.has(quest.rewardId) ||
      (rewardIds && !rewardIds.has(quest.rewardId)) ||
      !Array.isArray(quest.steps) || quest.steps.length < 2 || quest.steps.length > 10) {
      throw new TypeError('Learning Quest catalog contains an invalid or duplicate quest.');
    }

    questIds.add(quest.id);
    rewardSet.add(quest.rewardId);
    const stepIds = new Set();
    const activityIds = new Set();
    for (const step of quest.steps) {
      const activity = step && resolveActivity(step.activityId);
      if (!step || typeof step !== 'object' ||
        !isQuestId(step.id) || stepIds.has(step.id) ||
        typeof step.title !== 'string' || !step.title.trim() ||
        typeof step.instruction !== 'string' || !step.instruction.trim() ||
        !isQuestId(step.activityId) || activityIds.has(step.activityId) ||
        !activity || typeof activity.startMethod !== 'string' || !Array.isArray(activity.arguments)) {
        throw new TypeError(`Learning Quest "${quest.id}" contains an invalid or unsupported step.`);
      }
      stepIds.add(step.id);
      activityIds.add(step.activityId);
    }
  }
  return true;
}

function normalizeLearningQuestProgress(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const normalized = {};
  for (const [questId, rawProgress] of Object.entries(value)) {
    const quest = LEARNING_QUEST_CATALOG.find(candidate => candidate.id === questId);
    if (!quest || !rawProgress || typeof rawProgress !== 'object' || Array.isArray(rawProgress) ||
      !Array.isArray(rawProgress.completedStepIds) ||
      rawProgress.completedStepIds.length > quest.steps.length) continue;

    const completedStepIds = rawProgress.completedStepIds;
    if (completedStepIds.some((stepId, index) => stepId !== quest.steps[index]?.id)) continue;
    if (completedStepIds.length) normalized[questId] = { completedStepIds: [...completedStepIds] };
  }
  return normalized;
}

function advanceLearningQuestProgress(progress, questId, stepId) {
  const normalized = normalizeLearningQuestProgress(progress);
  const quest = LEARNING_QUEST_CATALOG.find(candidate => candidate.id === questId);
  if (!quest) return { progress: normalized, changed: false };
  const completedStepIds = normalized[questId]?.completedStepIds || [];
  const nextStep = quest.steps[completedStepIds.length];
  if (!nextStep || nextStep.id !== stepId) return { progress: normalized, changed: false };

  const updated = {
    ...normalized,
    [questId]: { completedStepIds: [...completedStepIds, stepId] }
  };
  return {
    progress: updated,
    changed: true,
    completed: updated[questId].completedStepIds.length === quest.steps.length
  };
}

function getQuestActivity(activityId) {
  return window.DailyChallenges?.getActivity(activityId) || null;
}

const LEARNING_QUEST_REWARD_IDS = new Set(
  (window.AchievementBadges?.catalog || []).map(badge => badge.id)
);

validateLearningQuestCatalog(LEARNING_QUEST_CATALOG, getQuestActivity, LEARNING_QUEST_REWARD_IDS);

window.LearningQuests = Object.freeze({
  catalog: LEARNING_QUEST_CATALOG,
  validateCatalog: validateLearningQuestCatalog,
  normalizeProgress: normalizeLearningQuestProgress,
  advanceProgress: advanceLearningQuestProgress,
  getActivity: getQuestActivity
});

function escapeLearningQuestHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

Object.assign(App.prototype, {
  showLearningQuests() {
    this.currentView = 'learning-quests';
    this.navigateToPath('/learning-centre/quests');
    this.updateHeader();
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'learning-quests';

    const profile = ProfileManager.getActiveProfile();
    const progress = normalizeLearningQuestProgress(profile.questProgress);
    main.innerHTML = `
      <div class="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <button data-action="learning" class="mb-6 flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300">
          <span aria-hidden="true">←</span><span>Back to Learning Centre</span>
        </button>
        <section class="mb-8 rounded-3xl border border-cyan-700/50 bg-slate-900 p-6 sm:p-8">
          <p class="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-300">Choose a learning adventure</p>
          <h1 class="font-ninja text-3xl font-bold text-white">Learning Quests</h1>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Complete activities in order. You can leave a quest at any time and continue from its next step.
            Signed-in progress syncs across devices; guest progress stays in this visit.
          </p>
        </section>
        <div class="grid gap-6 md:grid-cols-2" role="list" aria-label="Learning quests">
          ${LEARNING_QUEST_CATALOG.map(quest => {
            const completedStepIds = progress[quest.id]?.completedStepIds || [];
            const complete = completedStepIds.length === quest.steps.length;
            const reward = window.AchievementBadges.catalog.find(badge => badge.id === quest.rewardId);
            const nextStep = quest.steps[completedStepIds.length];
            const activityAvailable = nextStep && getQuestActivity(nextStep.activityId);
            return `
              <article role="listitem" data-quest-id="${escapeLearningQuestHtml(quest.id)}"
                class="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg">
                <h2 class="font-ninja text-xl font-bold text-white">${escapeLearningQuestHtml(quest.title)}</h2>
                <p class="mt-2 text-sm text-slate-300">${escapeLearningQuestHtml(quest.description)}</p>
                <p class="mt-3 text-sm font-bold text-cyan-200" data-quest-progress>
                  ${complete ? 'Quest complete' : `${completedStepIds.length} of ${quest.steps.length} steps complete`}
                </p>
                <ol class="mt-4 space-y-3" aria-label="${escapeLearningQuestHtml(quest.title)} steps">
                  ${quest.steps.map((step, index) => {
                    const stepComplete = index < completedStepIds.length;
                    const isNext = index === completedStepIds.length;
                    return `
                      <li class="rounded-xl border ${stepComplete ? 'border-emerald-700 bg-emerald-950/30' : 'border-slate-700 bg-slate-950/50'} p-3">
                        <div class="flex items-start gap-3">
                          <span class="font-bold ${stepComplete ? 'text-emerald-300' : isNext ? 'text-cyan-300' : 'text-slate-500'}">${stepComplete ? '✓' : index + 1}</span>
                          <div>
                            <h3 class="font-bold text-white">${escapeLearningQuestHtml(step.title)}</h3>
                            <p class="mt-1 text-xs text-slate-400">${escapeLearningQuestHtml(step.instruction)}</p>
                            <p class="mt-1 text-xs ${stepComplete ? 'text-emerald-300' : isNext ? 'text-cyan-300' : 'text-slate-500'}">
                              ${stepComplete ? 'Completed' : isNext ? 'Next step' : 'Locked until earlier steps are complete'}
                            </p>
                          </div>
                        </div>
                      </li>
                    `;
                  }).join('')}
                </ol>
                <section class="mt-4 rounded-xl border border-amber-700/60 bg-amber-950/30 p-3" aria-label="Quest reward">
                  <p class="font-bold text-amber-200">Reward: ${escapeLearningQuestHtml(reward?.icon || '🏅')} ${escapeLearningQuestHtml(reward?.name || 'Quest badge')}</p>
                  <p class="mt-1 text-xs text-amber-100/80">${escapeLearningQuestHtml(reward?.criteria || 'Complete every step in this quest.')}</p>
                  ${complete ? '<p class="mt-2 text-sm font-bold text-emerald-300">Reward earned and added to your Trophy Hall.</p>' : ''}
                </section>
                ${complete
                  ? '<p class="mt-4 rounded-lg bg-emerald-950/40 p-3 text-sm font-bold text-emerald-200">You completed this quest!</p>'
                  : `<button type="button" data-action="learning-quest-start" data-quest-id="${escapeLearningQuestHtml(quest.id)}"
                      class="mt-4 w-full rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                      ${activityAvailable ? '' : 'disabled'}>
                      ${completedStepIds.length ? 'Continue' : 'Start'} ${escapeLearningQuestHtml(quest.title)}
                    </button>`}
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  startLearningQuestStep(questId) {
    const quest = LEARNING_QUEST_CATALOG.find(candidate => candidate.id === questId);
    if (!quest) return false;
    const profile = ProfileManager.getActiveProfile();
    const progress = normalizeLearningQuestProgress(profile.questProgress);
    const step = quest.steps[progress[questId]?.completedStepIds.length || 0];
    if (!step) return false;
    const activity = getQuestActivity(step.activityId);
    if (!activity || typeof this[activity.startMethod] !== 'function') return false;

    this.activeLearningQuestRun = { questId, stepId: step.id, profileId: profile.id };
    try {
      this[activity.startMethod](...activity.arguments);
    } catch (error) {
      this.activeLearningQuestRun = null;
      throw error;
    }
    return true;
  },

  recordLearningQuestCompletion(event) {
    const run = this.activeLearningQuestRun;
    const quest = LEARNING_QUEST_CATALOG.find(candidate => candidate.id === run?.questId);
    const step = quest?.steps.find(candidate => candidate.id === run?.stepId);
    if (!run || !step || event?.detail?.id !== step.activityId) return false;

    this.activeLearningQuestRun = null;
    const profile = ProfileManager.getActiveProfile();
    if (profile.id !== run.profileId) return false;
    const result = advanceLearningQuestProgress(profile.questProgress, run.questId, run.stepId);
    if (!result.changed) return false;
    void ProfileManager.updateProfile({ ...profile, questProgress: result.progress });
    return true;
  }
});

window.addEventListener('raven-llama:activity-completed', event => {
  window.app?.recordLearningQuestCompletion(event);
});
