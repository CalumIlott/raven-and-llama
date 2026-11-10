const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

async function openFoodChains(page) {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await page.getByRole('button', { name: 'Explore Food Chains', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Build a Food Chain:/ })).toBeVisible();
}

async function placeWithKeyboard(page, organismId, positionIndex) {
  const organism = page.locator(`[data-food-chain-organism-id="${organismId}"]`);
  await organism.focus();
  await organism.press('Enter');
  const position = page.locator(`[data-food-chain-position-index="${positionIndex}"]`);
  await position.focus();
  await position.press('Enter');
}

async function arrangeWithKeyboard(page, organismIds) {
  for (const [positionIndex, organismId] of organismIds.entries()) {
    const currentId = await page.evaluate(
      index => window.app.foodChainsGame.placements[index],
      positionIndex
    );
    if (currentId !== organismId) {
      await placeWithKeyboard(page, organismId, positionIndex);
    }
  }
}

test('Food Chains opens from the refresh-safe Science Lab route', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explore Food Chains', exact: true })).toBeVisible();
  await expect(page.getByText('Build food chains from ten habitats; five different examples are selected for each round.')).toBeVisible();

  await page.getByRole('button', { name: 'Explore Food Chains', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Build a Food Chain:/ })).toBeVisible();
  const source = await page.evaluate(() => {
    const { sourceTitle, sourceUrl } = window.app.foodChainsGame.chains[0];
    return { sourceTitle, sourceUrl };
  });
  await expect(page.getByRole('link', { name: source.sourceTitle, exact: true })).toHaveAttribute(
    'href',
    source.sourceUrl
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explore Food Chains', exact: true })).toBeVisible();
});

test('keyboard learners can correct a food chain, complete all examples, and record progress once', async ({ page }) => {
  await openFoodChains(page);

  const incorrectOrder = await page.evaluate(() =>
    window.app.foodChainsGame.chains[0].organisms
      .map(organism => organism.id)
      .reverse()
  );
  for (const [positionIndex, organismId] of incorrectOrder.entries()) {
    await placeWithKeyboard(page, organismId, positionIndex);
  }
  await page.getByRole('button', { name: 'Check Food Chain', exact: true }).click();
  await expect(page.locator('#food-chains-feedback')).toContainText('Position');

  const chainCount = await page.evaluate(() => window.app.foodChainsGame.chains.length);
  expect(chainCount).toBe(5);
  for (let chainIndex = 0; chainIndex < chainCount; chainIndex++) {
    const organismIds = await page.evaluate(
      index => window.app.foodChainsGame.chains[index].organisms.map(organism => organism.id),
      chainIndex
    );
    await arrangeWithKeyboard(page, organismIds);
    await page.getByRole('button', { name: 'Check Food Chain', exact: true }).click();
    await expect(page.getByText('Correct food chain!', { exact: true })).toBeVisible();

    if (chainIndex < chainCount - 1) {
      await page.getByRole('button', { name: 'Next Food Chain', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Finish Food Chains', exact: true }).click();
    }
  }

  await expect(page.getByRole('heading', { name: 'Food Chains Complete!', exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({
    status: window.app.foodChainsActivityEngine.status,
    progressRecorded: window.app.foodChainsActivityEngine.progressRecorded,
    score: window.app.foodChainsActivityEngine.score
  }))).toEqual({ status: 'complete', progressRecorded: true, score: chainCount });
  await page.getByRole('button', { name: 'Return to Science Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
});

test.describe('touch Food Chains controls', () => {
  test.use({ hasTouch: true });

  test('learners can tap an organism and a position', async ({ page }) => {
    await openFoodChains(page);
    const producerId = await page.evaluate(() =>
      window.app.foodChainsGame.chains[0].organisms.find(organism => organism.role === 'producer').id
    );
    await page.locator(`[data-food-chain-organism-id="${producerId}"]`).tap();
    await page.locator('[data-food-chain-position-index="0"]').tap();
    const producer = await page.evaluate(() => window.app.foodChainsGame.chains[0].organisms[0]);
    await expect(page.locator('[data-food-chain-position-index="0"]')).toContainText(producer.name);
    await expect(page.locator('#food-chains-fact')).toContainText(producer.fact);
  });
});

test('organisms can be dragged into positions with shared drag feedback', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch devices use tap-to-place controls instead of native drag-and-drop.');
  await page.setViewportSize({ width: 1280, height: 1200 });
  await openFoodChains(page);

  const producerId = await page.evaluate(() =>
    window.app.foodChainsGame.chains[0].organisms.find(organism => organism.role === 'producer').id
  );
  const producerName = await page.evaluate(() =>
    window.app.foodChainsGame.chains[0].organisms.find(organism => organism.role === 'producer').name
  );
  const grass = page.locator(`[data-food-chain-organism-id="${producerId}"]`);
  const firstPosition = page.locator('[data-food-chain-position-index="0"]');
  const dragFeedback = page.evaluate(() => new Promise(resolve => {
    document.addEventListener('dragstart', event => {
      const source = event.target.closest('[draggable="true"]');
      const onDragOver = dragEvent => {
        const target = dragEvent.target.closest('[data-drag-drop-target]');
        if (!target) return;
        document.removeEventListener('dragover', onDragOver);
        resolve({
          sourceIsDragging: source.classList.contains('activity-drag-source'),
          targetIsHighlighted: target.classList.contains('activity-drop-target'),
          dropEffect: dragEvent.dataTransfer.dropEffect
        });
      };
      document.addEventListener('dragover', onDragOver);
    }, { once: true });
  }));
  await grass.dragTo(firstPosition);

  expect(await dragFeedback).toEqual({
    sourceIsDragging: true,
    targetIsHighlighted: true,
    dropEffect: 'move'
  });
  await expect(firstPosition).toContainText(producerName);
});
