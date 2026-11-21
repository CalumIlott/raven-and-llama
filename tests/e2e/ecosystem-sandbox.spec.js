const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('Pond Ecosystem Sandbox supports keyboard population changes and a five-day food-web challenge', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await setupApp(page);
  await page.goto('/learning-centre/science');
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Explore the Pond' }).click();

  await expect(page).toHaveURL('/learning-centre/science/ecosystem');
  await expect(page.getByRole('heading', { name: 'Pond Ecosystem Sandbox', exact: true })).toBeVisible();
  await expect(page.locator('.ecosystem-rules')).toContainText('simplified learning model');
  await expect(page.getByRole('heading', { name: 'Population over time' })).toBeVisible();
  const algaeTimeline = page.locator('.ecosystem-timeline__point--algae');
  await expect(algaeTimeline).toHaveCount(1);
  await expect(algaeTimeline.first()).toHaveAttribute('data-population', '12');

  const algaeCard = page.locator('.ecosystem-species--algae');
  const removeAlgae = algaeCard.getByRole('button', { name: 'Remove one algae group' });
  await removeAlgae.focus();
  await page.keyboard.press('Enter');
  await expect(algaeCard.locator('output')).toHaveText('11');
  await expect(algaeTimeline.first()).toHaveAttribute('data-population', '11');
  await expect(algaeCard.getByRole('button', { name: 'Remove one algae group' })).toBeFocused();

  for (let day = 0; day < 5; day += 1) {
    await page.getByRole('button', { name: 'Advance one day' }).click();
  }
  await expect(page.locator('#ecosystem-day-count')).toHaveText('5');
  await expect(algaeTimeline).toHaveCount(6);
  await expect(page.locator('#ecosystem-status')).toContainText('Goal reached!');
  await expect(page.locator('.ecosystem-goal-success')).toContainText('challenge complete');
  await expect(page.getByRole('button', { name: 'Advance one day' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.getByRole('button', { name: 'Reset pond' }).click();
  await expect(page.locator('#ecosystem-day-count')).toHaveText('0');
  await expect(algaeCard.locator('output')).toHaveText('12');
  await page.getByRole('button', { name: 'Back to Science Lab' }).click();
  await expect(page.getByRole('heading', { name: 'Science Lab', exact: true })).toBeVisible();
});

test('direct ecosystem route identifies an unstable population at the five-day checkpoint', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/science/ecosystem');
  await expect(page.getByRole('heading', { name: 'Pond Ecosystem Sandbox', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove one kingfisher group' }).click();

  for (let day = 0; day < 5; day += 1) {
    await page.getByRole('button', { name: 'Advance one day' }).click();
  }
  await expect(page.locator('#ecosystem-status')).toContainText('At least one group disappeared');
  await expect(page.locator('.ecosystem-goal-failure')).toContainText('Try again');
  await page.getByRole('button', { name: 'Reset pond' }).click();
  await expect(page.locator('.ecosystem-species--kingfishers output')).toHaveText('1');
});
