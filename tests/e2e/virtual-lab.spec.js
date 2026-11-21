const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('guided bubbling investigation supports keyboard steps and a reversible notebook', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  await page.getByRole('button', { name: 'Guided investigation: What makes bubbles?' }).click();
  await expect(page.getByRole('button', { name: 'I predict bubbles', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const pour = page.getByRole('button', { name: 'Pour virtual vinegar' });
  await expect(pour).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /Place selected material in beaker; contains vinegar/ })).toBeVisible();
  await expect(page.locator('.lab-investigation-liquid')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.lab-investigation-liquid')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('button', { name: 'Add virtual baking soda' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-virtual-lab-scene="bubbles"]')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Investigation notebook' })).toContainText('gas, not smoke');
  await expect(page.getByRole('button', { name: 'Reset investigation' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'I predict bubbles', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Back to free exploration' }).click();
  await expect(page.getByRole('heading', { name: 'Virtual Laboratory', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guided investigation: What makes bubbles?' })).toBeFocused();
});

async function addMaterialWithKeyboard(page, materialId, slotIndex) {
  const material = page.locator(`[data-virtual-lab-material-id="${materialId}"]`);
  await material.focus();
  await material.press('Enter');
  await expect(material).toBeFocused();
  const slot = page.locator(`[data-virtual-lab-slot-index="${slotIndex}"]`);
  await slot.focus();
  await slot.press('Enter');
  await expect(slot).toBeFocused();
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
  await expect(page.locator('[data-virtual-lab-scene="dissolving"]')).toBeVisible();
  const sceneAnimation = await page.locator('[data-virtual-lab-scene="dissolving"] .virtual-lab-scene__solute').first().evaluate(element => getComputedStyle(element).animationName);
  expect(sceneAnimation).toBe('virtual-lab-dissolve');
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
  await expect(activityRows).toContainText('Not measured');
  await expect(activityRows).toContainText('Completed');
  await expect(activityRows).not.toContainText('Mastered');
});

test('virtual lab scenes respect reduced motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  await addMaterialWithKeyboard(page, 'water', 0);
  await addMaterialWithKeyboard(page, 'sugar', 1);
  await page.locator('[data-action="virtual-lab-run"]').click();
  const animationName = await page.locator('[data-virtual-lab-scene="dissolving"] .virtual-lab-scene__solute').first()
    .evaluate(element => getComputedStyle(element).animationName);
  expect(animationName).toBe('none');
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

test('guided lab materials can be placed in the beaker with keyboard and touch', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  await page.getByRole('button', { name: 'Guided investigation: What makes bubbles?' }).click();
  await page.getByRole('button', { name: 'I predict bubbles' }).click();
  const vinegar = page.getByRole('button', { name: 'Select virtual vinegar bottle' });
  await vinegar.focus();
  await page.keyboard.press('Enter');
  const beaker = page.getByRole('button', { name: /Place selected material in beaker/ });
  await expect(beaker).toBeFocused();
  await page.keyboard.press('Enter');
  const soda = page.getByRole('button', { name: 'Select virtual baking soda jar' });
  await expect(soda).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(beaker).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Investigation notebook' })).toContainText('bubbles');
});

test('guided lab materials can be dragged onto the beaker', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch uses select and place.');
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.locator('[data-action="virtual-lab-start"]').click();
  await page.getByRole('button', { name: 'Guided investigation: What makes bubbles?' }).click();
  await page.getByRole('button', { name: 'I predict bubbles' }).click();
  async function dragMaterial(name) {
    const bench = page.locator('.lab-investigation-bench');
    await bench.scrollIntoViewIfNeeded();
    const source = await page.getByRole('button', { name }).boundingBox();
    const target = await page.getByRole('button', { name: /Place selected material in beaker/ }).boundingBox();
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
    await page.mouse.up();
  }
  await dragMaterial('Select virtual vinegar bottle');
  await expect(page.locator('.lab-investigation-liquid')).toBeVisible();
  await dragMaterial('Select virtual baking soda jar');
  await expect(page.getByRole('region', { name: 'Investigation notebook' })).toContainText('gas, not smoke');
});

test.describe('guided lab touch placement', () => {
  test.use({ hasTouch: true });
  test('touch users place both materials without a drag', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await setupApp(page);
    await page.goto('/learning-centre/science');
    await page.locator('[data-action="virtual-lab-start"]').tap();
    await page.getByRole('button', { name: 'Guided investigation: What makes bubbles?' }).tap();
    await page.getByRole('button', { name: 'I predict no visible change' }).tap();
    expect(await page.locator('.lab-investigation-apparatus').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2);
    await page.getByRole('button', { name: 'Select virtual vinegar bottle' }).tap();
    await page.getByRole('button', { name: /Place selected material in beaker/ }).tap();
    await page.getByRole('button', { name: 'Select virtual baking soda jar' }).tap();
    await page.getByRole('button', { name: /Place selected material in beaker/ }).tap();
    await expect(page.getByRole('region', { name: 'Investigation notebook' })).toContainText('no visible change');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
