const SOLAR_SYSTEM_ACTIVITY_ID = 'science-solar-system-order';
const SOLAR_SYSTEM_SKILL_ID = 'science_solar_system_order';
const SOLAR_SYSTEM_PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#a1a1aa',
    fact: 'Mercury is the smallest planet and the closest planet to the Sun. One trip around the Sun takes 88 Earth days.'
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#fbbf24',
    fact: 'Venus is the hottest planet. Its thick atmosphere traps heat, even though Mercury is closer to the Sun.'
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#3b82f6',
    fact: 'Earth is the third planet from the Sun and the only planet known to have life.'
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#ef4444',
    fact: 'Mars looks rusty red because iron-rich dust covers much of its surface.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#d97706',
    fact: 'Jupiter is the largest planet. Its Great Red Spot is a giant storm.'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#fcd34d',
    fact: 'Saturn has wide rings made mostly of pieces of ice and rock.'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#06b6d4',
    fact: 'Uranus spins on its side, making it look as if it rolls around the Sun.'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#6366f1',
    fact: 'Neptune is the farthest planet from the Sun. One Neptunian year lasts about 165 Earth years.'
  }
];
const SOLAR_SYSTEM_ORBIT_LAYOUT = [
  { radius: 34, angle: -90 },
  { radius: 62, angle: -45 },
  { radius: 91, angle: 0 },
  { radius: 120, angle: 45 },
  { radius: 150, angle: 90 },
  { radius: 180, angle: 135 },
  { radius: 210, angle: 180 },
  { radius: 240, angle: 225 }
];

function isCompleteSolarSystemPlacement(placements) {
  const planetIds = new Set(SOLAR_SYSTEM_PLANETS.map(planet => planet.id));
  return Array.isArray(placements) &&
    placements.length === SOLAR_SYSTEM_PLANETS.length &&
    placements.every(planetId => planetIds.has(planetId)) &&
    new Set(placements).size === SOLAR_SYSTEM_PLANETS.length;
}

function placePlanetInSolarSystem(placements, planetId, orbitIndex) {
  if (!Array.isArray(placements) ||
    placements.length !== SOLAR_SYSTEM_PLANETS.length ||
    !SOLAR_SYSTEM_PLANETS.some(planet => planet.id === planetId) ||
    !Number.isInteger(orbitIndex) ||
    orbitIndex < 0 ||
    orbitIndex >= SOLAR_SYSTEM_PLANETS.length) {
    return null;
  }

  const nextPlacements = [...placements];
  const previousOrbit = nextPlacements.indexOf(planetId);
  if (previousOrbit >= 0) nextPlacements[previousOrbit] = null;
  nextPlacements[orbitIndex] = planetId;
  return nextPlacements;
}

function getSolarSystemMismatches(placements) {
  return placements.flatMap((planetId, index) => {
    if (planetId === SOLAR_SYSTEM_PLANETS[index].id) return [];
    return [{
      orbit: index + 1,
      current: SOLAR_SYSTEM_PLANETS.find(planet => planet.id === planetId)?.name || 'Unknown planet',
      expected: SOLAR_SYSTEM_PLANETS[index].name
    }];
  });
}

Object.assign(App.prototype, {
  showScienceLab() {
    this.currentView = 'science-lab';
    this.scienceGame = null;
    this.solarSystemGame = null;
    this.navigateToPath('/learning-centre/science');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'science-lab';
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning-centre" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to ${window.brandWordmark()} Learning Centre</span>
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <section class="module-intro module-intro--science">
          <div class="module-intro__copy">
            <div class="module-eyebrow science-lab-badge">
              ${window.brandWordmark()} <span>Science Lab</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Science Lab</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">Explore familiar science missions, build a model Solar System, or follow a plant's life cycle.</p>
          </div>
          <div class="module-banner-aside">
            <p>Every discovery starts with a question.</p>
          </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <section class="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div class="flex items-start gap-4 mb-4">
              <span class="w-14 h-14 rounded-2xl bg-sky-950 border border-sky-700/70 flex items-center justify-center text-3xl" aria-hidden="true">🔬</span>
              <div>
                <p class="text-xs uppercase tracking-wider text-sky-300 font-bold">Question-based adventures</p>
                <h2 class="font-ninja text-2xl text-white font-bold">Science Explorers</h2>
              </div>
            </div>
            <p class="text-slate-300 mb-5">Revisit Orbit Rescue, Habitat Match, Matter Lab, and Nature Detectives.</p>
            <button type="button" data-action="science-home" class="rounded-xl bg-sky-700 hover:bg-sky-600 px-5 py-3 font-bold text-white transition-colors motion-reduce:transition-none">
              Explore Science Explorers
            </button>
          </section>

          <section class="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div class="flex items-start gap-4 mb-4">
              <span class="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-700/70 flex items-center justify-center text-3xl" aria-hidden="true">🪐</span>
              <div>
                <p class="text-xs uppercase tracking-wider text-indigo-300 font-bold">Hands-on ordering mission</p>
                <h2 class="font-ninja text-2xl text-white font-bold">Build a Solar System</h2>
              </div>
            </div>
            <p class="text-slate-300 mb-5">Place all eight planets in order from the Sun and discover a fact about each one.</p>
            <button type="button" data-action="solar-system-start" class="rounded-xl bg-indigo-700 hover:bg-indigo-600 px-5 py-3 font-bold text-white transition-colors motion-reduce:transition-none">
              Build a Solar System
            </button>
          </section>

          <section class="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div class="flex items-start gap-4 mb-4">
              <span class="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-700/70 flex items-center justify-center text-3xl" aria-hidden="true">🌱</span>
              <div>
                <p class="text-xs uppercase tracking-wider text-emerald-300 font-bold">Hands-on life science</p>
                <h2 class="font-ninja text-2xl text-white font-bold">Plant Life Cycle</h2>
              </div>
            </div>
            <p class="text-slate-300 mb-5">Arrange the stages of a flowering plant's life and see how one cycle can begin another.</p>
            <button type="button" data-action="plant-life-cycle-start" class="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-5 py-3 font-bold text-white transition-colors motion-reduce:transition-none">
              Explore Plant Life Cycle
            </button>
          </section>
        </div>
      </div>
    `;
  },

  startSolarSystemActivity() {
    this.currentView = 'science-solar-system';
    this.solarSystemGame = {
      placements: Array(SOLAR_SYSTEM_PLANETS.length).fill(null),
      selectedPlanetId: null,
      factPlanetId: null,
      message: 'Select a planet, then choose an orbit. You can also drag a planet to an orbit.',
      lastAnswerCorrect: null,
      mismatches: [],
      complete: false
    };
    const correctOrder = SOLAR_SYSTEM_PLANETS.map(planet => planet.id);
    this.solarSystemActivityEngine = new ActivityEngine();
    this.solarSystemActivityEngine.startQuiz({
      id: SOLAR_SYSTEM_ACTIVITY_ID,
      title: 'Build a Solar System',
      subject: 'Science Lab',
      skillId: SOLAR_SYSTEM_SKILL_ID,
      questions: [{
        id: `${SOLAR_SYSTEM_ACTIVITY_ID}-planets`,
        type: 'ordering',
        prompt: 'Put the planets in order from the Sun.',
        answer: correctOrder,
        correctOrder
      }],
      settings: { trackProgress: true, pointsPerCorrect: SOLAR_SYSTEM_PLANETS.length }
    });
    this.renderSolarSystemActivity();
  },

  selectSolarSystemPlanet(planetId) {
    const game = this.solarSystemGame;
    const planet = SOLAR_SYSTEM_PLANETS.find(item => item.id === planetId);
    if (!game || game.complete) return false;
    if (!planet) {
      game.message = 'Choose one of the planets in the tray.';
      this.renderSolarSystemActivity();
      return false;
    }

    game.selectedPlanetId = planetId;
    game.factPlanetId = planetId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${planet.name} selected. Choose an orbit or drag the planet to a slot.`;
    this.renderSolarSystemActivity();
    return true;
  },

  placeSelectedSolarSystemPlanet(orbitIndex) {
    const game = this.solarSystemGame;
    if (!game || !game.selectedPlanetId) {
      if (game) {
        game.message = 'Choose a planet before choosing an orbit.';
        this.renderSolarSystemActivity();
      }
      return false;
    }
    return this.placeSolarSystemPlanet(game.selectedPlanetId, orbitIndex);
  },

  placeSolarSystemPlanet(planetId, orbitIndex) {
    const game = this.solarSystemGame;
    if (!game || game.complete) return false;
    const placements = placePlanetInSolarSystem(game.placements, planetId, orbitIndex);
    if (!placements) {
      game.message = 'That planet could not be placed. Choose a planet from the tray and try again.';
      this.renderSolarSystemActivity();
      return false;
    }

    const planet = SOLAR_SYSTEM_PLANETS.find(item => item.id === planetId);
    game.placements = placements;
    game.selectedPlanetId = null;
    game.factPlanetId = planetId;
    game.lastAnswerCorrect = null;
    game.mismatches = [];
    game.message = `${planet.name} placed in Orbit ${orbitIndex + 1}.`;
    this.renderSolarSystemActivity();
    return true;
  },

  submitSolarSystemAnswer() {
    const game = this.solarSystemGame;
    if (!game || game.complete) return false;
    if (!isCompleteSolarSystemPlacement(game.placements)) {
      game.message = 'Place each planet in one orbit before checking your order.';
      this.renderSolarSystemActivity();
      return false;
    }
    if (this.solarSystemActivityEngine.answered &&
      !this.solarSystemActivityEngine.lastAnswerCorrect) {
      this.solarSystemActivityEngine.allowRetry();
    }

    const isCorrect = this.solarSystemActivityEngine.submitAnswer(game.placements);
    if (!isCorrect) {
      game.lastAnswerCorrect = false;
      game.mismatches = getSolarSystemMismatches(game.placements);
      game.message = '';
      this.renderSolarSystemActivity();
      return false;
    }

    this.solarSystemActivityEngine.complete();
    game.lastAnswerCorrect = true;
    game.complete = true;
    const profile = ProfileManager.getActiveProfile();
    profile.stars += SOLAR_SYSTEM_PLANETS.length;
    ProfileManager.updateProfile(profile);
    this.updateHeader();
    this.renderSolarSystemActivity();
    return true;
  },

  renderSolarSystemActivity() {
    const main = document.getElementById('app-main');
    const game = this.solarSystemGame;
    if (!main || !game) return;
    main.dataset.page = 'science-solar-system';
    this.updateHeader();

    if (game.complete) {
      main.innerHTML = `
        <div class="play-shell play-shell--science max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <div class="play-hud flex items-center justify-between mb-6">
            <button data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
            <span class="play-hud__title text-xs text-slate-400">Build a Solar System</span>
          </div>
          <section class="play-question-card science-result-card bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-7 sm:p-10 text-center shadow-2xl">
            <div class="text-6xl mb-4" aria-hidden="true">🪐</div>
            <p class="text-xs uppercase tracking-widest text-emerald-300 font-bold">Science Lab</p>
            <h1 class="font-ninja text-3xl text-white font-bold mt-1">Solar System Complete!</h1>
            <p class="text-slate-300 mt-3">You placed all eight planets in the correct order and earned ⭐ ${SOLAR_SYSTEM_PLANETS.length} stars.</p>
            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" data-action="solar-system-restart" class="btn-ninja flex-1 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold transition-colors motion-reduce:transition-none">Build Again</button>
              <button type="button" data-action="science-lab" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors motion-reduce:transition-none">Return to Science Lab</button>
            </div>
          </section>
        </div>
      `;
      return;
    }

    const factPlanet = SOLAR_SYSTEM_PLANETS.find(planet => planet.id === game.factPlanetId);
    const canSubmit = isCompleteSolarSystemPlacement(game.placements);
    const orbitMarkers = SOLAR_SYSTEM_ORBIT_LAYOUT.map((orbit, index) => {
      const angle = orbit.angle * Math.PI / 180;
      const x = 400 + Math.cos(angle) * orbit.radius;
      const y = 260 + Math.sin(angle) * orbit.radius;
      const planet = SOLAR_SYSTEM_PLANETS.find(item => item.id === game.placements[index]);
      return `
        <circle cx="${x}" cy="${y}" r="12" fill="${planet?.color || '#64748b'}" stroke="#f8fafc" stroke-width="2"></circle>
        <text x="${x}" y="${y + 4}" fill="#0f172a" font-size="10" font-weight="700" text-anchor="middle">${index + 1}</text>
      `;
    }).join('');
    const orbitRings = SOLAR_SYSTEM_ORBIT_LAYOUT.map(orbit =>
      `<circle cx="400" cy="260" r="${orbit.radius}" fill="none" stroke="#94a3b8" stroke-opacity="0.5" stroke-width="1.5"></circle>`
    ).join('');
    const orbitSlots = SOLAR_SYSTEM_PLANETS.map((_, index) => {
      const planet = SOLAR_SYSTEM_PLANETS.find(item => item.id === game.placements[index]);
      const ordinal = index + 1;
      const distance = ordinal === 1 ? 'closest to the Sun' : ordinal === 8 ? 'farthest from the Sun' : '';
      const label = planet ? `Orbit ${ordinal}, ${planet.name}. Place the selected planet here.` :
        `Orbit ${ordinal}${distance ? `, ${distance}` : ''}, empty. Place the selected planet here.`;
      return `
        <button type="button" data-action="solar-system-place" data-orbit-index="${index}" data-solar-orbit-index="${index}"
                aria-label="${label}" aria-describedby="solar-system-instructions"
                class="min-h-16 rounded-xl border-2 border-slate-700 bg-slate-950/70 px-3 py-2 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
          <span class="block text-xs text-slate-400">Orbit ${ordinal}</span>
          <span class="block font-bold">${planet?.name || 'Empty'}</span>
        </button>
      `;
    }).join('');

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
          <span class="play-hud__title text-xs text-slate-400">Build a Solar System</span>
        </div>

        <section class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="text-center mb-5">
            <p class="text-xs uppercase tracking-wider text-sky-300 font-bold">Planet ordering mission</p>
            <h1 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold mt-2">Build a Solar System</h1>
            <p class="text-slate-300 mt-2">Place the eight planets in order, starting with the one closest to the Sun.</p>
          </div>

          <figure class="mx-auto max-w-2xl mb-5">
            <svg class="solar-system-diagram w-full h-auto" viewBox="0 0 800 520" role="img" aria-labelledby="solar-system-diagram-title solar-system-diagram-description">
              <title id="solar-system-diagram-title">Eight planet orbits around the Sun</title>
              <desc id="solar-system-diagram-description">A schematic orbit diagram with numbered planet positions. The distances are not to scale.</desc>
              ${orbitRings}
              <circle cx="400" cy="260" r="20" fill="#fbbf24"></circle>
              <text x="400" y="264" fill="#422006" font-size="10" font-weight="700" text-anchor="middle">Sun</text>
              ${orbitMarkers}
            </svg>
            <figcaption class="text-center text-xs text-slate-400 mt-2">The orbit diagram is schematic; planet sizes and distances are not to scale.</figcaption>
          </figure>

          <p id="solar-system-instructions" class="text-sm text-slate-300 mb-4">Select a planet and an orbit, or drag a planet to an orbit. On touch screens, tap a planet and then tap its orbit.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            ${SOLAR_SYSTEM_PLANETS.map(planet => {
              const orbitIndex = game.placements.indexOf(planet.id);
              const placement = orbitIndex >= 0 ? `Orbit ${orbitIndex + 1}` : 'Not placed';
              return `
                <button type="button" draggable="true" data-action="solar-system-select" data-planet-id="${planet.id}" data-solar-planet-id="${planet.id}"
                        aria-label="${planet.name}, ${placement}. Select to read a fact and place it." aria-pressed="${game.selectedPlanetId === planet.id}"
                        class="min-h-14 rounded-xl border-2 ${game.selectedPlanetId === planet.id ? 'border-sky-400 bg-sky-950' : 'border-slate-700 bg-slate-950/70'} px-3 py-2 text-left text-white hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 transition-colors motion-reduce:transition-none">
                  <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color:${planet.color}" aria-hidden="true"></span>
                  <span class="font-bold">${planet.name}</span>
                  <span class="block text-xs text-slate-400 mt-1">${placement}</span>
                </button>
              `;
            }).join('')}
          </div>

          <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 mb-4" aria-labelledby="solar-system-fact-title">
            <h2 id="solar-system-fact-title" class="font-bold text-white">Planet fact</h2>
            <p id="solar-system-fact" role="status" aria-live="polite" class="text-slate-300 mt-1">
              ${factPlanet ? `<strong class="text-white">${factPlanet.name}:</strong> ${factPlanet.fact}` : 'Select a planet to discover a fact.'}
            </p>
          </section>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" aria-label="Planet orbits">
            ${orbitSlots}
          </div>
          <p id="solar-system-status" role="status" aria-live="polite" class="text-sm text-sky-200 min-h-6 mb-3">${game.message}</p>
          ${game.lastAnswerCorrect === false ? `
            <div id="solar-system-feedback" role="status" aria-live="polite" class="rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 mb-4 text-amber-100">
              <p class="font-bold">Not quite. Check these orbit positions and try again:</p>
              <ul class="list-disc pl-5 mt-2">
                ${game.mismatches.map(mismatch => `<li>Orbit ${mismatch.orbit}: ${mismatch.current} is here; ${mismatch.expected} belongs here.</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <button type="button" data-action="solar-system-submit" ${canSubmit ? '' : 'disabled'}
                  class="w-full rounded-xl bg-sky-700 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed px-5 py-3 text-white font-bold transition-colors motion-reduce:transition-none">
            Check Planet Order
          </button>
        </section>
      </div>
    `;

    main.querySelectorAll('[data-solar-planet-id]').forEach(button => {
      button.addEventListener('dragstart', event => {
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', button.dataset.solarPlanetId);
      });
    });
    main.querySelectorAll('[data-solar-orbit-index]').forEach(orbit => {
      orbit.addEventListener('dragover', event => event.preventDefault());
      orbit.addEventListener('drop', event => {
        event.preventDefault();
        const planetId = event.dataTransfer?.getData('text/plain');
        if (!planetId) {
          game.message = 'Choose a planet from the tray before dragging it to an orbit.';
          this.renderSolarSystemActivity();
          return;
        }
        this.placeSolarSystemPlanet(planetId, Number(orbit.dataset.solarOrbitIndex));
      });
    });
  }
});
