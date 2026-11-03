const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('plant cycle cards explain the stages and keyboard users can retry and complete', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await expect(page.getByRole('heading', { name: 'Plant Life Cycle', exact: true })).toHaveCount(1);
  await page.locator('[data-action="plant-life-cycle-start"]').click();
  await expect(page.locator('[data-cycle-stage-id]')).toHaveCount(6);

  await page.locator('[data-cycle-stage-id="germination"]').click();
  await expect(page.locator('#plant-life-cycle-fact')).toContainText('During germination, a root begins to grow');

  const incorrectOrder = [
    'seedling',
    'seed',
    'germination',
    'mature-flowering-plant',
    'fruit-and-seed-production',
    'seed-dispersal'
  ];
  for (const [positionIndex, stageId] of incorrectOrder.entries()) {
    const stage = page.locator(`[data-cycle-stage-id="${stageId}"]`);
    await stage.focus();
    await stage.press('Enter');
    const position = page.locator(`[data-cycle-position-index="${positionIndex}"]`);
    await position.focus();
    await position.press('Enter');
  }
  await page.locator('[data-action="plant-life-cycle-submit"]').click();
  await expect(page.locator('#plant-life-cycle-feedback')).toContainText(
    'After seed dispersal, a new cycle begins with Seed; Seedling belongs later.'
  );
  await expect(page.locator('#plant-life-cycle-feedback')).toContainText(
    'After Seed, Germination comes next, not Seed.'
  );
  await expect(page.locator('#plant-life-cycle-feedback')).toContainText(
    'After Germination, Seedling comes next, not Germination.'
  );

  for (const [stageId, positionIndex] of [['seed', 0], ['germination', 1], ['seedling', 2]]) {
    const stage = page.locator(`[data-cycle-stage-id="${stageId}"]`);
    await stage.focus();
    await stage.press('Enter');
    const position = page.locator(`[data-cycle-position-index="${positionIndex}"]`);
    await position.focus();
    await position.press('Enter');
  }
  await page.locator('[data-action="plant-life-cycle-submit"]').click();
  await expect(page.getByRole('heading', { name: 'Plant Life Cycle Complete!', exact: true })).toBeVisible();
  await expect(page.locator('#header-stars-count')).toHaveText('6');

  const activity = await page.evaluate(() => ({
    id: window.app.plantLifeCycleActivityEngine.definition.id,
    skillId: window.app.plantLifeCycleActivityEngine.definition.skillId,
    status: window.app.plantLifeCycleActivityEngine.status
  }));
  expect(activity).toEqual({
    id: 'science-plant-life-cycle-order',
    skillId: 'science_plant_life_cycle',
    status: 'complete'
  });
  await page.getByRole('button', { name: 'Return to Science Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
});

test('plant stages can be dragged and moved without duplicates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch devices use tap-to-place controls instead of native drag-and-drop.');
  await page.setViewportSize({ width: 1280, height: 1200 });
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="plant-life-cycle-start"]').click();
  const firstPosition = page.locator('[data-cycle-position-index="0"]');
  await firstPosition.scrollIntoViewIfNeeded();
  await page.locator('[data-cycle-stage-id="seed"]').dragTo(firstPosition);

  await expect(firstPosition).toContainText('Seed');
  await page.locator('[data-cycle-stage-id="seed"]').dragTo(page.locator('[data-cycle-position-index="3"]'));
  await expect(page.locator('[data-cycle-position-index="0"]')).toContainText('Empty');
  await expect(page.locator('[data-cycle-position-index="3"]')).toContainText('Seed');
  const placements = await page.evaluate(() => window.app.plantLifeCycleGame.placements);
  expect(placements.filter(stageId => stageId === 'seed')).toHaveLength(1);
});

test.describe('plant cycle touch placement', () => {
  test.use({ hasTouch: true });

  test('learners can tap each stage and its position', async ({ page }) => {
    await setupApp(page);
    await page.goto('/learning-centre/science');
    await page.locator('[data-action="plant-life-cycle-start"]').tap();

    const stageOrder = [
      'seed',
      'germination',
      'seedling',
      'mature-flowering-plant',
      'fruit-and-seed-production',
      'seed-dispersal'
    ];
    for (const [positionIndex, stageId] of stageOrder.entries()) {
      await page.locator(`[data-cycle-stage-id="${stageId}"]`).tap();
      await page.locator(`[data-cycle-position-index="${positionIndex}"]`).tap();
    }

    await page.locator('[data-action="plant-life-cycle-submit"]').tap();
    await expect(page.getByRole('heading', { name: 'Plant Life Cycle Complete!', exact: true })).toBeVisible();
  });
});
