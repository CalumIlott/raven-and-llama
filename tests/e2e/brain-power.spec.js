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
  await expect(page.locator('[data-action="brain-pattern-start"][data-difficulty="easy"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL('/');
});

test('Pattern Recognition supports keyboard retries and records a finite run', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');
  await page.locator('[data-action="brain-pattern-start"][data-difficulty="easy"]').click();
  await expect(page.getByRole('heading', { name: 'What number is missing?' })).toBeVisible();
  const questionCount = await page.evaluate(() => window.app.brainPowerPatternEngine.definition.questions.length);
  expect(questionCount).toBe(10);

  const firstAnswer = await page.evaluate(() => window.app.brainPowerPatternEngine.currentQuestion.answer);
  const wrongAnswer = page.locator(`[data-action="brain-pattern-answer"]:not([data-answer-value="${firstAnswer}"])`).first();
  await wrongAnswer.focus();
  await wrongAnswer.press('Enter');
  await expect(page.locator('.brain-power-status')).toContainText('try again');
  await page.locator('[data-action="brain-pattern-retry"]').focus();
  await page.locator('[data-action="brain-pattern-retry"]').press('Enter');
  await expect(page.locator('.brain-power-status')).toContainText('What is the step');

  for (let index = 0; index < questionCount; index++) {
    const answer = await page.evaluate(() => window.app.brainPowerPatternEngine.currentQuestion.answer);
    const choice = page.locator(`[data-action="brain-pattern-answer"][data-answer-value="${answer}"]`);
    await choice.focus();
    await choice.press('Enter');
  }
  await expect(page.getByRole('heading', { name: 'Patterns Complete!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.brainPowerPatternEngine.status)).toBe('complete');
  await page.getByRole('button', { name: 'Back to Brain Power', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});

test('Memory Match shows card content without state labels and prevents matched cards from being selected again', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');
  await page.locator('[data-action="brain-memory-start"][data-difficulty="easy"]').click();

  const pairId = await page.evaluate(() =>
    window.app.brainPowerMemoryGame.cards.find(card => card.side === 'symbol').pairId
  );
  await expect(page.locator('[data-action="brain-memory-card"]')).toHaveCount(8);
  const symbol = page.locator(`[data-action="brain-memory-card"][data-card-id="${pairId}-symbol"]`);
  const word = page.locator(`[data-action="brain-memory-card"][data-card-id="${pairId}-word"]`);
  await symbol.focus();
  await symbol.press('Enter');
  await word.focus();
  await word.press('Enter');
  await expect(symbol).toHaveAttribute('aria-disabled', 'true');
  await expect(word).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.brain-power-memory-card__state')).toHaveCount(0);

  const pairIds = await page.evaluate(() =>
    Array.from(new Set(window.app.brainPowerMemoryGame.cards.map(card => card.pairId)))
  );
  for (const pair of pairIds.filter(id => id !== pairId)) {
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
  await page.locator('[data-action="brain-code-start"][data-difficulty="easy"]').click();
  await expect(page.getByRole('heading', { name: 'Crack the 3-position code' })).toBeVisible();
  await expect(page.locator('[data-action="brain-code-color"]').first().locator('option')).toHaveCount(3);

  const guesses = await page.evaluate(() => {
    const game = window.app.brainPowerCodeGame;
    const colors = game.colors.map(color => color.id);
    const wrongColor = colors.find(color =>
      !game.puzzle.solution.every(solutionColor => solutionColor === color)
    );
    const wrongGuess = Array(game.puzzle.length).fill(wrongColor);
    return { solution: game.puzzle.solution, wrongGuess };
  });
  for (const [index, color] of guesses.wrongGuess.entries()) {
    await page.locator(`[data-action="brain-code-color"][data-position-index="${index}"]`).selectOption(color);
  }

  await page.locator('[data-action="brain-code-submit"]').click();
  await expect(page.locator('.brain-power-status')).toContainText('in the right place');
  for (const [index, color] of guesses.solution.entries()) {
    await page.locator(`[data-action="brain-code-color"][data-position-index="${index}"]`).selectOption(color);
  }
  await page.locator('[data-action="brain-code-submit"]').click();

  await expect(page.getByRole('heading', { name: 'Code cracked!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.brainPowerCodeEngine.progressRecorded)).toBe(true);
  await page.getByRole('button', { name: 'Back to Brain Power', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brain Power', exact: true })).toBeVisible();
});

test('Memory Match and Code Breaker difficulty modes scale their boards and color sets', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/brain-power');

  await page.locator('[data-action="brain-pattern-start"][data-difficulty="hard"]').click();
  await expect(page.locator('.brain-power-kicker')).toContainText('hard challenge');
  await expect.poll(() =>
    page.evaluate(() => window.app.brainPowerPatternEngine.definition.questions.length)
  ).toBe(10);
  await page.locator('[data-action="brain-power-home"]').click();

  for (const [difficulty, pairCount, colorCount] of [
    ['medium', 6, 5],
    ['hard', 8, 6]
  ]) {
    await page.locator(`[data-action="brain-memory-start"][data-difficulty="${difficulty}"]`).click();
    await expect(page.locator('[data-action="brain-memory-card"]')).toHaveCount(pairCount * 2);
    await expect(page.locator('.brain-power-memory-card__state')).toHaveCount(0);
    await page.locator('[data-action="brain-power-home"]').click();

    await page.locator(`[data-action="brain-code-start"][data-difficulty="${difficulty}"]`).click();
    await expect(page.locator('.brain-power-code-slots')).toHaveAttribute('data-code-length', '4');
    await expect(page.locator('[data-action="brain-code-color"]').first().locator('option')).toHaveCount(colorCount);
    await page.locator('[data-action="brain-power-home"]').click();
  }
});
