const { expect, test } = require('@playwright/test');
const { chooseQuestionAnswer, openLearningHub, setupApp } = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('home starts with program choices and keeps mastery stats accessible', async ({ page }) => {
  await expect(page.locator('.home-brand-heading')).toHaveText('Raven & Llama');
  await expect(page.locator('#app-main[data-page="home"] .home-section-heading')).toBeVisible();
  await expect(page.locator('#app-main[data-page="home"] .home-hero')).toHaveCount(0);
  await expect(page.getByText('Achievements Archive', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Mastery Stats/ })).toBeVisible();
});

test('home hub cards align and the guest banner follows the active theme', async ({ page }) => {
  const cards = await page.locator('#app-main[data-page="home"] .home-hub-card').evaluateAll(elements =>
    elements.map(element => {
      const { width, height } = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { width, height, borderRadius: style.borderRadius, backgroundImage: style.backgroundImage };
    })
  );
  expect(cards).toHaveLength(2);
  expect(Math.abs(cards[0].width - cards[1].width)).toBeLessThanOrEqual(1);
  expect(Math.abs(cards[0].height - cards[1].height)).toBeLessThanOrEqual(1);
  expect(cards[0].borderRadius).toBe('24px');
  expect(cards[1].borderRadius).toBe('24px');
  cards.forEach(card => expect(card.backgroundImage).toContain('linear-gradient'));
  const leaderboard = page.locator('#app-main .home-leaderboard');
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await expect(leaderboard).toHaveCSS('border-radius', '20px');
  await expect(leaderboard).toHaveCSS('background-color', 'rgb(232, 239, 255)');

  const statusBanner = page.locator('#account-status-banner');
  const wordmarkAmp = page.locator('#app-main .brand-wordmark__amp').first();
  await expect(statusBanner).toBeVisible();
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await expect(statusBanner).toHaveCSS('background-color', 'rgb(231, 243, 233)');
  await expect(wordmarkAmp).toHaveCSS('color', 'rgb(183, 121, 0)');
  await page.evaluate(() => window.ProfileManager.applyTheme('dark'));
  await expect(statusBanner).toHaveCSS('background-color', 'rgb(25, 53, 40)');
  await expect(wordmarkAmp).toHaveCSS('color', 'rgb(250, 204, 21)');
  await expect(leaderboard).toHaveCSS('background-color', 'rgb(41, 61, 98)');
});

test('module brand kickers keep their descriptors visually separated on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLearningHub(page);
  await page.locator('[data-action="science-home"]').first().click();

  const getDescriptorGap = selector => page.locator(selector).evaluate(element => {
    const [brand, descriptor] = element.children;
    return descriptor.getBoundingClientRect().left - brand.getBoundingClientRect().right;
  });
  expect(await getDescriptorGap('.science-lab-badge')).toBeGreaterThanOrEqual(4);

  await page.locator('[data-action="learning"]').first().click();
  await page.locator('[data-action="dojo"]').first().click();
  expect(await getDescriptorGap('#app-main .module-eyebrow')).toBeGreaterThanOrEqual(4);
});

test('active module badge never sits beneath the navigation', async ({ page }) => {
  await page.setViewportSize({ width: 761, height: 900 });
  await openLearningHub(page);
  await page.locator('[data-action="science-home"]').first().click();

  for (const width of [761, 820, 900, 901, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const overlaps = await page.evaluate(() => {
      const badge = document.querySelector('.site-brand__badge').getBoundingClientRect();
      const nav = document.querySelector('.site-nav').getBoundingClientRect();
      return badge.width > 0 && badge.right > nav.left && badge.left < nav.right
        && badge.bottom > nav.top && badge.top < nav.bottom;
    });
    expect(overlaps).toBe(false);
  }
});

test('Games Hub lets players choose Critter Catch and play a round', async ({ page }) => {
  await page.locator('#nav-btn-games').click();
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
  await expect(page.getByRole('heading', { name: 'Programs & Spaces', exact: true })).toBeVisible();
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

  await page.locator('#nav-btn-learning').click();
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
    expect(cards).toHaveLength(4);
    cards.forEach(card => {
      expect(card.borderRadius).toBe('24px');
      expect(card.backgroundImage).toContain('linear-gradient');
    });
    expect(new Set(cards.map(card => card.backgroundImage)).size).toBe(4);
  };

  await expectColorfulRoundedCards();
  await expect(page.locator('#app-main section[aria-label="Learning Hub Leaderboard"]'))
    .toHaveCSS('border-radius', '20px');
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await expectColorfulRoundedCards();
});

test('learning heading is unframed and its actions share a row beneath it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLearningHub(page);
  await expect(page.locator('[data-action="parent-report"]')).toContainText('Progress');
  await expect(page.locator('[data-action="parent-report"]')).not.toContainText('Stats');

  const intro = page.locator('.learning-intro');
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCSS('background-image', 'none');
  await expect(intro).toHaveCSS('border-width', '0px');

  const buttons = await page.locator('.learning-intro__actions button').evaluateAll(elements =>
    elements.map(element => {
      const { x, y, width } = element.getBoundingClientRect();
      return { x, y, width };
    })
  );
  expect(buttons).toHaveLength(2);
  expect(Math.abs(buttons[0].y - buttons[1].y)).toBeLessThanOrEqual(1);
  expect(buttons[0].x + buttons[0].width).toBeLessThan(buttons[1].x);
});

test('Learning heading uses Unkempt throughout with a yellow ampersand', async ({ page }) => {
  await openLearningHub(page);
  const title = page.locator('.learning-intro__title');

  for (const [theme, expectedAmpColor] of [['light', 'rgb(183, 121, 0)'], ['dark', 'rgb(250, 204, 21)']]) {
    await page.evaluate(value => window.ProfileManager.applyTheme(value), theme);
    const styles = await title.evaluate(element => ({
      fonts: [element, ...element.querySelectorAll('*')].map(part => getComputedStyle(part).fontFamily),
      ampColor: getComputedStyle(element.querySelector('.brand-wordmark__amp')).color
    }));
    styles.fonts.forEach(font => expect(font).toContain('Unkempt'));
    expect(styles.ampColor).toBe(expectedAmpColor);
  }
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