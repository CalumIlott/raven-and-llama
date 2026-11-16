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


test('particle layouts distinguish ice, liquid and vapour, including mixed phases', () => {
  const context = createBrowserContext();
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App {}; window.app = new App();');
  loadBrowserScripts(context, 'public/js/science/thermal-chamber.js');
  const model = (phase, index) => context.eval(`getThermalParticle('${phase}', ${index})`);
  for (let index = 0; index < 16; index++) {
    for (const phase of ['solid', 'liquid', 'gas', 'melting', 'boiling']) {
      const particle = model(phase, index);
      assert.ok(particle.x > 0 && particle.x < 100 && particle.y > 0 && particle.y < 100);
    }
    assert.equal(model('melting', index).phase, index < 8 ? 'solid' : 'liquid');
    assert.equal(model('boiling', index).phase, index < 8 ? 'liquid' : 'gas');
    assert.notDeepEqual([model('solid', index).x, model('solid', index).y],
      [model('gas', index).x, model('gas', index).y]);
  }
});
