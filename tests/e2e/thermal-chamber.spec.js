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
