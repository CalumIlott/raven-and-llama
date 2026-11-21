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


test('lifting balloons subtract units and remain keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await setupApp(page);
  await openBalanceScales(page);
  const status = page.locator('.balance-scale-status');
  const initial = await status.textContent();
  await page.getByRole('button', { name: 'Add 2 units' }).click();
  const balloon = page.getByRole('button', { name: 'Add balloon: subtract 2 units' });
  await balloon.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText(initial);
  await expect(page.getByRole('button', { name: 'Add balloon: subtract 2 units' })).toBeFocused();
  await page.getByRole('button', { name: 'Remove balloon: subtract 2 units' }).click();
  await expect(page.getByRole('button', { name: 'Add balloon: subtract 2 units' })).toBeFocused();
  await expect(status).not.toHaveText(initial);
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByRole('button', { name: 'Add 1 unit' })).toBeFocused();
  await expect(status).toHaveText(initial);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Blue Belt equation training uses the interactive balance scale', async ({ page }) => {
  await setupApp(page);
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="blue"]').click();
  await expect(page.getByRole('heading', { name: 'Blue Belt', exact: true })).toBeVisible();
  await page.locator('[data-action="skill-start"][data-skill-id="blue_balanced_equation"]').click();
  await expect(page.getByRole('heading', { name: /Balanced Equation Master/ })).toBeVisible();
  await page.evaluate(() => {
    const question = window.gameEngine.questions[0];
    Object.assign(question, { balanceMode: null, leftA: question.answer, leftB: 0, rightA: 0 });
    window.gameEngine.renderCurrentQuestion();
  });
  await expect(page.locator('#game-balance-panel')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check balance' })).toBeVisible();
  await expect(page.locator('#game-arena .play-answer-button')).toHaveCount(0);

  let remaining = await page.evaluate(() => window.gameEngine.questions[0].answer);
  for (const value of [20, 10, 5, 2, 1]) {
    while (remaining >= value) {
      await page.getByRole('button', { name: `Add ${value} unit${value === 1 ? '' : 's'}` }).click();
      remaining -= value;
    }
  }
  await expect(page.locator('.balance-scale__beam--balanced')).toBeVisible();
  await page.getByRole('button', { name: 'Check balance' }).click();
  await expect(page.locator('#feedback-banner')).toContainText('Correct!');
  await expect(page.getByText('Question 2 of 10', { exact: true })).toBeVisible({ timeout: 5000 });
});

test('Blue Belt training lets learners weigh a hidden x block with known weights', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await setupApp(page);
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="blue"]').click();
  await expect(page.getByRole('heading', { name: 'Blue Belt', exact: true })).toBeVisible();
  await page.locator('[data-action="skill-start"][data-skill-id="blue_balanced_equation"]').click();
  await expect(page.locator('#game-balance-panel')).toBeVisible();
  await page.evaluate(() => {
    Object.assign(window.gameEngine.questions[0], {
      balanceMode: 'mystery',
      prompt: 'Find the mass of the hidden x block using known weights.',
      answer: 17
    });
    window.gameEngine.renderCurrentQuestion();
  });

  await expect(page.locator('.balance-scale__weight--mystery')).toHaveText('x');
  await expect(page.getByRole('group', { name: 'Add a known weight to the left pan' })).toBeVisible();
  await page.getByRole('button', { name: 'Add 10 units' }).click();
  await expect(page.locator('.balance-scale-status')).toContainText('Left pan: 10 known units');
  await expect(page.locator('.balance-scale-status')).not.toContainText('17');
  await expect(page.locator('.balance-scale')).toHaveAttribute('aria-label', /hidden mystery block x/);
  await page.getByRole('button', { name: 'Add 5 units' }).click();
  await page.getByRole('button', { name: 'Add 2 units' }).click();
  await expect(page.locator('.balance-scale__beam--balanced')).toBeVisible();
  await page.getByRole('button', { name: 'Check balance' }).click();
  await expect(page.locator('#feedback-banner')).toContainText('Correct!');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Blue Belt training lets learners remove equal weights from both pans', async ({ page }) => {
  await setupApp(page);
  await openMathsDojo(page);
  await page.locator('a[data-action="belt-detail"][data-belt-id="blue"]').click();
  await expect(page.getByRole('heading', { name: 'Blue Belt', exact: true })).toBeVisible();
  await page.locator('[data-action="skill-start"][data-skill-id="blue_balanced_equation"]').click();
  await expect(page.locator('#game-balance-panel')).toBeVisible();
  await page.evaluate(() => {
    Object.assign(window.gameEngine.questions[0], {
      balanceMode: 'equal-operation',
      sharedWeight: 15,
      answer: 8,
      prompt: 'Remove equal weights from both sides of x + 15 = 8 + 15.'
    });
    window.gameEngine.renderCurrentQuestion();
  });

  await expect(page.locator('.balance-scale-status')).toContainText('15 shared units remain');
  await expect(page.getByRole('button', { name: 'Check x' })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove 10 from both pans' }).click();
  await expect(page.locator('.balance-scale-status')).toContainText('5 shared units remain');
  await page.getByRole('button', { name: 'Remove 5 from both pans' }).click();
  await expect(page.locator('.balance-scale-status')).toContainText('leaving x equal to the known weight');
  await expect(page.locator('.balance-scale__weight--mystery')).toHaveText('x');
  await page.getByRole('button', { name: 'Check x' }).click();
  await expect(page.locator('#feedback-banner')).toContainText('Correct!');
});
