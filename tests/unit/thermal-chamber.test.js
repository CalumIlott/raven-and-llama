const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

test('thermal chamber classifies water states at the modeled phase changes', () => {
  const context = createBrowserContext();
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App {}; window.app = new App();');
  loadBrowserScripts(context, 'public/js/science/thermal-chamber.js');
  const { getState } = context.ThermalChamber;

  assert.equal(getState(-100).phase, 'solid');
  assert.equal(getState(-1).phase, 'solid');
  assert.equal(getState(0).phase, 'melting');
  assert.equal(getState(1).phase, 'liquid');
  assert.equal(getState(99).phase, 'liquid');
  assert.equal(getState(100).phase, 'boiling');
  assert.equal(getState(101).phase, 'gas');
  assert.equal(getState(200).phase, 'gas');
  assert.equal(getState(-101), null);
  assert.equal(getState(201), null);
  assert.equal(getState(Number.NaN), null);
  assert.equal(context.ThermalChamber.minTemperatureC, -100);
  assert.equal(context.ThermalChamber.maxTemperatureC, 200);
});
