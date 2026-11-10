const VIRTUAL_LAB_ACTIVITY_ID = 'science-virtual-lab';
const VIRTUAL_LAB_SKILL_ID = 'science_virtual_lab';
const VIRTUAL_LAB_POINTS = 4;
const VIRTUAL_LAB_MATERIALS = [
  { id: 'ice', name: 'Ice', icon: '🧊', type: 'Material', fact: 'Ice is solid water in this virtual model.' },
  { id: 'water', name: 'Water', icon: '💧', type: 'Material', fact: 'Water is shown as a liquid in this virtual model.' },
  { id: 'sugar', name: 'Sugar', icon: '🍬', type: 'Material', fact: 'Sugar is represented as tiny solid crystals.' },
  { id: 'sand', name: 'Sand', icon: '🏖️', type: 'Material', fact: 'Sand is represented as visible grains.' },
  { id: 'warmth', name: 'Gentle warmth', icon: '☀️', type: 'Virtual condition', fact: 'Gentle warmth is a simulated condition, not a real heat source.' },
  { id: 'cooling', name: 'Gentle cooling', icon: '❄️', type: 'Virtual condition', fact: 'Gentle cooling is a simulated condition, not a real cooling device.' },
  { id: 'salt', name: 'Table salt', icon: '🧂', type: 'Material', fact: 'Salt is modeled as crystals that can dissolve in water.' },
  { id: 'oil', name: 'Cooking oil', icon: '🫗', type: 'Material', fact: 'Oil is modeled as a liquid that does not mix evenly with water.' },
  { id: 'vinegar', name: 'Vinegar', icon: '🍶', type: 'Material', fact: 'Vinegar is modeled as a dilute acid for this virtual reaction.' },
  { id: 'baking-soda', name: 'Baking soda', icon: '🥄', type: 'Material', fact: 'Baking soda is sodium bicarbonate, a solid that can react with acids.' },
  { id: 'iron-sand-mixture', name: 'Iron and sand mixture', icon: '⚫', type: 'Prepared mixture', fact: 'This prepared mixture contains magnetic iron particles and nonmagnetic sand.' },
  { id: 'magnet', name: 'Magnet', icon: '🧲', type: 'Tool', fact: 'A magnet attracts iron in this simplified separation model.' },
  { id: 'filter-paper', name: 'Filter paper', icon: '📄', type: 'Tool', fact: 'Filter paper can catch suspended particles, but not dissolved substances.' },
  { id: 'salt-water', name: 'Salt water', icon: '🌊', type: 'Prepared mixture', fact: 'Salt water is a solution with salt dissolved throughout the water.' },
  { id: 'sand-water-mixture', name: 'Sand and water mixture', icon: '🏖️', type: 'Prepared mixture', fact: 'Sand stays as visible particles when mixed with water.' },
  { id: 'muddy-water', name: 'Muddy water', icon: '🟤', type: 'Prepared mixture', fact: 'Muddy water contains suspended soil particles.' },
  { id: 'food-coloring', name: 'Food coloring', icon: '🎨', type: 'Material', fact: 'Food coloring mixes through water in this virtual model.' },
  { id: 'flour', name: 'Flour', icon: '🌾', type: 'Material', fact: 'Flour forms a cloudy suspension in water rather than dissolving completely.' }
];
const VIRTUAL_LAB_SIMULATIONS = [
  { id: 'ice-warms', materials: ['ice', 'warmth'], title: 'Ice melts', icon: '💧', explanation: 'In this simulation, solid ice changes into liquid water when the model is warmed.', sourceTitle: 'USGS: The Water Cycle', sourceUrl: 'https://www.usgs.gov/water-science-school/science/sun-and-water-cycle' },
  { id: 'water-cools', materials: ['cooling', 'water'], title: 'Water freezes', icon: '🧊', explanation: 'In this simulation, liquid water changes into solid ice as the model cools.', sourceTitle: 'USGS: What Is the Earth’s Water Cycle?', sourceUrl: 'https://www.usgs.gov/faqs/what-earths-water-cycle' },
  { id: 'sugar-dissolves', materials: ['sugar', 'water'], title: 'Sugar dissolves', icon: '🫧', explanation: 'The simulated sugar spreads through the water to form a solution. The sugar has not vanished.', sourceTitle: 'American Chemical Society: Why Does Water Dissolve Sugar?', sourceUrl: 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter5/lesson4.html' },
  { id: 'sand-mixture', materials: ['sand', 'water'], title: 'Sand and water form a mixture', icon: '🏖️', explanation: 'The sand grains stay visible in the simulated mixture and settle when it rests; they do not dissolve.', sourceTitle: 'Yale: Dissolved, Suspended, and Colloidal Material', sourceUrl: 'https://watermanagement.yale.edu/topics/water-science/introduction-to-water-quality/dissolved/' },
  { id: 'salt-dissolves', materials: ['salt', 'water'], title: 'Salt dissolves', icon: '🧂', explanation: 'Salt particles spread through the water to form a solution; the dissolved salt is still present.', sourceTitle: 'American Chemical Society: Why Does Water Dissolve Salt?', sourceUrl: 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter5/lesson3.html' },
  { id: 'oil-water', materials: ['oil', 'water'], title: 'Oil floats on water', icon: '🫗', explanation: 'The liquids form separate layers in this model because oil is less dense than water and does not mix evenly with it.', sourceTitle: 'NOAA: What Happens to Oil on the Ocean’s Surface?', sourceUrl: 'https://response.restoration.noaa.gov/training-and-education/education-students-and-teachers/what-happens-oil-oceans-surface.html' },
  { id: 'baking-soda-vinegar', materials: ['baking-soda', 'vinegar'], title: 'Baking soda and vinegar produce carbon dioxide', icon: '🫧', explanation: 'The simulated reaction forms carbon dioxide gas, water, and sodium acetate. The bubbles are gas, not smoke.', sourceTitle: 'American Chemical Society: Controlling the Amount of Products in a Chemical Reaction', sourceUrl: 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter6/lesson2.html' },
  { id: 'iron-sand-separation', materials: ['iron-sand-mixture', 'magnet'], title: 'A magnet separates iron from sand', icon: '🧲', explanation: 'The magnet attracts the iron particles in the prepared mixture while the sand remains.', sourceTitle: 'Penn State MRSEC: Mystery Mix', sourceUrl: 'https://www.mrsec.psu.edu/education-outreach/public/museum-kits/materials-matter/mystery-mix' },
  { id: 'sand-water-filtration', materials: ['filter-paper', 'sand-water-mixture'], title: 'Filter paper catches sand', icon: '🧻', explanation: 'In this simplified filtration model, suspended sand particles are caught while water passes through.', sourceTitle: 'Yale: Dissolved, Suspended, and Colloidal Material', sourceUrl: 'https://watermanagement.yale.edu/topics/water-science/introduction-to-water-quality/dissolved/' },
  { id: 'muddy-water-filtration', materials: ['filter-paper', 'muddy-water'], title: 'Filter paper removes visible soil particles', icon: '💧', explanation: 'The filter catches suspended soil particles in this simplified model. This does not mean filtered water is safe to drink.', sourceTitle: 'University of Arizona: Know Your Water', sourceUrl: 'https://wrrc.cals.arizona.edu/sites/wrrc.arizona.edu/files/az%20know%20your%20water.pdf' },
  { id: 'salt-water-filtration', materials: ['filter-paper', 'salt-water'], title: 'Filter paper does not remove dissolved salt', icon: '🧂', explanation: 'Dissolved salt passes through ordinary filter paper with the water; filtration catches particles, not dissolved ions.', sourceTitle: 'Yale: Dissolved, Suspended, and Colloidal Material', sourceUrl: 'https://watermanagement.yale.edu/topics/water-science/introduction-to-water-quality/dissolved/' },
  { id: 'salt-crystals', materials: ['salt-water', 'warmth'], title: 'Evaporation leaves salt crystals', icon: '✨', explanation: 'As water evaporates from the simulated salt solution, the dissolved salt remains and can form crystals.', sourceTitle: 'USGS: Salt Production from Evaporation Ponds', sourceUrl: 'https://www.usgs.gov/media/images/salt-produced-often-letting-saline-water-evaporate-ponds' },
  { id: 'saltwater-freezing-point', materials: ['cooling', 'salt-water'], title: 'Salt water needs more cooling to freeze', icon: '❄️', explanation: 'Dissolved salt lowers water’s freezing point, so this solution stays liquid under cooling that freezes pure water.', sourceTitle: 'American Chemical Society: Changing State—Freezing', sourceUrl: 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter2/lesson4.html' },
  { id: 'water-evaporates', materials: ['water', 'warmth'], title: 'Water evaporates', icon: '☁️', explanation: 'Some liquid water changes into invisible water vapor as the model is warmed; boiling is not required for evaporation.', sourceTitle: 'USGS: The Sun and the Water Cycle', sourceUrl: 'https://www.usgs.gov/water-science-school/science/sun-and-water-cycle' },
  { id: 'food-coloring-mixes', materials: ['food-coloring', 'water'], title: 'Food coloring spreads through water', icon: '🎨', explanation: 'Food-coloring molecules move through and dissolve in the water until the color is distributed.', sourceTitle: 'American Chemical Society: Can Liquids Dissolve in Water?', sourceUrl: 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter5/lesson7.html' },
  { id: 'flour-suspension', materials: ['flour', 'water'], title: 'Flour forms a cloudy suspension', icon: '🥣', explanation: 'Some flour particles remain suspended in water instead of forming a clear solution.', sourceTitle: 'Yale: Dissolved, Suspended, and Colloidal Material', sourceUrl: 'https://watermanagement.yale.edu/topics/water-science/introduction-to-water-quality/dissolved/' },
  { id: 'baking-soda-dissolves', materials: ['baking-soda', 'water'], title: 'Baking soda dissolves in water', icon: '💧', explanation: 'In this model, baking soda particles dissolve and spread through the water; no gas-producing reaction occurs without an acid.', sourceTitle: 'American Chemical Society: A Gas Sudsation!', sourceUrl: 'https://www.acs.org/content/dam/acsorg/education/resources/k-8/science-activities/chemicalphysicalchange/chemicalreactions/a-gas-sudstation.pdf' }
];

function isValidVirtualLabCatalog(materials, simulations) {
  if (!Array.isArray(materials) || materials.length < 10 || !Array.isArray(simulations) || simulations.length < 15) return false;
  const materialIds = new Set();
  for (const material of materials) {
    if (!material || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(material.id) || materialIds.has(material.id) ||
      !['name', 'icon', 'type', 'fact'].every(key => typeof material[key] === 'string' && material[key].trim())) return false;
    materialIds.add(material.id);
  }
  const simulationIds = new Set();
  const combinations = new Set();
  return simulations.every(simulation => {
    if (!simulation || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(simulation.id) || simulationIds.has(simulation.id) ||
      !['title', 'icon', 'explanation', 'sourceTitle'].every(key => typeof simulation[key] === 'string' && simulation[key].trim()) ||
      typeof simulation.sourceUrl !== 'string' || !simulation.sourceUrl.startsWith('https://') ||
      !Array.isArray(simulation.materials) || simulation.materials.length !== 2 ||
      new Set(simulation.materials).size !== 2 || simulation.materials.some(id => !materialIds.has(id))) return false;
    const combination = [...simulation.materials].sort().join('|');
    if (combinations.has(combination)) return false;
    simulationIds.add(simulation.id);
    combinations.add(combination);
    return true;
  });
}

if (!isValidVirtualLabCatalog(VIRTUAL_LAB_MATERIALS, VIRTUAL_LAB_SIMULATIONS)) {
  throw new TypeError('Virtual Lab catalog is missing or invalid.');
}

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

function escapeVirtualLabHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

const VIRTUAL_LAB_FILTERS = [
  { id: 'all', label: 'All items' },
  { id: 'Material', label: 'Materials' },
  { id: 'Prepared mixture', label: 'Prepared mixtures' },
  { id: 'Virtual condition', label: 'Conditions' },
  { id: 'Tool', label: 'Tools' }
];

window.VirtualLab = Object.freeze({
  materials: VIRTUAL_LAB_MATERIALS,
  simulations: VIRTUAL_LAB_SIMULATIONS,
  isValidCatalog: isValidVirtualLabCatalog,
  getSimulation: getVirtualLabSimulation
});

Object.assign(App.prototype, {
  startVirtualLabActivity() {
    this.currentView = 'science-virtual-lab';
    this.virtualLabGame = {
      slots: [null, null],
      materialFilter: 'all',
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

  filterVirtualLabMaterials(filter) {
    const game = this.virtualLabGame;
    if (!game || !VIRTUAL_LAB_FILTERS.some(option => option.id === filter)) return false;
    game.materialFilter = filter;
    this.renderVirtualLabActivity();
    return true;
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
    const filterButtons = VIRTUAL_LAB_FILTERS.map(filter => `
      <button type="button" data-action="virtual-lab-filter" data-virtual-lab-filter="${filter.id}" aria-pressed="${game.materialFilter === filter.id}" class="rounded-full border px-3 py-2 text-sm font-bold ${game.materialFilter === filter.id ? 'border-sky-400 bg-sky-900 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-400'}">${filter.label}</button>
    `).join('');
    const visibleMaterials = VIRTUAL_LAB_MATERIALS.filter(material => game.materialFilter === 'all' || material.type === game.materialFilter);
    const materialCards = visibleMaterials.map(material => {
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
              ${game.result.kind === 'supported' && game.result.sourceUrl ? `<p class="text-xs text-slate-300 mt-3">Learn more: <a class="text-cyan-300 underline" href="${escapeVirtualLabHtml(game.result.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeVirtualLabHtml(game.result.sourceTitle)}</a></p>` : ''}
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
            <p class="text-slate-300 mt-2">Explore ${VIRTUAL_LAB_SIMULATIONS.length} carefully authored outcomes using virtual materials, mixtures, conditions, and tools.</p>
          </div>

          <aside aria-label="Simulation notice" class="rounded-xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 mb-5">
            All outcomes are computer simulations, not real-world experiment instructions or safety guidance.
          </aside>
          <p id="virtual-lab-instructions" class="text-sm text-slate-300 mb-4">Select two different items and choose a workspace slot for each, or drag an item into a slot. On touch screens, tap an item and then tap its slot. Only authored combinations produce a simulated outcome.</p>
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-5">
            <div class="min-w-0">
              <div class="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter virtual lab items">
                ${filterButtons}
              </div>
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

    main.querySelectorAll('[data-virtual-lab-filter]').forEach(button => {
      button.addEventListener('click', () => this.filterVirtualLabMaterials(button.dataset.virtualLabFilter));
    });
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
