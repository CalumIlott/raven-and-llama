const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createSolarSystemContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {}, querySelectorAll: () => [] };
  context.document = { getElementById: id => id === 'app-main' ? context.main : null };
  context.profile = { stars: 0 };
  context.activityScores = [];
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.ProfileManager = {
    getActiveProfile: () => context.profile,
    updateProfile: profile => { context.profile = profile; },
    recordActivityScore: (...score) => { context.activityScores.push(score); }
  };
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} navigateToPath(path) { this.path = path; } }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/science/solar-system.js');
  return context;
}

test('solar system planets and activity use a stable science skill mapping', () => {
  const context = createSolarSystemContext();

  assert.deepEqual(
    Array.from(context.eval('SOLAR_SYSTEM_PLANETS'), planet => planet.name),
    ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
  );
  assert.equal(context.eval('SOLAR_SYSTEM_SKILL_ID'), 'science_solar_system_order');
  assert.ok(Array.from(context.eval('SOLAR_SYSTEM_PLANETS')).every(planet => planet.fact));
});

test('placing a planet moves it and cannot create duplicates', () => {
  const context = createSolarSystemContext();
  const empty = Array(8).fill(null);
  const firstPlacement = context.placePlanetInSolarSystem(empty, 'mercury', 0);
  const movedPlacement = context.placePlanetInSolarSystem(firstPlacement, 'mercury', 2);

  assert.deepEqual(Array.from(firstPlacement), ['mercury', null, null, null, null, null, null, null]);
  assert.deepEqual(Array.from(movedPlacement), [null, null, 'mercury', null, null, null, null, null]);
  assert.deepEqual(empty, Array(8).fill(null));
  assert.equal(context.placePlanetInSolarSystem(movedPlacement, 'pluto', 0), null);
});

test('incomplete and duplicate placements cannot be submitted as complete', () => {
  const context = createSolarSystemContext();

  assert.equal(context.isCompleteSolarSystemPlacement([null, ...Array(7).fill(null)]), false);
  assert.equal(context.isCompleteSolarSystemPlacement([
    'mercury', 'mercury', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
  ]), false);
  assert.equal(context.isCompleteSolarSystemPlacement([
    'venus', 'mercury', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
  ]), true);
});

test('incorrect orders identify misplaced planets and can be corrected before completion', () => {
  const context = createSolarSystemContext();
  const app = context.app;

  app.startSolarSystemActivity();
  assert.equal(app.solarSystemActivityEngine.definition.id, 'science-solar-system-order');
  assert.equal(app.solarSystemActivityEngine.definition.skillId, 'science_solar_system_order');
  assert.equal(app.submitSolarSystemAnswer(), false);
  assert.equal(app.solarSystemActivityEngine.status, 'active');

  for (const [index, planetId] of [
    'venus', 'mercury', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
  ].entries()) {
    app.selectSolarSystemPlanet(planetId);
    app.placeSelectedSolarSystemPlanet(index);
  }
  assert.equal(app.submitSolarSystemAnswer(), false);
  assert.deepEqual(
    Array.from(app.solarSystemGame.mismatches, mismatch => [mismatch.orbit, mismatch.current, mismatch.expected]),
    [[1, 'Venus', 'Mercury'], [2, 'Mercury', 'Venus']]
  );
  assert.match(context.main.innerHTML, /Venus is here; Mercury belongs here/);

  app.selectSolarSystemPlanet('mercury');
  app.placeSelectedSolarSystemPlanet(0);
  app.selectSolarSystemPlanet('venus');
  app.placeSelectedSolarSystemPlanet(1);
  assert.equal(app.submitSolarSystemAnswer(), true);
  assert.equal(app.solarSystemActivityEngine.status, 'complete');
  assert.equal(app.solarSystemActivityEngine.score, 8);
  assert.equal(context.profile.stars, 8);
  assert.equal(context.activityScores.length, 1);
  assert.equal(context.activityScores[0][1], 8);
  assert.equal(context.activityScores[0][2], 8);
  assert.equal(app.submitSolarSystemAnswer(), false);
  assert.equal(context.profile.stars, 8);
});

test('selecting a planet exposes its fact in the accessible fact card', () => {
  const context = createSolarSystemContext();
  const app = context.app;

  app.startSolarSystemActivity();
  app.selectSolarSystemPlanet('earth');
  assert.match(context.main.innerHTML, /id="solar-system-fact" role="status" aria-live="polite"/);
  assert.match(context.main.innerHTML, /Earth is the third planet from the Sun and the only planet known to have life/);
});
