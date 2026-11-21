const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Set the Clock supports mouse dragging, proportional hour movement, and keyboard setting', async ({ page }) => {
  await setupApp(page);
  await page.goto('/telling-time');
  await page.getByRole('button', { name: 'Set the Clock' }).click();

  const map = page.locator('.time-clock--interactive');
  await expect(map).toBeVisible();
  const bounds = await map.boundingBox();
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  await page.mouse.move(centerX, centerY - bounds.height * 0.34);
  await page.mouse.down();
  await page.mouse.move(centerX + bounds.width * 0.34, centerY, { steps: 5 });
  await page.mouse.up();

  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 12:15.');
  await expect(page.locator('#time-clock-hour-hand')).toHaveAttribute('transform', 'rotate(7.5 100 100)');

  await page.locator('#time-clock-minute-hand').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 12:10.');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 12:00.');

  const target = await page.locator('[aria-label^="Target time "]').getAttribute('aria-label');
  const [, targetHour, targetMinute] = target.match(/Target time (\d{1,2}):(\d{2})/);
  await page.locator('#time-clock-hour-hand').focus();
  for (let index = 0; index < (Number(targetHour) % 12); index++) await page.keyboard.press('ArrowUp');
  await page.locator('#time-clock-minute-hand').focus();
  for (let index = 0; index < Number(targetMinute) / 5; index++) await page.keyboard.press('ArrowUp');
  await expect(page.locator('#time-clock-current')).toHaveText(`Your clock shows ${targetHour}:${targetMinute}.`);
  await page.getByRole('button', { name: 'Check my clock' }).click();
  await expect(page.locator('.educational-feedback')).toContainText('Correct! Great time telling!');
});

test('Set the Clock is touch accessible on mobile and minute rollover advances the hour', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupApp(page);
  await page.goto('/telling-time');
  await page.getByRole('button', { name: 'Set the Clock' }).click();
  await expect(page.locator('#time-clock-minute-hand')).toBeAttached();
  await expect(page.locator('#time-clock-hour-hand')).toBeAttached();
  expect(await page.locator('#time-clock-minute-hand').evaluate(hand => hand.getBBox().height)).toBeGreaterThan(0);
  expect(await page.locator('#time-clock-hour-hand').evaluate(hand => hand.getBBox().height)).toBeGreaterThan(0);

  await page.locator('#time-clock-minute-hand').evaluate(hand => {
    const svg = hand.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const event = (type, x, y) => new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch',
      isPrimary: true, button: 0, clientX: x, clientY: y
    });
    hand.dispatchEvent(event('pointerdown', centerX, centerY - rect.height * 0.34));
    hand.dispatchEvent(event('pointermove', centerX + rect.width * 0.34, centerY));
    hand.dispatchEvent(event('pointerup', centerX + rect.width * 0.34, centerY));
  });
  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 12:15.');

  await page.locator('#time-clock-minute-hand').focus();
  for (let index = 0; index < 8; index++) await page.keyboard.press('ArrowUp');
  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 12:55.');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#time-clock-current')).toHaveText('Your clock shows 1:00.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
