const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadTimeTelling() {
  const context = createBrowserContext({ App: class App {} });
  loadBrowserScripts(context, 'public/js/mathmasters/telling-time.js');
  return context;
}

test('time activities generate distinct digital choices at the selected difficulty', () => {
  const { TIME_ACTIVITY_MODES, TimeTelling } = loadTimeTelling();

  assert.equal(TIME_ACTIVITY_MODES.length, 4);
  assert.equal(new Set(Array.from(TIME_ACTIVITY_MODES, mode => mode.id)).size, 4);

  for (const mode of TIME_ACTIVITY_MODES) {
    const question = TimeTelling.generateQuestion(mode.id);
    const [, minute] = question.answer.split(':').map(Number);

    assert.ok(mode.minutes.includes(minute));
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.answer));
    assert.equal(question.display, mode.display);
  }
});

test('analogue clock renderer labels the time and displays all twelve hour numbers', () => {
  const { TimeTelling } = loadTimeTelling();
  const svg = TimeTelling.formatClockSvg('3:45');

  assert.match(svg, /aria-label="Analogue clock showing 3:45"/);
  for (let hour = 1; hour <= 12; hour++) {
    assert.match(svg, new RegExp(`>${hour}<`));
  }
  assert.match(svg, /rotate\(112\.5 100 100\)/);
  assert.match(svg, /rotate\(270 100 100\)/);
});
