const { expect, test } = require('@playwright/test');
const { loginAccount, openAccountModal, registerAccount, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('guest can choose a theme that persists across reloads', async ({ page }) => {
  await openAccountModal(page);
  await expect(page.locator('#guest-theme')).toHaveValue('light');

  await page.locator('#guest-theme').selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('#guest-theme')).toHaveValue('dark');
  expect(await page.evaluate(() => localStorage.getItem('raven_llama_guest_theme'))).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await openAccountModal(page);
  await expect(page.locator('#guest-theme')).toHaveValue('dark');
  await page.locator('#guest-theme').selectOption('light');
  await expect(page.locator('html')).toHaveClass(/theme-light/);
  expect(await page.evaluate(() => localStorage.getItem('raven_llama_guest_theme'))).toBe('light');
  expect(await page.evaluate(() => localStorage.getItem('raven_llama_profiles_cache_v5'))).toBeNull();
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

test('signed-in account can change avatar and keep it after reload', async ({ page }) => {
  const { username } = await registerAccount(page);
  await openAccountModal(page);
  await expect(page.locator('#account-avatar-options')).toBeHidden();
  await expect(page.locator('#account-avatar-current-name')).toHaveText('Raven');
  await expect(page.locator('#account-avatar-picker-current-icon img')).toHaveAttribute('src', 'assets/Raven%26Llama_Profile_Raven.jpg');
  await page.getByRole('button', { name: /Change/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose an avatar' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Raven' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Save avatar' })).toBeDisabled();
  await expect(page.locator('#account-avatar-options label')).toHaveCount(4);
  await expect(page.locator('#account-avatar-options label img')).toHaveCount(4);
  await page.locator('#account-avatar-options label').filter({ has: page.getByRole('radio', { name: 'Owl' }) }).click();
  await expect(page.getByRole('radio', { name: 'Owl' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save avatar' })).toBeEnabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('#account-avatar-open')).toBeFocused();
  await expect(page.locator('#account-avatar-current-name')).toHaveText('Raven');
  await page.getByRole('button', { name: /Change/ }).click();
  await page.locator('#account-avatar-options label').filter({ has: page.getByRole('radio', { name: 'Owl' }) }).click();
  const avatarSave = page.waitForResponse(response =>
    response.url().endsWith('/api/progress') && response.request().method() === 'PUT'
  );
  await page.getByRole('button', { name: 'Save avatar' }).click();
  const savedProgress = await avatarSave;
  expect(savedProgress.status()).toBe(200);
  expect((await savedProgress.json()).profile.avatar).toBe('owl');

  await expect(page.locator('#account-message')).toHaveText('Avatar updated.');
  await expect(page.locator('#account-avatar-picker')).toBeHidden();
  await expect(page.locator('#account-avatar-current-name')).toHaveText('Owl');
  await expect(page.locator('#header-profile-avatar img')).toHaveAttribute('src', 'assets/Raven%26Llama_Profile_Owl.jpg');
  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
  await expect(page.locator('#header-profile-avatar img')).toHaveAttribute('src', 'assets/Raven%26Llama_Profile_Owl.jpg');

  await openAccountModal(page);
  await expect(page.locator('#account-avatar-options')).toBeHidden();
  await expect(page.locator('#account-avatar-current-name')).toHaveText('Owl');
  await page.getByRole('button', { name: /Change/ }).click();
  await expect(page.getByRole('radio', { name: 'Owl' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save avatar' })).toBeDisabled();
});

test('signed-in learners save subject-specific year levels independently', async ({ page }) => {
  const { username } = await registerAccount(page);
  await openAccountModal(page);

  await expect(page.locator('#profile-school-year')).toHaveValue('3');
  await expect(page.locator('#subject-year-english')).toHaveValue('');
  await page.locator('#subject-year-maths').selectOption('4');
  await page.evaluate(() => window.ProfileManager.flush());
  await page.locator('#subject-year-science').selectOption('2');
  await page.evaluate(() => window.ProfileManager.flush());
  await page.locator('#profile-school-year').selectOption('5');
  await page.evaluate(() => window.ProfileManager.flush());

  await expect(page.locator('#subject-year-maths')).toHaveValue('4');
  await expect(page.locator('#subject-year-science')).toHaveValue('2');
  await expect(page.locator('#subject-year-english')).toHaveValue('');
  await expect(page.locator('#subject-year-english option:checked')).toHaveText('Use global default (Year 5)');

  await page.reload();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
  await openAccountModal(page);
  await expect(page.locator('#profile-school-year')).toHaveValue('5');
  await expect(page.locator('#subject-year-maths')).toHaveValue('4');
  await expect(page.locator('#subject-year-science')).toHaveValue('2');
  await expect(page.locator('#subject-year-english')).toHaveValue('');
});

test('subject years recommend tiered activity difficulty while explicit choices override it', async ({ page }) => {
  await registerAccount(page);
  await page.evaluate(async () => {
    const profile = window.ProfileManager.getActiveProfile();
    await window.ProfileManager.updateProfile({
      ...profile,
      schoolYear: 8,
      subjectYears: { maths: 4, science: 2 }
    });
    await window.ProfileManager.flush();
  });

  await page.goto('/learning-centre');
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();
  const moneyRecommended = page.locator('[data-action="money-start"][data-profile-recommended="true"]').first();
  await expect(moneyRecommended).toHaveAttribute('data-difficulty', 'medium');
  await moneyRecommended.click();
  await expect.poll(() => page.evaluate(() => window.app.moneyGame.difficulty)).toBe('medium');

  await page.locator('[data-action="learning-centre"]').click();
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();
  await page.locator('[data-action="money-start"][data-activity-id="coin-recognition"][data-difficulty="hard"]').click();
  await expect.poll(() => page.evaluate(() => window.app.moneyGame.difficulty)).toBe('hard');

  await page.locator('[data-action="learning-centre"]').click();
  await page.locator('#learning-modules-grid button[data-action="science-home"]').click();
  const scienceRecommended = page.locator('[data-action="science-start"][data-profile-recommended="true"]').first();
  await expect(scienceRecommended).toHaveAttribute('data-difficulty', 'easy');
  await scienceRecommended.click();
  await expect.poll(() => page.evaluate(() => window.app.scienceGame.difficulty)).toBe('easy');

  await page.locator('[data-action="learning-centre"]').click();
  await page.locator('#learning-modules-grid button[data-action="spelling-home"]').click();
  const spellingRecommended = page.locator('[data-action="spelling-start"][data-profile-recommended="true"]').first();
  await expect(spellingRecommended).toHaveAttribute('data-difficulty', 'hard');
  await spellingRecommended.click();
  await expect.poll(() => page.evaluate(() => window.app.spellingSafariGame.difficulty)).toBe('hard');
});

test('last module is restored on home load without overriding explicit routes or login context', async ({ page }) => {
  const account = await registerAccount(page);

  await page.locator('#nav-btn-learning').click();
  await page.getByText('Open Times Tables Dojo', { exact: true }).click();
  await expect(page).toHaveURL(/\/timetables$/);
  await page.evaluate(() => window.ProfileManager.flush());

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Times Tables Dojo' })).toBeVisible();

  await page.goto('/learning');
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning Centre', exact: true })).toBeVisible();
  await page.locator('header button').filter({ has: page.locator('#header-profile-name') }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();

  await page.goto('/dojo');
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await loginAccount(page, account.username, account.password);
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await page.evaluate(() => window.ProfileManager.flush());

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();

  await page.locator('header button').filter({ has: page.locator('#header-profile-name') }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.locator('#nav-btn-home').click();
  await expect(page.getByRole('heading', { name: 'Programs & Spaces', exact: true })).toBeVisible();
  await loginAccount(page, account.username, account.password);
  await expect(page.getByRole('heading', { name: 'Programs & Spaces', exact: true })).toBeVisible();

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
});

test('progress syncs to another browser context without exposing it to a different account', async ({ browser, page }) => {
  test.setTimeout(60000);
  const first = await registerAccount(page);

  await page.locator('#nav-btn-learning').click();
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
    await otherPage.locator('#nav-btn-learning').click();
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

test('theme preference syncs to another browser context for the signed-in account', async ({ browser, page }) => {
  const account = await registerAccount(page);
  await openAccountModal(page);
  await page.locator('#account-theme').selectOption('light');
  await page.evaluate(() => window.ProfileManager.flush());
  await expect(page.locator('html')).toHaveClass(/theme-light/);

  const otherDevice = await browser.newContext();
  try {
    const otherPage = await otherDevice.newPage();
    await setupApp(otherPage);
    await loginAccount(otherPage, account.username, account.password);
    await expect(otherPage.locator('html')).toHaveClass(/theme-light/);
    await openAccountModal(otherPage);
    await expect(otherPage.locator('#account-theme')).toHaveValue('light');
  } finally {
    await otherDevice.close();
  }
});