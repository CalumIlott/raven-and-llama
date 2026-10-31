const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('navigation and account dialog support keyboard use on narrow screens', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.ProfileManager.getActiveProfile().stars = 17;
    window.app.updateHeader();
  });
  await page.getByRole('button', { name: 'Raven & Llama home' }).click();
  await expect(page.locator('#header-stars-count')).toHaveText('17');

  const expectNoHorizontalOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowedElements: [...document.querySelectorAll('body *')]
        .map(element => ({
          tag: element.tagName,
          id: element.id,
          className: typeof element.className === 'string' ? element.className : '',
          right: element.getBoundingClientRect().right
        }))
        .filter(element => element.right > document.documentElement.clientWidth)
    }));
    expect(dimensions.scrollWidth, JSON.stringify(dimensions.overflowedElements))
      .toBeLessThanOrEqual(dimensions.clientWidth);
  };

  await expectNoHorizontalOverflow();
  const learningLink = page.getByRole('link', { name: /Open Learning Academy/ });
  await learningLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning', exact: true })).toBeVisible();

  const mathsLink = page.getByRole('link', { name: /Open Maths Masters Dojo/ });
  await mathsLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow();

  const accountButton = page.locator('header button').filter({ has: page.locator('#header-profile-name') });
  await accountButton.focus();
  await page.keyboard.press('Enter');
  const accountDialog = page.getByRole('dialog', { name: 'Account' });
  const closeButton = page.getByRole('button', { name: 'Close account dialog' });
  await expect(accountDialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#account-submit-button')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(accountDialog).toBeHidden();
  await expect(accountButton).toBeFocused();
});