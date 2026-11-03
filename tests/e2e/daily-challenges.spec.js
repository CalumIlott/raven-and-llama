const { expect, test } = require('@playwright/test');
const { openAccountModal, registerAccount, setupApp } = require('./support');

async function openDailyChallenges(page) {
  await page.goto('/learning-centre');
  await expect(page.getByRole('heading', { name: 'Daily Challenges', exact: true })).toBeVisible();
}

async function getChallengeIds(page) {
  return page.locator('[data-daily-challenge]').evaluateAll(nodes =>
    nodes.map(node => node.dataset.dailyChallenge)
  );
}

test('daily set is stable in UTC and guest completion remains memory-only', async ({ page }) => {
  await setupApp(page);
  await openDailyChallenges(page);

  const dayKey = await page.locator('#daily-challenges').getAttribute('data-day-key');
  const activityIds = await getChallengeIds(page);
  expect(activityIds).toHaveLength(4);
  expect(new Set(activityIds).size).toBe(4);
  expect(await page.locator('[data-daily-challenge]').evaluateAll(nodes =>
    nodes.map(node => node.querySelector('p')?.textContent)
  )).toEqual(['Maths', 'Spelling', 'Science', 'Brain Power']);

  await page.evaluate(id => {
    window.dispatchEvent(new CustomEvent('raven-llama:activity-completed', {
      detail: { id, title: 'Daily Challenge Test' }
    }));
  }, activityIds[0]);
  expect(await page.evaluate(() => window.app.getDailyChallengeState().completedCount)).toBe(1);
  expect(await page.evaluate(() =>
    Object.keys(localStorage).some(key => key.toLowerCase().includes('daily-challenge'))
  )).toBe(false);

  await page.reload();
  await expect(page.locator('#daily-challenges')).toHaveAttribute('data-day-key', dayKey);
  expect(await getChallengeIds(page)).toEqual(activityIds);
  expect(await page.evaluate(() => window.app.getDailyChallengeState().completedCount)).toBe(0);
  expect(await page.evaluate(() => window.ProfileManager.getActiveProfile().stars)).toBe(0);
});

test('daily challenge buttons launch their selected existing activities', async ({ page }) => {
  await setupApp(page);
  await openDailyChallenges(page);
  const [activityId] = await getChallengeIds(page);

  await page.locator(`[data-action="daily-challenge-start"][data-challenge-id="${activityId}"]`).click();

  await expect.poll(() => page.evaluate(id => {
    const engine = Object.values(window.app).find(value => value?.definition?.id === id);
    return engine?.status === 'active' ? engine.definition.id : null;
  }, activityId)).toBe(activityId);
});

test('signed-in daily progress survives refresh and stays private to each account', async ({ page }) => {
  await setupApp(page);
  const firstAccount = await registerAccount(page);
  await openDailyChallenges(page);
  await page.evaluate(async () => {
    const state = window.app.getDailyChallengeState();
    for (const activity of state.activities) {
      window.dispatchEvent(new CustomEvent('raven-llama:activity-completed', {
        detail: { id: activity.id, title: activity.title }
      }));
    }
    await window.ProfileManager.flush();
    window.app.showLearningCentre();
  });

  await expect(page.locator('#daily-challenges-status')).toContainText('All 4 challenges complete');
  expect(await page.evaluate(() => window.ProfileManager.getActiveProfile().stars)).toBe(10);

  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(firstAccount.username);
  await expect(page.locator('#daily-challenges-status')).toContainText('All 4 challenges complete');
  expect(await page.evaluate(() => window.ProfileManager.getActiveProfile().stars)).toBe(10);

  await openAccountModal(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');
  await page.reload();
  const secondAccount = await registerAccount(page);
  expect(secondAccount.username).not.toBe(firstAccount.username);
  await openDailyChallenges(page);
  await expect(page.locator('#daily-challenges-status')).toContainText('0 of 4 challenges complete');
  expect(await page.evaluate(() => window.ProfileManager.getActiveProfile().stars)).toBe(0);
});
