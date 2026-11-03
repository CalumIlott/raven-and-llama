const { expect, test } = require('@playwright/test');
const { openLearningCentre, setupApp } = require('./support');

const games = [
  { id: 'coin-recognition', title: 'Coin & Note Match', difficulty: 'easy' },
  { id: 'build-total', title: 'Build the Amount', difficulty: 'medium' },
  { id: 'give-change', title: 'Change Challenge', difficulty: 'hard' }
];

async function answerCurrentMoneyQuestion(page, activityId) {
  const question = await page.evaluate(() => {
    const game = window.app.moneyGame;
    return game.questions[game.index];
  });

  if (activityId === 'build-total') {
    const coins = question.denominations.map(item => item.value).sort((a, b) => b - a);
    let remaining = question.target;
    for (const value of coins) {
      while (remaining >= value) {
        await page.locator(`[data-action="money-coin"][data-value="${value}"]`).click();
        remaining -= value;
      }
    }
    expect(remaining).toBe(0);
    await page.getByRole('button', { name: 'Check amount' }).click();
  } else {
    await page.locator(`[data-action="money-answer"][data-answer="${question.answer}"]`).click();
  }

  await expect(page.locator('#money-feedback')).toContainText('Correct!');
  await page.getByRole('button', { name: 'Next round' }).click();
}

test('Money Masters completes its original games with difficulty levels', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await expect(page.getByText('4 Money Games')).toBeVisible();
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();
  await expect(page.getByRole('heading', { name: 'Money Masters' })).toBeVisible();

  for (const game of games) {
    await page.locator(`[data-action="money-start"][data-activity-id="${game.id}"][data-difficulty="${game.difficulty}"]`).click();
    await expect(page.getByRole('heading', { name: game.title })).toBeVisible();
    await expect(page.getByText(`${game.difficulty} difficulty`)).toBeVisible();

    for (let round = 0; round < 6; round++) {
      await answerCurrentMoneyQuestion(page, game.id);
    }

    await expect(page.getByRole('heading', { name: 'Money Game Complete!' })).toBeVisible();
    await expect(page.locator('#money-arena')).toContainText('6 / 6');
    await page.getByRole('button', { name: 'Choose another game' }).click();
  }
});

test('Money Masters shows worked feedback, audio hints, and a retry for an incorrect answer', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();
  await page.locator('[data-action="money-start"][data-activity-id="coin-recognition"][data-difficulty="easy"]').click();

  const question = await page.evaluate(() => window.app.moneyGame.questions[0]);
  const wrongAnswer = question.options.find(option => option.value !== question.answer).value;
  await page.locator(`[data-action="money-answer"][data-answer="${wrongAnswer}"]`).click();

  await expect(page.locator('#money-feedback')).toContainText('Compare the shape, colour, and printed value');
  await expect(page.locator('#money-feedback .educational-feedback__example')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Listen to hint' })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('[data-action="money-answer"]').first()).toBeEnabled();

  await page.locator(`[data-action="money-answer"][data-answer="${question.answer}"]`).click();
  await expect(page.locator('#money-feedback')).toContainText('Correct!');
  await page.getByRole('button', { name: 'Next round' }).click();
  await expect(page.getByText('Round 2 of 6')).toBeVisible();
});
