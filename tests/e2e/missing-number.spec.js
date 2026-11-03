const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Missing Number supports retry, records one run, varies replay, and returns to Maths World', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/maths');
  await expect(page.getByRole('heading', { name: 'Missing Number', exact: true })).toBeVisible();

  const start = page.locator('[data-action="missing-number-start"][data-profile-recommended="true"]');
  await start.click();
  await expect(page.getByRole('heading', { name: 'Missing Number', exact: true })).toBeVisible();
  const firstRoundKeys = await page.evaluate(() =>
    window.app.missingNumberGame.questions.map(question => question.data.sequenceKey)
  );

  for (let round = 0; round < 5; round++) {
    const question = await page.evaluate(() => {
      const game = window.app.missingNumberGame;
      const current = game.questions[game.index];
      return { answer: current.answer, options: current.options };
    });

    if (round === 0) {
      const wrongAnswer = question.options.find(value => value !== question.answer);
      await page.locator(`[data-action="missing-number-select"][data-value="${wrongAnswer}"]`).click();
      await page.getByRole('button', { name: 'Check answer' }).click();
      await expect(page.locator('#missing-number-feedback')).toHaveClass(/is-incorrect/);
      await page.getByRole('button', { name: 'Try again' }).click();
      await expect(page.locator('[data-action="missing-number-select"]').first()).toBeFocused();
    }

    await page.locator(`[data-action="missing-number-select"][data-value="${question.answer}"]`).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.locator('#missing-number-feedback')).toHaveClass(/is-correct/);
    await page.getByRole('button', {
      name: round === 4 ? 'Finish activity' : 'Next sequence →'
    }).click();
    if (round < 4) {
      await expect(page.locator('[data-action="missing-number-select"]').first()).toBeFocused();
    }
  }

  await expect(page.getByRole('heading', { name: 'Missing Number complete!' })).toBeVisible();
  const completedRun = await page.evaluate(() => ({
    status: window.app.missingNumberEngine.status,
    progressRecorded: window.app.missingNumberEngine.progressRecorded,
    activityId: window.app.missingNumberEngine.definition.id,
    skillId: window.app.missingNumberEngine.definition.skillId,
    timesPlayed: window.ProfileManager.getActiveProfile().activityProgress['maths-missing-number'].timesPlayed
  }));
  expect(completedRun).toEqual({
    status: 'complete',
    progressRecorded: true,
    activityId: 'maths-missing-number',
    skillId: 'maths_missing_number',
    timesPlayed: 1
  });

  await page.getByRole('button', { name: 'Play again' }).click();
  const replayKeys = await page.evaluate(() =>
    window.app.missingNumberGame.questions.map(question => question.data.sequenceKey)
  );
  expect(replayKeys.some(key => firstRoundKeys.includes(key))).toBe(false);

  await page.getByRole('button', { name: 'Exit activity' }).click();
  await expect(page.getByRole('heading', { name: 'Numbers, patterns, and problem-solving' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Learning Centre' }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
});

test('Missing Number shows a recoverable message when no safe sequence is available', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/maths');
  await page.evaluate(() => {
    window.MissingNumber.generateQuestions = () => {
      throw new RangeError('No sequence candidates');
    };
  });

  await page.locator('[data-action="missing-number-start"][data-difficulty="easy"]').click();
  await expect(page.getByRole('alert')).toContainText("We couldn't make a safe sequence");
  await page.getByRole('button', { name: 'Back to Maths World' }).click();
  await expect(page.getByRole('heading', { name: 'Numbers, patterns, and problem-solving' })).toBeVisible();
});
