const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('parent dashboard header lock opens with keyboard and explains guest privacy', async ({ page }) => {
  const parentButton = page.getByRole('button', { name: 'Open Parent Dashboard' });
  await expect(parentButton).toBeVisible();
  await expect(parentButton).toHaveAttribute('aria-haspopup', 'dialog');
  await parentButton.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Parent Dashboard' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#parent-session-notice'))
    .toContainText('Guest view: this dashboard is not protected by parent sign-in');
  await page.getByRole('tab', { name: 'Learner settings' }).click();
  await expect(page.locator('#parent-dashboard-settings-panel')).toBeVisible();
  await expect(page.locator('#parent-session-notice')).toBeVisible();

  const layout = await dialog.evaluate(element => ({
    width: element.getBoundingClientRect().width,
    viewportWidth: document.documentElement.clientWidth
  }));
  expect(layout.width).toBeLessThanOrEqual(layout.viewportWidth);
});
