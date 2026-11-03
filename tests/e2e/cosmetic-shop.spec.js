const { expect, test } = require('@playwright/test');
const { loginAccount, openAccountModal, registerAccount, setupApp } = require('./support');

test('signed-in learners purchase, equip, and sync avatar frames', async ({ page, browser }) => {
  await setupApp(page);
  const { username, password } = await registerAccount(page);

  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    await window.ProfileManager.updateProfile({ ...profile, stars: 10 });
    await window.ProfileManager.flush();
  });
  await openAccountModal(page);
  await expect(page.getByRole('heading', { name: 'Cosmetic Shop' })).toBeVisible();
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('10');
  await expect(page.getByText('Your current avatars stay free.')).toBeVisible();

  await page.getByRole('button', { name: 'Buy Sunrise Frame for 5 stars' }).click();
  await expect(page.locator('#cosmetic-shop-status')).toHaveText('Sunrise Frame purchased. You can equip it now.');
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('5');
  await page.getByRole('button', { name: 'Buy Galaxy Frame for 15 stars' }).click();
  await expect(page.locator('#cosmetic-shop-status')).toHaveText('You need 15 stars to buy the Galaxy Frame.');
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('5');

  await page.locator('[data-cosmetic-id="sunrise-frame"] [data-action="cosmetic-equip"]').click();
  await expect(page.locator('#cosmetic-shop-status')).toHaveText('Sunrise Frame equipped.');
  await expect(page.locator('#header-profile-avatar')).toHaveAttribute('data-cosmetic', 'sunrise-frame');
  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
  await expect(page.locator('#header-profile-avatar')).toHaveAttribute('data-cosmetic', 'sunrise-frame');
  await openAccountModal(page);
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('5');
  await expect(page.locator('[data-cosmetic-id="sunrise-frame"]')).toContainText('Equipped');

  const secondContext = await browser.newContext({
    viewport: await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
  });
  try {
    const secondPage = await secondContext.newPage();
    await setupApp(secondPage);
    await loginAccount(secondPage, username, password);
    await openAccountModal(secondPage);
    await expect(secondPage.locator('#cosmetic-star-balance')).toHaveText('5');
    await expect(secondPage.locator('[data-cosmetic-id="sunrise-frame"]')).toContainText('Equipped');
    await expect(secondPage.locator('#header-profile-avatar')).toHaveAttribute('data-cosmetic', 'sunrise-frame');
  } finally {
    await secondContext.close();
  }
});

test('guest cosmetic purchases stay in memory for the current visit', async ({ page }) => {
  await setupApp(page);
  await page.evaluate(() => window.ProfileManager.updateProfile({
    ...window.ProfileManager.getActiveProfile(),
    stars: 5
  }));
  await openAccountModal(page);
  await expect(page.locator('#cosmetic-shop-session-note')).toHaveText('Guest purchases remain available only for this visit.');

  await page.getByRole('button', { name: 'Buy Sunrise Frame for 5 stars' }).click();
  await expect(page.locator('#cosmetic-shop-status')).toHaveText('Sunrise Frame purchased. You can equip it now.');
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('0');
  expect(await page.evaluate(() => localStorage.getItem('raven_llama_profiles_cache_v5'))).toBeNull();

  await page.reload();
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');
  await openAccountModal(page);
  await expect(page.locator('#cosmetic-star-balance')).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Buy Sunrise Frame for 5 stars' })).toBeVisible();
});
