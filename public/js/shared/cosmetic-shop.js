(function () {
  const catalog = Object.freeze([
    {
      id: 'sunrise-frame',
      name: 'Sunrise Frame',
      description: 'A warm orange glow around your profile avatar.',
      price: 5,
      eligibility: 'Available to every learner.',
      previewIcon: '🌅',
      frameClass: 'ring-2 ring-orange-400 ring-offset-2 ring-offset-zinc-900',
      available: true
    },
    {
      id: 'ocean-frame',
      name: 'Ocean Frame',
      description: 'A cool blue frame for your profile avatar.',
      price: 10,
      eligibility: 'Available to every learner.',
      previewIcon: '🌊',
      frameClass: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-zinc-900',
      available: true
    },
    {
      id: 'galaxy-frame',
      name: 'Galaxy Frame',
      description: 'A bright violet frame for your profile avatar.',
      price: 15,
      eligibility: 'Available to every learner.',
      previewIcon: '🌌',
      frameClass: 'ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-zinc-900',
      available: true
    }
  ].map(item => Object.freeze(item)));

  function validateCatalog(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new TypeError('Cosmetic catalog must be a non-empty array.');
    }
    const ids = new Set();
    for (const item of items) {
      if (!item || typeof item !== 'object' ||
        typeof item.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(item.id) ||
        ids.has(item.id) ||
        typeof item.name !== 'string' || item.name.trim().length === 0 ||
        typeof item.description !== 'string' || item.description.trim().length === 0 ||
        !Number.isSafeInteger(item.price) || item.price < 1 ||
        typeof item.eligibility !== 'string' || item.eligibility.trim().length === 0 ||
        typeof item.previewIcon !== 'string' || item.previewIcon.trim().length === 0 ||
        typeof item.frameClass !== 'string' || item.frameClass.trim().length === 0 ||
        typeof item.available !== 'boolean') {
        throw new TypeError('Cosmetic catalog contains an invalid or duplicate item.');
      }
      ids.add(item.id);
    }
    return true;
  }

  function get(id) {
    return catalog.find(item => item.id === id) || null;
  }

  function normalizeOwned(value) {
    return Array.isArray(value)
      ? [...new Set(value.filter(id => typeof id === 'string' && get(id)?.available))]
      : [];
  }

  validateCatalog(catalog);
  window.CosmeticShop = Object.freeze({ catalog, validateCatalog, get, normalizeOwned });
})();
