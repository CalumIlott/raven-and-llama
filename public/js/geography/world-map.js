const GEOGRAPHY_CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America'
];
const GEOGRAPHY_MAP_ZOOM_LEVELS = [1, 1.5, 2, 3];

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

if (!isValidGeographyCountryData(window.GEOGRAPHY_COUNTRY_DATA)) {
  throw new TypeError('Geography country data is missing or invalid.');
}

const GEOGRAPHY_COUNTRIES = window.GEOGRAPHY_COUNTRY_DATA.countries;

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

function renderGeographyCountryDetails(country) {
  return `
    <article class="geography-country-details" aria-labelledby="geography-country-name">
      <div class="geography-country-details__heading">
        <span class="geography-country-details__flag" aria-hidden="true">${escapeGeographyHtml(country.flag)}</span>
        <div>
          <p class="geography-country-details__continent">${escapeGeographyHtml(country.continent)}</p>
          <h2 id="geography-country-name">${escapeGeographyHtml(country.name)}</h2>
        </div>
      </div>
      <p class="geography-country-details__capital"><strong>Capital:</strong> ${escapeGeographyHtml(country.capital)}</p>
      <p class="geography-country-details__fact">${escapeGeographyHtml(country.fact)}</p>
      <p class="geography-country-details__source">
        Source: <a href="${escapeGeographyHtml(country.factSourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeGeographyHtml(country.factSource)}</a>
      </p>
      <button type="button" data-action="geography-country-speak" class="geography-speak-button">
        Listen to ${escapeGeographyHtml(country.name)} facts
      </button>
      <p id="geography-speech-status" class="geography-speech-status" role="status" aria-live="polite"></p>
    </article>
  `;
}

Object.assign(App.prototype, {
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
              <svg id="geography-world-map" class="geography-map" viewBox="0 0 360 180" role="group" aria-label="Interactive world map. Select a highlighted country to see its capital and facts.">
                <rect class="geography-map__ocean" x="0" y="0" width="360" height="180" rx="5"></rect>
                <g class="geography-map__countries">
                  ${GEOGRAPHY_COUNTRIES.map(country => `
                    <g class="geography-map__region" data-action="geography-country-select" data-country-id="${country.id}" role="button" tabindex="0" aria-label="${escapeGeographyHtml(country.name)}, ${escapeGeographyHtml(country.continent)}. Select to view capital and facts." aria-pressed="${country.id === selectedCountry.id}">
                      <title>${escapeGeographyHtml(country.name)}</title>
                      ${country.mapPaths.map(path => `<path d="${path}"></path>`).join('')}
                      <circle class="geography-map__marker" cx="${country.mapPoint[0]}" cy="${country.mapPoint[1]}" r="1.7"></circle>
                    </g>
                  `).join('')}
                </g>
              </svg>
              <figcaption class="geography-map-caption">The country outlines are simplified for learning and are not to scale.</figcaption>
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
                            <span class="geography-country-option__flag" aria-hidden="true">${escapeGeographyHtml(country.flag)}</span>
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
      const target = event.target.closest?.('.geography-map__region');
      if (!target || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      this.selectGeographyCountry(target.dataset.countryId);
    };
    this.renderGeographyCountrySelection(selectedCountry);
  },

  renderGeographyCountrySelection(country) {
    const details = document.getElementById('geography-country-details');
    if (!details) throw new Error('Geography country details panel was not rendered');
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
      map.setAttribute('viewBox', '0 0 360 180');
    } else {
      const region = map.querySelector(`[data-country-id="${country.id}"]`);
      if (!region) throw new Error(`Geography country map was not rendered: ${country.id}`);
      const bounds = region.getBBox();
      const width = 360 / zoom;
      const height = 180 / zoom;
      const left = bounds.x + bounds.width / 2 - width / 2;
      const top = bounds.y + bounds.height / 2 - height / 2;
      map.setAttribute('viewBox', [left, top, width, height]
        .map(value => Number(value.toFixed(2)))
        .join(' '));
    }

    const status = document.getElementById('geography-map-zoom-status');
    if (status) status.textContent = zoom === 1 ? 'World view' : `${zoom}× · ${country.name}`;
    const zoomOut = document.querySelector('[data-action="geography-map-zoom"][data-delta="-1"]');
    const zoomIn = document.querySelector('[data-action="geography-map-zoom"][data-delta="1"]');
    if (zoomOut) zoomOut.disabled = zoomIndex === 0;
    if (zoomIn) zoomIn.disabled = zoomIndex === GEOGRAPHY_MAP_ZOOM_LEVELS.length - 1;
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

  selectGeographyCountry(countryId) {
    const country = geographyCountryById(countryId);
    if (!country) throw new RangeError(`Unknown geography country: ${countryId}`);
    this.geographySelectedCountryId = country.id;
    this.renderGeographyCountrySelection(country);
    return true;
  },

  speakGeographyCountry() {
    const country = geographyCountryById(this.geographySelectedCountryId);
    if (!country) throw new Error('No geography country is selected');
    const status = document.getElementById('geography-speech-status');
    return window.EducationalFeedback.speak(
      `${country.name}. The capital city is ${country.capital}. ${country.fact}`,
      status
    );
  }
});

window.GeographyWorld = Object.freeze({
  continents: GEOGRAPHY_CONTINENTS,
  countries: GEOGRAPHY_COUNTRIES,
  countryById: geographyCountryById,
  countryPath: geographyCountryPath,
  isValidCountryData: isValidGeographyCountryData
});
