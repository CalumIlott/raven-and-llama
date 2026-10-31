const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

test('curriculum belt levels and skill identifiers are consistent', () => {
  const context = loadBrowserScripts(createBrowserContext(), 'js/mathmasters/curriculum.js');
  const belts = context.BELTS_DATA;

  assert.equal(belts.length, 7);
  assert.deepEqual(Array.from(belts, belt => belt.level), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(new Set(Array.from(belts, belt => belt.id)).size, belts.length);

  const skillIds = belts.flatMap(belt => {
    assert.ok(belt.skills.length > 0, `${belt.id} must define at least one skill`);
    assert.ok(belt.arcadeGame?.id, `${belt.id} must define an arcade game`);
    for (const skill of belt.skills) {
      assert.ok(skill.name);
      assert.ok(Number.isFinite(skill.timeLimitSeconds) && skill.timeLimitSeconds > 0);
    }
    return belt.skills.map(skill => skill.id);
  });

  assert.equal(new Set(skillIds).size, skillIds.length);
});