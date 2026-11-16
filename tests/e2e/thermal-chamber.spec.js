const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

async function setTemperature(page, temperatureC) {
  await page.locator('#thermal-chamber-temperature').evaluate((input, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, temperatureC);
}

test('thermal chamber shows phase changes and condensation without requiring drag-only controls', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.getByRole('button', { name: 'Open Thermal Chamber' }).click();

  const temperature = page.locator('#thermal-chamber-temperature');
  const phase = page.locator('#thermal-chamber-phase');
  await expect(temperature).toHaveValue('20');
  await expect(phase).toHaveText('Liquid water');
  await setTemperature(page, -10);
  await expect(phase).toHaveText('Solid ice');
  await expect(page.locator('.thermal-particle--solid')).toHaveCount(16);
  await setTemperature(page, 0);
  await expect(phase).toContainText('Melting point');
  await setTemperature(page, 100);
  await expect(phase).toContainText('Boiling point');
  await setTemperature(page, 130);
  await expect(phase).toHaveText('Water vapour');
  await page.getByRole('button', { name: 'Close cool lid' }).click();
  await expect(page.locator('#thermal-chamber-lid-feedback')).toContainText('condenses into liquid droplets');
  await expect(page.locator('.thermal-condensation')).toContainText('💧');

  await setTemperature(page, 80);
  await expect(phase).toHaveText('Liquid water');
  await expect(page.locator('#thermal-chamber-lid-feedback')).toContainText('not enough water vapour');
  await expect(page.getByLabel('Model limits')).toContainText('not a real heater or experiment');
});

test('thermal chamber temperature remains operable through the mobile range control', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'This check specifically covers the mobile touch project.');
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.getByRole('button', { name: 'Open Thermal Chamber' }).tap();
  await page.locator('#thermal-chamber-temperature').fill('150');
  await expect(page.locator('#thermal-chamber-reading')).toHaveText('150°C');
  await expect(page.locator('#thermal-chamber-phase')).toHaveText('Water vapour');
  await page.getByRole('button', { name: 'Cool −10°C' }).tap();
  await expect(page.locator('#thermal-chamber-reading')).toHaveText('140°C');
});


test('particle model changes layout, moves, and stays informative with reduced motion', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.getByRole('button', { name: 'Open Thermal Chamber' }).click();

  const dots = page.locator('.thermal-particle');
  const positions = () => dots.evaluateAll(elements => elements.map(element => ({
    x: element.style.getPropertyValue('--particle-x'),
    y: element.style.getPropertyValue('--particle-y')
  })));
  await setTemperature(page, -20);
  const solid = await positions();
  await expect(page.locator('.thermal-particle--solid')).toHaveCount(16);
  await setTemperature(page, 20);
  const liquid = await positions();
  expect(liquid).not.toEqual(solid);
  await setTemperature(page, 0);
  await expect(page.locator('.thermal-particle--solid')).toHaveCount(8);
  await expect(page.locator('.thermal-particle--liquid')).toHaveCount(8);
  await setTemperature(page, 150);
  const gas = await positions();
  expect(gas).not.toEqual(liquid);
  const particle = dots.first();
  const before = await particle.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => particle.evaluate(element => getComputedStyle(element).transform)).not.toBe(before);
  await setTemperature(page, 100);
  await expect(page.locator('.thermal-particle--liquid')).toHaveCount(8);
  await expect(page.locator('.thermal-particle--gas')).toHaveCount(8);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setTemperature(page, -20);
  expect(await positions()).toEqual(solid);
  await expect(particle).toHaveCSS('animation-name', 'none');
  await setTemperature(page, 150);
  expect(await positions()).toEqual(gas);
});
