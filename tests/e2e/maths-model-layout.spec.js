const { expect, test } = require('@playwright/test');
const { setupApp, openMathsDojo } = require('./support');

test('Array Architect renders the requested columns under the production CSP', async ({ page }) => {
  await setupApp(page);
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="brown"]').click();
  await page.getByRole('button', { name: /Array Architect/ }).click();
  const columns = await page.evaluate(() => window.arcadeEngine.mathsActivity.columns);
  const grid = page.locator('#ma-body [role="img"]');
  await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(columns);
  // Exercise every supported grid width through the real renderer and CSP.
  for (let width = 2; width <= 11; width++) {
    await page.evaluate(columns => {
      window.arcadeEngine.mathsActivity.columns = columns;
      window.arcadeEngine.mathsActivity.rows = 2;
      window.arcadeEngine.renderArrayRound();
    }, width);
    await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(width);
  }
});

test('Fraction Fold keeps equal parts in its intended grid', async ({ page }) => {
  await setupApp(page);
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="brown"]').click();
  await page.getByRole('button', { name: /Fraction Fold/ }).click();
  const denominator = await page.evaluate(() => window.arcadeEngine.mathsActivity.denominator);
  const grid = page.locator('#ma-body [data-action="arcade-maths-cell"]').first().locator('..');
  await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(Math.min(denominator, 4));
  for (const denominator of [2, 3, 4, 8]) {
    await page.evaluate(denominator => {
      window.arcadeEngine.mathsActivity.denominator = denominator;
      window.arcadeEngine.renderFractionFold();
    }, denominator);
    await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(Math.min(denominator, 4));
  }
});
