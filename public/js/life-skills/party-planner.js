const PARTY_PLANNER_ACTIVITY_ID = 'life-skills-plan-party';
const PARTY_PLANNER_SKILL_ID = 'life_skills_budgeting';
const PARTY_PLANNER_BUDGET_CENTS = 10000;
const PARTY_PLANNER_ITEMS = [
  {
    id: 'venue',
    name: 'Party room',
    description: 'A place for everyone to meet.',
    priceCents: 3000,
    maxQuantity: 1,
    requiredQuantity: 1
  },
  {
    id: 'snacks',
    name: 'Snacks',
    description: 'Food to share with your guests.',
    priceCents: 2000,
    maxQuantity: 4,
    requiredQuantity: 1
  },
  {
    id: 'activity',
    name: 'Party game',
    description: 'An activity for everyone to enjoy.',
    priceCents: 1500,
    maxQuantity: 1,
    requiredQuantity: 1
  },
  {
    id: 'cake',
    name: 'Birthday cake',
    description: 'A special treat for the celebration.',
    priceCents: 2500,
    maxQuantity: 1,
    requiredQuantity: 0
  },
  {
    id: 'invitations',
    name: 'Invitations',
    description: 'Invite friends to the party.',
    priceCents: 500,
    maxQuantity: 8,
    requiredQuantity: 0
  },
  {
    id: 'decorations',
    name: 'Decorations',
    description: 'Make the room feel festive.',
    priceCents: 1000,
    maxQuantity: 2,
    requiredQuantity: 0
  }
];

function validatePartyPlannerItems(items = PARTY_PLANNER_ITEMS) {
  if (!Array.isArray(items) || items.length === 0) return false;
  const ids = new Set();
  return items.every(item => {
    if (!item || typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) ||
      ids.has(item.id) ||
      typeof item.name !== 'string' || !item.name.trim() ||
      typeof item.description !== 'string' || !item.description.trim() ||
      !Number.isSafeInteger(item.priceCents) || item.priceCents <= 0 ||
      !Number.isSafeInteger(item.maxQuantity) || item.maxQuantity < 0 ||
      !Number.isSafeInteger(item.requiredQuantity) ||
      item.requiredQuantity < 0 || item.requiredQuantity > item.maxQuantity) return false;
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

function createPartyPlannerActivityEngine() {
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
      configuration: { budgetCents: PARTY_PLANNER_BUDGET_CENTS }
    }
  });
  return engine;
}

Object.assign(App.prototype, {
  startPartyPlanner() {
    if (!validatePartyPlannerItems()) throw new Error('Invalid Plan a Party item data.');
    this.currentView = 'life-skills-party';
    this.partyPlannerGame = {
      quantities: createPartyPlannerQuantities(),
      message: 'Choose the required party items, then add optional extras if your budget allows.',
      complete: false
    };
    this.partyPlannerActivityEngine = createPartyPlannerActivityEngine();
    this.navigateToPath('/learning-centre/life-skills/party-planner');
    this.renderPartyPlanner();
  },

  adjustPartyPlannerQuantity(itemId, delta) {
    const game = this.partyPlannerGame;
    if (!game || game.complete || this.partyPlannerActivityEngine?.status !== 'active') return false;
    const quantities = changePartyPlannerQuantity(game.quantities, itemId, delta);
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
    const result = evaluatePartyPlan(game.quantities);
    if (!result.valid) {
      const feedback = [];
      if (result.invalidQuantities) {
        feedback.push('Check the item quantities and use the quantity controls to make a valid plan.');
      } else {
        if (result.missingItems.length) {
          const names = result.missingItems
            .map(id => PARTY_PLANNER_ITEMS.find(item => item.id === id).name);
          feedback.push(`Add the required item${names.length === 1 ? '' : 's'}: ${names.join(', ')}.`);
        }
        if (result.overBudget) {
          feedback.push(`Your plan is ${MoneyMasters.formatMoney(result.totalCents - PARTY_PLANNER_BUDGET_CENTS)} over budget.`);
        }
        if (!feedback.length) feedback.push('Adjust your plan and try again.');
      }
      game.message = `${feedback.join(' ')} You have $100.00 to spend.`;
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
    game.quantities = createPartyPlannerQuantities();
    game.message = 'Start again by choosing the required party items.';
    this.renderPartyPlanner();
    return true;
  },

  renderPartyPlanner() {
    const main = document.getElementById('app-main');
    const game = this.partyPlannerGame;
    if (!main || !game) return;
    main.dataset.page = 'life-skills-party';
    this.updateHeader();
    const result = evaluatePartyPlan(game.quantities);
    const total = MoneyMasters.formatMoney(result.totalCents);
    const remaining = result.remainingCents >= 0
      ? `${MoneyMasters.formatMoney(result.remainingCents)} remaining`
      : `${MoneyMasters.formatMoney(-result.remainingCents)} over budget`;

    if (game.complete) {
      const chosenItems = PARTY_PLANNER_ITEMS
        .filter(item => game.quantities[item.id] > 0)
        .map(item => `<li>${item.name} × ${game.quantities[item.id]}</li>`)
        .join('');
      main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <section class="party-planner-panel party-planner-result">
            <p class="party-planner-kicker">Life Skills · Plan a Party</p>
            <h1>Party planned!</h1>
            <p>Your plan costs ${total} and stays within the $100.00 budget.</p>
            <ul class="party-planner-result__items">${chosenItems}</ul>
            <div class="party-planner-actions">
              <button type="button" class="party-planner-button" data-action="life-skills-party">Plan another party</button>
              <button type="button" class="party-planner-button party-planner-button--secondary" data-action="learning-centre">Back to Life Skills</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const items = PARTY_PLANNER_ITEMS.map(item => {
      const quantity = game.quantities[item.id];
      return `
        <article class="party-planner-item">
          <div class="party-planner-item__copy">
            <h2>${item.name}</h2>
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
    }).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="party-planner-back" data-action="learning-centre">← Back to Life Skills</button>
        <section class="party-planner-panel">
          <p class="party-planner-kicker">Life Skills · Plan a Party</p>
          <h1>Plan a Party</h1>
          <p class="party-planner-instructions">Plan a celebration for your friends. Include a party room, snacks, and a game, then choose optional extras without spending more than $100.00.</p>
          <dl class="party-planner-budget" aria-live="polite" aria-atomic="true">
            <div><dt>Budget</dt><dd>$100.00</dd></div>
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
