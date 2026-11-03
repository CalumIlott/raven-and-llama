const { expect, test } = require('@playwright/test');
const { loginAccount, registerAccount, setupApp } = require('./support');

test('Trophy Hall shows earned and locked badges with accessible criteria', async ({ page }) => {
  await setupApp(page);
  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    profile.activityProgress = {
      'science-water-cycle': {
        title: 'Water Cycle',
        subject: 'Science Lab',
        kind: 'quiz',
        scoreUnit: 'questions',
        bestScore: 1,
        bestTotal: 1,
        correct: 1,
        total: 1,
        correctAnswers: 1,
        totalAnswers: 1,
        timesPlayed: 1
      }
    };
    profile.skillsProgress = { white_addition: { timesTrained: 1, bestScore: 10 } };
    profile.passedBelts = ['white'];
    await window.ProfileManager.updateProfile(profile);
  });

  await page.locator('#nav-btn-learning').click();
  await page.getByRole('button', { name: /Trophy Room/ }).click();

  const badgeList = page.getByRole('list', { name: 'Achievement badges' });
  await expect(badgeList.getByRole('listitem', { name: 'First Steps: earned' })).toBeVisible();
  await expect(badgeList.getByRole('listitem', { name: 'Skill Master: earned' })).toBeVisible();
  await expect(badgeList.getByRole('listitem', { name: 'Curriculum Graduate: earned' })).toBeVisible();
  await expect(badgeList.getByRole('listitem', { name: 'Activity Explorer: locked' })).toBeVisible();
  await expect(page.locator('[data-badge-id="activity-explorer"]'))
    .toContainText('Complete five different Learning Centre activities.');

  const backButton = page.getByRole('button', { name: /Back to .* Learning Centre/ });
  await backButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning Centre', exact: true })).toBeVisible();
});

test('signed-in badge awards survive reload and restore in a second browser context', async ({ page, browser }) => {
  await setupApp(page);
  const { username, password } = await registerAccount(page);

  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    profile.activityProgress = {
      'science-water-cycle': {
        title: 'Water Cycle',
        subject: 'Science Lab',
        kind: 'quiz',
        scoreUnit: 'questions',
        bestScore: 1,
        bestTotal: 1,
        correct: 1,
        total: 1,
        correctAnswers: 1,
        totalAnswers: 1,
        timesPlayed: 1
      }
    };
    await window.ProfileManager.updateProfile(profile);
    await window.ProfileManager.flush();
  });

  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
  await page.locator('#nav-btn-learning').click();
  await page.getByRole('button', { name: /Trophy Room/ }).click();
  await expect(page.getByRole('heading', { name: `${username}'s Trophy Hall` })).toBeVisible();
  await expect(page.getByRole('listitem', { name: 'First Steps: earned' })).toBeVisible();

  const secondContext = await browser.newContext({ viewport: await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  })) });
  try {
    const secondPage = await secondContext.newPage();
    await setupApp(secondPage);
    await loginAccount(secondPage, username, password);
    await secondPage.locator('#nav-btn-learning').click();
    await secondPage.getByRole('button', { name: /Trophy Room/ }).click();
    await expect(secondPage.getByRole('listitem', { name: 'First Steps: earned' })).toBeVisible();
  } finally {
    await secondContext.close();
  }
});
