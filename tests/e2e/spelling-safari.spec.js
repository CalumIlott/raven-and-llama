const { expect, test } = require('@playwright/test');
const { openLearningHub, setupApp } = require('./support');

async function answerCurrentQuestion(page) {
  const question = await page.evaluate(() => {
    const game = window.app.spellingSafariGame;
    return game.questions[game.index];
  });

  if (question.type === 'scramble') {
    const tileIndexes = [];
    const usedIndexes = new Set();
    for (const letter of question.answer) {
      const tileIndex = question.scramble.findIndex((tile, index) => tile === letter && !usedIndexes.has(index));
      usedIndexes.add(tileIndex);
      tileIndexes.push(tileIndex);
    }
    for (const tileIndex of tileIndexes) await page.locator(`#safari-letter-${tileIndex}`).click();
  } else {
    await page.getByRole('button', { name: question.answer, exact: true }).click();
  }
}

test('Spelling Safari offers and completes all four word-game adventures', async ({ page }) => {
  await setupApp(page);
  await openLearningHub(page);
  await expect(page.getByRole('heading', { name: 'Learning Modules' })).toBeVisible();
  await expect(page.locator('#learning-modules-grid').getByRole('button', { name: /Spelling Safari/ })).toBeVisible();
  await page.getByRole('button', { name: /Spelling Safari/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose your adventure' })).toBeVisible();

  for (const activity of ['Spelling Sprint', 'Phonics Trail', 'Word Explorer', 'Jungle Jumble']) {
    await page.getByRole('button', { name: new RegExp(activity) }).click();
    await expect(page.getByRole('heading', { name: new RegExp(activity) })).toBeVisible();

    for (let round = 1; round <= 6; round++) {
      await answerCurrentQuestion(page);
      await expect(page.locator('#safari-feedback')).toContainText('Great work!');
      await page.getByRole('button', { name: 'Next word' }).click();
      if (round < 6) {
        await expect(page.getByText(`Round ${round + 1} of 6`)).toBeVisible();
      }
    }

    await expect(page.getByRole('heading', { name: 'Safari Complete!' })).toBeVisible();
    await expect(page.locator('#safari-arena')).toContainText('6 / 6');
    if (activity !== 'Jungle Jumble') {
      await page.getByRole('button', { name: 'Choose another adventure' }).click();
    }
  }
});
