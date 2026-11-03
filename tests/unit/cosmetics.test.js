const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

async function loadProfileManager() {
  const requests = [];
  const context = createBrowserContext({
    fetch: async url => {
      requests.push(String(url));
      return { ok: false, status: 401, json: async () => ({ error: 'Not signed in' }) };
    }
  });
  loadBrowserScripts(
    context,
    'public/js/mathmasters/curriculum.js',
    'public/js/shared/accounts.js',
    'public/js/shared/achievement-badges.js',
    'public/js/shared/cosmetic-shop.js'
  );
  await context.ProfileManager.initialize();
  return { context, profileManager: context.ProfileManager, requests };
}

test('cosmetic catalog validates unique IDs, prices, eligibility, and visual previews', async () => {
  const { context } = await loadProfileManager();
  const cosmetics = context.CosmeticShop;

  assert.equal(cosmetics.validateCatalog(cosmetics.catalog), true);
  assert.equal(new Set(cosmetics.catalog.map(item => item.id)).size, cosmetics.catalog.length);
  assert.ok(cosmetics.catalog.every(item => item.price > 0 && item.eligibility && item.previewIcon && item.frameClass));
  assert.throws(() => cosmetics.validateCatalog([...cosmetics.catalog, { ...cosmetics.catalog[0] }]), /invalid or duplicate/i);
  assert.throws(() => cosmetics.validateCatalog([{ ...cosmetics.catalog[0], price: -1 }]), /invalid or duplicate/i);
});

test('guest purchases and equips stay in memory and repeat purchases cannot charge twice', async () => {
  const { context, profileManager, requests } = await loadProfileManager();
  await profileManager.updateProfile({ ...profileManager.getActiveProfile(), stars: 10 });

  const purchase = await profileManager.purchaseCosmetic('sunrise-frame');
  assert.deepEqual({ ...purchase }, { success: true, reason: null });
  assert.equal(profileManager.getActiveProfile().stars, 5);
  assert.deepEqual(Array.from(profileManager.getActiveProfile().ownedCosmetics), ['sunrise-frame']);

  const retry = await profileManager.purchaseCosmetic('sunrise-frame');
  assert.deepEqual({ ...retry }, { success: false, reason: 'already-owned' });
  assert.equal(profileManager.getActiveProfile().stars, 5);
  assert.deepEqual({ ...(await profileManager.equipCosmetic('sunrise-frame')) }, { success: true, reason: null });
  assert.equal(profileManager.getActiveProfile().equippedCosmetic, 'sunrise-frame');
  assert.deepEqual({ ...(await profileManager.equipCosmetic(null)) }, { success: true, reason: null });
  assert.equal(profileManager.getActiveProfile().equippedCosmetic, null);
  assert.deepEqual({ ...(await profileManager.purchaseCosmetic('galaxy-frame')) }, {
    success: false,
    reason: 'insufficient-stars'
  });
  assert.deepEqual({ ...(await profileManager.purchaseCosmetic('unknown-frame')) }, {
    success: false,
    reason: 'unavailable'
  });

  assert.deepEqual(requests, ['/api/auth/session']);
  assert.equal(context.localStorage.getItem('raven_llama_profiles_cache_v5'), null);
});

test('profile normalization drops unknown cosmetics and refuses to equip unowned items', async () => {
  const { profileManager } = await loadProfileManager();
  const profile = profileManager.normalizeProfile({
    ownedCosmetics: ['sunrise-frame', 'unknown-frame'],
    equippedCosmetic: 'galaxy-frame'
  }, null);

  assert.deepEqual(Array.from(profile.ownedCosmetics), ['sunrise-frame']);
  assert.equal(profile.equippedCosmetic, null);
});
