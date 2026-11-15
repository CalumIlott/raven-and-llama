const ECOSYSTEM_SANDBOX_ACTIVITY_ID = 'science-ecosystem-sandbox';
const ECOSYSTEM_SANDBOX_DAYS = 5;
const ECOSYSTEM_SANDBOX_MAX_POPULATION = 12;
const ECOSYSTEM_SANDBOX_SPECIES = Object.freeze([
  { id: 'algae', name: 'Algae', controlName: 'algae', role: 'Producer', icon: '🌿', food: 'Uses sunlight to grow.' },
  { id: 'tadpoles', name: 'Tadpoles', controlName: 'tadpole', role: 'Plant-eater', icon: '🐸', food: 'Eat algae.' },
  { id: 'fish', name: 'Fish', controlName: 'fish', role: 'Predator', icon: '🐟', food: 'Eat tadpoles.' },
  { id: 'kingfishers', name: 'Kingfishers', controlName: 'kingfisher', role: 'Top predator', icon: '🐦', food: 'Eat fish.' }
]);

function createEcosystemSandboxState() {
  return {
    populations: { algae: 12, tadpoles: 3, fish: 2, kingfishers: 1 },
    day: 0,
    challengeFailed: false,
    message: 'Adjust the pond, then advance one day. Keep every group present for five days.'
  };
}

function adjustEcosystemSandboxPopulation(populations, speciesId, delta) {
  const species = ECOSYSTEM_SANDBOX_SPECIES.find(item => item.id === speciesId);
  if (!species || !Number.isInteger(delta) || Math.abs(delta) !== 1 ||
    !populations || !Number.isInteger(populations[speciesId])) return null;

  return {
    ...populations,
    [speciesId]: Math.max(0, Math.min(ECOSYSTEM_SANDBOX_MAX_POPULATION, populations[speciesId] + delta))
  };
}

function advanceEcosystemSandboxDay(populations) {
  if (!populations || ECOSYSTEM_SANDBOX_SPECIES.some(species =>
    !Number.isInteger(populations[species.id]) || populations[species.id] < 0 || populations[species.id] > ECOSYSTEM_SANDBOX_MAX_POPULATION
  )) return null;

  const algaeGrowth = 2;
  const algaeEaten = Math.min(3, populations.tadpoles);
  const tadpoleBirths = populations.algae >= 3 ? 1 : populations.algae === 0 ? -1 : 0;
  const tadpolesEaten = populations.fish > 0 ? 1 : 0;
  const fishBirths = populations.tadpoles >= 2 ? 1 : populations.tadpoles === 0 ? -1 : 0;
  const fishEaten = populations.kingfishers > 0 ? 1 : 0;
  const kingfisherBirths = populations.fish >= 3 ? 1 : populations.fish === 0 ? -1 : 0;

  return {
    algae: Math.max(0, Math.min(ECOSYSTEM_SANDBOX_MAX_POPULATION, populations.algae + algaeGrowth - algaeEaten)),
    tadpoles: Math.max(0, Math.min(ECOSYSTEM_SANDBOX_MAX_POPULATION, populations.tadpoles + tadpoleBirths - tadpolesEaten)),
    fish: Math.max(0, Math.min(ECOSYSTEM_SANDBOX_MAX_POPULATION, populations.fish + fishBirths - fishEaten)),
    kingfishers: Math.max(0, Math.min(ECOSYSTEM_SANDBOX_MAX_POPULATION, populations.kingfishers + kingfisherBirths))
  };
}

function isEcosystemSandboxGoalReached(state) {
  return Boolean(state && state.day >= ECOSYSTEM_SANDBOX_DAYS && !state.challengeFailed);
}

window.EcosystemSandbox = Object.freeze({
  days: ECOSYSTEM_SANDBOX_DAYS,
  maxPopulation: ECOSYSTEM_SANDBOX_MAX_POPULATION,
  species: ECOSYSTEM_SANDBOX_SPECIES,
  createState: createEcosystemSandboxState,
  adjustPopulation: adjustEcosystemSandboxPopulation,
  advanceDay: advanceEcosystemSandboxDay,
  isGoalReached: isEcosystemSandboxGoalReached
});

Object.assign(App.prototype, {
  showScienceEcosystemSandbox() {
    this.currentView = 'science-ecosystem';
    this.ecosystemSandboxGame = createEcosystemSandboxState();
    this.navigateToPath('/learning-centre/science/ecosystem');
    this.updateHeader();
    this.renderScienceEcosystemSandbox();
  },

  adjustScienceEcosystemPopulation(speciesId, delta) {
    const game = this.ecosystemSandboxGame;
    if (!game || game.day >= ECOSYSTEM_SANDBOX_DAYS) return false;
    const populations = adjustEcosystemSandboxPopulation(game.populations, speciesId, delta);
    if (!populations) return false;
    game.populations = populations;
    game.message = `${ECOSYSTEM_SANDBOX_SPECIES.find(species => species.id === speciesId).name}: ${populations[speciesId]} groups.`;
    this.renderScienceEcosystemSandbox(`[data-action="ecosystem-sandbox-adjust"][data-species-id="${speciesId}"][data-delta="${delta}"]`);
    return true;
  },

  advanceScienceEcosystemDay() {
    const game = this.ecosystemSandboxGame;
    if (!game || game.day >= ECOSYSTEM_SANDBOX_DAYS) return false;
    const before = game.populations;
    const after = advanceEcosystemSandboxDay(before);
    if (!after) return false;
    game.day += 1;
    game.populations = after;
    game.challengeFailed = game.challengeFailed || ECOSYSTEM_SANDBOX_SPECIES.some(species => after[species.id] === 0);
    const declined = ECOSYSTEM_SANDBOX_SPECIES.filter(species => after[species.id] < before[species.id]);
    const increased = ECOSYSTEM_SANDBOX_SPECIES.filter(species => after[species.id] > before[species.id]);
    const changes = [
      ...increased.map(species => `${species.name} increased`),
      ...declined.map(species => `${species.name} decreased`)
    ];
    if (game.day >= ECOSYSTEM_SANDBOX_DAYS) {
      game.message = isEcosystemSandboxGoalReached(game)
        ? 'Goal reached! Every group is still present after five days.'
        : 'Five days complete. At least one group disappeared; reset and try a different balance.';
    } else {
      game.message = changes.length ? `Day ${game.day}: ${changes.join('; ')}.` : `Day ${game.day}: populations stayed steady.`;
    }
    this.renderScienceEcosystemSandbox(game.day >= ECOSYSTEM_SANDBOX_DAYS
      ? '[data-action="ecosystem-sandbox-reset"]'
      : '[data-action="ecosystem-sandbox-next-day"]');
    return true;
  },

  resetScienceEcosystemSandbox() {
    this.ecosystemSandboxGame = createEcosystemSandboxState();
    this.renderScienceEcosystemSandbox('[data-action="ecosystem-sandbox-reset"]');
  },

  renderScienceEcosystemSandbox(focusSelector = null) {
    const main = document.getElementById('app-main');
    const game = this.ecosystemSandboxGame;
    if (!main || !game) return;
    main.dataset.page = 'science-ecosystem';
    const finished = game.day >= ECOSYSTEM_SANDBOX_DAYS;
    const reached = isEcosystemSandboxGoalReached(game);
    const groupCards = ECOSYSTEM_SANDBOX_SPECIES.map(species => {
      const count = game.populations[species.id];
      const indicators = Array.from({ length: ECOSYSTEM_SANDBOX_MAX_POPULATION }, (_, index) =>
        `<span class="ecosystem-population__pip${index < count ? ' is-active' : ''}" aria-hidden="true"></span>`
      ).join('');
      return `
        <section class="ecosystem-species ecosystem-species--${species.id}" aria-labelledby="ecosystem-${species.id}-title">
          <div class="ecosystem-species__title">
            <span aria-hidden="true">${species.icon}</span>
            <div><h2 id="ecosystem-${species.id}-title">${species.name}</h2><p>${species.role}</p></div>
          </div>
          <p class="ecosystem-species__food">${species.food}</p>
          <div class="ecosystem-population__meter" aria-hidden="true">${indicators}</div>
          <p class="ecosystem-species__count">Population groups: <output aria-live="polite">${count}</output> of ${ECOSYSTEM_SANDBOX_MAX_POPULATION}</p>
          <div class="ecosystem-species__controls" role="group" aria-label="Adjust ${species.name} population">
            <button type="button" data-action="ecosystem-sandbox-adjust" data-species-id="${species.id}" data-delta="-1" aria-label="Remove one ${species.controlName} group" ${count <= 0 || finished ? 'disabled' : ''}>−</button>
            <button type="button" data-action="ecosystem-sandbox-adjust" data-species-id="${species.id}" data-delta="1" aria-label="Add one ${species.controlName} group" ${count >= ECOSYSTEM_SANDBOX_MAX_POPULATION || finished ? 'disabled' : ''}>+</button>
          </div>
        </section>
      `;
    }).join('');

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button type="button" data-action="science-lab" class="ecosystem-back-link">← Back to Science Lab</button>
          <button type="button" data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <section class="module-intro module-intro--science">
          <div class="module-intro__copy">
            <div class="module-eyebrow science-lab-badge">${window.brandWordmark()} <span>Science Lab</span></div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Pond Ecosystem Sandbox</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">Adjust populations and step through five days to explore how energy moves through a food web.</p>
          </div>
          <div class="module-banner-aside"><p>Small changes can ripple through a living system.</p></div>
        </section>

        <section class="ecosystem-challenge" aria-labelledby="ecosystem-challenge-title">
          <div>
            <p class="ecosystem-challenge__eyebrow">Five-day challenge</p>
            <h2 id="ecosystem-challenge-title">Keep all four groups present</h2>
            <p>At day five, algae, tadpoles, fish, and kingfishers must all still be present.</p>
          </div>
          <p class="ecosystem-day-count"><span>Day</span><output id="ecosystem-day-count" aria-live="polite">${game.day}</output><span>of ${ECOSYSTEM_SANDBOX_DAYS}</span></p>
        </section>

        <section class="ecosystem-populations" aria-label="Pond populations">
          ${groupCards}
        </section>

        <section class="ecosystem-actions" aria-label="Simulation controls">
          <button type="button" data-action="ecosystem-sandbox-next-day" ${finished ? 'disabled' : ''}>Advance one day</button>
          <button type="button" data-action="ecosystem-sandbox-reset">Reset pond</button>
        </section>

        <p id="ecosystem-status" class="ecosystem-status${reached ? ' is-complete' : ''}" role="status" aria-live="polite">${game.message}</p>
        ${reached ? '<p class="ecosystem-goal-success">🌱 Pond challenge complete.</p>' : finished ? '<p class="ecosystem-goal-failure">Try again with a different population balance.</p>' : ''}

        <details class="ecosystem-rules">
          <summary>How this simplified model works</summary>
          <ul>
            <li>Algae gains two groups from sunlight and tadpoles eat up to three groups each day.</li>
            <li>Tadpoles gain one group when at least three algae groups are present; fish eat one tadpole group when fish are present.</li>
            <li>Fish gain one group when at least two tadpole groups are present; kingfishers eat one fish group when kingfishers are present.</li>
            <li>Kingfishers gain one group when at least three fish groups are present. Every population is limited to twelve groups.</li>
          </ul>
          <p>This is a simplified learning model, not a prediction of a real pond. Real food webs have more species and changing conditions.</p>
          <a href="https://education.nationalgeographic.org/resource/food-web/" target="_blank" rel="noopener noreferrer">Read about food webs at National Geographic Education</a>
        </details>
      </div>
    `;
    if (focusSelector) main.querySelector(focusSelector)?.focus?.({ preventScroll: true });
  }
});
