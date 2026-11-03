const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

test('History & Discovery is linked from the subject card and survives route history and refresh', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre');
  await page.locator('[data-subject="history-discovery"]').getByRole('button', {
    name: 'Explore History & Discovery',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/learning-centre\/history$/);
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'history-discovery');
  await expect(page.getByRole('heading', { name: 'Travel Through Time', exact: true })).toBeVisible();
  await expect(page.locator('[data-action="history-timeline-start"]')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/learning-centre$/);
  await expect.poll(() => page.evaluate(() => window.app.currentView)).toBe('learning-centre');
  await page.goForward();
  await expect(page).toHaveURL(/\/learning-centre\/history$/);
  await expect.poll(() => page.evaluate(() => window.app.currentView)).toBe('history-discovery');

  await page.reload();
  await expect(page).toHaveURL(/\/learning-centre\/history$/);
  await expect(page.getByRole('heading', { name: 'Travel Through Time', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Back to Raven & Llama Learning Centre/ }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
});

test('Timeline Builder gives useful retry feedback and completes in chronological order', async ({ page }) => {
  await setupApp(page);
  await page.goto('/learning-centre/history');
  await page.locator('[data-action="history-timeline-start"]').click();
  await expect(page.getByRole('heading', { name: 'Timeline Builder', exact: true })).toBeVisible();
  await expect(page.locator('.history-event-card')).toHaveCount(6);
  await expect(page.locator('.history-timeline-slot')).toHaveCount(6);

  const orders = await page.evaluate(() => {
    const sorted = [...window.HISTORY_EVENT_DATA.events].sort((left, right) => left.sortYear - right.sortYear);
    return { correct: sorted.map(event => event.id), incorrect: sorted.reverse().map(event => event.id) };
  });
  await page.locator('[data-action="history-event-select"][data-event-id="early-writing"]').focus();
  await page.locator('[data-action="history-event-select"][data-event-id="early-writing"]').press('Enter');
  await expect(page.locator('#history-event-fact')).toContainText('Some of the earliest known writing');

  for (const [positionIndex, eventId] of orders.incorrect.entries()) {
    const card = page.locator(`[data-action="history-event-select"][data-event-id="${eventId}"]`);
    await card.focus();
    await card.press('Enter');
    const position = page.locator(`[data-action="history-timeline-place"][data-position-index="${positionIndex}"]`);
    await position.focus();
    await position.press('Enter');
  }
  await page.locator('[data-action="history-timeline-submit"]').click();
  await expect(page.locator('#history-timeline-feedback')).toContainText('Some events are out of order');
  await expect(page.locator('#history-timeline-feedback')).toContainText('Early farming communities');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();

  while (await page.locator('[data-action="history-timeline-remove"]').count()) {
    await page.locator('[data-action="history-timeline-remove"]').first().click();
  }
  for (const [positionIndex, eventId] of orders.correct.entries()) {
    const card = page.locator(`[data-action="history-event-select"][data-event-id="${eventId}"]`);
    await card.focus();
    await card.press('Enter');
    const position = page.locator(`[data-action="history-timeline-place"][data-position-index="${positionIndex}"]`);
    await position.focus();
    await position.press('Enter');
  }

  await page.locator('[data-action="history-timeline-submit"]').click();
  await expect(page.getByRole('heading', { name: 'Timeline Complete!', exact: true })).toBeVisible();
  await expect(page.locator('#history-timeline-feedback')).toContainText('The dates are approximate');
  await expect(page.locator('[data-history-position-index="0"]')).toContainText('about 10,000 years ago');
  await expect(page.locator('#header-stars-count')).toHaveText('6');
  const activity = await page.evaluate(() => ({
    id: window.app.historyTimelineActivityEngine.definition.id,
    skillId: window.app.historyTimelineActivityEngine.definition.skillId,
    status: window.app.historyTimelineActivityEngine.status
  }));
  expect(activity).toEqual({
    id: 'history-timeline-sequence',
    skillId: 'history_event_chronology',
    status: 'complete'
  });
  await page.getByRole('button', { name: 'Return to History & Discovery', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Travel Through Time', exact: true })).toBeVisible();
});

test('event cards can be dragged onto the timeline and placed events can be reordered', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Touch devices use tap-to-place controls instead of native drag-and-drop.');
  await setupApp(page);
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/learning-centre/history');
  await page.locator('[data-action="history-timeline-start"]').click();

  const eventIds = await page.evaluate(() =>
    window.app.historyTimelineGame.eventTray.slice(0, 3).map(event => event.id)
  );
  const [firstEventId, secondEventId, thirdEventId] = eventIds;
  const timelinePosition = index => page.locator(
    `[data-history-position-index="${index}"] .history-timeline-slot__place`
  );
  const eventSource = eventId => page.locator(`[data-history-drag-event-id="${eventId}"]`);

  await eventSource(firstEventId).dragTo(timelinePosition(0));
  await expect(timelinePosition(0)).toContainText(
    await page.evaluate(eventId => window.HistoryTimeline.eventById(eventId).title, firstEventId)
  );
  await eventSource(secondEventId).dragTo(timelinePosition(1));

  const firstTitle = await page.evaluate(eventId =>
    window.HistoryTimeline.eventById(eventId).title, firstEventId);
  const secondTitle = await page.evaluate(eventId =>
    window.HistoryTimeline.eventById(eventId).title, secondEventId);
  await eventSource(firstEventId).dragTo(timelinePosition(1));
  await expect(timelinePosition(0)).toContainText(secondTitle);
  await expect(timelinePosition(1)).toContainText(firstTitle);

  await eventSource(thirdEventId).dragTo(timelinePosition(1));
  const thirdTitle = await page.evaluate(eventId =>
    window.HistoryTimeline.eventById(eventId).title, thirdEventId);
  await expect(timelinePosition(1)).toContainText(thirdTitle);
  await expect(eventSource(firstEventId)).toBeVisible();
  await expect(page.locator('.history-timeline-count')).toHaveText('2 of 6 placed');
});
