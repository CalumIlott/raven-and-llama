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
  const populations = { algae: 12, tadpoles: 3, fish: 2, kingfishers: 1 };
  return {
    populations,
    timeline: [{ day: 0, populations: { ...populations } }],
    day: 0,
    challengeFailed: false,
    message: 'Adjust the pond, then advance one day. Keep every group present for five days.'
  };
}

function recordEcosystemSandboxTimeline(game) {
  const populations = { ...game.populations };
  const currentIndex = game.timeline.findIndex(entry => entry.day === game.day);
  if (currentIndex === -1) game.timeline.push({ day: game.day, populations });
  else game.timeline[currentIndex] = { day: game.day, populations };
}

function renderEcosystemSandboxTimeline(game) {
  const plot = { left: 54, right: 610, top: 24, bottom: 174 };
  const xForDay = day => plot.left + (plot.right - plot.left) * day / ECOSYSTEM_SANDBOX_DAYS;
  const yForPopulation = population => plot.bottom - (plot.bottom - plot.top) * population / ECOSYSTEM_SANDBOX_MAX_POPULATION;
  const days = game.timeline;
  const gridLines = [0, 3, 6, 9, 12].map(population => {
    const y = yForPopulation(population);
    return `<g class="ecosystem-timeline__grid"><line x1="${plot.left}" y1="${y}" x2="${plot.right}" y2="${y}"/><text x="${plot.left - 12}" y="${y + 4}" text-anchor="end">${population}</text></g>`;
  }).join('');
  const dayLabels = Array.from({ length: ECOSYSTEM_SANDBOX_DAYS + 1 }, (_, day) =>
    `<text class="ecosystem-timeline__day" x="${xForDay(day)}" y="${plot.bottom + 22}" text-anchor="middle">${day}</text>`
  ).join('');
  const series = ECOSYSTEM_SANDBOX_SPECIES.map(species => {
    const points = days.map(entry => ({
      day: entry.day,
      population: entry.populations[species.id],
      x: xForDay(entry.day),
      y: yForPopulation(entry.populations[species.id])
    }));
    const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
    const markers = points.map(point => `<circle class="ecosystem-timeline__point ecosystem-timeline__point--${species.id}" data-day="${point.day}" data-population="${point.population}" cx="${point.x}" cy="${point.y}" r="5"><title>Day ${point.day}: ${species.name}, ${point.population}</title></circle>`).join('');
    return `<path class="ecosystem-timeline__line ecosystem-timeline__line--${species.id}" d="${path}"/>${markers}`;
  }).join('');
  const legend = ECOSYSTEM_SANDBOX_SPECIES.map(species =>
    `<span class="ecosystem-timeline__legend-item ecosystem-timeline__legend-item--${species.id}"><span aria-hidden="true"></span>${species.icon} ${species.name}</span>`
  ).join('');

  return `
    <figure class="ecosystem-timeline" aria-labelledby="ecosystem-timeline-title">
      <figcaption>
        <h2 id="ecosystem-timeline-title">Population over time</h2>
        <p>Each line follows one group from day 0 to day 5. Adjustments change the current day; advancing adds the next point.</p>
      </figcaption>
      <svg class="ecosystem-timeline__chart" viewBox="0 0 640 214" role="img" aria-labelledby="ecosystem-timeline-svg-title ecosystem-timeline-svg-desc">
        <title id="ecosystem-timeline-svg-title">Pond population timeline</title>
        <desc id="ecosystem-timeline-svg-desc">A line chart of algae, tadpole, fish, and kingfisher populations. The vertical axis ranges from zero to twelve groups; the horizontal axis shows days zero through five.</desc>
        ${gridLines}
        <line class="ecosystem-timeline__axis" x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.bottom}"/>
        <line class="ecosystem-timeline__axis" x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}"/>
        <text class="ecosystem-timeline__axis-label" x="14" y="${plot.top + (plot.bottom - plot.top) / 2}" text-anchor="middle" transform="rotate(-90 14 ${plot.top + (plot.bottom - plot.top) / 2})">Groups</text>
        ${series}
        ${dayLabels}
        <text class="ecosystem-timeline__axis-label" x="${(plot.left + plot.right) / 2}" y="210" text-anchor="middle">Day</text>
      </svg>
      <div class="ecosystem-timeline__legend" aria-label="Chart legend">${legend}</div>
    </figure>
  `;
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
    recordEcosystemSandboxTimeline(game);
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
    recordEcosystemSandboxTimeline(game);
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

        ${renderEcosystemSandboxTimeline(game)}

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
