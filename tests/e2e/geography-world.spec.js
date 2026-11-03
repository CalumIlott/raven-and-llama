const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Geography & The World route survives refresh and is linked from the subject card', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre');
  await page.locator('[data-subject="geography-world"]').getByRole('button', {
    name: 'Explore Geography & The World',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/learning-centre\/geography$/);
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'geography-world');
  await expect(page.getByRole('heading', { name: 'Our World', exact: true })).toBeVisible();
  await expect(page.locator('.geography-map__region')).toHaveCount(18);
  await expect(page.locator('.geography-country-option')).toHaveCount(18);
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  )).toBe(true);
  await page.goBack();
  await expect(page).toHaveURL(/\/learning-centre$/);
  await expect.poll(() => page.evaluate(() => window.app.currentView)).toBe('learning-centre');
  await page.goForward();
  await expect(page).toHaveURL(/\/learning-centre\/geography$/);
  await expect.poll(() => page.evaluate(() => window.app.currentView)).toBe('geography-world');

  await page.reload();
  await expect(page).toHaveURL(/\/learning-centre\/geography$/);
  await expect(page.getByRole('heading', { name: 'Our World', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canada', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Back to Raven & Llama Learning Centre/ }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
});

test('country map and list selection share facts and support keyboard activation', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');

  const franceMapRegion = page.locator('.geography-map__region[data-country-id="france"]');
  await franceMapRegion.focus();
  await franceMapRegion.press('Enter');
  await expect(page.getByRole('heading', { name: 'France', exact: true })).toBeVisible();
  await expect(page.locator('.geography-country-details')).toContainText('Capital: Paris');
  await expect(franceMapRegion).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Australia', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Australia', exact: true })).toBeVisible();
  await expect(page.locator('.geography-country-details')).toContainText('Capital: Canberra');
  await expect(page.locator('.geography-country-details')).toContainText('Great Barrier Reef');
  await expect(page.locator('.geography-map__region[data-country-id="australia"]')).toHaveAttribute('aria-pressed', 'true');
});

test('country markers align to their map outlines and picker zoom controls work', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');

  const misplacedCountries = await page.evaluate(() =>
    window.GEOGRAPHY_COUNTRY_DATA.countries
      .filter(country => {
        const region = document.querySelector(`.geography-map__region[data-country-id="${country.id}"]`);
        const point = new DOMPoint(...country.mapPoint);
        return !Array.from(region.querySelectorAll('path')).some(path => path.isPointInFill(point));
      })
      .map(country => country.id)
  );
  expect(misplacedCountries).toEqual([]);

  await page.getByLabel('Find a country').selectOption('fiji');
  await expect(page.getByRole('heading', { name: 'Fiji', exact: true })).toBeVisible();
  await expect(page.locator('#geography-country-picker')).toHaveValue('fiji');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(page.locator('#geography-world-map')).not.toHaveAttribute('viewBox', '0 0 360 180');
  await expect(page.locator('#geography-map-zoom-status')).toContainText('Fiji');
  await page.getByRole('button', { name: 'Reset map view' }).click();
  await expect(page.locator('#geography-world-map')).toHaveAttribute('viewBox', '0 0 360 180');
});

test('country facts can be spoken with a clear fallback when speech is unavailable', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');
  await page.evaluate(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: null });
  });

  await page.getByRole('button', { name: 'Listen to Canada facts', exact: true }).click();
  await expect(page.locator('#geography-speech-status')).toHaveText('Audio hints are not available in this browser.');
});
