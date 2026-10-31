const { expect, test } = require('@playwright/test');
const { loginAccount, openAccountModal, registerAccount, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('guest can create an account, change password, sign out, sign in, and delete the account', async ({ page }) => {
  const { username, password } = await registerAccount(page);
  await expect(page.locator('#account-status-banner')).toBeHidden();

  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(username);

  await openAccountModal(page);
  await page.locator('#account-current-password').fill(password);
  await page.locator('#account-new-password').fill('replacement password 456');
  await page.locator('#account-new-password-confirm').fill('replacement password 456');
  await page.getByRole('button', { name: 'Update password' }).click();
  await expect(page.locator('#account-message')).toHaveText('Password updated.');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');

  await openAccountModal(page);
  await page.locator('#account-username').fill(username);
  await page.locator('#account-password').fill(password);
  await page.locator('#account-submit-button').click();
  await expect(page.locator('#account-message')).toContainText('Invalid username or password');
  await page.locator('#account-password').fill('replacement password 456');
  await page.locator('#account-submit-button').click();
  await expect(page.locator('#header-profile-name')).toHaveText(username);

  await openAccountModal(page);
  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.locator('#delete-account-password').fill('replacement password 456');
  await page.getByRole('button', { name: 'Confirm account deletion' }).click();
  await expect(page.locator('#header-profile-name')).toHaveText('Guest');
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');
});

test('progress syncs to another browser context without exposing it to a different account', async ({ browser, page }) => {
  test.setTimeout(60000);
  const first = await registerAccount(page);

  await page.getByRole('button', { name: /Enter Learning Hub/ }).click();
  await page.getByText('Open Maths Masters Dojo', { exact: true }).click();
  await page.getByRole('heading', { name: 'White Belt', exact: true }).click();
  await page.getByRole('button', { name: /Train Skill/ }).first().click();
  for (let question = 1; question <= 10; question++) {
    const answer = await page.evaluate(() => window.gameEngine.questions[window.gameEngine.currentIndex].answer);
    await page.getByRole('button', { name: String(answer), exact: true }).click();
    if (question < 10) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }
  await expect(page.getByRole('heading', { name: 'Training Finished!' })).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => window.ProfileManager.flush());

  const otherDevice = await browser.newContext();
  try {
    const otherPage = await otherDevice.newPage();
    await setupApp(otherPage);
    await loginAccount(otherPage, first.username, first.password);
    await expect(otherPage.locator('#header-stars-count')).toHaveText('10');
    await otherPage.getByRole('button', { name: /Enter Learning Hub/ }).click();
    await otherPage.getByText('Open Maths Masters Dojo', { exact: true }).click();
    await otherPage.getByRole('heading', { name: 'White Belt', exact: true }).click();
    await expect(otherPage.getByText('10 / 10', { exact: true }).first()).toBeVisible();

    await otherPage.locator('header button').filter({ has: otherPage.locator('#header-profile-name') }).click();
    await otherPage.getByRole('button', { name: 'Sign out' }).click();
    const second = await registerAccount(otherPage);
    expect(second.username).not.toBe(first.username);
    await expect(otherPage.locator('#header-stars-count')).toHaveText('0');
  } finally {
    await otherDevice.close();
  }
});