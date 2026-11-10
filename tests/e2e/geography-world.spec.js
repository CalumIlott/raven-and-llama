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
  const countryCount = await page.evaluate(() => window.GEOGRAPHY_COUNTRY_DATA.countries.length);
  await expect(page.locator('.geography-map__region')).toHaveCount(countryCount);
  await expect(page.locator('.geography-country-option')).toHaveCount(countryCount);
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

test('world map shows full country context and keeps Pacific islands inside its border', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');

  const contextCountries = page.locator('.geography-map__context-country');
  await expect(contextCountries).toHaveCount(177);
  for (const name of [
    'Brazil',
    'Canada',
    'Russia',
    'South Africa',
    'Indonesia',
    'Philippines',
    'Papua New Guinea',
    'Solomon Islands',
    'Fiji',
    'New Zealand'
  ]) {
    await expect(page.locator(`.geography-map__context-country[data-world-country="${name}"]`)).toHaveCount(1);
  }

  const map = page.locator('#geography-world-map');
  await expect(map).toHaveAttribute('viewBox', '-8 -4 376 188');
  const edgeCountries = await page.locator(
    '.geography-map__region[data-country-id="fiji"], .geography-map__region[data-country-id="new-zealand"]'
  ).evaluateAll(regions => regions.map(region => {
    const { x, y, width, height } = region.getBBox();
    return { x, y, right: x + width, bottom: y + height };
  }));
  expect(edgeCountries).toHaveLength(2);
  for (const country of edgeCountries) {
    expect(country.x).toBeGreaterThan(-8);
    expect(country.y).toBeGreaterThan(-4);
    expect(country.right).toBeLessThan(368);
    expect(country.bottom).toBeLessThan(184);
  }
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
  const mapViewBox = (await page.locator('#geography-world-map').getAttribute('viewBox')).split(' ').map(Number);
  expect(mapViewBox[0]).toBeGreaterThanOrEqual(-8);
  expect(mapViewBox[1]).toBeGreaterThanOrEqual(-4);
  expect(mapViewBox[0] + mapViewBox[2]).toBeLessThanOrEqual(368);
  expect(mapViewBox[1] + mapViewBox[3]).toBeLessThanOrEqual(184);
  await expect(page.locator('#geography-map-zoom-status')).toContainText('Fiji');
  await page.getByRole('button', { name: 'Reset map view' }).click();
  await expect(page.locator('#geography-world-map')).toHaveAttribute('viewBox', '-8 -4 376 188');
});

test('zoomed map supports mouse panning without selecting a country', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');
  await page.getByLabel('Find a country').selectOption('germany');
  await page.getByRole('button', { name: 'Zoom in' }).click();

  const map = page.locator('#geography-world-map');
  await map.scrollIntoViewIfNeeded();
  const bounds = await map.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  const before = (await map.getAttribute('viewBox')).split(' ').map(Number);
  const startX = bounds.x + bounds.width / 2;
  const startY = bounds.y + bounds.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  expect(await page.evaluate(() => window.app.geographyMapPan)).toBeDefined();
  await page.mouse.move(startX + 48, startY - 24, { steps: 4 });
  const duringPan = (await map.getAttribute('viewBox')).split(' ').map(Number);
  await page.mouse.up();

  const after = (await map.getAttribute('viewBox')).split(' ').map(Number);
  expect(duringPan[0]).toBeLessThan(before[0]);
  expect(duringPan[1]).toBeGreaterThan(before[1]);
  expect(after).toEqual(duringPan);
  expect(after[0]).toBeGreaterThanOrEqual(-8);
  expect(after[1]).toBeGreaterThanOrEqual(-4);
  expect(after[0] + after[2]).toBeLessThanOrEqual(368);
  expect(after[1] + after[3]).toBeLessThanOrEqual(184);
  await expect(page.getByRole('heading', { name: 'Germany', exact: true })).toBeVisible();
});

test('zoomed map supports touch panning', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');
  await page.getByLabel('Find a country').selectOption('japan');
  await page.getByRole('button', { name: 'Zoom in' }).click();

  const viewBoxes = await page.locator('#geography-world-map').evaluate(map => {
    const bounds = map.getBoundingClientRect();
    const before = map.getAttribute('viewBox');
    const startX = bounds.left + bounds.width / 2;
    const startY = bounds.top + bounds.height / 2;
    const pointerEvent = (type, clientX, clientY) => new PointerEvent(type, {
      bubbles: true,
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      clientX,
      clientY
    });
    map.dispatchEvent(pointerEvent('pointerdown', startX, startY));
    map.dispatchEvent(pointerEvent('pointermove', startX + 36, startY + 18));
    map.dispatchEvent(pointerEvent('pointerup', startX + 36, startY + 18));
    return { before, after: map.getAttribute('viewBox') };
  });
  expect(viewBoxes.after).not.toBe(viewBoxes.before);
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
