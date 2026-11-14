const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createGeographyContext() {
  const context = createBrowserContext();
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App {};');
  loadBrowserScripts(
    context,
    'public/js/geography/world-map-context.js',
    'public/js/geography/country-data.js',
    'public/js/geography/country-facts-data.js',
    'public/js/geography/world-map.js'
  );
  return context;
}

test('geography dataset has sourced, selectable countries across inhabited continents', () => {
  const context = createGeographyContext();
  const continents = Array.from(context.GeographyWorld.continents);
  const countries = Array.from(context.GeographyWorld.countries);

  assert.equal(context.GeographyWorld.isValidCountryData(context.GEOGRAPHY_COUNTRY_DATA), true);
  assert.ok(countries.length >= 160);
  for (const id of [
    'bahamas', 'bolivia', 'central-african-republic', 'colombia', 'costa-rica',
    'cuba', 'cyprus', 'djibouti', 'dominican-republic', 'el-salvador',
    'equatorial-guinea', 'eritrea', 'eswatini', 'guatemala', 'guyana', 'indonesia',
    'israel', 'lebanon', 'lesotho', 'libya', 'montenegro', 'north-macedonia',
    'niger', 'oman', 'panama', 'paraguay', 'portugal', 'russia', 'serbia',
    'sierra-leone', 'slovakia', 'slovenia', 'somalia', 'south-africa', 'south-sudan',
    'spain', 'sri-lanka', 'sudan', 'suriname', 'switzerland', 'tanzania', 'timor-leste',
    'togo', 'trinidad-and-tobago', 'tunisia', 'turkey', 'uganda', 'ukraine',
    'united-kingdom', 'uruguay', 'vanuatu', 'venezuela', 'yemen', 'zimbabwe'
  ]) {
    assert.ok(context.GeographyWorld.countryById(id), `Expected quiz coverage for ${id}`);
  }
  assert.deepEqual(
    [...new Set(countries.map(country => country.continent))].sort(),
    [...continents].sort()
  );
  assert.ok(countries.every(country =>
    country.name && country.flag && country.capital && country.fact &&
    country.factSource && country.factSourceUrl.startsWith('https://') &&
    Array.from(country.flag).length === 2 &&
    country.mapPaths.length > 0
  ));
  assert.ok(countries.every(country => Array.isArray(country.facts) && country.facts.length >= 5));
  assert.ok(context.GeographyWorld.countryById('brazil').capital.includes(String.fromCharCode(237)));
});

test('country fact selection changes on repeat visits and keeps each fact source', () => {
  const context = createGeographyContext();
  const canada = context.GeographyWorld.countryById('canada');
  const first = context.GeographyWorld.chooseCountryFact(canada);
  canada.selectedFact = first;
  const second = context.GeographyWorld.chooseCountryFact(canada);

  assert.notEqual(second.text, first.text);
  assert.ok(second.source && second.sourceUrl.startsWith('https://'));
});

test('every geography flag resolves to a self-hosted SVG asset', () => {
  const context = createGeographyContext();
  for (const country of context.GeographyWorld.countries) {
    const code = context.GeographyWorld.flagCodeForCountry(country);
    assert.match(code, /^[A-Z]{2}$/);
    assert.equal(context.GeographyWorld.flagImagePathForCountry(country), `/images/flags/${code.toLowerCase()}.svg`);
    const filePath = path.resolve(__dirname, '../../public', 'images', 'flags', `${code.toLowerCase()}.svg`);
    assert.equal(fs.existsSync(filePath), true, `Missing SVG flag for ${country.name} (${code})`);
    assert.match(fs.readFileSync(filePath, 'utf8'), /<svg\b/);
  }
});

test('geography country identifiers and map geometry remain unique and valid', () => {
  const context = createGeographyContext();
  const countries = Array.from(context.GeographyWorld.countries);
  const ids = countries.map(country => country.id);

  assert.equal(new Set(ids).size, ids.length);
  for (const country of countries) {
    assert.equal(context.GeographyWorld.countryById(country.id).name, country.name);
    assert.ok(context.GeographyWorld.countryPath(country).startsWith('M'));
    assert.ok(country.mapPaths.every(path => /^M[-\d.\sLZ]+$/i.test(path)));
    assert.ok(country.mapPoint.every(Number.isFinite));
  }
  assert.equal(context.GeographyWorld.countryById('not-a-country'), null);
});

test('world map context connects continents and includes Pacific island groups', () => {
  const context = createGeographyContext();
  const countries = Array.from(context.GeographyWorld.worldContextCountries);
  const names = new Set(countries.map(country => country.name));

  assert.ok(countries.length >= 170);
  for (const name of [
    'Brazil',
    'Canada',
    'Russia',
    'South Africa',
    'Indonesia',
    'Philippines',
    'Papua New Guinea',
    'Solomon Islands',
    'Fiji',
    'New Zealand'
  ]) {
    assert.ok(names.has(name), `Expected a world map outline for ${name}`);
  }
  assert.equal(context.GeographyWorld.worldViewBox, '-8 -4 376 188');
  assert.ok(countries.every(country => /^M[-\d.\sMLZ]+$/i.test(country.path)));
});

test('geography data validation rejects duplicate identifiers and incomplete records', () => {
  const context = createGeographyContext();
  const validData = context.eval('window.GEOGRAPHY_COUNTRY_DATA');
  const firstCountry = validData.countries[0];

  assert.equal(context.GeographyWorld.isValidCountryData({
    ...validData,
    countries: [firstCountry, firstCountry]
  }), false);
  assert.equal(context.GeographyWorld.isValidCountryData({
    ...validData,
    countries: [{ ...firstCountry, factSourceUrl: 'http://example.test' }]
  }), false);
  assert.equal(context.GeographyWorld.isValidCountryData({
    ...validData,
    countries: [{ ...firstCountry, flag: 'CA' }]
  }), false);
  assert.equal(context.GeographyWorld.isValidCountryData({
    ...validData,
    countries: [{ ...firstCountry, mapPaths: ['<script>'] }]
  }), false);
  assert.equal(context.GeographyWorld.isValidWorldContext({
    ...context.GEOGRAPHY_WORLD_MAP_CONTEXT,
    countries: [{ name: 'Only one country', path: 'M0 0Z' }]
  }), false);
});
