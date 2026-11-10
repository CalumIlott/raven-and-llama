const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

async function addMaterialWithKeyboard(page, materialId, slotIndex) {
  const material = page.locator(`[data-virtual-lab-material-id="${materialId}"]`);
  await material.focus();
  await material.press('Enter');
  const slot = page.locator(`[data-virtual-lab-slot-index="${slotIndex}"]`);
  await slot.focus();
  await slot.press('Enter');
}

test('virtual lab safely runs supported combinations and refuses unsupported ones', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await expect(page.getByRole('heading', { name: 'Virtual Laboratory', exact: true })).toHaveCount(1);
  await page.locator('[data-action="virtual-lab-start"]').click();
  await expect(page.getByRole('complementary', { name: 'Simulation notice' }))
    .toContainText('computer simulations, not real-world experiment instructions');

  await addMaterialWithKeyboard(page, 'ice', 0);
  await addMaterialWithKeyboard(page, 'water', 1);
  await page.locator('[data-action="virtual-lab-run"]').click();
  await expect(page.locator('#virtual-lab-result')).toContainText('No authored simulation for this pairing');
  await expect(page.locator('#virtual-lab-result')).toContainText('The items stay unchanged; no outcome is assumed.');
  await expect(page.locator('#header-stars-count')).toHaveText('0');
  await expect(page.locator('[data-action="virtual-lab-run"]')).toBeEnabled();

  await page.locator('[data-action="virtual-lab-reset"]').click();
  await expect(page.locator('[data-virtual-lab-slot-index="0"]')).toContainText('Empty');
  await addMaterialWithKeyboard(page, 'water', 0);
  await addMaterialWithKeyboard(page, 'sugar', 1);
  await page.locator('[data-action="virtual-lab-run"]').click();
  await expect(page.locator('#virtual-lab-result')).toContainText('Sugar dissolves');
  await expect(page.locator('#virtual-lab-result')).toContainText('The sugar has not vanished.');
  await expect(page.locator('#header-stars-count')).toHaveText('4');
  const firstResult = await page.evaluate(() => window.app.virtualLabGame.result);

  await page.locator('[data-action="virtual-lab-reset"]').click();
  await addMaterialWithKeyboard(page, 'sugar', 0);
  await addMaterialWithKeyboard(page, 'water', 1);
  await page.locator('[data-action="virtual-lab-run"]').click();
  const repeatedResult = await page.evaluate(() => window.app.virtualLabGame.result);
  expect(repeatedResult).toEqual(firstResult);
  await expect(page.locator('#virtual-lab-result')).toContainText('Sugar dissolves');
  await expect(page.locator('#header-stars-count')).toHaveText('4');

  const activity = await page.evaluate(() => ({
    id: window.app.virtualLabActivityEngine.definition.id,
    skillId: window.app.virtualLabActivityEngine.definition.skillId,
    status: window.app.virtualLabActivityEngine.status
  }));
  expect(activity).toEqual({
    id: 'science-virtual-lab',
    skillId: 'science_virtual_lab',
    status: 'complete'
  });
  await page.getByRole('button', { name: /Back to Science Lab/ }).click();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await page.evaluate(() => window.app.showParentOverview());
  const activityRows = page.locator('#parent-activity-stats-tbody');
  await expect(activityRows).toContainText('Virtual Laboratory');
  await expect(activityRows).toContainText('1 / 1 (100%)');
  await expect(activityRows).toContainText('Mastered');
});

test('virtual materials can be dragged into the workspace', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch devices use tap-to-place controls instead of native drag-and-drop.');
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  const firstSlot = page.locator('[data-virtual-lab-slot-index="0"]');
  await firstSlot.scrollIntoViewIfNeeded();
  await page.locator('[data-virtual-lab-material-id="water"]').dragTo(firstSlot);
  const secondSlot = page.locator('[data-virtual-lab-slot-index="1"]');
  await secondSlot.scrollIntoViewIfNeeded();
  await page.locator('[data-virtual-lab-material-id="sand"]').dragTo(secondSlot);

  await expect(firstSlot).toContainText('Water');
  await expect(secondSlot).toContainText('Sand');
  await page.locator('[data-action="virtual-lab-run"]').click();
  await expect(page.locator('#virtual-lab-result')).toContainText('Sand and water form a mixture');
});

test.describe('virtual lab touch controls', () => {
  test.use({ hasTouch: true });

  test('learners can tap materials and workspace slots to run a simulation', async ({ page }) => {
    await setupApp(page);
    await page.goto('/learning-centre/science');
    await page.locator('[data-action="virtual-lab-start"]').tap();
    await page.locator('[data-virtual-lab-material-id="ice"]').tap();
    await page.locator('[data-virtual-lab-slot-index="0"]').tap();
    await page.locator('[data-virtual-lab-material-id="warmth"]').tap();
    await page.locator('[data-virtual-lab-slot-index="1"]').tap();
    await page.locator('[data-action="virtual-lab-run"]').tap();

    await expect(page.locator('#virtual-lab-result')).toContainText('Ice melts');
    await expect(page.locator('#virtual-lab-result')).toContainText('solid ice changes into liquid water');
    await expect(page.locator('#header-stars-count')).toHaveText('4');
  });
});

test('virtual lab filters materials and links each authored result to its source', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  await expect(page.getByText('Explore 17 carefully authored outcomes')).toBeVisible();

  await page.getByRole('button', { name: 'Prepared mixtures' }).click();
  await expect(page.locator('[data-virtual-lab-material-id="salt-water"]')).toBeVisible();
  await expect(page.locator('[data-virtual-lab-material-id="vinegar"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'All items' }).click();

  await addMaterialWithKeyboard(page, 'baking-soda', 0);
  await addMaterialWithKeyboard(page, 'vinegar', 1);
  await page.locator('[data-action="virtual-lab-run"]').click();
  await expect(page.locator('#virtual-lab-result')).toContainText('Baking soda and vinegar produce carbon dioxide');
  await expect(page.locator('#virtual-lab-result a')).toHaveAttribute('href', 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter6/lesson2.html');
});
