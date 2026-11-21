const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Artifact Detective gates answers on clues and completes the finite sourced investigation', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/history');
  await page.getByRole('button', { name: 'Investigate Artifacts' }).click();
  await expect(page).toHaveURL(/\/learning-centre\/history\/artifact-detective$/);
  await expect(page.getByRole('heading', { name: 'Artifact Detective' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit identification' })).toBeDisabled();
  await page.getByRole('button', { name: 'Inspect clue 1' }).click();
  await page.getByRole('button', { name: 'Inspect clue 2' }).click();
  await page.getByRole('button', { name: 'Inspect clue 3' }).click();
  await expect(page.getByRole('group')).toBeEnabled();
  const totalCases = await page.evaluate(() => window.app.historyArtifactCases.length);
  for (let caseIndex = 0; caseIndex < totalCases; caseIndex++) {
    if (caseIndex > 0) {
      await page.getByRole('button', { name: 'Next artifact' }).click();
      for (let clue = 1; clue <= 3; clue++) await page.getByRole('button', { name: `Inspect clue ${clue}` }).click();
    }
    const correctAnswer = await page.evaluate(() => {
      const app = window.app;
      return app.historyArtifactCases[app.historyArtifactActivityEngine.currentIndex].answer;
    });
    await page.locator(`input[name="artifact-period"][value="${correctAnswer}"]`).check();
    await page.getByRole('button', { name: 'Submit identification' }).click();
    await expect(page.getByRole('link', { name: /The British Museum|Metropolitan Museum/ })).toBeVisible();
    if (caseIndex < totalCases - 1) await expect(page.getByRole('button', { name: 'Next artifact' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Finish investigation' }).click();
  await expect(page.getByRole('heading', { name: 'Investigation complete' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.historyArtifactActivityEngine.status)).toBe('complete');
});

test('Artifact Detective remains usable at narrow mobile width and supports keyboard input', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/learning-centre/history/artifact-detective');
  await page.getByRole('button', { name: 'Inspect clue 1' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.artifact-clues li')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Inspect clue 2' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Inspect clue 3' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('input[name="artifact-period"]').first()).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('input[name="artifact-period"]').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Submit identification' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Next artifact' })).toBeFocused();
  expect(await page.locator('body').evaluate(element => element.scrollWidth <= window.innerWidth)).toBe(true);
});
