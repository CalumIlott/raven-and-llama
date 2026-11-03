const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Science Lab route survives refresh and keeps Science Explorers available', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await expect(page).toHaveURL(/\/learning-centre\/science$/);
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'science-lab');
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await expect(page.locator('[data-action="science-home"]')).toBeVisible();
  await expect(page.locator('[data-action="solar-system-start"]')).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/learning-centre\/science$/);
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await page.locator('[data-action="science-home"]').click();
  await expect(page.getByRole('heading', { name: 'Science Explorers', exact: true })).toBeVisible();
  await expect(page.locator('[data-mission-id="orbit-rescue"][data-difficulty="easy"]')).toBeVisible();
});

test('planet tray starts in a shuffled order', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.evaluate(() => { Math.random = () => 0; });
  await page.locator('[data-action="solar-system-start"]').click();

  const trayOrder = await page.locator('[data-solar-planet-id]').evaluateAll(
    planets => planets.map(planet => planet.dataset.solarPlanetId)
  );
  expect(trayOrder).not.toEqual(['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']);
  expect(new Set(trayOrder).size).toBe(8);
});

test('planet order can be completed with keyboard and incorrect planets are identified', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="solar-system-start"]').click();
  await expect(page.getByRole('heading', { name: 'Build a Solar System', exact: true })).toBeVisible();
  await expect(page.locator('.solar-system-diagram')).toHaveAttribute('viewBox', '0 0 800 520');
  await expect(page.locator('figcaption')).toContainText('not to scale');
  await expect(page.locator('[data-action="solar-system-submit"]')).toBeDisabled();

  await page.locator('[data-solar-planet-id="earth"]').click();
  await expect(page.locator('#solar-system-fact')).toContainText('Earth is the third planet from the Sun');

  const incorrectOrder = ['venus', 'mercury', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  for (const [orbitIndex, planetId] of incorrectOrder.entries()) {
    const planet = page.locator(`[data-solar-planet-id="${planetId}"]`);
    await planet.focus();
    await planet.press('Enter');
    const orbit = page.locator(`[data-solar-orbit-index="${orbitIndex}"]`);
    await orbit.focus();
    await orbit.press('Enter');
  }
  await expect(page.locator('[data-action="solar-system-submit"]')).toBeEnabled();
  await page.locator('[data-action="solar-system-submit"]').click();
  await expect(page.locator('#solar-system-feedback')).toContainText('Orbit 1: Venus is here; Mercury belongs here.');
  await expect(page.locator('#solar-system-feedback')).toContainText('Orbit 2: Mercury is here; Venus belongs here.');

  await page.locator('[data-solar-planet-id="mercury"]').click();
  await page.locator('[data-solar-orbit-index="0"]').click();
  await page.locator('[data-solar-planet-id="venus"]').click();
  await page.locator('[data-solar-orbit-index="1"]').click();
  await page.locator('[data-action="solar-system-submit"]').click();

  await expect(page.getByRole('heading', { name: 'Solar System Complete!', exact: true })).toBeVisible();
  await expect(page.locator('#header-stars-count')).toHaveText('8');
  const activity = await page.evaluate(() => ({
    id: window.app.solarSystemActivityEngine.definition.id,
    skillId: window.app.solarSystemActivityEngine.definition.skillId,
    status: window.app.solarSystemActivityEngine.status
  }));
  expect(activity).toEqual({
    id: 'science-solar-system-order',
    skillId: 'science_solar_system_order',
    status: 'complete'
  });
  await page.getByRole('button', { name: 'Return to Science Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
});

test('planets can be dragged to orbit slots and moved without duplicates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch devices use tap-to-place controls instead of native drag-and-drop.');
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="solar-system-start"]').click();
  await page.locator('[data-solar-planet-id="mercury"]').dragTo(page.locator('[data-solar-orbit-index="0"]'));

  await expect(page.locator('[data-solar-orbit-index="0"]')).toContainText('Mercury');
  await page.locator('[data-solar-planet-id="mercury"]').dragTo(page.locator('[data-solar-orbit-index="1"]'));
  await expect(page.locator('[data-solar-orbit-index="0"]')).toContainText('Empty');
  await expect(page.locator('[data-solar-orbit-index="1"]')).toContainText('Mercury');
  const placements = await page.evaluate(() => window.app.solarSystemGame.placements);
  expect(placements.filter(planetId => planetId === 'mercury')).toHaveLength(1);
});

test.describe('touch placement', () => {
  test.use({ hasTouch: true });

  test('learners can tap a planet and an orbit slot', async ({ page }) => {
    await setupApp(page);
    await page.goto('/learning-centre/science');
    await page.locator('[data-action="solar-system-start"]').tap();
    await page.locator('[data-solar-planet-id="neptune"]').tap();
    await page.locator('[data-solar-orbit-index="7"]').tap();
    await expect(page.locator('[data-solar-orbit-index="7"]')).toContainText('Neptune');
    await expect(page.locator('#solar-system-fact')).toContainText('Neptune is the farthest planet');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const transition = await page.locator('[data-solar-planet-id="mercury"]').evaluate(element => getComputedStyle(element).transitionProperty);
    expect(transition).toBe('none');
  });
});
