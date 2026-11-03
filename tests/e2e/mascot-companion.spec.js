const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('provides contextual help and a safe hint, then celebrates activity completion', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/history');

  const panel = page.locator('[data-mascot-panel]');
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).focus();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).press('Enter');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Welcome, time traveller!');
  await page.getByRole('button', { name: 'Hide companion' }).focus();
  await page.getByRole('button', { name: 'Hide companion' }).press('Enter');
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).focus();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).press('Enter');
  await expect(panel).toBeVisible();

  await page.evaluate(() => {
    window.mascotConfettiCalls = 0;
    window.confetti = () => { window.mascotConfettiCalls++; };
  });
  await page.locator('[data-action="history-timeline-start"]').click();
  await expect(page.locator('#app-main')).toContainText('Put these selected events in chronological order.');
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).click();
  await expect(page.locator('[data-mascot-title]')).toHaveText('Need a hand with Timeline Builder?');
  const hintButton = page.getByRole('button', { name: 'Get a hint' });
  await expect(hintButton).toBeVisible();
  await hintButton.focus();
  await hintButton.press('Enter');
  await expect(page.locator('[data-mascot-hint]')).toContainText(
    'Use the approximate dates as clues and look for the earliest event first.'
  );
  await page.getByRole('button', { name: 'Hide companion' }).click();
  await expect(panel).toBeHidden();

  const order = await page.evaluate(() =>
    [...window.HISTORY_EVENT_DATA.events]
      .sort((left, right) => left.sortYear - right.sortYear)
      .map(event => event.id)
  );
  for (const [positionIndex, eventId] of order.entries()) {
    await page.locator(`[data-action="history-event-select"][data-event-id="${eventId}"]`).click();
    await page.locator(`[data-action="history-timeline-place"][data-position-index="${positionIndex}"]`).click();
  }
  await page.locator('[data-action="history-timeline-submit"]').click();

  await expect(page.locator('[data-mascot-announcement]')).toContainText(
    'Great work. You completed Timeline Builder.'
  );
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).click();
  await expect(page.locator('[data-mascot-title]')).toHaveText('Amazing work!');
  await expect(page.locator('[data-mascot-message]')).toContainText('You completed Timeline Builder.');
  await expect.poll(() => page.evaluate(() => window.mascotConfettiCalls)).toBe(1);
  await page.getByRole('button', { name: 'Hide companion' }).click();
  await page.getByRole('button', { name: 'Return to History & Discovery', exact: true }).click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'history-discovery');
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).click();
  await expect(page.locator('[data-mascot-title]')).toHaveText('Welcome, time traveller!');
  await page.getByRole('button', { name: 'Hide companion' }).click();
  await page.locator('#app-main [data-action="home"]').click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'home');
  await page.getByRole('button', { name: 'Open Raven & Llama helper' }).click();
  await expect(page.locator('[data-mascot-title]')).toHaveText('Welcome, explorer!');
});

test('respects reduced motion when celebrating activity completion', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre');
  await expect(page.locator('[data-mascot-title]')).toHaveText('Welcome to the Learning Centre!');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    window.mascotConfettiCalls = 0;
    window.confetti = () => { window.mascotConfettiCalls++; };
    window.dispatchEvent(new CustomEvent('raven-llama:activity-completed', {
      detail: { id: 'reduced-motion-test', title: 'Reduced Motion Test' }
    }));
  });

  await expect(page.locator('[data-mascot-announcement]')).toContainText(
    'Great work. You completed Reduced Motion Test.'
  );
  await expect(page.locator('[data-mascot-title]')).toHaveText('Amazing work!');
  await expect(page.locator('[data-mascot-message]')).toContainText('You completed Reduced Motion Test.');
  await expect.poll(() => page.evaluate(() => window.mascotConfettiCalls)).toBe(0);
});
