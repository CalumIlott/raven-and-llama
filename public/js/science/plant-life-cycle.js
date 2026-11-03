const PLANT_LIFE_CYCLE_ACTIVITY_ID = 'science-plant-life-cycle-order';
const PLANT_LIFE_CYCLE_SKILL_ID = 'science_plant_life_cycle';
const PLANT_LIFE_CYCLE_STAGES = [
  {
    id: 'seed',
    name: 'Seed',
    icon: '🌰',
    summary: 'A tiny plant is protected inside.',
    fact: 'A seed contains a young plant and stored food. Many seeds can wait until water, air, and suitable warmth are available.'
  },
  {
    id: 'germination',
    name: 'Germination',
    icon: '🌱',
    summary: 'The seed begins to sprout.',
    fact: 'During germination, a root begins to grow and a shoot pushes out of the seed. The conditions needed can vary by plant.'
  },
  {
    id: 'seedling',
    name: 'Seedling',
    icon: '🌿',
    summary: 'A young plant grows roots and leaves.',
    fact: 'A seedling grows roots to take in water and leaves that help it use sunlight to make food.'
  },
  {
    id: 'mature-flowering-plant',
    name: 'Mature flowering plant',
    icon: '🌼',
    summary: 'The plant grows and may produce flowers.',
    fact: 'In this example, the plant grows larger and produces flowers. The timing and details differ between plant species.'
  },
  {
    id: 'fruit-and-seed-production',
    name: 'Fruit and seed production',
    icon: '🍎',
    summary: 'Flowers can develop into fruit with seeds.',
    fact: 'After pollination and fertilization, many flowering plants form fruit containing seeds. Other plants produce seeds differently.'
  },
  {
    id: 'seed-dispersal',
    name: 'Seed dispersal',
    icon: '🍃',
    summary: 'Seeds move to new places.',
    fact: 'Seeds may travel by wind, water, animals, or other ways. A seed that reaches suitable conditions can begin a new cycle.'
  }
];

function isCompletePlantLifeCyclePlacement(placements) {
  const stageIds = new Set(PLANT_LIFE_CYCLE_STAGES.map(stage => stage.id));
  return Array.isArray(placements) &&
    placements.length === PLANT_LIFE_CYCLE_STAGES.length &&
    placements.every(stageId => stageIds.has(stageId)) &&
    new Set(placements).size === PLANT_LIFE_CYCLE_STAGES.length;
}

function placePlantLifeCycleStage(placements, stageId, positionIndex) {
  if (!Array.isArray(placements) ||
    placements.length !== PLANT_LIFE_CYCLE_STAGES.length ||
    !PLANT_LIFE_CYCLE_STAGES.some(stage => stage.id === stageId) ||
    !Number.isInteger(positionIndex) ||
    positionIndex < 0 ||
    positionIndex >= PLANT_LIFE_CYCLE_STAGES.length) {
    return null;
  }

  const nextPlacements = [...placements];
  const previousPosition = nextPlacements.indexOf(stageId);
  if (previousPosition >= 0) nextPlacements[previousPosition] = null;
  nextPlacements[positionIndex] = stageId;
  return nextPlacements;
}

function getPlantLifeCycleMismatches(placements) {
  return placements.flatMap((stageId, index) => {
    if (stageId === PLANT_LIFE_CYCLE_STAGES[index].id) return [];
    const currentStage = PLANT_LIFE_CYCLE_STAGES.find(stage => stage.id === stageId);
    const expectedStage = PLANT_LIFE_CYCLE_STAGES[index];
    if (index === 0) {
      return [{
        position: index + 1,
        explanation: `After seed dispersal, a new cycle begins with ${expectedStage.name}; ${currentStage.name} belongs later.`
      }];
    }

    return [{
      position: index + 1,
      explanation: `After ${PLANT_LIFE_CYCLE_STAGES[index - 1].name}, ${expectedStage.name} comes next, not ${currentStage.name}.`
    }];
  });
}

function shuffledPlantLifeCycleStages() {
  const stages = [...PLANT_LIFE_CYCLE_STAGES];
  for (let index = stages.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [stages[index], stages[swapIndex]] = [stages[swapIndex], stages[index]];
  }
  return stages;
}

Object.assign(App.prototype, {
  startPlantLifeCycleActivity() {
    this.currentView = 'science-plant-life-cycle';
    this.plantLifeCycleGame = {
      placements: Array(PLANT_LIFE_CYCLE_STAGES.length).fill(null),
      stageTray: shuffledPlantLifeCycleStages(),
      selectedStageId: null,
      factStageId: null,
      message: 'Select a stage, then choose its position. You can also drag a stage to a position.',
      lastAnswerCorrect: null,
      mismatches: [],
      complete: false
    };
    const correctOrder = PLANT_LIFE_CYCLE_STAGES.map(stage => stage.id);
    this.plantLifeCycleActivityEngine = new ActivityEngine();
    this.plantLifeCycleActivityEngine.startQuiz({
      id: PLANT_LIFE_CYCLE_ACTIVITY_ID,
      title: 'Plant Life Cycle',
      subject: 'Science Lab',
      skillId: PLANT_LIFE_CYCLE_SKILL_ID,
      questions: [{
        id: `${PLANT_LIFE_CYCLE_ACTIVITY_ID}-sequence`,
        type: 'ordering',
        prompt: 'Put the stages of a flowering plant life cycle in order.',
        answer: correctOrder,
        correctOrder
      }],
      settings: {
        trackProgress: true,
        awardStars: true,
        pointsPerCorrect: PLANT_LIFE_CYCLE_STAGES.length
      }
    });
    this.renderPlantLifeCycleActivity();
  },

  selectPlantLifeCycleStage(stageId) {
    const game = this.plantLifeCycleGame;
    const stage = PLANT_LIFE_CYCLE_STAGES.find(item => item.id === stageId);
    if (!game || game.complete) return false;
    if (!stage) {
      game.message = 'Choose one of the stages in the tray.';
      this.renderPlantLifeCycleActivity();
      return false;
    }

    game.selectedStageId = stageId;
    game.factStageId = stageId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${stage.name} selected. Choose a position or drag the stage to a slot.`;
    this.renderPlantLifeCycleActivity();
    return true;
  },

  placeSelectedPlantLifeCycleStage(positionIndex) {
    const game = this.plantLifeCycleGame;
    if (!game || !game.selectedStageId) {
      if (game) {
        game.message = 'Choose a stage before choosing a position.';
        this.renderPlantLifeCycleActivity();
      }
      return false;
    }
    return this.placePlantLifeCycleStage(game.selectedStageId, positionIndex);
  },

  placePlantLifeCycleStage(stageId, positionIndex) {
    const game = this.plantLifeCycleGame;
    if (!game || game.complete) return false;
    const placements = placePlantLifeCycleStage(game.placements, stageId, positionIndex);
    if (!placements) {
      game.message = 'That stage could not be placed. Choose a stage from the tray and try again.';
      this.renderPlantLifeCycleActivity();
      return false;
    }

    const stage = PLANT_LIFE_CYCLE_STAGES.find(item => item.id === stageId);
    game.placements = placements;
    game.selectedStageId = null;
    game.factStageId = stageId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${stage.name} placed in Position ${positionIndex + 1}.`;
    this.renderPlantLifeCycleActivity();
    return true;
  },

  submitPlantLifeCycleAnswer() {
    const game = this.plantLifeCycleGame;
    if (!game || game.complete) return false;
    if (!isCompletePlantLifeCyclePlacement(game.placements)) {
      game.message = 'Place each life-cycle stage once before checking the sequence.';
      this.renderPlantLifeCycleActivity();
      return false;
    }
    if (this.plantLifeCycleActivityEngine.answered &&
      !this.plantLifeCycleActivityEngine.lastAnswerCorrect) {
      this.plantLifeCycleActivityEngine.allowRetry();
    }

    const isCorrect = this.plantLifeCycleActivityEngine.submitAnswer(game.placements);
    if (!isCorrect) {
      game.lastAnswerCorrect = false;
      game.mismatches = getPlantLifeCycleMismatches(game.placements);
      game.message = '';
      this.renderPlantLifeCycleActivity();
      return false;
    }

    this.plantLifeCycleActivityEngine.complete();
    game.lastAnswerCorrect = true;
    game.complete = true;
    this.updateHeader();
    this.renderPlantLifeCycleActivity();
    return true;
  },

  renderPlantLifeCycleActivity() {
    const main = document.getElementById('app-main');
    const game = this.plantLifeCycleGame;
    if (!main || !game) return;
    main.dataset.page = 'science-plant-life-cycle';
    this.updateHeader();

    if (game.complete) {
      main.innerHTML = `
        <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div class="play-hud flex items-center justify-between mb-6">
            <button data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
            <span class="play-hud__title text-xs text-slate-400">Plant Life Cycle</span>
          </div>
          <section class="play-question-card science-result-card bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div class="text-6xl mb-4" aria-hidden="true">🌱</div>
            <p class="text-xs uppercase tracking-widest text-emerald-300 font-bold">Science Lab</p>
            <h1 class="font-ninja text-3xl text-white font-bold mt-1">Plant Life Cycle Complete!</h1>
            <p class="text-slate-300 mt-3">You arranged all six stages and earned ⭐ ${PLANT_LIFE_CYCLE_STAGES.length} stars.</p>
            <ol class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 text-left" aria-label="Correct plant life cycle order">
              ${PLANT_LIFE_CYCLE_STAGES.map(stage => `
                <li class="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                  <span class="block text-2xl" aria-hidden="true">${stage.icon}</span>
                  <span class="block text-sm font-bold text-white mt-1">${stage.name}</span>
                </li>
              `).join('')}
            </ol>
            <p class="text-sm text-slate-300 mt-4">After seed dispersal, a seed may begin a new cycle when conditions are suitable.</p>
            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" data-action="plant-life-cycle-restart" class="btn-ninja flex-1 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold transition-colors motion-reduce:transition-none">Try Again</button>
              <button type="button" data-action="science-lab" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors motion-reduce:transition-none">Return to Science Lab</button>
            </div>
          </section>
        </div>
      `;
      return;
    }

    const factStage = PLANT_LIFE_CYCLE_STAGES.find(stage => stage.id === game.factStageId);
    const canSubmit = isCompletePlantLifeCyclePlacement(game.placements);
    const stageCards = game.stageTray.map(stage => {
      const positionIndex = game.placements.indexOf(stage.id);
      const placement = positionIndex >= 0 ? `Position ${positionIndex + 1}` : 'Not placed';
      const selectedClasses = game.selectedStageId === stage.id
        ? 'border-sky-400 bg-sky-950'
        : 'border-slate-700 bg-slate-950/70';
      return `
        <button type="button" draggable="true" data-action="plant-life-cycle-select" data-stage-id="${stage.id}" data-cycle-stage-id="${stage.id}"
                aria-label="${stage.name}. ${stage.summary} ${placement}. Select to read more and place it." aria-pressed="${game.selectedStageId === stage.id}"
                class="min-h-36 rounded-xl border-2 ${selectedClasses} px-3 py-3 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
          <span class="block text-3xl mb-2" aria-hidden="true">${stage.icon}</span>
          <span class="block font-bold">${stage.name}</span>
          <span class="block text-xs text-slate-300 mt-1">${stage.summary}</span>
          <span class="block text-xs text-slate-400 mt-2">${placement}</span>
        </button>
      `;
    }).join('');
    const positions = PLANT_LIFE_CYCLE_STAGES.map((_, index) => {
      const stage = PLANT_LIFE_CYCLE_STAGES.find(item => item.id === game.placements[index]);
      const label = stage
        ? `Position ${index + 1}, ${stage.name}. Place the selected stage here.`
        : `Position ${index + 1}${index === 0 ? ', beginning of the cycle' : ''}, empty. Place the selected stage here.`;
      return `
        <button type="button" data-action="plant-life-cycle-place" data-position-index="${index}" data-cycle-position-index="${index}" data-drag-drop-target
                aria-label="${label}" aria-describedby="plant-life-cycle-instructions"
                class="min-h-16 rounded-xl border-2 border-slate-700 bg-slate-950/70 px-3 py-2 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
          <span class="block text-xs text-slate-400">Position ${index + 1}</span>
          <span class="block font-bold">${stage?.name || 'Empty'}</span>
        </button>
      `;
    }).join('');

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
          <span class="play-hud__title text-xs text-slate-400">Plant Life Cycle</span>
        </div>

        <section class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="text-center mb-5">
            <p class="text-xs uppercase tracking-wider text-sky-300 font-bold">Life science sequencing mission</p>
            <h1 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold mt-2">Plant Life Cycle</h1>
            <p class="text-slate-300 mt-2">Arrange the stages of this flowering plant example. Timing and details can vary between species.</p>
          </div>

          <p id="plant-life-cycle-instructions" class="text-sm text-slate-300 mb-4">Select a stage and a position, or drag a stage into place. On touch screens, tap a stage and then tap its position.</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5" aria-label="Plant life-cycle stage cards">
            ${stageCards}
          </div>

          <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 mb-4" aria-labelledby="plant-life-cycle-fact-title">
            <h2 id="plant-life-cycle-fact-title" class="font-bold text-white">Stage explanation</h2>
            <p id="plant-life-cycle-fact" role="status" aria-live="polite" class="text-slate-300 mt-1">
              ${factStage ? `<strong class="text-white">${factStage.name}:</strong> ${factStage.fact}` : 'Select a stage to learn what changes.'}
            </p>
          </section>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4" aria-label="Plant life-cycle order">
            ${positions}
          </div>
          <p id="plant-life-cycle-status" role="status" aria-live="polite" class="text-sm text-sky-200 min-h-6 mb-3">${game.message}</p>
          ${game.lastAnswerCorrect === false ? `
            <div id="plant-life-cycle-feedback" role="status" aria-live="polite" class="rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 mb-4 text-amber-100">
              <p class="font-bold">Not quite. Use these stage relationships to adjust the sequence:</p>
              <ul class="list-disc pl-5 mt-2">
                ${game.mismatches.map(mismatch => `<li>Position ${mismatch.position}: ${mismatch.explanation}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <button type="button" data-action="plant-life-cycle-submit" ${canSubmit ? '' : 'disabled'}
                  class="w-full rounded-xl bg-sky-700 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed px-5 py-3 text-white font-bold transition-colors motion-reduce:transition-none">
            Check Life Cycle Order
          </button>
        </section>
      </div>
    `;

    main.querySelectorAll('[data-cycle-stage-id]').forEach(button => {
      button.addEventListener('dragstart', event => {
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', button.dataset.cycleStageId);
      });
    });
    main.querySelectorAll('[data-cycle-position-index]').forEach(position => {
      position.addEventListener('dragover', event => event.preventDefault());
      position.addEventListener('drop', event => {
        event.preventDefault();
        const stageId = event.dataTransfer?.getData('text/plain');
        if (!stageId) {
          game.message = 'Choose a stage card before dragging it into position.';
          this.renderPlantLifeCycleActivity();
          return;
        }
        this.placePlantLifeCycleStage(stageId, Number(position.dataset.cyclePositionIndex));
      });
    });
  }
});
