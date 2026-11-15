const { expect, test } = require('@playwright/test');
const { openMathsDojo, setupApp } = require('./support');

async function openBalanceScales(page) {
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="blue"]').click();
  await expect(page.getByRole('heading', { name: 'Blue Belt', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Balance the Scales/ }).click();
  await expect(page.getByRole('heading', { name: 'Balance the Scales' })).toBeVisible();
}

test('Balance the Scales assembles weights until the beam balances', async ({ page }) => {
  await setupApp(page);
  await openBalanceScales(page);

  const answer = await page.evaluate(() => window.arcadeEngine.mathsActivity.question.answer);
  let remaining = answer;
  for (const value of [20, 10, 5, 2, 1]) {
    while (remaining >= value) {
      await page.getByRole('button', { name: `Add ${value} unit${value === 1 ? '' : 's'}` }).click();
      remaining -= value;
    }
  }

  expect(remaining).toBe(0);
  await expect(page.locator('.balance-scale__beam--balanced')).toBeVisible();
  await expect(page.locator('.balance-scale-status')).toContainText('The scale is balanced.');
  await page.getByRole('button', { name: 'Check balance' }).click();
  await expect.poll(() => page.evaluate(() => window.arcadeEngine.mathsActivity.round)).toBe(1);
  await expect(page.locator('.balance-scale-selected .balance-scale__weight')).toHaveCount(0);
});

test('Balance the Scales supports keyboard controls and fits a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await setupApp(page);
  await openBalanceScales(page);

  const addOne = page.getByRole('button', { name: 'Add 1 unit' });
  await addOne.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove 1 unit weight' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
