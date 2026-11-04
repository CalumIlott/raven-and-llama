const { expect, test } = require('@playwright/test');
const { openLearningCentre, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('Fraction Pizza supports touch, keyboard, drag and drop, retry, and progress', async ({ page }) => {
  await openLearningCentre(page);
  await page.getByRole('button', { name: 'Explore Maths World' }).click();
  await page.locator('[data-action="maths-topic"][data-topic="fractions"]').click();
  await expect(page.getByRole('heading', { name: 'Fraction Pizza', exact: true })).toBeVisible();

  await page.evaluate(() => {
    window.__fractionPizzaOriginalRandom = Math.random;
    Math.random = () => 0.999999;
  });
  await page.locator('[data-action="fraction-pizza-start"][data-difficulty="easy"]').click();
  await page.evaluate(() => {
    Math.random = window.__fractionPizzaOriginalRandom;
    delete window.__fractionPizzaOriginalRandom;
  });

  const model = await page.evaluate(() => {
    const question = window.app.fractionPizzaEngine.currentQuestion;
    return {
      answer: question.answer,
      denominator: question.data.denominator,
      mode: question.data.mode,
      skillId: window.app.fractionPizzaEngine.definition.skillId
    };
  });
  expect(model).toEqual({ answer: 3, denominator: 4, mode: 'proper', skillId: 'brown_fraction' });

  await page.locator('[data-action="fraction-pizza-token"][data-token="0"]').click();
  await page.getByRole('button', { name: 'Check fraction' }).click();
  await expect(page.locator('#fraction-pizza-feedback .educational-feedback')).toHaveClass(/is-incorrect/);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('[data-action="fraction-pizza-slot"][data-slot="0"]')).toHaveAttribute('aria-pressed', 'false');

  if (test.info().project.name === 'chromium') {
    await page.locator('[data-action="fraction-pizza-token"][data-token="0"]')
      .dragTo(page.locator('[data-action="fraction-pizza-slot"][data-slot="0"]'));
  } else {
    await page.locator('[data-action="fraction-pizza-token"][data-token="0"]').click();
  }
  const keyboardToken = page.locator('[data-action="fraction-pizza-token"][data-token="1"]');
  await keyboardToken.focus();
  await keyboardToken.press('Enter');
  await expect(page.locator('[data-action="fraction-pizza-slot"][data-slot="1"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-action="fraction-pizza-token"][data-token="2"]').click();
  await page.getByRole('button', { name: 'Check fraction' }).click();
  await expect(page.locator('#fraction-pizza-feedback .educational-feedback')).toHaveClass(/is-correct/);
  await page.getByRole('button', { name: 'Next pizza' }).click();

  for (let round = 1; round < 5; round++) {
    const answer = await page.evaluate(() => window.app.fractionPizzaEngine.currentQuestion.answer);
    for (let tokenId = 0; tokenId < answer; tokenId++) {
      await page.locator(`[data-action="fraction-pizza-token"][data-token="${tokenId}"]`).click();
    }
    await page.getByRole('button', { name: 'Check fraction' }).click();
    await expect(page.locator('#fraction-pizza-feedback .educational-feedback')).toHaveClass(/is-correct/);
    await page.getByRole('button', {
      name: round === 4 ? 'Finish activity' : 'Next pizza'
    }).click();
  }

  await expect(page.getByRole('heading', { name: 'Well done, pizza builder!' })).toBeVisible();
  await expect(page.locator('#app-main')).toContainText('Correct pizzas: 5 / 5');
  await page.getByRole('button', { name: 'Maths World' }).click();
  await page.getByRole('button', { name: 'Back to Learning Centre' }).click();
  await page.locator('[data-action="parent-report"]').click();
  await expect(page.getByRole('dialog', { name: 'Mastery & Progress Report' })).toBeVisible();
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('Fraction Pizza');
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('5 / 5 questions');
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('5 / 5 (100%)');
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('Mastered');
  await expect(page.locator('#parent-analytics-subjects')).toContainText('Maths');
  await expect(page.locator('#parent-analytics-subjects')).toContainText('5 / 5 (100%)');
  await expect(page.locator('#parent-analytics-trends')).toContainText('5');
  await expect(page.locator('#parent-analytics-mappings')).toContainText('Fraction Master');
  await expect(page.locator('#parent-analytics-mappings')).toContainText('Not mapped');
  await page.locator('#parent-analytics-range').selectOption('7');
  await expect(page.locator('#parent-analytics-range')).toHaveValue('7');
});

test('Fraction Pizza presents equivalent fractions and mixed-number models', async ({ page }) => {
  await openLearningCentre(page);
  await page.getByRole('button', { name: 'Explore Maths World' }).click();
  await page.locator('[data-action="maths-topic"][data-topic="fractions"]').click();

  await page.evaluate(() => {
    window.__fractionPizzaOriginalRandom = Math.random;
    Math.random = () => 0.999999;
  });
  await page.locator('[data-action="fraction-pizza-start"][data-difficulty="medium"]').click();
  await page.evaluate(() => {
    Math.random = window.__fractionPizzaOriginalRandom;
    delete window.__fractionPizzaOriginalRandom;
  });
  const equivalent = await page.evaluate(() => window.app.fractionPizzaEngine.currentQuestion);
  await expect(page.getByRole('heading', { name: `Build ${equivalent.data.targetNumerator}/${equivalent.data.targetDenominator}` }))
    .toBeVisible();
  expect(equivalent.data.mode).toBe('equivalent');
  expect(equivalent.answer).toBe(equivalent.data.numerator);
  expect(equivalent.data.denominator).toBeGreaterThan(equivalent.data.targetDenominator);
  expect(equivalent.data.numerator).not.toBe(equivalent.data.targetNumerator);
  await page.getByRole('button', { name: 'Maths World' }).click();

  await page.evaluate(() => {
    window.__fractionPizzaOriginalRandom = Math.random;
    Math.random = () => 0.999999;
  });
  await page.locator('[data-action="fraction-pizza-start"][data-difficulty="hard"]').click();
  await page.evaluate(() => {
    Math.random = window.__fractionPizzaOriginalRandom;
    delete window.__fractionPizzaOriginalRandom;
  });
  const mixed = await page.evaluate(() => window.app.fractionPizzaEngine.currentQuestion);
  await expect(page.getByRole('heading', {
    name: `Build ${mixed.data.whole} ${mixed.data.numerator}/${mixed.data.denominator}`
  })).toBeVisible();
  expect(mixed.data.mode).toBe('mixed');
  expect(mixed.answer).toBe(mixed.data.whole * mixed.data.denominator + mixed.data.numerator);
  await expect(page.locator('[data-fraction-drop-pizza]')).toHaveCount(mixed.data.pizzas);
  await expect(page.locator('[data-action="fraction-pizza-slot"]'))
    .toHaveCount(mixed.data.pizzas * mixed.data.denominator);
});
