const { expect, test } = require('@playwright/test');
const { openMathsDojo, setupApp } = require('./support');

test('Brown Belt fraction training shows a shaded mixed number and accepts its answer', async ({ page }) => {
  await setupApp(page);
  await openMathsDojo(page);
  await page.getByRole('heading', { name: 'Brown Belt', exact: true }).click();
  await page.locator('[data-action="skill-start"][data-skill-id="brown_fraction"]').click();

  await page.evaluate(() => {
    const game = window.gameEngine;
    game.questions[game.currentIndex] = {
      type: 'fraction_visual',
      title: 'Fraction Master',
      prompt: 'Write the shaded amount as a mixed number.',
      fractionMode: 'mixed',
      visualModel: 'fraction_circles',
      numerator: 7,
      denominator: 4,
      timeLimitSeconds: 30,
      answer: '1 3/4',
      options: ['1 3/4', '1 2/4', '1/4', '2 3/4']
    };
    game.renderCurrentQuestion();
  });

  await expect(page.getByText('Write the shaded amount as a mixed number.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Unit 1: 4 of 4 parts shaded' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Unit 2: 3 of 4 parts shaded' })).toBeVisible();
  const circleShading = page.locator('.fraction-circle__shading');
  await expect(circleShading).toHaveCount(2);
  await expect(circleShading.nth(0)).toHaveAttribute('fill', '#34d399');
  await expect(circleShading.nth(1)).toHaveAttribute('d', /A 42 42 0 1 1/);
  await expect(page.locator('.fraction-circle__base').first()).toHaveAttribute('fill', '#334155');
  expect(await page.locator('[role="img"][aria-label^="Unit "]').evaluateAll(elements =>
    elements.every(element => !element.hasAttribute('style'))
  )).toBe(true);
  await page.getByRole('button', { name: '1 3/4', exact: true }).click();
  await expect(page.locator('#feedback-banner')).toContainText('Correct!');
});
