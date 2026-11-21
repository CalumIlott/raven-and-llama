const THERMAL_CHAMBER_MIN_C = -100;
const THERMAL_CHAMBER_MAX_C = 200;
const THERMAL_CHAMBER_PARTICLE_POSITIONS = [
  [18, 24], [38, 18], [59, 26], [78, 19], [24, 45], [47, 42], [69, 48], [84, 39],
  [16, 67], [37, 73], [59, 64], [78, 75], [26, 88], [49, 87], [69, 91], [88, 84]
];

// Illustrative layouts keep phase changes visible with reduced motion too.
function getThermalParticle(phase, index) {
  const kind = phase === 'melting' ? (index < 8 ? 'solid' : 'liquid')
    : phase === 'boiling' ? (index < 8 ? 'liquid' : 'gas') : phase;
  const column = index % 4, row = Math.floor(index / 4);
  const positions = {
    solid: [35 + column * 10, 56 + row * 10],
    liquid: [19 + column * 21 + (row % 2) * 6, 62 + row * 9],
    gas: THERMAL_CHAMBER_PARTICLE_POSITIONS[index]
  };
  const [x, y] = positions[kind];
  return { phase: kind, x, y, dx: index % 2 ? -1 : 1, dy: index % 3 ? 1 : -1, delay: -(index % 7) * 0.23 };
}

function getThermalChamberState(temperatureC) {
  if (!Number.isFinite(temperatureC) || temperatureC < THERMAL_CHAMBER_MIN_C || temperatureC > THERMAL_CHAMBER_MAX_C) return null;
  if (temperatureC === 0) return { phase: 'melting', label: 'Melting point: ice and liquid water can coexist', sourcePhase: 'solid-liquid' };
  if (temperatureC < 0) return { phase: 'solid', label: 'Solid ice', sourcePhase: 'solid' };
  if (temperatureC === 100) return { phase: 'boiling', label: 'Boiling point: liquid water and water vapour can coexist', sourcePhase: 'liquid-gas' };
  if (temperatureC < 100) return { phase: 'liquid', label: 'Liquid water', sourcePhase: 'liquid' };
  return { phase: 'gas', label: 'Water vapour', sourcePhase: 'gas' };
}

window.ThermalChamber = Object.freeze({
  minTemperatureC: THERMAL_CHAMBER_MIN_C,
  maxTemperatureC: THERMAL_CHAMBER_MAX_C,
  getState: getThermalChamberState
});

Object.assign(App.prototype, {
  startThermalChamber() {
    this.currentView = 'science-thermal-chamber';
    this.thermalChamberGame = { temperatureC: 20, lidClosed: false };
    this.renderThermalChamber();
  },

  setThermalChamberTemperature(temperatureC) {
    const game = this.thermalChamberGame;
    if (!game || !Number.isFinite(temperatureC)) return false;
    game.temperatureC = Math.max(THERMAL_CHAMBER_MIN_C, Math.min(THERMAL_CHAMBER_MAX_C, Math.round(temperatureC)));
    this.updateThermalChamberDisplay();
    return true;
  },

  adjustThermalChamberTemperature(deltaC) {
    const game = this.thermalChamberGame;
    if (!game || !Number.isFinite(deltaC)) return false;
    return this.setThermalChamberTemperature(game.temperatureC + deltaC);
  },

  toggleThermalChamberLid() {
    if (!this.thermalChamberGame) return false;
    this.thermalChamberGame.lidClosed = !this.thermalChamberGame.lidClosed;
    this.updateThermalChamberDisplay();
    return true;
  },

  updateThermalChamberDisplay() {
    const game = this.thermalChamberGame;
    const main = document.getElementById('app-main');
    if (!game || !main) return false;
    const state = getThermalChamberState(game.temperatureC);
    const chamber = main.querySelector('.thermal-chamber-vessel');
    const phase = main.querySelector('#thermal-chamber-phase');
    const reading = main.querySelector('#thermal-chamber-reading');
    const feedback = main.querySelector('#thermal-chamber-lid-feedback');
    const condensation = main.querySelector('.thermal-condensation');
    if (!state || !chamber || !phase || !reading || !feedback || !condensation) return false;
    chamber.setAttribute('aria-label', `Water particle model: ${state.label}; ${game.lidClosed ? 'lid closed' : 'lid open'}`);
    chamber.classList.toggle('thermal-chamber-vessel--closed', game.lidClosed);
    const slider = main.querySelector('#thermal-chamber-temperature');
    if (slider) slider.value = String(game.temperatureC);
    const lid = main.querySelector('[data-action="thermal-chamber-lid"]');
    if (lid) {
      lid.setAttribute('aria-pressed', String(game.lidClosed));
      lid.textContent = game.lidClosed ? 'Open cool lid' : 'Close cool lid';
    }
    phase.textContent = state.label;
    reading.textContent = `${game.temperatureC}°C`;
    main.querySelectorAll('.thermal-particle').forEach((particle, index) => {
      const model = getThermalParticle(state.phase, index);
      particle.className = `thermal-particle thermal-particle--${model.phase}`;
      particle.style.setProperty('--particle-x', `${model.x}%`);
      particle.style.setProperty('--particle-y', `${model.y}%`);
      particle.style.setProperty('--particle-dx', String(model.dx));
      particle.style.setProperty('--particle-dy', String(model.dy));
      particle.style.setProperty('--particle-delay', `${model.delay}s`);
    });
    const isCondensing = game.lidClosed && state.phase === 'gas';
    feedback.textContent = isCondensing
      ? 'Water vapour touches the cool lid and condenses into liquid droplets.'
      : game.lidClosed
        ? 'The lid is closed. There is not enough water vapour here to show condensation yet.'
        : 'Close the cool lid after making water vapour to observe condensation.';
    condensation.textContent = isCondensing ? '💧　💧　💧' : '';
    return true;
  },

  renderThermalChamber() {
    const main = document.getElementById('app-main');
    const game = this.thermalChamberGame;
    if (!main || !game) return;
    main.dataset.page = 'science-thermal-chamber';
    const state = getThermalChamberState(game.temperatureC);
    const dots = THERMAL_CHAMBER_PARTICLE_POSITIONS.map((_, index) => {
      const particle = getThermalParticle(state.phase, index);
      return `<span class="thermal-particle thermal-particle--${particle.phase}" data-particle="${index}" aria-hidden="true"></span>`;
    }).join('');
    const lidFeedback = game.lidClosed && state.phase === 'gas'
      ? 'Water vapour touches the cool lid and condenses into liquid droplets.'
      : game.lidClosed
        ? 'The lid is closed. There is not enough water vapour here to show condensation yet.'
        : 'Close the cool lid after making water vapour to observe condensation.';
    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button type="button" data-action="science-lab" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to Science Lab</button>
          <span class="play-hud__title text-xs text-slate-400">Thermal Chamber</span>
        </div>
        <section class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <header class="text-center mb-5">
            <p class="text-xs uppercase tracking-wider text-sky-300 font-bold">States of matter sandbox</p>
            <h1 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold mt-2">Thermal Chamber</h1>
            <p class="text-slate-300 mt-2">Change the temperature and watch this simple model of water particles respond.</p>
          </header>
          <aside aria-label="Model limits" class="rounded-xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 mb-5">
            This is a simplified computer model, not a real heater or experiment. It assumes pure water at standard sea-level pressure; boiling temperature changes with pressure.
          </aside>
          <div class="grid gap-6 lg:grid-cols-[1fr_0.85fr] items-start">
            <div>
              <div class="thermal-chamber-vessel ${game.lidClosed ? 'thermal-chamber-vessel--closed' : ''}" role="img" aria-label="Water particle model: ${state.label}; ${game.lidClosed ? 'lid closed' : 'lid open'}">
                <div class="thermal-chamber-lid" aria-hidden="true"></div>
                ${dots}
                <div class="thermal-condensation" aria-hidden="true">${game.lidClosed && state.phase === 'gas' ? '💧　💧　💧' : ''}</div>
              </div>
              <div class="text-center mt-3">
                <p id="thermal-chamber-phase" class="text-xl font-bold text-white" aria-live="polite">${state.label}</p>
                <p class="text-sm text-slate-300 mt-1">Particle movement is illustrative; the molecules are far too small to see.</p>
              </div>
            </div>
            <div class="space-y-4">
              <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <label for="thermal-chamber-temperature" class="block font-bold text-white">Temperature</label>
                <output id="thermal-chamber-reading" for="thermal-chamber-temperature" class="block text-3xl font-bold text-cyan-300 my-2">${game.temperatureC}°C</output>
                <input id="thermal-chamber-temperature" data-action="thermal-chamber-temperature" type="range" min="${THERMAL_CHAMBER_MIN_C}" max="${THERMAL_CHAMBER_MAX_C}" step="1" value="${game.temperatureC}" class="w-full accent-cyan-400" aria-describedby="thermal-chamber-range">
                <p id="thermal-chamber-range" class="text-xs text-slate-400 mt-1">${THERMAL_CHAMBER_MIN_C}°C to ${THERMAL_CHAMBER_MAX_C}°C</p>
                <div class="grid grid-cols-2 gap-3 mt-4">
                  <button type="button" data-action="thermal-chamber-adjust" data-delta="-10" class="rounded-xl bg-blue-800 hover:bg-blue-700 px-4 py-3 text-white font-bold">Cool −10°C</button>
                  <button type="button" data-action="thermal-chamber-adjust" data-delta="10" class="rounded-xl bg-orange-700 hover:bg-orange-600 px-4 py-3 text-white font-bold">Warm +10°C</button>
                </div>
              </section>
              <section class="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <h2 class="font-bold text-white">Condensation lid</h2>
                <p id="thermal-chamber-lid-feedback" class="text-sm text-slate-300 mt-1" aria-live="polite">${lidFeedback}</p>
                <button type="button" data-action="thermal-chamber-lid" aria-pressed="${game.lidClosed}" class="mt-3 w-full rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 text-white font-bold">${game.lidClosed ? 'Open cool lid' : 'Close cool lid'}</button>
              </section>
              <p class="text-xs text-slate-400">Near 0°C, ice and liquid water can coexist. Near 100°C at sea-level pressure, liquid water and vapour can coexist.</p>
            </div>
          </div>
        </section>
      </div>
    `;
    main.querySelector('#thermal-chamber-temperature').addEventListener('input', event => {
      game.temperatureC = Number(event.currentTarget.value);
      this.updateThermalChamberDisplay();
    });
    this.updateThermalChamberDisplay();
  }
});
