const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

function contrastRatio(foreground, background) {
  const luminance = color => {
    const channels = color.match(/\d+/g).slice(0, 3).map(channel => Number(channel) / 255);
    const linear = channels.map(channel => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((first, second) => second - first);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

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
  await expect(page.locator('#guest-theme')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(accountDialog).toBeHidden();
  await expect(accountButton).toBeFocused();
});

test('light-theme Science and Spelling cards keep accent text readable on mobile', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await page.locator('[data-action="learning"]').first().click();

  const expectNoHorizontalOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  };

  await page.locator('[data-action="science-home"]').click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'science');
  const scienceLabels = await page.locator('.science-mission-topic, .science-mission-reward').evaluateAll(elements =>
    elements.map(element => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(element.closest('button')).backgroundColor
    }))
  );
  expect(scienceLabels).toHaveLength(8);
  scienceLabels.forEach(label => expect(contrastRatio(label.color, label.background)).toBeGreaterThanOrEqual(4.5));
  await expectNoHorizontalOverflow();

  await page.locator('[data-action="learning"]').first().click();
  await page.locator('[data-action="spelling-home"]').click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'spelling');
  const spellingAction = await page.locator('.spelling-activity-action').first().evaluate(element => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element.closest('button')).backgroundColor
  }));
  expect(contrastRatio(spellingAction.color, spellingAction.background)).toBeGreaterThanOrEqual(4.5);
  await expectNoHorizontalOverflow();
});

test('Parent Report keeps keyboard focus inside its dialog on mobile', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const reportButton = page.getByRole('button', { name: /Mastery Stats/ });
  await reportButton.focus();
  await page.keyboard.press('Enter');

  const reportDialog = page.getByRole('dialog', { name: 'Mastery & Progress Report' });
  const headerClose = page.getByRole('button', { name: 'Close progress report' });
  const footerClose = page.getByRole('button', { name: 'Close Report' });
  await expect(reportDialog).toBeVisible();
  await expect(headerClose).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(footerClose).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(headerClose).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(reportDialog).toBeHidden();
  await expect(reportButton).toBeFocused();
});