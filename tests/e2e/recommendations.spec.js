const { expect, test } = require('@playwright/test');
const { openLearningCentre, registerAccount, setupApp } = require('./support');

test('Learning Centre shows a small, subject-diverse fallback and launches at the learner’s year level', async ({ page }) => {
  await setupApp(page);
  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    profile.schoolYear = 1;
    profile.subjectYears.maths = 9;
    await window.ProfileManager.updateProfile(profile);
  });
  await openLearningCentre(page);

  const panel = page.locator('#learning-recommendations');
  const cards = panel.locator('[data-recommendation]');
  const unsupported = await page.evaluate(() => window.LearningRecommendations.getCatalog()
    .filter(activity => typeof window.app[activity.startMethod] !== 'function')
    .map(activity => activity.activityId));
  expect(unsupported).toEqual([]);
  await expect(panel.getByRole('heading', { name: 'Recommended for you' })).toBeVisible();
  await expect(cards).toHaveCount(3);
  const subjects = await cards.locator('.learning-recommendation-subject').allTextContents();
  expect(new Set(subjects).size).toBe(3);
  const pizza = panel.locator('[data-recommendation="fraction-pizza"]');
  await expect(pizza).toContainText('You have not tried Fraction Pizza yet');
  await pizza.getByRole('button', { name: 'Try Fraction Pizza · hard' }).click();

  await expect(page.locator('[data-fraction-pizza-arena]')).toBeVisible();
  expect(await page.evaluate(() => window.app.fractionPizzaDifficulty)).toBe('hard');
});

test('recent low accuracy is explained and does not leak between signed-in accounts', async ({ page, browser }) => {
  await setupApp(page);
  await registerAccount(page, `recommendation_owner_${Date.now().toString(36)}`);
  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    profile.activityHistory = [{
      date: new Date().toISOString().slice(0, 10),
      activityId: 'fraction-pizza',
      title: 'Fraction Pizza',
      subject: 'Maths',
      skillId: 'brown_fraction',
      kind: 'quiz',
      score: 1,
      total: 5,
      correctAnswers: 1,
      totalAnswers: 5
    }];
    await window.ProfileManager.updateProfile(profile);
  });
  await openLearningCentre(page);
  const ownerPizza = page.locator('#learning-recommendations [data-recommendation="fraction-pizza"]');
  await expect(ownerPizza).toContainText('20% correct');

  const otherContext = await browser.newContext();
  try {
    const otherPage = await otherContext.newPage();
    await setupApp(otherPage);
    await registerAccount(otherPage, `recommendation_other_${Date.now().toString(36)}`);
    await openLearningCentre(otherPage);
    const otherPizza = otherPage.locator('#learning-recommendations [data-recommendation="fraction-pizza"]');
    await expect(otherPizza).toContainText('You have not tried Fraction Pizza yet');
    await expect(otherPizza).not.toContainText('20% correct');
  } finally {
    await otherContext.close();
  }
});
