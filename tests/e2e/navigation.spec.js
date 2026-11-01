const { expect, test } = require('@playwright/test');
const { chooseQuestionAnswer, openLearningHub, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('Games Hub lets players choose Critter Catch and play a round', async ({ page }) => {
  await page.getByRole('button', { name: 'Enter Games Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Games Hub', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Critter Catch' })).toHaveCount(0);

  await page.getByRole('button', { name: /Play Critter Catch/ }).click();
  await expect(page.locator('#critter-catch-title')).toBeVisible();

  await page.getByRole('button', { name: 'Play 30-second round' }).click();
  const score = page.locator('#critter-catch-score');
  await page.locator('#critter-catch-board button[aria-label="Empty burrow"]').first().click();
  await expect(page.locator('#critter-catch-board button.critter-catch-feedback-miss')).toHaveCount(1);
  for (let catchCount = 0; catchCount < 5; catchCount++) {
    const critter = page.locator('#critter-catch-board button[aria-label^="Catch the"]');
    await expect(critter).toBeVisible();
    await critter.click();
    if (catchCount === 0) {
      await expect(page.locator('#critter-catch-board button.critter-catch-feedback-catch')).toHaveCount(1);
    }
  }
  await expect(score).toHaveText('75');
  await expect(page.locator('#critter-catch-status')).toHaveText('Five in a row! Bonus points!');
  await expect(page.locator('#critter-catch-bonus')).toBeVisible();
  await expect(score).toHaveClass(/score-celebrate/);

  await page.getByRole('button', { name: 'Back to Games Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Play Critter Catch/ })).toBeVisible();

  await page.getByRole('button', { name: 'Back to Raven & Llama Home' }).click();
  await expect(page.getByRole('heading', { name: 'Raven & Llama', exact: true })).toBeVisible();
});

test('home counts, module navigation, and exam failure, retry, and pass gates work', async ({ page }) => {
  test.setTimeout(60000);

  const curriculum = await page.evaluate(() => ({
    belts: window.BELTS_DATA.length,
    skills: window.BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0)
  }));
  await expect(page.getByText(`${curriculum.belts} Belt Levels • ${curriculum.skills} Skills`, { exact: true })).toBeVisible();

  await openLearningHub(page);
  await expect(page.getByText(`${curriculum.skills} Skills`, { exact: true })).toBeVisible();
  await page.getByText('Open Maths Masters Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'White Belt', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Belt Examination Hall' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Show Me What You Know' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Complete Stage 1 to Unlock/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /View Missing Prerequisites/ })).toBeVisible();

  await page.getByRole('button', { name: /Take Stage 1 Exam/ }).click();
  await expect(page.getByRole('heading', { name: 'White Belt Stage 1: Show Me What You Know' })).toBeVisible();
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible();

  for (let question = 1; question <= 3; question++) {
    await chooseQuestionAnswer(page, false);
    await expect(page.locator('#feedback-banner')).toContainText('The correct answer was:');
    if (question < 3) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Test Incomplete' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Retry Test/ }).click();
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible();

  for (let question = 1; question <= 10; question++) {
    await chooseQuestionAnswer(page, question > 2);
    if (question < 10) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Stage 1 Test Passed!' })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#game-arena')).toContainText('8/10');
  await expect(page.locator('#game-arena')).toContainText('on Show Me What You Know!');
  await page.getByRole('button', { name: /Return to Dojo/ }).click();
  await expect(page.getByRole('button', { name: /Take Stage 2 Quiz/ })).toBeEnabled();
});

test('parent progress report and trophy room render their full states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Mastery Stats/ }).click();
  await expect(page.getByRole('dialog', { name: 'Mastery & Progress Report' })).toBeVisible();
  const skillCount = await page.evaluate(() => window.BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0));
  await expect(page.locator('#parent-stats-tbody tr')).toHaveCount(skillCount);
  const reportLayout = await page.locator('.parent-report-table-wrap').evaluate(element => ({
    overflowX: getComputedStyle(element).overflowX,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth
  }));
  expect(reportLayout.overflowX).toBe('auto');
  expect(reportLayout.scrollWidth).toBeGreaterThan(reportLayout.clientWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  await page.getByRole('button', { name: 'Close Report' }).click();

  await page.getByRole('button', { name: /Enter Learning Hub/ }).click();
  await page.getByRole('button', { name: /Trophy Room/ }).click();
  await expect(page.getByRole('heading', { name: "Guest's Trophy Hall" })).toBeVisible();
  await expect(page.getByText('No Grand Master certificates earned yet.')).toBeVisible();
});

test('learning hub uses colorful, rounded program cards', async ({ page }) => {
  await openLearningHub(page);

  const getCardStyles = () => page.locator('#learning-modules-grid > *').evaluateAll(elements =>
    elements.map(element => ({
      borderRadius: getComputedStyle(element).borderRadius,
      backgroundImage: getComputedStyle(element).backgroundImage
    }))
  );
  const expectColorfulRoundedCards = async () => {
    const cards = await getCardStyles();
    expect(cards).toHaveLength(5);
    cards.forEach(card => {
      expect(card.borderRadius).toBe('24px');
      expect(card.backgroundImage).toContain('linear-gradient');
    });
    expect(new Set(cards.map(card => card.backgroundImage)).size).toBe(5);
  };

  await expectColorfulRoundedCards();
  await expect(page.locator('#app-main section[aria-label="Learning Hub Leaderboard"]'))
    .toHaveCSS('border-radius', '20px');
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await expectColorfulRoundedCards();
});

test('Telling Time teaches analogue and digital clock matching', async ({ page }) => {
  await openLearningHub(page);
  await page.getByRole('button', { name: /Explore Telling Time/ }).click();
  await expect(page.getByRole('heading', { name: 'Telling Time', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Five-Minute Clock Match/ })).toBeVisible();

  await page.getByRole('button', { name: /Five-Minute Clock Match/ }).click();
  await expect(page.getByRole('heading', { name: 'What digital time does this clock show?' })).toBeVisible();
  await expect(page.locator('svg[aria-label^="Analogue clock showing"]')).toBeVisible();
  const answer = await page.evaluate(() => window.app.timeActivity.questions[0].answer);
  await page.locator(`[data-action="time-answer"][data-answer="${answer}"]`).click();
  await expect(page.locator('#app-main [role="status"]')).toContainText('Correct!');
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 10')).toBeVisible();

  await page.getByRole('button', { name: 'Activities' }).click();
  await page.getByRole('button', { name: /Digital to Analogue/ }).click();
  await expect(page.getByRole('heading', { name: 'Which analogue clock shows this time?' })).toBeVisible();
  await expect(page.locator('[data-action="time-answer"] svg')).toHaveCount(4);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
});

test('certificate text cannot create markup and mobile zoom remains available', async ({ page }) => {
  const certificateText = '<em data-injected>Injected markup</em>';
  await page.evaluate(value => {
    window.ProfileManager.getActiveProfile().certificates = [{
      beltName: value,
      date: value,
      score: value
    }];
    window.app.showTrophyRoom();
  }, certificateText);

  await expect(page.locator('#app-main em[data-injected]')).toHaveCount(0);
  await expect(page.locator('#app-main')).toContainText(`${certificateText} Mastery`);

  const accessibilitySettings = await page.evaluate(() => ({
    viewport: document.querySelector('meta[name="viewport"]').content,
    userSelect: getComputedStyle(document.body).userSelect
  }));
  expect(accessibilitySettings.viewport).not.toMatch(/maximum-scale|user-scalable=no/);
  expect(accessibilitySettings.userSelect).not.toBe('none');
});