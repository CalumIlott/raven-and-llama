const FOOD_CHAINS_ACTIVITY_ID = 'science-food-chains';
const FOOD_CHAINS_SKILL_ID = 'science_food_chains';
const FOOD_CHAIN_ROLE_ORDER = [
  'producer',
  'primary-consumer',
  'secondary-consumer',
  'tertiary-consumer'
];
const FOOD_CHAIN_DATA = [
  {
    id: 'grassland',
    name: 'Grassland',
    description: 'Follow one possible path of energy through a grassland.',
    energySource: 'sunlight',
    sourceTitle: 'National Geographic Education: Food Chain',
    sourceUrl: 'https://education.nationalgeographic.org/resource/food-chain/',
    organisms: [
      {
        id: 'grass',
        name: 'Grass',
        role: 'producer',
        roleLabel: 'Producer',
        summary: 'Makes its own food using sunlight.',
        fact: 'Grass produces its own food using energy from sunlight.',
        foodSourceId: null
      },
      {
        id: 'rabbit',
        name: 'Rabbit',
        role: 'primary-consumer',
        roleLabel: 'Primary consumer',
        summary: 'Eats plants such as grass.',
        fact: 'In this example, the rabbit gets energy by eating grass.',
        foodSourceId: 'grass'
      },
      {
        id: 'fox',
        name: 'Fox',
        role: 'secondary-consumer',
        roleLabel: 'Secondary consumer',
        summary: 'Eats the rabbit in this example.',
        fact: 'In this example, the fox gets energy by eating the rabbit.',
        foodSourceId: 'rabbit'
      }
    ]
  },
  {
    id: 'kelp-forest',
    name: 'Kelp forest',
    description: 'Follow one possible path of energy through a kelp forest.',
    energySource: 'sunlight',
    sourceTitle: 'National Geographic Education: Food Web',
    sourceUrl: 'https://education.nationalgeographic.org/resource/food-web/',
    organisms: [
      {
        id: 'giant-kelp',
        name: 'Giant kelp',
        role: 'producer',
        roleLabel: 'Producer',
        summary: 'A seaweed that makes its own food.',
        fact: 'Giant kelp is a seaweed producer in kelp-forest food webs.',
        foodSourceId: null
      },
      {
        id: 'sea-urchin',
        name: 'Sea urchin',
        role: 'primary-consumer',
        roleLabel: 'Primary consumer',
        summary: 'Grazes on giant kelp.',
        fact: 'Sea urchins eat giant kelp in this example.',
        foodSourceId: 'giant-kelp'
      },
      {
        id: 'sea-otter',
        name: 'Sea otter',
        role: 'secondary-consumer',
        roleLabel: 'Secondary consumer',
        summary: 'Hunts sea urchins in this example.',
        fact: 'A sea otter can get energy by hunting sea urchins.',
        foodSourceId: 'sea-urchin'
      }
    ]
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Follow one possible path of energy through a desert.',
    energySource: 'sunlight',
    sourceTitle: 'National Geographic Education: Food Web',
    sourceUrl: 'https://education.nationalgeographic.org/resource/food-web/',
    organisms: [
      {
        id: 'desert-plant',
        name: 'Desert plant',
        role: 'producer',
        roleLabel: 'Producer',
        summary: 'Makes food using sunlight; its seeds can feed animals.',
        fact: 'Plants make their own food, and their seeds can feed desert animals.',
        foodSourceId: null
      },
      {
        id: 'desert-mouse',
        name: 'Desert mouse',
        role: 'primary-consumer',
        roleLabel: 'Primary consumer',
        summary: 'Eats seeds and fruit from plants.',
        fact: 'A desert mouse can get energy by eating seeds and fruit.',
        foodSourceId: 'desert-plant'
      },
      {
        id: 'snake',
        name: 'Snake',
        role: 'secondary-consumer',
        roleLabel: 'Secondary consumer',
        summary: 'Can eat a mouse in this example.',
        fact: 'In this desert example, a snake eats a mouse.',
        foodSourceId: 'desert-mouse'
      },
      {
        id: 'owl',
        name: 'Owl',
        role: 'tertiary-consumer',
        roleLabel: 'Tertiary consumer',
        summary: 'Can prey on a snake in this example.',
        fact: 'In this desert example, an owl can prey on a snake.',
        foodSourceId: 'snake'
      }
    ]
  }
];

function isValidFoodChainData(chains) {
  if (!Array.isArray(chains) || chains.length < 2) return false;
  const chainIds = new Set();
  return chains.every(chain => {
    if (!chain || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(chain.id) ||
      chainIds.has(chain.id) ||
      !['name', 'description', 'sourceTitle'].every(key =>
        typeof chain[key] === 'string' && chain[key].trim()) ||
      chain.energySource !== 'sunlight' ||
      typeof chain.sourceUrl !== 'string' || !chain.sourceUrl.startsWith('https://') ||
      !Array.isArray(chain.organisms) ||
      chain.organisms.length < 3 || chain.organisms.length > FOOD_CHAIN_ROLE_ORDER.length) {
      return false;
    }

    chainIds.add(chain.id);
    const organismIds = new Set();
    return chain.organisms.every((organism, index) => {
      if (!organism || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(organism.id) ||
        organismIds.has(organism.id) ||
        !['name', 'roleLabel', 'summary', 'fact'].every(key =>
          typeof organism[key] === 'string' && organism[key].trim()) ||
        organism.role !== FOOD_CHAIN_ROLE_ORDER[index] ||
        (index === 0
          ? organism.foodSourceId !== null
          : organism.foodSourceId !== chain.organisms[index - 1].id)) {
        return false;
      }
      organismIds.add(organism.id);
      return true;
    });
  });
}

if (!isValidFoodChainData(FOOD_CHAIN_DATA)) {
  throw new TypeError('Food chain data is missing or invalid.');
}

function shuffleFoodChainItems(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleFoodChainOrganisms(chain, random = Math.random) {
  return shuffleFoodChainItems(chain.organisms, random);
}

function isCompleteFoodChainPlacement(placements, chain) {
  if (!chain || !Array.isArray(chain.organisms)) return false;
  const organismIds = new Set(chain.organisms.map(organism => organism.id));
  return Array.isArray(placements) &&
    placements.length === chain.organisms.length &&
    placements.every(organismId => organismIds.has(organismId)) &&
    new Set(placements).size === chain.organisms.length;
}

function moveFoodChainOrganism(placements, chain, organismId, positionIndex) {
  if (!Array.isArray(placements) ||
    !chain || !Array.isArray(chain.organisms) ||
    placements.length !== chain.organisms.length ||
    !chain.organisms.some(organism => organism.id === organismId) ||
    !Number.isInteger(positionIndex) ||
    positionIndex < 0 ||
    positionIndex >= chain.organisms.length) {
    return null;
  }

  const nextPlacements = [...placements];
  const previousPosition = nextPlacements.indexOf(organismId);
  if (previousPosition >= 0) nextPlacements[previousPosition] = null;
  nextPlacements[positionIndex] = organismId;
  return nextPlacements;
}

function getFoodChainMismatches(placements, chain) {
  return placements.flatMap((organismId, index) => {
    const expected = chain.organisms[index];
    if (organismId === expected.id) return [];
    const actual = chain.organisms.find(organism => organism.id === organismId);
    if (index === 0) {
      return [{
        position: index + 1,
        explanation: `Start with ${expected.name}, the producer; ${actual.name} belongs later in this example.`
      }];
    }

    const previous = chain.organisms[index - 1];
    return [{
      position: index + 1,
      explanation: `After ${previous.name}, ${expected.name} comes next because it gets energy from ${previous.name}; ${actual.name} belongs elsewhere in this example.`
    }];
  });
}

function escapeFoodChainHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

Object.assign(App.prototype, {
  startFoodChainsActivity(random = Math.random) {
    this.currentView = 'science-food-chains';
    const chains = shuffleFoodChainItems(FOOD_CHAIN_DATA, random);
    const firstChain = chains[0];
    this.foodChainsGame = {
      chains,
      random,
      chainIndex: 0,
      placements: Array(firstChain.organisms.length).fill(null),
      trayOrganisms: shuffleFoodChainOrganisms(firstChain, random),
      selectedOrganismId: null,
      factOrganismId: null,
      message: 'Select an organism, then choose its position. You can also drag an organism into a position.',
      lastAnswerCorrect: null,
      mismatches: [],
      complete: false
    };
    this.foodChainsActivityEngine = new ActivityEngine();
    this.foodChainsActivityEngine.startQuiz({
      id: FOOD_CHAINS_ACTIVITY_ID,
      title: 'Food Chains',
      subject: 'Science Lab',
      skillId: FOOD_CHAINS_SKILL_ID,
      questions: chains.map(chain => {
        const correctOrder = chain.organisms.map(organism => organism.id);
        return {
          id: `${FOOD_CHAINS_ACTIVITY_ID}-${chain.id}`,
          type: 'ordering',
          prompt: `Arrange the organisms in the ${chain.name} chain from producer to consumer.`,
          answer: correctOrder,
          correctOrder
        };
      }),
      settings: {
        trackProgress: true,
        awardStars: true,
        pointsPerCorrect: 1
      }
    });
    this.renderFoodChainsActivity();
  },

  selectFoodChainOrganism(organismId) {
    const game = this.foodChainsGame;
    const chain = game?.chains[game?.chainIndex];
    const organism = chain?.organisms.find(item => item.id === organismId);
    if (!game || game.complete || game.lastAnswerCorrect === true) return false;
    if (!organism) {
      game.message = 'Choose an organism from the tray.';
      this.renderFoodChainsActivity();
      return false;
    }

    game.selectedOrganismId = organismId;
    game.factOrganismId = organismId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${organism.name} selected. Choose a position or drag it to the chain.`;
    this.renderFoodChainsActivity();
    return true;
  },

  placeSelectedFoodChainOrganism(positionIndex) {
    const game = this.foodChainsGame;
    if (!game || !game.selectedOrganismId) {
      if (game) {
        game.message = 'Choose an organism before choosing a position.';
        this.renderFoodChainsActivity();
      }
      return false;
    }
    return this.placeFoodChainOrganism(game.selectedOrganismId, positionIndex);
  },

  placeFoodChainOrganism(organismId, positionIndex) {
    const game = this.foodChainsGame;
    const chain = game?.chains[game?.chainIndex];
    if (!game || !chain || game.complete || game.lastAnswerCorrect === true) return false;
    const placements = moveFoodChainOrganism(game.placements, chain, organismId, positionIndex);
    if (!placements) {
      game.message = 'That organism could not be placed. Choose an organism from the tray and try again.';
      this.renderFoodChainsActivity();
      return false;
    }

    const organism = chain.organisms.find(item => item.id === organismId);
    game.placements = placements;
    game.selectedOrganismId = null;
    game.factOrganismId = organismId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${organism.name} placed in Position ${positionIndex + 1}.`;
    this.renderFoodChainsActivity();
    return true;
  },

  clearFoodChain() {
    const game = this.foodChainsGame;
    const chain = game?.chains[game?.chainIndex];
    if (!game || !chain || game.complete || game.lastAnswerCorrect === true) return false;
    game.placements = Array(chain.organisms.length).fill(null);
    game.selectedOrganismId = null;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = 'The chain is clear. Start with the producer.';
    this.renderFoodChainsActivity();
    return true;
  },

  submitFoodChainAnswer() {
    const game = this.foodChainsGame;
    const chain = game?.chains[game?.chainIndex];
    if (!game || !chain || game.complete || game.lastAnswerCorrect === true) return false;
    if (!isCompleteFoodChainPlacement(game.placements, chain)) {
      game.message = 'Place each organism once before checking the chain.';
      this.renderFoodChainsActivity();
      return false;
    }
    if (this.foodChainsActivityEngine.answered &&
      !this.foodChainsActivityEngine.lastAnswerCorrect) {
      this.foodChainsActivityEngine.allowRetry();
    }

    const isCorrect = this.foodChainsActivityEngine.submitAnswer(game.placements);
    if (!isCorrect) {
      game.lastAnswerCorrect = false;
      game.mismatches = getFoodChainMismatches(game.placements, chain);
      game.message = '';
      this.renderFoodChainsActivity();
      return false;
    }

    game.lastAnswerCorrect = true;
    game.message = `Correct! Energy moves from ${chain.organisms[0].name} to the organisms that eat it.`;
    this.renderFoodChainsActivity();
    return true;
  },

  nextFoodChain() {
    const game = this.foodChainsGame;
    if (!game || game.complete || game.lastAnswerCorrect !== true) return false;
    const advanced = this.foodChainsActivityEngine.nextQuestion();
    if (!advanced) {
      game.complete = true;
      this.updateHeader();
      this.renderFoodChainsActivity();
      return true;
    }

    game.chainIndex++;
    const chain = game.chains[game.chainIndex];
    game.placements = Array(chain.organisms.length).fill(null);
    game.trayOrganisms = shuffleFoodChainOrganisms(chain, game.random);
    game.selectedOrganismId = null;
    game.factOrganismId = null;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = 'Select an organism, then choose its position. You can also drag an organism into a position.';
    this.renderFoodChainsActivity();
    return true;
  },

  renderFoodChainsActivity() {
    const main = document.getElementById('app-main');
    const game = this.foodChainsGame;
    if (!main || !game) return;
    main.dataset.page = 'science-food-chains';
    this.updateHeader();

    if (game.complete) {
      main.innerHTML = `
        <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div class="play-hud flex items-center justify-between mb-6">
            <button type="button" data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
            <span class="play-hud__title text-xs text-slate-400">Food Chains</span>
          </div>
          <section class="play-question-card science-result-card bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div class="text-6xl mb-4" aria-hidden="true">🌿</div>
            <p class="text-xs uppercase tracking-widest text-emerald-300 font-bold">Science Lab</p>
            <h1 class="font-ninja text-3xl text-white font-bold mt-1">Food Chains Complete!</h1>
            <p class="text-slate-300 mt-3">You built all ${game.chains.length} food chains and earned ⭐ ${this.foodChainsActivityEngine.score} stars.</p>
            <p class="text-slate-300 mt-2">These are simplified examples. In nature, connected food chains form larger food webs.</p>
            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" data-action="food-chains-restart" class="btn-ninja flex-1 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold transition-colors motion-reduce:transition-none">Build Again</button>
              <button type="button" data-action="science-lab" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors motion-reduce:transition-none">Return to Science Lab</button>
            </div>
          </section>
        </div>
      `;
      return;
    }

    const chain = game.chains[game.chainIndex];
    const positionGridClasses = chain.organisms.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    const factOrganism = chain.organisms.find(organism => organism.id === game.factOrganismId);
    const canSubmit = isCompleteFoodChainPlacement(game.placements, chain);
    const organismCards = game.trayOrganisms.map(organism => {
      const positionIndex = game.placements.indexOf(organism.id);
      const placement = positionIndex >= 0 ? `Position ${positionIndex + 1}` : 'Not placed';
      const selectedClasses = game.selectedOrganismId === organism.id
        ? 'border-emerald-400 bg-emerald-950'
        : 'border-slate-700 bg-slate-950/70';
      return `
        <button type="button" draggable="true" data-action="food-chains-select" data-organism-id="${organism.id}" data-food-chain-organism-id="${organism.id}"
                aria-label="${escapeFoodChainHtml(organism.name)}, ${escapeFoodChainHtml(organism.roleLabel)}. ${escapeFoodChainHtml(placement)}. Select to read more and place it."
                aria-pressed="${game.selectedOrganismId === organism.id}"
                class="min-h-28 rounded-xl border-2 ${selectedClasses} px-3 py-3 text-left text-white hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition-colors motion-reduce:transition-none">
          <span class="block text-xs uppercase tracking-wide text-emerald-300 font-bold">${escapeFoodChainHtml(organism.roleLabel)}</span>
          <span class="block font-bold mt-1">${escapeFoodChainHtml(organism.name)}</span>
          <span class="block text-xs text-slate-400 mt-2">${escapeFoodChainHtml(placement)}</span>
        </button>
      `;
    }).join('');
    const positions = chain.organisms.map((_, index) => {
      const organism = chain.organisms.find(item => item.id === game.placements[index]);
      const label = organism
        ? `Position ${index + 1}, ${organism.name}, ${organism.roleLabel}. Place the selected organism here.`
        : `Position ${index + 1}${index === 0 ? ', start with the producer' : ''}, empty. Place the selected organism here.`;
      return `
        <button type="button" data-action="food-chains-place" data-position-index="${index}" data-food-chain-position-index="${index}" data-drag-drop-target
                aria-label="${escapeFoodChainHtml(label)}" aria-describedby="food-chains-instructions"
                class="min-h-16 rounded-xl border-2 border-slate-700 bg-slate-950/70 px-3 py-2 text-left text-white hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition-colors motion-reduce:transition-none">
          <span class="block text-xs text-slate-400">Position ${index + 1}</span>
          <span class="block font-bold">${organism ? escapeFoodChainHtml(organism.name) : 'Empty'}</span>
        </button>
      `;
    }).join('');

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button type="button" data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
          <span class="play-hud__title text-xs text-slate-400">Food Chains</span>
        </div>

        <section class="play-question-card science-question-card bg-slate-900 border-2 border-emerald-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="text-center mb-5">
            <p class="text-xs uppercase tracking-wider text-emerald-300 font-bold">Food chain ${game.chainIndex + 1} of ${game.chains.length}</p>
            <h1 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold mt-2">Build a Food Chain: ${escapeFoodChainHtml(chain.name)}</h1>
            <p class="text-slate-300 mt-2">${escapeFoodChainHtml(chain.description)}</p>
          </div>

          <p id="food-chains-instructions" class="text-sm text-slate-300 mb-4">Energy starts with sunlight and moves from food to eater. Arrange the organisms from producer to consumer. Select a card and a position, drag a card, or tap both on a touch screen.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5" aria-label="Organism cards">
            ${organismCards}
          </div>

          <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 mb-4" aria-labelledby="food-chains-fact-title">
            <h2 id="food-chains-fact-title" class="font-bold text-white">Organism fact</h2>
            <p id="food-chains-fact" role="status" aria-live="polite" class="text-slate-300 mt-1">
              ${factOrganism
                ? `<strong class="text-white">${escapeFoodChainHtml(factOrganism.name)} · ${escapeFoodChainHtml(factOrganism.roleLabel)}:</strong> ${escapeFoodChainHtml(factOrganism.fact)}`
                : 'Select an organism to learn its role in this example.'}
            </p>
            <p class="text-xs text-slate-400 mt-2">Source: <a class="text-cyan-300 underline" href="${escapeFoodChainHtml(chain.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeFoodChainHtml(chain.sourceTitle)}</a></p>
          </section>

          <div class="grid ${positionGridClasses} gap-3 mb-4" aria-label="${escapeFoodChainHtml(chain.name)} food chain">
            ${positions}
          </div>
          <p class="text-xs text-slate-400 mb-3">This is one simplified path through a food web; many organisms have more than one food source.</p>
          <p id="food-chains-status" role="status" aria-live="polite" class="text-sm text-emerald-200 min-h-6 mb-3">${escapeFoodChainHtml(game.message)}</p>
          ${game.lastAnswerCorrect === false ? `
            <div id="food-chains-feedback" role="status" aria-live="polite" class="rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 mb-4 text-amber-100">
              <p class="font-bold">Not quite. Check each producer-to-consumer link:</p>
              <ul class="list-disc pl-5 mt-2">
                ${game.mismatches.map(mismatch => `<li>Position ${mismatch.position}: ${escapeFoodChainHtml(mismatch.explanation)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${game.lastAnswerCorrect === true ? `
            <div role="status" aria-live="polite" class="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-4 mb-4 text-emerald-100">
              <p class="font-bold">Correct food chain!</p>
              <p>Energy moves from food to the organism that eats it. In this example, ${escapeFoodChainHtml(chain.organisms[chain.organisms.length - 1].name)} is the final consumer in the chain.</p>
            </div>
          ` : ''}
          <div class="flex flex-col sm:flex-row gap-3">
            <button type="button" data-action="food-chains-clear" ${game.placements.some(Boolean) && game.lastAnswerCorrect !== true ? '' : 'disabled'}
                    class="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-4 py-3 text-white font-bold">Clear chain</button>
            ${game.lastAnswerCorrect === true
              ? `<button type="button" data-action="food-chains-next" class="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-3 text-white font-bold">${game.chainIndex === game.chains.length - 1 ? 'Finish Food Chains' : 'Next Food Chain'}</button>`
              : `<button type="button" data-action="food-chains-submit" ${canSubmit ? '' : 'disabled'} class="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed px-4 py-3 text-white font-bold">Check Food Chain</button>`}
          </div>
          <button type="button" data-action="food-chains-restart" class="mt-3 text-sm text-slate-300 underline hover:text-white">Start over</button>
        </section>
      </div>
    `;

    main.querySelectorAll('[data-food-chain-organism-id]').forEach(button => {
      button.addEventListener('dragstart', event => {
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', button.dataset.foodChainOrganismId);
      });
    });
    main.querySelectorAll('[data-food-chain-position-index]').forEach(position => {
      position.addEventListener('dragover', event => event.preventDefault());
      position.addEventListener('drop', event => {
        event.preventDefault();
        const organismId = event.dataTransfer?.getData('text/plain');
        if (!organismId) {
          game.message = 'Choose an organism from the tray before dragging it into the chain.';
          this.renderFoodChainsActivity();
          return;
        }
        this.placeFoodChainOrganism(organismId, Number(position.dataset.foodChainPositionIndex));
      });
    });
  }
});

window.FoodChains = Object.freeze({
  chains: FOOD_CHAIN_DATA,
  isValidData: isValidFoodChainData,
  shuffleChains: shuffleFoodChainItems,
  shuffleOrganisms: shuffleFoodChainOrganisms,
  isCompletePlacement: isCompleteFoodChainPlacement,
  moveOrganism: moveFoodChainOrganism,
  getMismatches: getFoodChainMismatches
});
