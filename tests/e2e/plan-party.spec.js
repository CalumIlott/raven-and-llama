const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

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

  const requiredVenue = page.locator('[data-action="party-plan-quantity"][data-item-id="venue"][data-delta="1"]');
  await requiredVenue.focus();
  await requiredVenue.press('Enter');
  await expect(page.locator('#party-plan-total')).toHaveText('$30.00');
  await page.getByRole('button', { name: /Back to Life Skills/ }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
  await expect(page.locator('[data-action="telling-time"]')).toBeVisible();
  await expect(page.locator('[data-action="money-home"]')).toBeVisible();
});

test('party planning gives over-budget feedback and accepts an exact-budget retry', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/life-skills/party-planner');

  for (const itemId of ['venue', 'snacks', 'activity', 'cake']) {
    await page.locator(`[data-action="party-plan-quantity"][data-item-id="${itemId}"][data-delta="1"]`).click();
  }
  for (let count = 0; count < 3; count++) {
    await page.locator('[data-action="party-plan-quantity"][data-item-id="invitations"][data-delta="1"]').click();
  }
  await expect(page.locator('#party-plan-total')).toHaveText('$105.00');
  await expect(page.locator('#party-plan-remaining')).toHaveText('$5.00 over budget');
  await page.locator('[data-action="party-plan-submit"]').click();
  await expect(page.locator('.party-planner-status')).toContainText('$5.00 over budget');
  await expect.poll(() => page.evaluate(() => window.app.partyPlannerActivityEngine.status)).toBe('active');

  await page.locator('[data-action="party-plan-quantity"][data-item-id="invitations"][data-delta="-1"]').click();
  await expect(page.locator('#party-plan-total')).toHaveText('$100.00');
  await expect(page.locator('#party-plan-remaining')).toHaveText('0c remaining');
  await page.locator('[data-action="party-plan-submit"]').click();

  await expect(page.getByRole('heading', { name: 'Party planned!', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.partyPlannerActivityEngine.progressRecorded)).toBe(true);
  await page.getByRole('button', { name: 'Back to Life Skills', exact: true }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
});
