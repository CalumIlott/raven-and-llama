const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

async function applyPartyQuantities(page, items, quantities) {
  for (const item of items) {
    const addButton = page.locator(
      `[data-action="party-plan-quantity"][data-item-id="${item.id}"][data-delta="1"]`
    );
    for (let count = 0; count < quantities[item.id]; count++) await addButton.click();
  }
}

test('Plan a Party has a refresh-safe Life Skills route and preserves existing activities', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre');
  await page.locator('[data-subject="life-skills"]').getByRole('button', {
    name: 'Plan a Party',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/learning-centre\/life-skills\/party-planner$/);
  await expect(page.getByRole('heading', { name: 'Plan a Party', exact: true })).toBeVisible();
  await expect(page.locator('#party-plan-total')).toHaveText('0c');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Plan a Party', exact: true })).toBeVisible();

  const venue = await page.evaluate(() => {
    const item = window.app.partyPlannerGame.items.find(candidate => candidate.category === 'Venue');
    return { id: item.id, price: window.MoneyMasters.formatMoney(item.priceCents) };
  });
  const requiredVenue = page.locator(
    `[data-action="party-plan-quantity"][data-item-id="${venue.id}"][data-delta="1"]`
  );
  await requiredVenue.focus();
  await requiredVenue.press('Enter');
  await expect(page.locator('#party-plan-total')).toHaveText(venue.price);
  await page.getByRole('button', { name: /Back to Life Skills/ }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
  await expect(page.locator('[data-action="telling-time"]')).toBeVisible();
  await expect(page.locator('[data-action="money-home"]')).toBeVisible();
});

test('party planning gives over-budget feedback and accepts an exact-budget retry', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/life-skills/party-planner');
  await page.evaluate(() => window.app.startPartyPlanner(() => 0));

  const planData = await page.evaluate(() => {
    const { items, scenario } = window.app.partyPlannerGame;
    let states = new Map([[0, Object.fromEntries(items.map(item => [item.id, 0]))]]);
    for (const item of items) {
      const nextStates = new Map();
      for (const [total, quantities] of states) {
        for (let quantity = item.requiredQuantity; quantity <= item.maxQuantity; quantity++) {
          const nextTotal = total + quantity * item.priceCents;
          if (nextTotal > scenario.budgetCents) continue;
          const nextQuantities = { ...quantities, [item.id]: quantity };
          if (!nextStates.has(nextTotal)) nextStates.set(nextTotal, nextQuantities);
        }
      }
      states = nextStates;
    }
    return {
      items,
      budgetCents: scenario.budgetCents,
      exact: states.get(scenario.budgetCents),
      over: Object.fromEntries(items.map(item => [item.id, item.maxQuantity]))
    };
  });
  expect(planData.exact).toBeTruthy();
  await applyPartyQuantities(page, planData.items, planData.over);

  const maximumTotal = planData.items.reduce((total, item) =>
    total + item.priceCents * planData.over[item.id], 0);
  expect(maximumTotal).toBeGreaterThan(planData.budgetCents);
  const overAmount = await page.evaluate(
    amount => window.MoneyMasters.formatMoney(amount),
    maximumTotal - planData.budgetCents
  );
  await expect(page.locator('#party-plan-total')).toHaveText(
    await page.evaluate(total => window.MoneyMasters.formatMoney(total), maximumTotal)
  );
  await expect(page.locator('#party-plan-remaining')).toHaveText(`${overAmount} over budget`);
  await page.locator('[data-action="party-plan-submit"]').click();
  await expect(page.locator('.party-planner-status')).toContainText(`${overAmount} over budget`);
  await expect.poll(() => page.evaluate(() => window.app.partyPlannerActivityEngine.status)).toBe('active');

  await page.locator('[data-action="party-plan-reset"]').click();
  await applyPartyQuantities(page, planData.items, planData.exact);
  await expect(page.locator('#party-plan-total')).toHaveText('$100.00');
  await expect(page.locator('#party-plan-remaining')).toHaveText('0c remaining');
  await page.locator('[data-action="party-plan-submit"]').click();

  await expect(page.getByRole('heading', { name: 'Party planned!', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.partyPlannerActivityEngine.progressRecorded)).toBe(true);
  await page.getByRole('button', { name: 'Back to Life Skills', exact: true }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
});
