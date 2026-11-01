const { expect, test } = require('@playwright/test');
const { openLearningHub, setupApp } = require('./support');

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

test('Money Masters offers three games with difficulty levels and completes each game', async ({ page }) => {
  await setupApp(page);
  await openLearningHub(page);
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
