const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

test('Globe Trotter cases point to selectable countries and provide progressive clues', () => {
  const context = createBrowserContext();
  loadBrowserScripts(
    context,
    'public/js/geography/world-map-context.js',
    'public/js/geography/country-data.js',
    'public/js/geography/globe-trotter.js'
  );
  const cases = Array.from(context.GeographyGlobeTrail.cases);
  const countryIds = new Set(context.GEOGRAPHY_COUNTRY_DATA.countries.map(country => country.id));

  assert.ok(cases.length >= 5);
  assert.equal(new Set(cases.map(item => item.id)).size, cases.length);
  for (const trailCase of cases) {
    assert.ok(countryIds.has(trailCase.answerCountryId), `Missing answer country: ${trailCase.answerCountryId}`);
    assert.equal(trailCase.clues.length, 3);
    assert.ok(trailCase.clues.every(clue => typeof clue === 'string' && clue.length >= 20));
  }
});

test('Globe Trotter case choice avoids repeating the last mystery and validates guesses', () => {
  const context = createBrowserContext();
  loadBrowserScripts(context, 'public/js/geography/globe-trotter.js');
  const cases = Array.from(context.GeographyGlobeTrail.cases);
  const previous = cases[0];
  const next = context.GeographyGlobeTrail.chooseCase(() => 0, previous.id);

  assert.notEqual(next.id, previous.id);
  assert.equal(context.GeographyGlobeTrail.isCorrectAnswer(next, next.answerCountryId), true);
  assert.equal(context.GeographyGlobeTrail.isCorrectAnswer(next, previous.answerCountryId),
    next.answerCountryId === previous.answerCountryId);
  assert.equal(context.GeographyGlobeTrail.isCorrectAnswer(null, next.answerCountryId), false);
});
