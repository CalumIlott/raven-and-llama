const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Brain Power hub is linked from Learning Centre and survives refresh', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre');
  await page.locator('[data-subject="brain-power"]').getByRole('button', {
    name: 'Explore Brain Power',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/learning-centre\/brain-power$/);
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'brain-power');
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
  await expect(page.locator('[data-action="brain-pattern-start"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});

test('Pattern Recognition supports keyboard retries and records a finite run', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');
  await page.locator('[data-action="brain-pattern-start"]').click();
  await expect(page.getByRole('heading', { name: 'What number is missing?' })).toBeVisible();

  const firstAnswer = page.locator('[data-action="brain-pattern-answer"][data-answer-value="8"]');
  await firstAnswer.focus();
  await firstAnswer.press('Enter');
  await expect(page.locator('.brain-power-status')).toContainText('try again');
  await page.locator('[data-action="brain-pattern-retry"]').focus();
  await page.locator('[data-action="brain-pattern-retry"]').press('Enter');
  await expect(page.locator('.brain-power-status')).toContainText('What is the step');

  for (const answer of ['10', '9', '20', '12']) {
    const choice = page.locator(`[data-action="brain-pattern-answer"][data-answer-value="${answer}"]`);
    await choice.focus();
    await choice.press('Enter');
  }
  await expect(page.getByRole('heading', { name: 'Patterns Complete!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.brainPowerPatternEngine.status)).toBe('complete');
  await page.getByRole('button', { name: 'Back to Brain Power', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});

test('Memory Match exposes pair state and prevents matched cards from being selected again', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');
  await page.locator('[data-action="brain-memory-start"]').click();

  const symbol = page.locator('[data-action="brain-memory-card"][data-card-id="sun-symbol"]');
  const word = page.locator('[data-action="brain-memory-card"][data-card-id="sun-word"]');
  await symbol.focus();
  await symbol.press('Enter');
  await word.focus();
  await word.press('Enter');
  await expect(page.locator('[data-card-id="sun-symbol"]')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('[data-card-id="sun-word"]')).toContainText('Matched');
  await expect(page.locator('[data-card-id="sun-symbol"]')).toHaveAttribute('aria-pressed', 'false');

  for (const pair of ['bird', 'tree', 'fish']) {
    await page.locator(`[data-card-id="${pair}-symbol"]`).click();
    await page.locator(`[data-card-id="${pair}-word"]`).click();
  }
  await expect(page.getByRole('heading', { name: 'All pairs matched!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.brainPowerMemoryEngine.progressRecorded)).toBe(true);
  await page.getByRole('button', { name: 'Back to Brain Power', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});

test('Code Breaker applies clue feedback, accepts a correct code, and returns to its hub', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');
  await page.locator('[data-action="brain-code-start"]').click();
  await expect(page.getByRole('heading', { name: 'Crack the three-color code' })).toBeVisible();

  await page.locator('[data-action="brain-code-submit"]').click();
  await expect(page.locator('.brain-power-status')).toContainText('1 in the right place');
  await page.locator('[data-action="brain-code-color"][data-position-index="1"]').selectOption('sapphire');
  await page.locator('[data-action="brain-code-color"][data-position-index="2"]').selectOption('emerald');
  await page.locator('[data-action="brain-code-submit"]').click();

  await expect(page.getByRole('heading', { name: 'Code cracked!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.brainPowerCodeEngine.progressRecorded)).toBe(true);
  await page.getByRole('button', { name: 'Back to Brain Power', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});
