const VIRTUAL_LAB_ACTIVITY_ID = 'science-virtual-lab';
const VIRTUAL_LAB_SKILL_ID = 'science_virtual_lab';
const VIRTUAL_LAB_POINTS = 4;
const VIRTUAL_LAB_MATERIALS = [
  {
    id: 'ice',
    name: 'Ice',
    icon: '🧊',
    type: 'Material',
    fact: 'Ice is solid water in this virtual model.'
  },
  {
    id: 'water',
    name: 'Water',
    icon: '💧',
    type: 'Material',
    fact: 'Water is shown as a liquid in this virtual model.'
  },
  {
    id: 'sugar',
    name: 'Sugar',
    icon: '🍬',
    type: 'Material',
    fact: 'Sugar is represented as tiny solid crystals.'
  },
  {
    id: 'sand',
    name: 'Sand',
    icon: '🏖️',
    type: 'Material',
    fact: 'Sand is represented as visible grains.'
  },
  {
    id: 'warmth',
    name: 'Gentle warmth',
    icon: '☀️',
    type: 'Virtual condition',
    fact: 'Gentle warmth is a simulated condition, not a real heat source.'
  },
  {
    id: 'cooling',
    name: 'Gentle cooling',
    icon: '❄️',
    type: 'Virtual condition',
    fact: 'Gentle cooling is a simulated condition, not a real cooling device.'
  }
];
const VIRTUAL_LAB_SIMULATIONS = [
  {
    id: 'ice-warms',
    materials: ['ice', 'warmth'],
    title: 'Ice melts',
    icon: '💧',
    explanation: 'In this simulation, solid ice changes into liquid water when the model is warmed.'
  },
  {
    id: 'water-cools',
    materials: ['cooling', 'water'],
    title: 'Water freezes',
    icon: '🧊',
    explanation: 'In this simulation, liquid water changes into solid ice as the model cools.'
  },
  {
    id: 'sugar-dissolves',
    materials: ['sugar', 'water'],
    title: 'Sugar dissolves',
    icon: '🫧',
    explanation: 'The simulated sugar spreads through the water to form a solution. The sugar has not vanished.'
  },
  {
    id: 'sand-mixture',
    materials: ['sand', 'water'],
    title: 'Sand and water form a mixture',
    icon: '🏖️',
    explanation: 'The sand grains stay visible in the simulated mixture and settle when it rests; they do not dissolve.'
  }
];

function getVirtualLabSimulation(materialIds) {
  if (!Array.isArray(materialIds) ||
    materialIds.length !== 2 ||
    materialIds.some(id => !VIRTUAL_LAB_MATERIALS.some(material => material.id === id)) ||
    new Set(materialIds).size !== 2) {
    return null;
  }

  const combination = [...materialIds].sort().join('|');
  return VIRTUAL_LAB_SIMULATIONS.find(simulation => [...simulation.materials].sort().join('|') === combination) || null;
}

Object.assign(App.prototype, {
  startVirtualLabActivity() {
    this.currentView = 'science-virtual-lab';
    this.virtualLabGame = {
      slots: [null, null],
      selectedMaterialId: null,
      factMaterialId: null,
      result: null,
      completed: false,
      message: 'Choose two different items, place them in the workspace, and run a simulation.'
    };
    this.virtualLabActivityEngine = new ActivityEngine();
    this.virtualLabActivityEngine.startQuiz({
      id: VIRTUAL_LAB_ACTIVITY_ID,
      title: 'Virtual Laboratory',
      subject: 'Science Lab',
      skillId: VIRTUAL_LAB_SKILL_ID,
      questions: [{
        id: `${VIRTUAL_LAB_ACTIVITY_ID}-simulation`,
        type: 'simulation',
        prompt: 'Run one authored virtual simulation.',
        answer: true
      }],
      settings: {
        trackProgress: true,
        awardStars: true,
        pointsPerCorrect: VIRTUAL_LAB_POINTS
      }
    });
    this.renderVirtualLabActivity();
  },

  selectVirtualLabMaterial(materialId) {
    const game = this.virtualLabGame;
    const material = VIRTUAL_LAB_MATERIALS.find(item => item.id === materialId);
    if (!game) return false;
    if (!material) {
      game.message = 'Choose one of the items shown in the virtual lab.';
      this.renderVirtualLabActivity();
      return false;
    }

    game.selectedMaterialId = materialId;
    game.factMaterialId = materialId;
    game.message = `${material.name} selected. Choose a workspace slot or drag it there.`;
    this.renderVirtualLabActivity();
    return true;
  },

  placeSelectedVirtualLabMaterial(slotIndex) {
    const game = this.virtualLabGame;
    if (!game || !game.selectedMaterialId) {
      if (game) {
        game.message = 'Choose an item before choosing a workspace slot.';
        this.renderVirtualLabActivity();
      }
      return false;
    }
    return this.placeVirtualLabMaterial(game.selectedMaterialId, slotIndex);
  },

  placeVirtualLabMaterial(materialId, slotIndex) {
    const game = this.virtualLabGame;
    if (!game) return false;
    if (!VIRTUAL_LAB_MATERIALS.some(material => material.id === materialId) ||
      !Number.isInteger(slotIndex) ||
      slotIndex < 0 ||
      slotIndex >= game.slots.length) {
      game.message = 'That item could not be placed. Choose an item and workspace slot, then try again.';
      this.renderVirtualLabActivity();
      return false;
    }

    const slots = [...game.slots];
    const previousSlot = slots.indexOf(materialId);
    if (previousSlot >= 0) slots[previousSlot] = null;
    slots[slotIndex] = materialId;
    game.slots = slots;
    game.selectedMaterialId = null;
    game.factMaterialId = materialId;
    game.result = null;
    const material = VIRTUAL_LAB_MATERIALS.find(item => item.id === materialId);
    game.message = `${material.name} placed in Workspace Slot ${slotIndex + 1}.`;
    this.renderVirtualLabActivity();
    return true;
  },

  runVirtualLabSimulation() {
    const game = this.virtualLabGame;
    if (!game) return false;
    if (game.slots.some(materialId => !materialId)) {
      game.message = 'Place two different items in the workspace before running a simulation.';
      this.renderVirtualLabActivity();
      return false;
    }

    const simulation = getVirtualLabSimulation(game.slots);
    if (!simulation) {
      game.result = {
        kind: 'unsupported',
        title: 'No authored simulation for this pairing',
        icon: '🔎',
        explanation: 'This virtual lab does not model this combination. The items stay unchanged; no outcome is assumed.'
      };
      game.message = 'No simulation was run for this pairing.';
      this.renderVirtualLabActivity();
      return false;
    }

    game.result = { kind: 'supported', ...simulation };
    game.message = `Simulation result: ${simulation.title}.`;
    if (!game.completed) {
      if (this.virtualLabActivityEngine.submitAnswer(true) !== true) {
        throw new Error('The virtual laboratory simulation could not be recorded by the activity engine.');
      }
      if (!this.virtualLabActivityEngine.complete()) {
        throw new Error('The virtual laboratory activity could not be completed.');
      }
      game.completed = true;
    }

    this.updateHeader();
    this.renderVirtualLabActivity();
    return true;
  },

  resetVirtualLabWorkspace() {
    const game = this.virtualLabGame;
    if (!game) return false;
    game.slots = [null, null];
    game.selectedMaterialId = null;
    game.factMaterialId = null;
    game.result = null;
    game.message = game.completed
      ? 'Workspace reset. You can keep exploring; progress is recorded only once per activity.'
      : 'Workspace reset. Choose two different items to run another simulation.';
    this.renderVirtualLabActivity();
    return true;
  },

  renderVirtualLabActivity() {
    const main = document.getElementById('app-main');
    const game = this.virtualLabGame;
    if (!main || !game) return;
    main.dataset.page = 'science-virtual-lab';
    this.updateHeader();

    const factMaterial = VIRTUAL_LAB_MATERIALS.find(material => material.id === game.factMaterialId);
    const materialCards = VIRTUAL_LAB_MATERIALS.map(material => {
      const slotIndex = game.slots.indexOf(material.id);
      const placement = slotIndex >= 0 ? `Workspace Slot ${slotIndex + 1}` : 'Not in workspace';
      const selectedClasses = game.selectedMaterialId === material.id
        ? 'border-sky-400 bg-sky-950'
        : 'border-slate-700 bg-slate-950/70';
      return `
        <button type="button" draggable="true" data-action="virtual-lab-select" data-material-id="${material.id}" data-virtual-lab-material-id="${material.id}"
                aria-label="${material.name}, ${material.type}. ${material.fact} ${placement}. Select to read more and place it."
                aria-pressed="${game.selectedMaterialId === material.id}"
                class="min-h-32 rounded-xl border-2 ${selectedClasses} px-3 py-3 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
          <span class="block text-3xl mb-2" aria-hidden="true">${material.icon}</span>
          <span class="block font-bold">${material.name}</span>
          <span class="block text-xs text-slate-300 mt-1">${material.type}</span>
          <span class="block text-xs text-slate-400 mt-2">${placement}</span>
        </button>
      `;
    }).join('');
    const workspace = game.slots.map((materialId, index) => {
      const material = VIRTUAL_LAB_MATERIALS.find(item => item.id === materialId);
      const contents = material ? `${material.icon} ${material.name}` : 'Empty';
      return `
        <button type="button" data-action="virtual-lab-place" data-slot-index="${index}" data-virtual-lab-slot-index="${index}" data-drag-drop-target
                aria-label="Workspace Slot ${index + 1}, ${material?.name || 'empty'}. Place the selected item here."
                aria-describedby="virtual-lab-instructions"
                class="min-h-20 rounded-xl border-2 border-slate-700 bg-slate-950/70 px-3 py-3 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
          <span class="block text-xs text-slate-400">Workspace Slot ${index + 1}</span>
          <span class="block font-bold mt-1">${contents}</span>
        </button>
      `;
    }).join('');
    const result = game.result
      ? `
        <section id="virtual-lab-result" role="status" aria-live="polite" aria-labelledby="virtual-lab-result-title"
                 class="rounded-2xl border ${game.result.kind === 'supported' ? 'border-emerald-500/60 bg-emerald-950/40' : 'border-amber-500/60 bg-amber-950/40'} p-4 mt-4 text-white">
          <div class="flex items-start gap-3">
            <span class="text-3xl" aria-hidden="true">${game.result.icon}</span>
            <div>
              <p class="text-xs uppercase tracking-wider font-bold">${game.result.kind === 'supported' ? 'Simulated outcome' : 'No result predicted'}</p>
              <h2 id="virtual-lab-result-title" class="font-bold mt-1">${game.result.title}</h2>
              <p class="text-sm text-slate-200 mt-1">${game.result.explanation}</p>
            </div>
          </div>
        </section>
      `
      : '';
    const completion = game.completed
      ? `<p id="virtual-lab-progress" role="status" aria-live="polite" class="mt-3 text-sm text-emerald-200">Activity complete: ⭐ ${VIRTUAL_LAB_POINTS} stars recorded. You can continue exploring without earning duplicate progress.</p>`
      : '';

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
          <span class="play-hud__title text-xs text-slate-400">Virtual Laboratory</span>
        </div>

        <section class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="text-center mb-5">
            <p class="text-xs uppercase tracking-wider text-sky-300 font-bold">Bounded science simulation</p>
            <h1 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold mt-2">Virtual Laboratory</h1>
            <p class="text-slate-300 mt-2">Explore a few carefully authored changes using virtual materials and conditions.</p>
          </div>

          <aside aria-label="Simulation notice" class="rounded-xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 mb-5">
            All outcomes are computer simulations, not real-world experiment instructions or safety guidance.
          </aside>
          <p id="virtual-lab-instructions" class="text-sm text-slate-300 mb-4">Select two different items and choose a workspace slot for each, or drag an item into a slot. On touch screens, tap an item and then tap its slot. Only authored combinations produce a simulated outcome.</p>
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-5">
            <div class="min-w-0">
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5" aria-label="Curated virtual materials and conditions">
                ${materialCards}
              </div>
              <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4" aria-labelledby="virtual-lab-fact-title">
                <h2 id="virtual-lab-fact-title" class="font-bold text-white">Item explanation</h2>
                <p id="virtual-lab-fact" role="status" aria-live="polite" class="text-slate-300 mt-1">
                  ${factMaterial ? `<strong class="text-white">${factMaterial.name}:</strong> ${factMaterial.fact}` : 'Select an item to learn how it is represented in the simulation.'}
                </p>
              </section>
            </div>
            <div class="min-w-0">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Virtual laboratory workspace">
                ${workspace}
              </div>
              <p id="virtual-lab-status" role="status" aria-live="polite" class="text-sm text-sky-200 min-h-6 mt-3">${game.message}</p>
              ${result}
              ${completion}
              <div class="flex flex-col sm:flex-row gap-3 mt-5">
                <button type="button" data-action="virtual-lab-run" ${game.slots.every(Boolean) ? '' : 'disabled'}
                        class="flex-1 rounded-xl bg-sky-700 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed px-5 py-3 text-white font-bold transition-colors motion-reduce:transition-none">
                  Run Simulation
                </button>
                <button type="button" data-action="virtual-lab-reset"
                        class="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-3 text-white font-bold transition-colors motion-reduce:transition-none">
                  Reset Workspace
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    main.querySelectorAll('[data-virtual-lab-material-id]').forEach(button => {
      button.addEventListener('dragstart', event => {
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', button.dataset.virtualLabMaterialId);
      });
    });
    main.querySelectorAll('[data-virtual-lab-slot-index]').forEach(slot => {
      slot.addEventListener('dragover', event => event.preventDefault());
      slot.addEventListener('drop', event => {
        event.preventDefault();
        const materialId = event.dataTransfer?.getData('text/plain');
        if (!materialId) {
          game.message = 'Choose an item before dragging it into the workspace.';
          this.renderVirtualLabActivity();
          return;
        }
        this.placeVirtualLabMaterial(materialId, Number(slot.dataset.virtualLabSlotIndex));
      });
    });
  }
});
