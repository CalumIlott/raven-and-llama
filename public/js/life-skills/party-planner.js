const PARTY_PLANNER_ACTIVITY_ID = 'life-skills-plan-party';
const PARTY_PLANNER_SKILL_ID = 'life_skills_budgeting';
const PARTY_PLANNER_BUDGET_CENTS = 10000;
const PARTY_PLANNER_ITEMS = [
  { id: 'party-room', name: 'Party room', category: 'Venue', description: 'A room where everyone can meet.', priceCents: 2000, maxQuantity: 1 },
  { id: 'campsite-pitch', name: 'Campsite pitch', category: 'Venue', description: 'A safe place to set up camp.', priceCents: 1500, maxQuantity: 1 },
  { id: 'school-hall', name: 'School hall', category: 'Venue', description: 'A covered space for a school event.', priceCents: 1800, maxQuantity: 1 },
  { id: 'picnic-shelter', name: 'Picnic shelter', category: 'Venue', description: 'A sheltered spot with tables.', priceCents: 1000, maxQuantity: 1 },
  { id: 'snacks', name: 'Snacks', category: 'Food & Drink', description: 'Food to share with your guests.', priceCents: 800, maxQuantity: 4 },
  { id: 'pizza', name: 'Pizzas', category: 'Food & Drink', description: 'Slices to share during the event.', priceCents: 1000, maxQuantity: 5 },
  { id: 'juice', name: 'Juice cartons', category: 'Food & Drink', description: 'A drink for the group.', priceCents: 300, maxQuantity: 10 },
  { id: 'sandwiches', name: 'Sandwiches', category: 'Food & Drink', description: 'A filling lunch for hungry guests.', priceCents: 900, maxQuantity: 5 },
  { id: 'fruit-platter', name: 'Fruit platter', category: 'Food & Drink', description: 'Fresh fruit to share.', priceCents: 600, maxQuantity: 3 },
  { id: 'popcorn', name: 'Popcorn', category: 'Food & Drink', description: 'A movie-time snack.', priceCents: 400, maxQuantity: 6 },
  { id: 'party-game', name: 'Party game', category: 'Entertainment', description: 'A group game everyone can join.', priceCents: 800, maxQuantity: 1 },
  { id: 'movie-rental', name: 'Movie rental', category: 'Entertainment', description: 'A film for movie night.', priceCents: 500, maxQuantity: 1 },
  { id: 'science-demo-kit', name: 'Science demo kit', category: 'Entertainment', description: 'Materials for a safe science demonstration.', priceCents: 1200, maxQuantity: 1 },
  { id: 'art-activity', name: 'Art activity', category: 'Entertainment', description: 'Supplies for a make-and-take activity.', priceCents: 700, maxQuantity: 1 },
  { id: 'projector-hire', name: 'Projector hire', category: 'Entertainment', description: 'A screen and projector for the film.', priceCents: 1000, maxQuantity: 1 },
  { id: 'tent-hire', name: 'Tent hire', category: 'Gear', description: 'A tent to shelter the campers.', priceCents: 1500, maxQuantity: 2 },
  { id: 'sleeping-bags', name: 'Sleeping bags', category: 'Gear', description: 'Warm sleeping bags for the group.', priceCents: 700, maxQuantity: 5 },
  { id: 'torches', name: 'Torches', category: 'Gear', description: 'Light for finding your way after dark.', priceCents: 300, maxQuantity: 6 },
  { id: 'first-aid-kit', name: 'First-aid kit', category: 'Gear', description: 'Basic supplies for small scrapes.', priceCents: 800, maxQuantity: 1 },
  { id: 'folding-chairs', name: 'Folding chairs', category: 'Gear', description: 'Extra seats for the event.', priceCents: 200, maxQuantity: 12 },
  { id: 'birthday-decorations', name: 'Birthday decorations', category: 'Decorations', description: 'Banners and decorations for a birthday.', priceCents: 800, maxQuantity: 3 },
  { id: 'invitations', name: 'Invitations', category: 'Decorations', description: 'Invite friends to the event.', priceCents: 100, maxQuantity: 8 },
  { id: 'science-posters', name: 'Science posters', category: 'Decorations', description: 'Signs to label fair displays.', priceCents: 300, maxQuantity: 5 },
  { id: 'table-covers', name: 'Table covers', category: 'Decorations', description: 'Keep tables tidy during the event.', priceCents: 300, maxQuantity: 4 }
];
const PARTY_PLANNER_CATEGORIES = ['Venue', 'Food & Drink', 'Entertainment', 'Gear', 'Decorations'];
const PARTY_PLANNER_SCENARIOS = [
  {
    id: 'birthday-party',
    name: 'Birthday Party',
    budgetCents: 10000,
    description: 'Plan a birthday celebration with a place to meet, something to eat, and an activity.',
    featuredItemId: 'birthday-decorations',
    requiredCategories: ['Venue', 'Food & Drink', 'Entertainment']
  },
  {
    id: 'camping-trip',
    name: 'Camping Trip',
    budgetCents: 15000,
    description: 'Plan an overnight camping trip with shelter, food, and useful gear.',
    featuredItemId: 'tent-hire',
    requiredCategories: ['Venue', 'Food & Drink', 'Gear']
  },
  {
    id: 'school-science-fair',
    name: 'School Science Fair',
    budgetCents: 7500,
    description: 'Plan a school science fair with a space to meet, something to show, and supplies.',
    featuredItemId: 'science-demo-kit',
    requiredCategories: ['Venue', 'Entertainment', 'Decorations']
  },
  {
    id: 'pizza-movie-night',
    name: 'Pizza Movie Night',
    budgetCents: 5000,
    description: 'Plan a cosy movie night with a place to watch, a film, and snacks.',
    featuredItemId: 'pizza',
    requiredCategories: ['Venue', 'Food & Drink', 'Entertainment']
  }
];

function shufflePartyPlannerItems(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('Party planner random values must be between 0 and 1.');
    }
    const swapIndex = Math.floor(value * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createPartyPlannerRound(random = Math.random) {
  if (typeof random !== 'function') throw new TypeError('Party planner random source must be a function.');
  const scenarioValue = random();
  if (!Number.isFinite(scenarioValue) || scenarioValue < 0 || scenarioValue >= 1) {
    throw new RangeError('Party planner random values must be between 0 and 1.');
  }
  const scenario = PARTY_PLANNER_SCENARIOS[Math.floor(scenarioValue * PARTY_PLANNER_SCENARIOS.length)];
  const requiredCountValue = random();
  if (!Number.isFinite(requiredCountValue) || requiredCountValue < 0 || requiredCountValue >= 1) {
    throw new RangeError('Party planner random values must be between 0 and 1.');
  }
  const requiredCategoryCount = 2 + Math.floor(requiredCountValue * 2);
  const requiredCategories = new Set(
    shufflePartyPlannerItems(scenario.requiredCategories, random).slice(0, requiredCategoryCount)
  );
  const items = PARTY_PLANNER_CATEGORIES.flatMap(category => {
    const categoryItems = PARTY_PLANNER_ITEMS.filter(item => item.category === category);
    const featuredItem = categoryItems.find(item => item.id === scenario.featuredItemId);
    const options = featuredItem
      ? [featuredItem, ...shufflePartyPlannerItems(
        categoryItems.filter(item => item.id !== featuredItem.id),
        random
      ).slice(0, 1)]
      : shufflePartyPlannerItems(categoryItems, random).slice(0, 2);
    return options.map((item, index) => ({
      ...item,
      requiredQuantity: index === 0 && requiredCategories.has(category) ? 1 : 0
    }));
  });
  return { scenario, items };
}

function validatePartyPlannerItems(items = PARTY_PLANNER_ITEMS) {
  if (!Array.isArray(items) || items.length === 0) return false;
  const ids = new Set();
  return items.every(item => {
    if (!item || typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) ||
      ids.has(item.id) ||
      typeof item.name !== 'string' || !item.name.trim() ||
      !PARTY_PLANNER_CATEGORIES.includes(item.category) ||
      typeof item.description !== 'string' || !item.description.trim() ||
      !Number.isSafeInteger(item.priceCents) || item.priceCents <= 0 ||
      !Number.isSafeInteger(item.maxQuantity) || item.maxQuantity < 0 ||
      !Number.isSafeInteger(item.requiredQuantity ?? 0) ||
      (item.requiredQuantity ?? 0) < 0 || (item.requiredQuantity ?? 0) > item.maxQuantity) return false;
    ids.add(item.id);
    return true;
  });
}

function createPartyPlannerQuantities(items = PARTY_PLANNER_ITEMS) {
  if (!validatePartyPlannerItems(items)) throw new TypeError('Invalid Plan a Party item data.');
  return Object.fromEntries(items.map(item => [item.id, 0]));
}

function changePartyPlannerQuantity(quantities, itemId, delta, items = PARTY_PLANNER_ITEMS) {
  if (!validatePartyPlannerItems(items) || !quantities ||
    !Number.isInteger(delta) || Math.abs(delta) !== 1) return null;
  const item = items.find(candidate => candidate.id === itemId);
  if (!item) return null;
  const current = quantities[itemId];
  if (!Number.isSafeInteger(current) || current < 0 || current > item.maxQuantity) return null;
  const next = current + delta;
  if (next < 0 || next > item.maxQuantity) return null;
  return { ...quantities, [itemId]: next };
}

function evaluatePartyPlan(quantities, budgetCents = PARTY_PLANNER_BUDGET_CENTS, items = PARTY_PLANNER_ITEMS) {
  if (!Number.isSafeInteger(budgetCents) || budgetCents < 0) {
    throw new RangeError('Party budget must be a non-negative integer number of cents.');
  }
  if (!validatePartyPlannerItems(items) || !quantities ||
    Object.keys(quantities).length !== items.length ||
    items.some(item => !Object.prototype.hasOwnProperty.call(quantities, item.id) ||
      !Number.isSafeInteger(quantities[item.id]) ||
      quantities[item.id] < 0 ||
      quantities[item.id] > item.maxQuantity)) {
    return {
      valid: false,
      invalidQuantities: true,
      totalCents: null,
      remainingCents: null,
      overBudget: false,
      missingItems: []
    };
  }
  const totalCents = items.reduce((total, item) => total + quantities[item.id] * item.priceCents, 0);
  const missingItems = items.filter(item => quantities[item.id] < item.requiredQuantity);
  const overBudget = totalCents > budgetCents;
  return {
    valid: !overBudget && missingItems.length === 0,
    invalidQuantities: false,
    totalCents,
    remainingCents: budgetCents - totalCents,
    overBudget,
    missingItems: missingItems.map(item => item.id)
  };
}

function createPartyPlannerActivityEngine(budgetCents = PARTY_PLANNER_BUDGET_CENTS) {
  const engine = new ActivityEngine();
  engine.start({
    version: 1,
    kind: 'game',
    id: PARTY_PLANNER_ACTIVITY_ID,
    title: 'Plan a Party',
    subject: 'Life Skills',
    skillId: PARTY_PLANNER_SKILL_ID,
    settings: { trackProgress: true },
    game: {
      adapter: 'life-skills',
      gameId: 'plan-a-party',
      scoreUnit: 'rounds',
      configuration: { budgetCents }
    }
  });
  return engine;
}

Object.assign(App.prototype, {
  startPartyPlanner(random = Math.random) {
    if (!validatePartyPlannerItems()) throw new Error('Invalid Plan a Party item data.');
    const round = createPartyPlannerRound(random);
    this.currentView = 'life-skills-party';
    this.partyPlannerGame = {
      scenario: round.scenario,
      items: round.items,
      quantities: createPartyPlannerQuantities(round.items),
      message: 'Choose the required items, then add optional extras if your budget allows.',
      complete: false
    };
    this.partyPlannerActivityEngine = createPartyPlannerActivityEngine(round.scenario.budgetCents);
    this.navigateToPath('/learning-centre/life-skills/party-planner');
    this.renderPartyPlanner();
  },

  adjustPartyPlannerQuantity(itemId, delta) {
    const game = this.partyPlannerGame;
    if (!game || game.complete || this.partyPlannerActivityEngine?.status !== 'active') return false;
    const quantities = changePartyPlannerQuantity(game.quantities, itemId, delta, game.items);
    if (!quantities) return false;
    game.quantities = quantities;
    game.message = '';
    this.renderPartyPlanner();
    return true;
  },

  submitPartyPlan() {
    const game = this.partyPlannerGame;
    const engine = this.partyPlannerActivityEngine;
    if (!game || game.complete || !engine || engine.status !== 'active') return false;
    const result = evaluatePartyPlan(game.quantities, game.scenario.budgetCents, game.items);
    if (!result.valid) {
      const feedback = [];
      if (result.invalidQuantities) {
        feedback.push('Check the item quantities and use the quantity controls to make a valid plan.');
      } else {
        if (result.missingItems.length) {
          const names = result.missingItems
            .map(id => game.items.find(item => item.id === id).name);
          feedback.push(`Add the required item${names.length === 1 ? '' : 's'}: ${names.join(', ')}.`);
        }
        if (result.overBudget) {
          feedback.push(`Your plan is ${MoneyMasters.formatMoney(result.totalCents - game.scenario.budgetCents)} over budget.`);
        }
        if (!feedback.length) feedback.push('Adjust your plan and try again.');
      }
      game.message = `${feedback.join(' ')} Your budget is ${MoneyMasters.formatMoney(game.scenario.budgetCents)}.`;
      this.renderPartyPlanner();
      return false;
    }

    engine.addScore(1);
    game.complete = engine.complete();
    game.message = 'Your plan includes the required items and stays within the budget.';
    this.renderPartyPlanner();
    return game.complete;
  },

  resetPartyPlan() {
    const game = this.partyPlannerGame;
    if (!game || game.complete || this.partyPlannerActivityEngine?.status !== 'active') return false;
    game.quantities = createPartyPlannerQuantities(game.items);
    game.message = 'Start again by choosing the required items.';
    this.renderPartyPlanner();
    return true;
  },

  renderPartyPlanner() {
    const main = document.getElementById('app-main');
    const game = this.partyPlannerGame;
    if (!main || !game) return;
    main.dataset.page = 'life-skills-party';
    this.updateHeader();
    const result = evaluatePartyPlan(game.quantities, game.scenario.budgetCents, game.items);
    const total = MoneyMasters.formatMoney(result.totalCents);
    const remaining = result.remainingCents >= 0
      ? `${MoneyMasters.formatMoney(result.remainingCents)} remaining`
      : `${MoneyMasters.formatMoney(-result.remainingCents)} over budget`;

    if (game.complete) {
      const chosenItems = game.items
        .filter(item => game.quantities[item.id] > 0)
        .map(item => `<li>${item.name} × ${game.quantities[item.id]}</li>`)
        .join('');
      main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <section class="party-planner-panel party-planner-result">
            <p class="party-planner-kicker">Life Skills · Plan a Party</p>
            <h1>Party planned!</h1>
            <h2>${game.scenario.name}</h2>
            <p>Your plan costs ${total} and stays within the ${MoneyMasters.formatMoney(game.scenario.budgetCents)} budget.</p>
            <ul class="party-planner-result__items">${chosenItems}</ul>
            <div class="party-planner-actions">
              <button type="button" class="party-planner-button" data-action="life-skills-party">Plan another party</button>
              <button type="button" class="party-planner-button party-planner-button--secondary" data-action="learning-centre">Back to Life Skills</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const renderItem = item => {
      const quantity = game.quantities[item.id];
      return `
        <article class="party-planner-item">
          <div class="party-planner-item__copy">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="party-planner-item__price">Each: ${MoneyMasters.formatMoney(item.priceCents)}</p>
            ${item.requiredQuantity
              ? `<p class="party-planner-item__required">Required: choose at least ${item.requiredQuantity}</p>`
              : '<p class="party-planner-item__optional">Optional</p>'}
          </div>
          <div class="party-planner-quantity">
            <button type="button" data-action="party-plan-quantity" data-item-id="${item.id}" data-delta="-1"
              aria-label="Remove one ${item.name}" ${quantity === 0 ? 'disabled' : ''}>−</button>
            <output aria-label="${item.name} quantity">${quantity}</output>
            <button type="button" data-action="party-plan-quantity" data-item-id="${item.id}" data-delta="1"
              aria-label="Add one ${item.name}" ${quantity === item.maxQuantity ? 'disabled' : ''}>+</button>
          </div>
        </article>`;
    };
    const items = PARTY_PLANNER_CATEGORIES.map(category => {
      const categoryItems = game.items.filter(item => item.category === category);
      if (!categoryItems.length) return '';
      return `
        <section class="party-planner-category" aria-labelledby="party-planner-category-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">
          <h2 id="party-planner-category-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">${category}</h2>
          <div class="party-planner-category__items">${categoryItems.map(renderItem).join('')}</div>
        </section>`;
    }).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="party-planner-back" data-action="learning-centre">← Back to Life Skills</button>
        <section class="party-planner-panel">
          <p class="party-planner-kicker">Life Skills · Plan a Party</p>
          <h1>Plan a Party</h1>
          <h2 class="party-planner-scenario">${game.scenario.name}</h2>
          <p class="party-planner-instructions">${game.scenario.description} Required items are marked. Add optional extras if your budget allows.</p>
          <dl class="party-planner-budget" aria-live="polite" aria-atomic="true">
            <div><dt>Budget</dt><dd>${MoneyMasters.formatMoney(game.scenario.budgetCents)}</dd></div>
            <div><dt>Plan total</dt><dd id="party-plan-total">${total}</dd></div>
            <div><dt>Budget left</dt><dd id="party-plan-remaining">${remaining}</dd></div>
          </dl>
          <div class="party-planner-items">${items}</div>
          <p class="party-planner-status" role="status" aria-live="polite" aria-atomic="true">${game.message}</p>
          <div class="party-planner-actions">
            <button type="button" class="party-planner-button" data-action="party-plan-submit">Check my plan</button>
            <button type="button" class="party-planner-button party-planner-button--secondary" data-action="party-plan-reset">Start over</button>
          </div>
        </section>
      </div>`;
  }
});
