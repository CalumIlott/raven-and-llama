const GEOGRAPHY_CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America'
];
const GEOGRAPHY_MAP_ZOOM_LEVELS = [1, 1.5, 2, 3, 4.5, 6, 8, 12, 16];
const GEOGRAPHY_MAP_SMALL_ISLAND_MARKERS = new Set([
  'mauritius', 'seychelles', 'comoros', 'maldives', 'kiribati', 'tuvalu',
  'nauru', 'tonga', 'samoa', 'marshall-islands', 'micronesia', 'palau',
  'andorra', 'antigua-and-barbuda', 'bahrain', 'barbados', 'cabo-verde', 'dominica', 'grenada', 'liechtenstein', 'malta', 'monaco', 'saint-kitts-and-nevis', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'san-marino', 'sao-tome-and-principe', 'singapore'
]);
const GEOGRAPHY_MAP_WORLD_VIEW_BOX = '-8 -4 376 188';
const GEOGRAPHY_MAP_WORLD_BOUNDS = Object.freeze({
  x: -8,
  y: -4,
  width: 376,
  height: 188
});

function geographyFlagCode(country) {
  const indicators = Array.from(country?.flag || '', character => character.codePointAt(0));
  if (indicators.length !== 2 || indicators.some(codePoint =>
    codePoint < 0x1f1e6 || codePoint > 0x1f1ff
  )) return null;
  return indicators.map(codePoint => String.fromCharCode(codePoint - 0x1f1e6 + 65)).join('');
}

function geographyFlagImagePath(country) {
  const code = geographyFlagCode(country);
  if (!code) throw new TypeError(`Country has no supported regional flag code: ${country?.id || 'unknown'}`);
  return `/images/flags/${code.toLowerCase()}.svg`;
}

function isValidGeographyCountryData(data) {
  if (!data || !Array.isArray(data.countries) || data.countries.length === 0 ||
    typeof data.mapSource !== 'string' || !data.mapSource.trim() ||
    typeof data.mapSourceUrl !== 'string' || !data.mapSourceUrl.startsWith('https://')) {
    return false;
  }

  const ids = new Set();
  return data.countries.every(country => {
    if (!country || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(country.id) ||
      ids.has(country.id) ||
      !['name', 'continent', 'flag', 'capital', 'fact', 'factSource', 'factSourceUrl']
        .every(key => typeof country[key] === 'string' && country[key].trim()) ||
      !geographyFlagCode(country) ||
      !country.factSourceUrl.startsWith('https://') ||
      !GEOGRAPHY_CONTINENTS.includes(country.continent) ||
      !Array.isArray(country.mapPoint) || country.mapPoint.length !== 2 ||
      !country.mapPoint.every(Number.isFinite) ||
      !Array.isArray(country.mapPaths) || country.mapPaths.length === 0 ||
      !country.mapPaths.every(path => typeof path === 'string' && /^M[-\d.\sLZ]+$/i.test(path))) {
      return false;
    }
    ids.add(country.id);
    return true;
  });
}

function isValidGeographyWorldContext(data) {
  if (!data || !Array.isArray(data.countries) || data.countries.length < 100 ||
    typeof data.mapSource !== 'string' || !data.mapSource.trim() ||
    typeof data.mapSourceUrl !== 'string' || !data.mapSourceUrl.startsWith('https://')) {
    return false;
  }

  const names = new Set();
  return data.countries.every(country => {
    if (!country || typeof country.name !== 'string' || !country.name.trim() ||
      names.has(country.name) || typeof country.path !== 'string' ||
      !/^M[-\d.\sMLZ]+$/i.test(country.path)) {
      return false;
    }
    names.add(country.name);
    return true;
  });
}

if (!isValidGeographyCountryData(window.GEOGRAPHY_COUNTRY_DATA)) {
  throw new TypeError('Geography country data is missing or invalid.');
}
if (!isValidGeographyWorldContext(window.GEOGRAPHY_WORLD_MAP_CONTEXT)) {
  throw new TypeError('Geography world map context is missing or invalid.');
}

const GEOGRAPHY_COUNTRIES = window.GEOGRAPHY_COUNTRY_DATA.countries;
function filterGeographyCountries(query) {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const search = normalize(query);
  return GEOGRAPHY_COUNTRIES.filter(country =>
    normalize(`${country.name} ${country.capital} ${country.continent}`).includes(search));
}
const GEOGRAPHY_WORLD_CONTEXT_COUNTRIES = window.GEOGRAPHY_WORLD_MAP_CONTEXT.countries;

function escapeGeographyHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function geographyCountryById(countryId) {
  return GEOGRAPHY_COUNTRIES.find(country => country.id === countryId) || null;
}

function geographyCountryPath(country) {
  return country.mapPaths.join('');
}

function geographyMapPointFromClient(map, clientX, clientY, inverseScreenMatrix) {
  const inverse = inverseScreenMatrix || map.getScreenCTM()?.inverse();
  if (!inverse) return { x: clientX, y: clientY };
  return new DOMPoint(clientX, clientY).matrixTransform(inverse);
}

function geographyMapZoomIndexForScale(scale) {
  return GEOGRAPHY_MAP_ZOOM_LEVELS.reduce((closestIndex, level, index) =>
    Math.abs(Math.log(level / scale)) < Math.abs(Math.log(GEOGRAPHY_MAP_ZOOM_LEVELS[closestIndex] / scale))
      ? index
      : closestIndex, 0);
}

function renderGeographyCountryDetails(country) {
  const fact = country.selectedFact || country.fact;
  return `
    <article class="geography-country-details" aria-labelledby="geography-country-name">
      <div class="geography-country-details__heading">
        <img class="country-flag-image geography-country-details__flag" src="${geographyFlagImagePath(country)}" alt="Flag of ${escapeGeographyHtml(country.name)}" width="56" height="56" decoding="async">
        <div>
          <p class="geography-country-details__continent">${escapeGeographyHtml(country.continent)}</p>
          <h2 id="geography-country-name">${escapeGeographyHtml(country.name)}</h2>
        </div>
      </div>
      <p class="geography-country-details__capital"><strong>Capital:</strong> ${escapeGeographyHtml(country.capital)}</p>
      <p class="geography-country-details__fact" aria-live="polite">${escapeGeographyHtml(fact.text || fact)}</p>
      <p class="geography-country-details__source">
        Source: <a href="${escapeGeographyHtml(fact.sourceUrl || country.factSourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeGeographyHtml(fact.source || country.factSource)}</a>
      </p>
      <button type="button" data-action="geography-country-speak" class="geography-speak-button">
        Listen to ${escapeGeographyHtml(country.name)} facts
      </button>
      <p id="geography-speech-status" class="geography-speech-status" role="status" aria-live="polite"></p>
    </article>
  `;
}

Object.assign(App.prototype, {
  startGeographyGlobeTrail() {
    const previousCaseId = this.geographyGlobeTrail?.case?.id || null;
    const trailCase = window.GeographyGlobeTrail.chooseCase(Math.random, previousCaseId);
    this.geographyGlobeTrail = { case: trailCase, clueIndex: 0, solved: false, message: '' };
    this.renderGeographyGlobeTrail();
  },

  revealGeographyGlobeClue() {
    const trail = this.geographyGlobeTrail;
    if (!trail || trail.solved || trail.clueIndex >= trail.case.clues.length - 1) return;
    trail.clueIndex += 1;
    trail.message = '';
    this.renderGeographyGlobeTrail();
  },

  renderGeographyGlobeTrail() {
    const panel = document.getElementById('geography-globe-trail-panel');
    const trail = this.geographyGlobeTrail;
    if (!panel || !trail) return;
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Passport mystery · ${trail.solved ? 'stamp earned' : `clue ${trail.clueIndex + 1} of ${trail.case.clues.length}`}</p>
          <h3 id="geography-globe-trail-title" class="mt-1 font-ninja text-xl font-bold text-white">Where are we going?</h3>
        </div>
        <button type="button" data-action="geography-globe-start" class="rounded-xl border border-violet-300/70 px-3 py-2 text-sm font-bold text-violet-100 hover:bg-violet-400/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200">New mystery</button>
      </div>
      <ol class="mt-4 grid gap-2 text-sm text-slate-200">
        ${trail.case.clues.slice(0, trail.clueIndex + 1).map((clue, index) => `<li class="flex gap-3 rounded-xl bg-slate-900/80 p-3"><span class="font-bold text-violet-300">${index + 1}.</span><span>${escapeGeographyHtml(clue)}</span></li>`).join('')}
      </ol>
      ${trail.solved && trail.case.sourceUrl ? `<p class="mt-3 text-xs text-slate-300">Clue source: <a class="font-semibold text-violet-200 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200" href="${escapeGeographyHtml(trail.case.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeGeographyHtml(trail.case.sourceName || 'Source')}</a></p>` : ''}
      <div class="mt-4 flex flex-wrap items-center gap-3">
        ${!trail.solved && trail.clueIndex < trail.case.clues.length - 1 ? '<button type="button" data-action="geography-globe-clue" class="rounded-xl bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200">Reveal next clue</button>' : ''}
        <p id="geography-globe-trail-status" class="min-h-6 text-sm font-semibold ${trail.solved ? 'text-emerald-300' : 'text-slate-300'}" role="status" aria-live="polite">${escapeGeographyHtml(trail.message || (trail.solved ? 'Passport stamp earned! Explore the country facts below.' : `Clue ${trail.clueIndex + 1} of ${trail.case.clues.length} revealed. Select your guess on the map or in the country list.`))}</p>
      </div>
    `;
  },

  showGeographyWorld() {
    this.currentView = 'geography-world';
    this.rememberModule('geography-world', '/learning-centre/geography');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'geography-world';
    this.updateHeader();

    const selectedCountry = geographyCountryById(this.geographySelectedCountryId)
      || GEOGRAPHY_COUNTRIES[0];
    this.geographySelectedCountryId = selectedCountry.id;
    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button type="button" data-action="learning-centre" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform" aria-hidden="true">←</span>
            <span>Back to ${window.brandWordmark()} Learning Centre</span>
          </button>
          <button type="button" data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <section class="module-intro geography-intro">
          <div class="module-intro__copy">
            <div class="module-eyebrow geography-badge">
              ${window.brandWordmark()} <span>Geography &amp; The World</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Our World</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">Choose a highlighted country on the map or use the country list to discover its flag, capital, and a fact about the place.</p>
          </div>
          <div class="module-banner-aside">
            <p>Every place has a story to discover.</p>
          </div>
        </section>

        <section class="mt-8 rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-5 sm:p-7" aria-labelledby="geography-activities-title">
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Try a challenge</p>
            <h2 id="geography-activities-title" class="mt-1 font-ninja text-2xl font-bold text-white">Geography games</h2>
            <p class="mt-2 max-w-2xl text-sm text-slate-300">Practise spotting flags and remembering capital cities with five quick questions.</p>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article class="flex flex-col items-start gap-3 rounded-2xl border border-sky-400/30 bg-slate-950/70 p-5">
              <span class="text-3xl" aria-hidden="true">🚩</span>
              <h3 class="font-ninja text-xl font-bold text-white">Flag Detective</h3>
              <p class="flex-1 text-sm text-slate-300">Look at a flag and choose the country it belongs to.</p>
              <button type="button" data-action="geography-flag-start" class="rounded-xl border border-sky-300 bg-sky-400/20 px-4 py-2 font-bold text-sky-100 transition hover:bg-sky-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200">Play Flag Detective</button>
            </article>
            <article class="flex flex-col items-start gap-3 rounded-2xl border border-emerald-400/30 bg-slate-950/70 p-5">
              <span class="text-3xl" aria-hidden="true">🏙️</span>
              <h3 class="font-ninja text-xl font-bold text-white">Capital Cities</h3>
              <p class="flex-1 text-sm text-slate-300">Match each country with its capital city.</p>
              <button type="button" data-action="geography-capital-start" class="rounded-xl border border-emerald-300 bg-emerald-400/20 px-4 py-2 font-bold text-emerald-100 transition hover:bg-emerald-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200">Play Capital Cities</button>
            </article>
            <article class="flex flex-col items-start gap-3 rounded-2xl border border-violet-400/30 bg-slate-950/70 p-5">
              <span class="text-3xl" aria-hidden="true">🧭</span>
              <h3 class="font-ninja text-xl font-bold text-white">Globe Trotter</h3>
              <p class="flex-1 text-sm text-slate-300">Follow travel clues, then find the mystery country on the map or in the country list.</p>
              <button type="button" data-action="geography-globe-start" class="rounded-xl border border-violet-300 bg-violet-400/20 px-4 py-2 font-bold text-violet-100 transition hover:bg-violet-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200">Launch Globe Trotter</button>
            </article>
          </div>
          <section id="geography-globe-trail-panel" class="mt-5 hidden rounded-2xl border border-violet-400/30 bg-slate-950/70 p-5" aria-labelledby="geography-globe-trail-title"></section>
        </section>

        <div class="geography-explorer">
          <section class="geography-map-panel" aria-labelledby="geography-map-title">
            <div class="geography-section-heading">
              <div>
                <p class="geography-eyebrow">Explore by place</p>
                <h2 id="geography-map-title">Choose a country on the map</h2>
              </div>
              <span class="geography-country-count">${GEOGRAPHY_COUNTRIES.length} countries</span>
            </div>
            <div class="geography-map-controls">
              <label class="geography-country-picker" for="geography-country-picker">
                <span>Find a country</span>
                <select id="geography-country-picker" data-action="geography-country-picker">
                  ${GEOGRAPHY_COUNTRIES.map(country => `
                    <option value="${country.id}" ${country.id === selectedCountry.id ? 'selected' : ''}>${escapeGeographyHtml(country.name)}</option>
                  `).join('')}
                </select>
              </label>
              <div class="geography-map-zoom-controls" role="group" aria-label="Map zoom controls">
                <button type="button" data-action="geography-map-zoom" data-delta="-1" aria-label="Zoom out" disabled>−</button>
                <output id="geography-map-zoom-status" aria-live="polite">World view</output>
                <button type="button" data-action="geography-map-zoom" data-delta="1" aria-label="Zoom in">+</button>
                <button type="button" data-action="geography-map-reset" aria-label="Reset map view">Reset</button>
              </div>
            </div>
            <figure class="geography-map-figure">
              <div class="geography-map-viewport" id="geography-map-viewport">
                <button type="button" data-action="geography-map-fullscreen" class="geography-map-fullscreen" aria-label="View map full screen" aria-pressed="false">⛶ Full screen</button>
                <svg id="geography-world-map" class="geography-map" viewBox="${GEOGRAPHY_MAP_WORLD_VIEW_BOX}" role="group" aria-label="Interactive world map. Select a highlighted country to see its capital and facts.">
                  <rect class="geography-map__ocean" x="${GEOGRAPHY_MAP_WORLD_BOUNDS.x}" y="${GEOGRAPHY_MAP_WORLD_BOUNDS.y}" width="${GEOGRAPHY_MAP_WORLD_BOUNDS.width}" height="${GEOGRAPHY_MAP_WORLD_BOUNDS.height}" rx="5"></rect>
                  <g class="geography-map__context" aria-hidden="true">
                    ${GEOGRAPHY_WORLD_CONTEXT_COUNTRIES.map(country => `
                      <path class="geography-map__context-country" data-world-country="${escapeGeographyHtml(country.name)}" d="${country.path}" fill-rule="evenodd"></path>
                    `).join('')}
                  </g>
                  <g class="geography-map__countries">
                    ${GEOGRAPHY_COUNTRIES.map(country => `
                      <g class="geography-map__region" data-action="geography-country-select" data-country-id="${country.id}" role="button" tabindex="0" aria-label="${escapeGeographyHtml(country.name)}, ${escapeGeographyHtml(country.continent)}. Select to view capital and facts." aria-pressed="${country.id === selectedCountry.id}">
                        <title>${escapeGeographyHtml(country.name)}</title>
                        ${country.mapPaths.map(path => `<path d="${path}"></path>`).join('')}
                        ${GEOGRAPHY_MAP_SMALL_ISLAND_MARKERS.has(country.id) ? `<circle class="geography-map__hit-target" cx="${country.mapPoint[0]}" cy="${country.mapPoint[1]}" r="1.7"></circle>` : ""}
                        <circle class="geography-map__marker" cx="${country.mapPoint[0]}" cy="${country.mapPoint[1]}" r="1.7"></circle>
                      </g>
                    `).join('')}
                  </g>
                </svg>
              </div>
              <figcaption class="geography-map-caption">The full world is shown; select one of the ${GEOGRAPHY_COUNTRIES.length} highlighted countries. Use the buttons or pinch to zoom, then drag to pan. Open the map full screen for a larger view. Tiny countries are shown as enlarged markers and are not to scale; simplified outlines may omit them.</figcaption>
            </figure>
            <p class="geography-map-attribution">
              Map outlines: <a href="${escapeGeographyHtml(window.GEOGRAPHY_COUNTRY_DATA.mapSourceUrl)}" target="_blank" rel="noopener noreferrer">Natural Earth (public domain)</a>.
            </p>
          </section>

          <div class="geography-details-column">
            <div id="geography-country-details" aria-live="polite"></div>
            <section class="geography-country-list" aria-labelledby="geography-country-list-title">
              <div class="geography-section-heading">
                <div>
                  <p class="geography-eyebrow">Keyboard-friendly alternative</p>
                  <h2 id="geography-country-list-title">Choose from the country list</h2>
                </div>
              </div>
              <label class="geography-country-picker" for="geography-country-search">Search country list
                <input id="geography-country-search" type="search" placeholder="Country, capital or continent" aria-describedby="geography-country-search-status" autocomplete="off">
              </label>
              <p id="geography-country-search-status" role="status" aria-live="polite">${GEOGRAPHY_COUNTRIES.length} countries shown</p>
              <div class="geography-country-groups">
                ${GEOGRAPHY_CONTINENTS.map(continent => {
                  const countries = GEOGRAPHY_COUNTRIES.filter(country => country.continent === continent);
                  if (countries.length === 0) return '';
                  return `
                    <section class="geography-country-group" aria-labelledby="geography-continent-${continent.toLowerCase().replace(/\s+/g, '-')}">
                      <h3 id="geography-continent-${continent.toLowerCase().replace(/\s+/g, '-')}">${continent}</h3>
                      <div class="geography-country-options">
                        ${countries.map(country => `
                          <button type="button" class="geography-country-option" data-action="geography-country-select" data-country-id="${country.id}" aria-pressed="${country.id === selectedCountry.id}">
                            <img class="country-flag-image geography-country-option__flag" src="${geographyFlagImagePath(country)}" alt="" width="28" height="19" loading="lazy" decoding="async">
                            <span>${escapeGeographyHtml(country.name)}</span>
                          </button>
                        `).join('')}
                      </div>
                    </section>
                  `;
                }).join('')}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    main.onkeydown = event => {
      const mapViewport = document.getElementById('geography-map-viewport');
      if (event.key === 'Escape' && mapViewport?.classList.contains('is-fullscreen-fallback')) {
        event.preventDefault();
        void this.toggleGeographyMapFullscreen();
        return;
      }
      const target = event.target.closest?.('.geography-map__region');
      if (!target || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      this.selectGeographyCountry(target.dataset.countryId);
    };
    const map = document.getElementById('geography-world-map');
    map.onpointerdown = event => this.startGeographyMapGesture(event);
    map.onpointermove = event => this.moveGeographyMapGesture(event);
    map.onpointerup = event => this.endGeographyMapGesture(event);
    map.onpointercancel = event => this.endGeographyMapGesture(event);
    map.onlostpointercapture = event => this.endGeographyMapGesture(event);
    document.addEventListener('fullscreenchange', this.updateGeographyMapFullscreenButton);
    map.addEventListener('click', event => {
      const hitTarget = event.target.closest?.('.geography-map__hit-target');
      if (!event.target.closest?.('.geography-map__region')) return;
      const nearestTarget = [...map.querySelectorAll('.geography-map__hit-target')]
        .map(target => {
          const bounds = target.getBoundingClientRect();
          const x = bounds.left + bounds.width / 2;
          const y = bounds.top + bounds.height / 2;
          return { target, distance: Math.hypot(event.clientX - x, event.clientY - y), radius: bounds.width / 2 };
        })
        .sort((first, second) => first.distance - second.distance)[0];
      if (!nearestTarget || (!hitTarget && nearestTarget.distance > nearestTarget.radius)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.selectGeographyCountry(nearestTarget.target.closest('.geography-map__region')?.dataset.countryId);
    }, true);
    map.addEventListener('click', event => {
      if (!this.geographyMapSuppressClick) return;
      this.geographyMapSuppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    this.renderGeographyCountrySelection(selectedCountry);
    document.getElementById('geography-country-search').addEventListener('input', event => {
      const matches = new Set(filterGeographyCountries(event.currentTarget.value).map(country => country.id));
      main.querySelectorAll('.geography-country-option').forEach(button => { button.hidden = !matches.has(button.dataset.countryId); });
      main.querySelectorAll('.geography-country-group').forEach(group => {
        group.hidden = !group.querySelector('.geography-country-option:not([hidden])');
      });
      document.getElementById('geography-country-search-status').textContent = matches.size
        ? `${matches.size} ${matches.size === 1 ? 'country' : 'countries'} shown`
        : 'No countries match. Try another country, capital or continent.';
    });
  },

  renderGeographyCountrySelection(country) {
    const details = document.getElementById('geography-country-details');
    if (!details) throw new Error('Geography country details panel was not rendered');
    country.selectedFact = chooseGeographyCountryFact(country);
    details.innerHTML = renderGeographyCountryDetails(country);
    const picker = document.getElementById('geography-country-picker');
    if (picker) picker.value = country.id;
    this.updateGeographyMapView(country);
    document.querySelectorAll('[data-action="geography-country-select"]').forEach(option => {
      const selected = option.dataset.countryId === country.id;
      option.setAttribute('aria-pressed', String(selected));
      option.classList.toggle('is-selected', selected);
    });
  },

  updateGeographyMapView(country) {
    const map = document.getElementById('geography-world-map');
    if (!map) throw new Error('Geography map was not rendered');
    const zoomIndex = Number.isInteger(this.geographyMapZoomIndex)
      ? this.geographyMapZoomIndex
      : 0;
    const zoom = GEOGRAPHY_MAP_ZOOM_LEVELS[zoomIndex];
    if (!zoom) throw new RangeError(`Unknown geography map zoom level: ${zoomIndex}`);

    if (zoom === 1) {
      map.setAttribute('viewBox', GEOGRAPHY_MAP_WORLD_VIEW_BOX);
    } else {
      const region = map.querySelector(`[data-country-id="${country.id}"]`);
      if (!region) throw new Error(`Geography country map was not rendered: ${country.id}`);
      const bounds = region.getBBox();
      const width = GEOGRAPHY_MAP_WORLD_BOUNDS.width / zoom;
      const height = GEOGRAPHY_MAP_WORLD_BOUNDS.height / zoom;
      this.setGeographyMapViewBox(
        bounds.x + bounds.width / 2 - width / 2,
        bounds.y + bounds.height / 2 - height / 2,
        width,
        height
      );
    }

    map.classList.toggle('is-draggable', zoom > 1);
    const status = document.getElementById('geography-map-zoom-status');
    if (status) status.textContent = zoom === 1 ? 'World view' : `${zoom}× · ${country.name}`;
    const zoomOut = document.querySelector('[data-action="geography-map-zoom"][data-delta="-1"]');
    const zoomIn = document.querySelector('[data-action="geography-map-zoom"][data-delta="1"]');
    if (zoomOut) zoomOut.disabled = zoomIndex === 0;
    if (zoomIn) zoomIn.disabled = zoomIndex === GEOGRAPHY_MAP_ZOOM_LEVELS.length - 1;
  },

  updateGeographyMapFullscreenButton() {
    const button = document.querySelector('[data-action="geography-map-fullscreen"]');
    const viewport = document.getElementById('geography-map-viewport');
    if (!button || !viewport) return;
    const active = document.fullscreenElement === viewport || viewport.classList.contains('is-fullscreen-fallback');
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Exit full screen map' : 'View map full screen');
    button.textContent = active ? '× Exit full screen' : '⛶ Full screen';
  },

  async toggleGeographyMapFullscreen() {
    const viewport = document.getElementById('geography-map-viewport');
    if (!viewport) return;
    const active = document.fullscreenElement === viewport || viewport.classList.contains('is-fullscreen-fallback');
    if (active) {
      if (document.fullscreenElement === viewport && document.exitFullscreen) await document.exitFullscreen();
      viewport.classList.remove('is-fullscreen-fallback');
    } else if (viewport.requestFullscreen) {
      try {
        await viewport.requestFullscreen();
      } catch {
        viewport.classList.add('is-fullscreen-fallback');
      }
    } else {
      viewport.classList.add('is-fullscreen-fallback');
    }
    this.updateGeographyMapFullscreenButton();
  },

  zoomGeographyMap(delta) {
    if (![-1, 1].includes(delta)) throw new RangeError(`Invalid geography map zoom delta: ${delta}`);
    const currentIndex = Number.isInteger(this.geographyMapZoomIndex)
      ? this.geographyMapZoomIndex
      : 0;
    this.geographyMapZoomIndex = Math.max(
      0,
      Math.min(GEOGRAPHY_MAP_ZOOM_LEVELS.length - 1, currentIndex + delta)
    );
    const country = geographyCountryById(this.geographySelectedCountryId)
      || GEOGRAPHY_COUNTRIES[0];
    this.updateGeographyMapView(country);
  },

  resetGeographyMapZoom() {
    this.geographyMapZoomIndex = 0;
    const country = geographyCountryById(this.geographySelectedCountryId)
      || GEOGRAPHY_COUNTRIES[0];
    this.updateGeographyMapView(country);
  },

  startGeographyMapGesture(event) {
    if (event.button !== 0 || event.isPrimary === false) {
      if (event.pointerType !== 'touch') return;
    }
    const map = document.getElementById('geography-world-map');
    if (!map) return;
    if (!this.geographyMapPointers) this.geographyMapPointers = new Map();
    this.geographyMapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.pointerType === 'touch' && map.setPointerCapture && event.isTrusted) {
      try { map.setPointerCapture(event.pointerId); } catch { /* capture may be unavailable in older mobile browsers */ }
    }
    const { x, y, width, height } = map.viewBox.baseVal;
    if (this.geographyMapPointers.size >= 2) {
      const [first, second] = [...this.geographyMapPointers.values()];
      const inverseScreenMatrix = map.getScreenCTM()?.inverse();
      const firstMapPoint = geographyMapPointFromClient(map, first.x, first.y, inverseScreenMatrix);
      const secondMapPoint = geographyMapPointFromClient(map, second.x, second.y, inverseScreenMatrix);
      this.geographyMapGesture = {
        type: 'pinch',
        startDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        startViewBox: { x, y, width, height },
        inverseScreenMatrix,
        startMidpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
        startMidpointMap: { x: (firstMapPoint.x + secondMapPoint.x) / 2, y: (firstMapPoint.y + secondMapPoint.y) / 2 }
      };
      map.classList.add('is-panning');
      return;
    }
    if (this.geographyMapZoomIndex === 0) return;
    this.geographyMapSuppressClick = false;
    this.geographyMapGesture = {
      type: 'pan',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      inverseScreenMatrix: map.getScreenCTM()?.inverse(),
      startMapPoint: geographyMapPointFromClient(map, event.clientX, event.clientY),
      startViewBox: { x, y, width, height },
      moved: false
    };
  },

  moveGeographyMapGesture(event) {
    const points = this.geographyMapPointers;
    if (points?.has(event.pointerId)) points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = this.geographyMapGesture;
    const map = document.getElementById('geography-world-map');
    if (!gesture || !map) return;
    if (gesture.type === 'pinch' && points?.size >= 2) {
      const [first, second] = [...points.values()];
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const midpointX = (first.x + second.x) / 2;
      const midpointY = (first.y + second.y) / 2;
      const worldScale = GEOGRAPHY_MAP_WORLD_BOUNDS.width / gesture.startViewBox.width;
      const scale = Math.max(1, Math.min(16, worldScale * distance / gesture.startDistance));
      const width = GEOGRAPHY_MAP_WORLD_BOUNDS.width / scale;
      const height = width * gesture.startViewBox.height / gesture.startViewBox.width;
      const midpointMap = geographyMapPointFromClient(map, midpointX, midpointY, gesture.inverseScreenMatrix);
      const normalizedX = (midpointMap.x - gesture.startViewBox.x) / gesture.startViewBox.width;
      const normalizedY = (midpointMap.y - gesture.startViewBox.y) / gesture.startViewBox.height;
      this.setGeographyMapViewBox(
        gesture.startMidpointMap.x - normalizedX * width,
        gesture.startMidpointMap.y - normalizedY * height,
        width,
        height
      );
      this.geographyMapZoomIndex = geographyMapZoomIndexForScale(scale);
      map.classList.toggle('is-draggable', scale > 1.05);
      this.updateGeographyMapZoomStatus();
      event.preventDefault();
      return;
    }
    if (gesture.type !== 'pan' || gesture.pointerId !== event.pointerId) return;
    const currentMapPoint = geographyMapPointFromClient(map, event.clientX, event.clientY, gesture.inverseScreenMatrix);
    const deltaX = currentMapPoint.x - gesture.startMapPoint.x;
    const deltaY = currentMapPoint.y - gesture.startMapPoint.y;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 4) return;
    gesture.moved = true;
    map.classList.add('is-panning');
    event.preventDefault();
    this.setGeographyMapViewBox(
      gesture.startViewBox.x - deltaX,
      gesture.startViewBox.y - deltaY,
      gesture.startViewBox.width,
      gesture.startViewBox.height
    );
  },

  endGeographyMapGesture(event) {
    this.geographyMapPointers?.delete(event.pointerId);
    const map = document.getElementById('geography-world-map');
    const gesture = this.geographyMapGesture;
    if (gesture?.type === 'pinch') {
      if ((this.geographyMapPointers?.size || 0) >= 2) {
        const [first, second] = [...this.geographyMapPointers.values()];
        const { x, y, width, height } = map.viewBox.baseVal;
        this.geographyMapGesture = {
          type: 'pinch', startDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
          startViewBox: { x, y, width, height },
          inverseScreenMatrix: map?.getScreenCTM()?.inverse(),
          startMidpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
          startMidpointMap: (() => {
            const inverse = map?.getScreenCTM()?.inverse();
            const firstPoint = geographyMapPointFromClient(map, first.x, first.y, inverse);
            const secondPoint = geographyMapPointFromClient(map, second.x, second.y, inverse);
            return { x: (firstPoint.x + secondPoint.x) / 2, y: (firstPoint.y + secondPoint.y) / 2 };
          })()
        };
      } else {
        this.geographyMapGesture = null;
        map?.classList.remove('is-panning');
        this.geographyMapSuppressClick = true;
      }
      return;
    }
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    this.geographyMapGesture = null;
    if (gesture.moved) {
      this.geographyMapSuppressClick = true;
      map?.classList.remove('is-panning');
    }
  },

  updateGeographyMapZoomStatus() {
    const map = document.getElementById('geography-world-map');
    const status = document.getElementById('geography-map-zoom-status');
    const country = geographyCountryById(this.geographySelectedCountryId) || GEOGRAPHY_COUNTRIES[0];
    const scale = map ? GEOGRAPHY_MAP_WORLD_BOUNDS.width / map.viewBox.baseVal.width : 1;
    if (status) status.textContent = scale < 1.05 ? 'World view' : `${scale.toFixed(1)}× · ${country.name}`;
    const zoomOut = document.querySelector('[data-action="geography-map-zoom"][data-delta="-1"]');
    const zoomIn = document.querySelector('[data-action="geography-map-zoom"][data-delta="1"]');
    if (zoomOut) zoomOut.disabled = scale <= 1.05;
    if (zoomIn) zoomIn.disabled = scale >= 15.9;
  },

  setGeographyMapViewBox(x, y, width, height) {
    const map = document.getElementById('geography-world-map');
    if (!map) throw new Error('Geography map was not rendered');
    const left = Math.max(
      GEOGRAPHY_MAP_WORLD_BOUNDS.x,
      Math.min(GEOGRAPHY_MAP_WORLD_BOUNDS.x + GEOGRAPHY_MAP_WORLD_BOUNDS.width - width, x)
    );
    const top = Math.max(
      GEOGRAPHY_MAP_WORLD_BOUNDS.y,
      Math.min(GEOGRAPHY_MAP_WORLD_BOUNDS.y + GEOGRAPHY_MAP_WORLD_BOUNDS.height - height, y)
    );
    map.setAttribute('viewBox', [left, top, width, height]
      .map(value => Number(value.toFixed(2)))
      .join(' '));
  },

  startGeographyMapPan(event) {
    const zoomIndex = Number.isInteger(this.geographyMapZoomIndex) ? this.geographyMapZoomIndex : 0;
    if (zoomIndex === 0 || event.button !== 0 || event.isPrimary === false) return;
    const map = document.getElementById('geography-world-map');
    if (!map) throw new Error('Geography map was not rendered');
    const { x, y, width, height } = map.viewBox.baseVal;
    this.geographyMapSuppressClick = false;
    this.geographyMapPan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startViewBox: { x, y, width, height },
      moved: false
    };
  },

  moveGeographyMapPan(event) {
    const pan = this.geographyMapPan;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pan.startX;
    const deltaY = event.clientY - pan.startY;
    if (!pan.moved && Math.hypot(deltaX, deltaY) < 4) return;
    const map = document.getElementById('geography-world-map');
    if (!map) throw new Error('Geography map was not rendered');

    if (!pan.moved) {
      pan.moved = true;
      map.classList.add('is-panning');
      if (typeof map.setPointerCapture === 'function' && event.isTrusted) {
        map.setPointerCapture(event.pointerId);
      }
    }

    event.preventDefault();
    const bounds = map.getBoundingClientRect();
    this.setGeographyMapViewBox(
      pan.startViewBox.x - deltaX * pan.startViewBox.width / bounds.width,
      pan.startViewBox.y - deltaY * pan.startViewBox.height / bounds.height,
      pan.startViewBox.width,
      pan.startViewBox.height
    );
  },

  endGeographyMapPan(event) {
    const pan = this.geographyMapPan;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const map = document.getElementById('geography-world-map');
    this.geographyMapPan = null;
    if (pan.moved) {
      this.geographyMapSuppressClick = true;
      map?.classList.remove('is-panning');
      if (map?.hasPointerCapture?.(event.pointerId)) {
        map.releasePointerCapture(event.pointerId);
      }
    }
  },

  selectGeographyCountry(countryId) {
    const country = geographyCountryById(countryId);
    if (!country) throw new RangeError(`Unknown geography country: ${countryId}`);
    const trail = this.geographyGlobeTrail;
    if (trail && !trail.solved) {
      if (!window.GeographyGlobeTrail.isCorrectAnswer(trail.case, country.id)) {
        trail.message = 'Not this stop. Read the clues and try another country.';
        this.renderGeographyGlobeTrail();
        return false;
      }
      trail.solved = true;
      trail.message = `Passport stamp earned! You found ${country.name}. Explore its flag and facts below.`;
      this.renderGeographyGlobeTrail();
    }
    this.geographySelectedCountryId = country.id;
    this.renderGeographyCountrySelection(country);
    return true;
  },

  speakGeographyCountry() {
    const country = geographyCountryById(this.geographySelectedCountryId);
    if (!country) throw new Error('No geography country is selected');
    const status = document.getElementById('geography-speech-status');
    return window.EducationalFeedback.speak(
      `${country.name}. The capital city is ${country.capital}. ${(country.selectedFact || country.fact).text || country.fact}`,
      status
    );
  }
});

function chooseGeographyCountryFact(country) {
  const facts = Array.isArray(country.facts) && country.facts.length
    ? country.facts
    : [{ text: country.fact, source: country.factSource, sourceUrl: country.factSourceUrl }];
  const previous = country.selectedFact;
  const alternatives = facts.filter(fact => fact.text !== previous?.text);
  const pool = alternatives.length ? alternatives : facts;
  return pool[Math.floor(Math.random() * pool.length)];
}

window.GeographyWorld = Object.freeze({
  continents: GEOGRAPHY_CONTINENTS,
  countries: GEOGRAPHY_COUNTRIES,
  countryById: geographyCountryById,
  chooseCountryFact: chooseGeographyCountryFact,
  flagCodeForCountry: geographyFlagCode,
  flagImagePathForCountry: geographyFlagImagePath,
  countryPath: geographyCountryPath,
  isValidCountryData: isValidGeographyCountryData,
  isValidWorldContext: isValidGeographyWorldContext,
  worldContextCountries: GEOGRAPHY_WORLD_CONTEXT_COUNTRIES,
  worldBounds: GEOGRAPHY_MAP_WORLD_BOUNDS,
  worldViewBox: GEOGRAPHY_MAP_WORLD_VIEW_BOX
});
