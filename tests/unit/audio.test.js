const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

test('sound effects preference follows the active profile instead of local storage', () => {
  const context = createBrowserContext();
  const profile = { soundEnabled: true };
  const updates = [];
  context.ProfileManager = {
    getActiveProfile: () => profile,
    updateProfile: updated => {
      updates.push(updated);
      Object.assign(profile, updated);
      return Promise.resolve(true);
    }
  };
  loadBrowserScripts(context, 'public/js/shared/audio.js');

  assert.equal(context.soundFX.isMuted(), false);
  assert.equal(context.soundFX.toggleMute(), true);
  assert.equal(profile.soundEnabled, false);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].soundEnabled, false);
  assert.equal(context.localStorage.getItem('math_masters_muted'), null);
  context.soundFX.setMuted(false);
  assert.equal(context.soundFX.isMuted(), false);
});
