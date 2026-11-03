const { expect, test } = require('@playwright/test');
const { loginAccount, openAccountModal, registerAccount, setupApp } = require('./support');

async function openQuests(page) {
  await page.locator('#nav-btn-learning').click();
  await page.getByRole('button', { name: /Learning Quests/ }).click();
  await expect(page.getByRole('heading', { name: 'Learning Quests', exact: true })).toBeVisible();
}

async function completeSolarSystem(page) {
  const correctOrder = await page.evaluate(() =>
    window.app.solarSystemActivityEngine.definition.questions[0].correctOrder
  );
  for (const [orbitIndex, planetId] of correctOrder.entries()) {
    await page.locator(`[data-solar-planet-id="${planetId}"]`).click();
    await page.locator(`[data-solar-orbit-index="${orbitIndex}"]`).click();
  }
  await page.locator('[data-action="solar-system-submit"]').click();
  await expect(page.getByRole('heading', { name: 'Solar System Complete!', exact: true })).toBeVisible();
}

async function completePlantLifeCycle(page) {
  const correctOrder = await page.evaluate(() =>
    window.app.plantLifeCycleActivityEngine.definition.questions[0].correctOrder
  );
  for (const [positionIndex, stageId] of correctOrder.entries()) {
    await page.locator(`[data-cycle-stage-id="${stageId}"]`).click();
    await page.locator(`[data-cycle-position-index="${positionIndex}"]`).click();
  }
  await page.locator('[data-action="plant-life-cycle-submit"]').click();
  await expect(page.getByRole('heading', { name: 'Plant Life Cycle Complete!', exact: true })).toBeVisible();
}

test('signed-in learners can resume a quest, complete it, and earn its badge across devices', async ({ page, browser }) => {
  await setupApp(page);
  const { username, password } = await registerAccount(page);
  await openQuests(page);

  await page.getByRole('button', { name: 'Start Solar System Explorer' }).click();
  await completeSolarSystem(page);
  await page.evaluate(() => window.ProfileManager.flush());
  await openQuests(page);
  const quest = page.locator('[data-quest-id="stellar-expedition"]');
  await expect(quest.locator('[data-quest-progress]')).toHaveText('1 of 2 steps complete');
  await expect(quest.locator('li').nth(0)).toContainText('Completed');
  await expect(quest.locator('li').nth(1)).toContainText('Next step');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Learning Quests', exact: true })).toBeVisible();
  await expect(page.locator('[data-quest-id="stellar-expedition"] [data-quest-progress]'))
    .toHaveText('1 of 2 steps complete');
  await page.getByRole('button', { name: 'Continue Solar System Explorer' }).click();
  await completePlantLifeCycle(page);
  await page.evaluate(() => window.ProfileManager.flush());
  await openQuests(page);
  await expect(page.locator('[data-quest-id="stellar-expedition"] [data-quest-progress]')).toHaveText('Quest complete');
  await expect(page.locator('[data-quest-id="stellar-expedition"]')).toContainText('Reward earned and added to your Trophy Hall.');

  const secondContext = await browser.newContext({
    viewport: await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
  });
  try {
    const secondPage = await secondContext.newPage();
    await setupApp(secondPage);
    await loginAccount(secondPage, username, password);
    await secondPage.goto('/learning-centre/quests');
    await expect(secondPage.locator('[data-quest-id="stellar-expedition"] [data-quest-progress]'))
      .toHaveText('Quest complete');
    await secondPage.locator('#nav-btn-learning').click();
    await secondPage.getByRole('button', { name: /Trophy Room/ }).click();
    await expect(secondPage.getByRole('listitem', { name: 'Stellar Explorer: earned' })).toBeVisible();
  } finally {
    await secondContext.close();
  }
});

test('guest quest progress remains memory-only', async ({ page }) => {
  await setupApp(page);
  await openQuests(page);
  await page.getByRole('button', { name: 'Start Solar System Explorer' }).click();
  await completeSolarSystem(page);
  await page.evaluate(async () => {
    await window.ProfileManager.flush();
  });
  await openQuests(page);
  await expect(page.locator('[data-quest-id="stellar-expedition"] [data-quest-progress]'))
    .toHaveText('1 of 2 steps complete');
  expect(await page.evaluate(() => localStorage.getItem('raven_llama_profiles_cache_v5'))).toBeNull();

  await page.reload();
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');
  await page.goto('/learning-centre/quests');
  await expect(page.locator('[data-quest-id="stellar-expedition"] [data-quest-progress]'))
    .toHaveText('0 of 2 steps complete');
});
