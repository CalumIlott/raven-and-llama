const { expect, test } = require('@playwright/test');
const { chooseQuestionAnswer, openLearningHub, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('home counts, module navigation, and exam failure, retry, and pass gates work', async ({ page }) => {
  test.setTimeout(60000);

  const curriculum = await page.evaluate(() => ({
    belts: window.BELTS_DATA.length,
    skills: window.BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0)
  }));
  await expect(page.getByText(`${curriculum.belts} Belt Levels • ${curriculum.skills} Skills`, { exact: true })).toBeVisible();

  await openLearningHub(page);
  await expect(page.getByText(`${curriculum.skills} Skills`, { exact: true })).toBeVisible();
  await page.getByText('Open Maths Masters Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'White Belt', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Belt Examination Hall' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Complete Stage 1 to Unlock/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /View Missing Prerequisites/ })).toBeVisible();

  await page.getByRole('button', { name: /Take Stage 1 Exam/ }).click();
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible();

  for (let question = 1; question <= 3; question++) {
    await chooseQuestionAnswer(page, false);
    await expect(page.locator('#feedback-banner')).toContainText('The correct answer was:');
    if (question < 3) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Test Incomplete' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Retry Test/ }).click();
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible();

  for (let question = 1; question <= 10; question++) {
    await chooseQuestionAnswer(page, question > 2);
    if (question < 10) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Stage 1 Test Passed!' })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#game-arena')).toContainText('8/10');
  await page.getByRole('button', { name: /Return to Dojo/ }).click();
  await expect(page.getByRole('button', { name: /Take Stage 2 Quiz/ })).toBeEnabled();
});

test('parent progress report and trophy room render their full states', async ({ page }) => {
  await page.getByRole('button', { name: /Mastery Stats/ }).click();
  await expect(page.getByRole('heading', { name: 'Mastery & Progress Report' })).toBeVisible();
  const skillCount = await page.evaluate(() => window.BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0));
  await expect(page.locator('#parent-stats-tbody tr')).toHaveCount(skillCount);
  await page.getByRole('button', { name: 'Close Report' }).click();

  await page.getByRole('button', { name: /Enter Learning Hub/ }).click();
  await page.getByRole('button', { name: /Trophy Room/ }).click();
  await expect(page.getByRole('heading', { name: "Guest's Trophy Hall" })).toBeVisible();
  await expect(page.getByText('No Grand Master certificates earned yet.')).toBeVisible();
});