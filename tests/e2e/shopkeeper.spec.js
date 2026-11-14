const { expect, test } = require('@playwright/test');
const { openLearningCentre, setupApp } = require('./support');

async function openShopkeeper(page, difficulty = 'medium') {
  await setupApp(page);
  await openLearningCentre(page);
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();
  await page.locator(`[data-action="money-start"][data-activity-id="shopkeeper"][data-difficulty="${difficulty}"]`).click();
  await expect(page.getByRole('heading', { name: 'Shopkeeper', level: 2 })).toBeVisible();
}

async function useTestTransaction(page, payment, difficulty = 'medium') {
  return page.evaluate(({ paymentAmount, difficulty: level }) => {
    const question = window.MoneyMasters.createShopkeeperQuestion([
      { name: 'Notebook', price: 125 },
      { name: 'Storybook', price: 250 }
    ], paymentAmount, level);
    Object.assign(window.app.moneyGame.questions[0], question);
    window.app.renderMoneyQuestion();
    return question;
  }, { paymentAmount: payment, difficulty });
}

test('Shopkeeper completes a basket transaction by dragging exact change', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Native drag and drop is covered on desktop.');
  await openShopkeeper(page);

  const question = await useTestTransaction(page, 500);
  expect(question.total).toBe(375);
  expect(question.change).toBe(125);
  await expect(page.locator('[data-shopkeeper-basket]')).toContainText('Notebook');
  await expect(page.locator('[data-shopkeeper-basket]')).toContainText('$1.25');
  await expect(page.getByRole('heading', { name: 'Customer counter' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cash drawer' })).toBeVisible();
  await expect(page.getByText('Change due')).toHaveCount(0);

  for (const value of [100, 20, 5]) {
    await page.locator(`[data-action="money-coin"][data-money-draggable="true"][data-value="${value}"]`)
      .dragTo(page.locator('[data-money-change-drop-target]'));
  }
  await expect(page.locator('#money-selected-total')).toHaveText('$1.25');
  await page.getByRole('button', { name: 'Check change' }).click();
  await expect(page.locator('#money-feedback')).toContainText('Correct!');
  await page.getByRole('button', { name: 'Next round' }).click();
  await expect(page.getByText('Round 2 of 6')).toBeVisible();
});

test('Shopkeeper separates the cash drawer into coin and note slots without revealing the answer', async ({ page }) => {
  await openShopkeeper(page, 'hard');
  const question = await useTestTransaction(page, 5000, 'hard');
  expect(question.change).toBe(4625);

  await expect(page.locator('.money-drawer-group--coin')).toBeVisible();
  await expect(page.locator('.money-drawer-group--note')).toBeVisible();
  await expect(page.locator('[data-shopkeeper-basket]')).toContainText('Notebook');
  await expect(page.getByText('Customer pays')).toBeVisible();
  await expect(page.getByText('Change due')).toHaveCount(0);

  for (const [value, count] of [[2000, 2], [500, 1], [100, 1], [20, 1], [5, 1]]) {
    const denomination = page.locator(`[data-action="money-coin"][data-value="${value}"]`);
    for (let index = 0; index < count; index++) await denomination.click();
  }
  await expect(page.locator('#money-selected-total')).toHaveText('$46.25');
  await expect(page.locator('#money-selected-total')).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: 'Check change' }).click();
  await expect(page.locator('#money-feedback')).toContainText('Correct!');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Shopkeeper supports keyboard and touch selection of change', async ({ page }, testInfo) => {
  await openShopkeeper(page);
  const question = await useTestTransaction(page, 550);
  expect(question.change).toBe(175);

  for (const value of [100, 50, 20, 5]) {
    const coin = page.locator(`[data-action="money-coin"][data-value="${value}"]`);
    if (testInfo.project.name === 'mobile-chromium') {
      await coin.tap();
    } else {
      await coin.focus();
      await coin.press('Enter');
    }
  }
  await expect(page.locator('#money-selected-total')).toHaveText('$1.75');
  await page.getByRole('button', { name: 'Check change' }).click();
  await expect(page.locator('#money-feedback')).toContainText('Correct!');
});
