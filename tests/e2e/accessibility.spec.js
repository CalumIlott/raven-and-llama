const { expect, test } = require('@playwright/test');
const {
  openAccountModal,
  openLearningCentre,
  openMathsDojo,
  openTimesTables,
  registerAccount,
  setupApp
} = require('./support');

function contrastRatio(foreground, background) {
  const luminance = color => {
    const channels = color.match(/\d+/g).slice(0, 3).map(channel => Number(channel) / 255);
    const linear = channels.map(channel => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((first, second) => second - first);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function findTextContrastFailures(page) {
  return page.locator('#app-main').evaluate(root => {
    const parseColor = value => {
      if (value.startsWith('oklch(') || value.startsWith('oklab(')) {
        const channels = value.match(/-?[\d.]+/g);
        if (!channels || channels.length < 3) return null;
        const lightness = Number(channels[0]);
        const isOklch = value.startsWith('oklch(');
        const a = isOklch
          ? Number(channels[1]) * Math.cos(Number(channels[2]) * Math.PI / 180)
          : Number(channels[1]);
        const b = isOklch
          ? Number(channels[1]) * Math.sin(Number(channels[2]) * Math.PI / 180)
          : Number(channels[2]);
        const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
        const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
        const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
        const linearChannels = [
          4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
        ];
        return [
          ...linearChannels.map(channel => {
            const value = channel <= 0.0031308
              ? 12.92 * channel
              : 1.055 * Math.max(0, channel) ** (1 / 2.4) - 0.055;
            return Math.max(0, Math.min(255, value * 255));
          }),
          channels.length > 3 ? Number(channels[3]) : 1
        ];
      }
      const channels = value.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return null;
      return [
        Number(channels[0]),
        Number(channels[1]),
        Number(channels[2]),
        channels.length > 3 ? Number(channels[3]) : 1
      ];
    };
    const composite = (foreground, background) => {
      const alpha = foreground[3];
      return [
        foreground[0] * alpha + background[0] * (1 - alpha),
        foreground[1] * alpha + background[1] * (1 - alpha),
        foreground[2] * alpha + background[2] * (1 - alpha),
        1
      ];
    };
    const luminance = color => {
      const channels = color.slice(0, 3).map(channel => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const ratio = (first, second) => {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const bodyBackground = parseColor(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const failures = [];

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const element = textNode.parentElement;
      const text = textNode.textContent.trim();
      if (!text || !element || element.closest('[aria-hidden="true"], .sr-only, :disabled')) continue;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) continue;

      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const ancestry = [];
      for (let current = element; current && current !== document.body; current = current.parentElement) {
        ancestry.unshift(current);
      }

      let backgrounds = [bodyBackground];
      let unsupportedBackgroundImage = null;
      for (const current of ancestry) {
        const currentStyle = getComputedStyle(current);
        const color = parseColor(currentStyle.backgroundColor);
        if (color && color[3] > 0) {
          backgrounds = backgrounds.map(background => composite(color, background));
        }
        if (currentStyle.backgroundImage !== 'none') {
          const gradientColors = [...currentStyle.backgroundImage.matchAll(/(?:rgb|rgba|oklab|oklch)\([^)]+\)/g)]
            .map(match => parseColor(match[0]))
            .filter(Boolean);
          if (!gradientColors.length) {
            unsupportedBackgroundImage = currentStyle.backgroundImage;
          } else {
            backgrounds = gradientColors.flatMap(gradientColor =>
              backgrounds.map(background => composite(gradientColor, background))
            );
          }
        }
      }

      let opacity = 1;
      for (let current = element; current; current = current.parentElement) {
        opacity *= Number(getComputedStyle(current).opacity);
      }
      if (opacity < 0.01) continue;
      const foreground = parseColor(style.color);
      if (!foreground) continue;
      foreground[3] *= opacity;
      const contrastSamples = backgrounds.map(background => ({
        contrast: ratio(composite(foreground, background), background),
        background
      }));
      const worstSample = contrastSamples.reduce((worst, sample) =>
        sample.contrast < worst.contrast ? sample : worst
      );
      const contrast = worstSample.contrast;
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseInt(style.fontWeight, 10);
      const minimum = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
      if (unsupportedBackgroundImage || contrast + 0.01 < minimum) {
        failures.push({
          text: text.slice(0, 50),
          contrast: Number(contrast.toFixed(2)),
          minimum,
          foreground: style.color,
          background: `rgb(${worstSample.background.slice(0, 3).map(Math.round).join(', ')})`,
          ...(unsupportedBackgroundImage ? { unsupportedBackgroundImage } : {})
        });
      }
    }

    return failures;
  });
}

test('navigation and account dialog support keyboard use on narrow screens', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.ProfileManager.getActiveProfile().stars = 17;
    window.app.updateHeader();
  });
  await page.getByRole('button', { name: 'Raven & Llama home' }).click();
  await expect(page.locator('#header-stars-count')).toHaveText('17');

  const expectNoHorizontalOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowedElements: [...document.querySelectorAll('body *')]
        .map(element => ({
          tag: element.tagName,
          id: element.id,
          className: typeof element.className === 'string' ? element.className : '',
          right: element.getBoundingClientRect().right
        }))
        .filter(element => element.right > document.documentElement.clientWidth)
    }));
    expect(dimensions.scrollWidth, JSON.stringify(dimensions.overflowedElements))
      .toBeLessThanOrEqual(dimensions.clientWidth);
  };

  await expectNoHorizontalOverflow();
  const learningLink = page.getByRole('link', { name: /Open Learning Academy/ });
  await learningLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning Centre', exact: true })).toBeVisible();

  const mathsLink = page.getByRole('link', { name: /Open Maths Masters Dojo/ });
  await mathsLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow();

  const accountButton = page.locator('header button').filter({ has: page.locator('#header-profile-name') });
  await accountButton.focus();
  await page.keyboard.press('Enter');
  const accountDialog = page.getByRole('dialog', { name: 'Account' });
  const closeButton = page.getByRole('button', { name: 'Close account dialog' });
  const lastFocusable = accountDialog.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ).filter({ visible: true }).last();
  await expect(accountDialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(lastFocusable).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(accountDialog).toBeHidden();
  await expect(accountButton).toBeFocused();
});

test('light-theme Science and Spelling cards keep accent text readable on mobile', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await page.locator('[data-action="learning-centre"]').first().click();

  const expectNoHorizontalOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  };

  await page.locator('[data-action="science-lab"]').click();
  await page.locator('[data-action="science-home"]').click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'science');
  const scienceLabBadge = await page.locator('.science-lab-badge').evaluate(element => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
    borderWidth: getComputedStyle(element).borderWidth
  }));
  expect(scienceLabBadge.background).toBe('rgba(0, 0, 0, 0)');
  expect(scienceLabBadge.borderWidth).toBe('0px');
  ['rgb(201, 232, 244)', 'rgb(188, 231, 215)', 'rgb(230, 233, 166)'].forEach(background => {
    expect(contrastRatio(scienceLabBadge.color, background)).toBeGreaterThanOrEqual(4.5);
  });
  const scienceLabels = await page.locator('.science-mission-topic, .science-mission-reward').evaluateAll(elements =>
    elements.map(element => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(element.closest('.science-mission-card')).backgroundColor
    }))
  );
  expect(scienceLabels).toHaveLength(8);
  scienceLabels.forEach(label => expect(contrastRatio(label.color, label.background)).toBeGreaterThanOrEqual(4.5));
  await expectNoHorizontalOverflow();

  await page.locator('[data-action="learning-centre"]').first().click();
  await page.locator('[data-action="spelling-home"]').click();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'spelling');
  const spellingAction = await page.locator('.spelling-activity-action').first().evaluate(element => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element.closest('.spelling-activity-card')).backgroundColor
  }));
  expect(contrastRatio(spellingAction.color, spellingAction.background)).toBeGreaterThanOrEqual(4.5);
  await expectNoHorizontalOverflow();
});

test('light-theme action buttons retain readable contrast across views', async ({ page }) => {
  await setupApp(page);
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));

  const expectReadableButtons = async selector => {
    const buttons = await page.locator(selector).evaluateAll(elements => elements.map(element => ({
      foreground: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor
    })));
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => expect(contrastRatio(button.foreground, button.background)).toBeGreaterThanOrEqual(4.5));
  };

  await expectReadableButtons('#app-main .home-stats-link');
  await openTimesTables(page);
  await expectReadableButtons('#app-main button[data-action="times-table-quiz"], #app-main button[data-action="endless-timetables"], #app-main button[data-action="times-table-arcade"]');

  await registerAccount(page);
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await openAccountModal(page);
  const deleteButtonColors = await page.locator('#delete-account-toggle').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element.closest('.account-dialog')).backgroundColor
  }));
  expect(contrastRatio(deleteButtonColors.foreground, deleteButtonColors.background)).toBeGreaterThanOrEqual(4.5);
  await page.locator('#delete-account-toggle').click();
  await expectReadableButtons('#delete-account-confirmation button[type="submit"]');
});

test('active Science and Spelling rounds fit mobile light theme with readable feedback', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await page.getByRole('button', { name: 'Raven & Llama home' }).click();
  await page.locator('[data-action="learning-centre"]').first().click();
  await page.getByText('Explore Science Lab', { exact: true }).click();
  await page.locator('[data-action="science-home"]').click();
  await page.locator('[data-mission-id="orbit-rescue"][data-difficulty="medium"]').click();

  const expectNoHorizontalOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  };

  await expect(page.locator('.play-shell--science')).toBeVisible();
  await expectNoHorizontalOverflow();
  const scienceAnswer = await page.evaluate(() => window.app.scienceGame.mission.questions[0].answer);
  await page.locator(`[data-science-choice="${scienceAnswer}"]`).click();
  const scienceColors = await page.locator('.science-feedback').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor
  }));
  expect(contrastRatio(scienceColors.foreground, scienceColors.background)).toBeGreaterThanOrEqual(4.5);

  await page.locator('[data-action="science-home"]').click();
  await page.locator('[data-action="learning-centre"]').first().click();
  await page.getByRole('button', { name: /Spelling Safari/ }).click();
  await page.locator('[data-activity-id="spelling-sprint"][data-difficulty="medium"]').click();
  await expect(page.locator('.play-shell--spelling')).toBeVisible();
  await expectNoHorizontalOverflow();
  const spellingAnswer = await page.evaluate(() => window.app.spellingSafariGame.questions[0].answer);
  await page.getByRole('button', { name: spellingAnswer, exact: true }).click();
  const spellingColors = await page.locator('.spelling-feedback').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor
  }));
  expect(contrastRatio(spellingColors.foreground, spellingColors.background)).toBeGreaterThanOrEqual(4.5);
});

test('Science Explorers success message has readable contrast in dark theme', async ({ page }) => {
  await setupApp(page);
  await page.evaluate(() => window.ProfileManager.applyTheme('dark'));
  await page.locator('#nav-btn-learning').click();
  await page.getByText('Explore Science Lab', { exact: true }).click();
  await page.locator('[data-action="science-home"]').click();
  await page.locator('[data-mission-id="orbit-rescue"][data-difficulty="medium"]').click();

  const scienceAnswer = await page.evaluate(() => window.app.scienceGame.mission.questions[0].answer);
  await page.locator(`[data-science-choice="${scienceAnswer}"]`).click();

  const messageColors = await page.locator('.science-feedback > p.font-bold').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element.parentElement).backgroundColor
  }));
  expect(contrastRatio(messageColors.foreground, messageColors.background)).toBeGreaterThanOrEqual(7);

  const detailColors = await page.locator('.science-feedback > p:not(.font-bold)').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element.parentElement).backgroundColor
  }));
  expect(contrastRatio(detailColors.foreground, detailColors.background)).toBeGreaterThanOrEqual(4.5);
});

test('light-theme Maths timer tones and order slots retain readable contrast', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.ProfileManager.applyTheme('light'));
  await openMathsDojo(page);
  await page.getByRole('heading', { name: 'White Belt', exact: true }).click();
  await page.getByRole('button', { name: /Train Skill/ }).first().click();

  await page.evaluate(() => window.gameEngine.startCustomQuiz('Order Practice', [{
    type: 'order_drag',
    prompt: 'Put these numbers in order',
    items: [3, 1, 2],
    correctOrder: [1, 2, 3],
    answer: '1,2,3',
    timeLimitSeconds: 100
  }], true));

  for (const [timeLeft, tone] of [[70, 'healthy'], [50, 'warning'], [20, 'critical']]) {
    await page.evaluate(value => {
      window.gameEngine.timeLeft = value;
      window.gameEngine.totalTime = 100;
      window.gameEngine.updateTimerUI();
    }, timeLeft);
    await expect(page.locator('#question-timer-bar')).toHaveAttribute('data-tone', tone);
    const timerColors = await page.locator('#question-timer-text').evaluate(element => ({
      foreground: getComputedStyle(element).color,
      background: getComputedStyle(element.closest('.play-shell').querySelector('.play-question-card')).backgroundColor
    }));
    expect(contrastRatio(timerColors.foreground, timerColors.background)).toBeGreaterThanOrEqual(4.5);
  }

  await page.locator('[data-action="game-order-pick"][data-value="1"]').click();
  const slotColors = await page.locator('.play-order-slot.is-filled').evaluate(element => ({
    foreground: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor
  }));
  expect(contrastRatio(slotColors.foreground, slotColors.background)).toBeGreaterThanOrEqual(4.5);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Parent Report keeps keyboard focus inside its dialog on mobile', async ({ page }) => {
  await setupApp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const reportButton = page.getByRole('button', { name: /Mastery Stats/ });
  await reportButton.focus();
  await page.keyboard.press('Enter');

  const reportDialog = page.getByRole('dialog', { name: 'Parent Dashboard' });
  const headerClose = page.getByRole('button', { name: 'Close progress report' });
  const footerClose = page.getByRole('button', { name: 'Close', exact: true });
  await expect(reportDialog).toBeVisible();
  await expect(headerClose).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(footerClose).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(headerClose).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(reportDialog).toBeHidden();
  await expect(reportButton).toBeFocused();
});

test('Maths World and Number Builder text meet WCAG AA contrast in both themes', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await page.getByRole('button', { name: 'Explore Maths World' }).click();

  const checkBothThemes = async surface => {
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.ProfileManager.applyTheme(value), theme);
      const failures = await findTextContrastFailures(page);
      expect(failures, `${surface} (${theme} theme): ${JSON.stringify(failures)}`).toEqual([]);
    }
    await page.evaluate(() => window.ProfileManager.applyTheme('dark'));
  };

  await checkBothThemes('Maths World');
  await page.locator('[data-action="maths-topic"][data-topic="number"]').click();
  await checkBothThemes('Number Builder card');

  await page.locator('[data-action="number-builder-start"][data-difficulty="easy"]').click();
  await checkBothThemes('Number Builder activity');

  for (let round = 0; round < 5; round++) {
    const correctOrder = await page.evaluate(() =>
      window.app.numberBuilderGame.questions[window.app.numberBuilderGame.index].correctOrder
    );

    if (round === 0) {
      for (const value of [...correctOrder].reverse()) {
        await page.locator(`[data-action="number-builder-pick"][data-value="${value}"]`).click();
      }
      await page.getByRole('button', { name: 'Check order' }).click();
      await expect(page.locator('#number-builder-feedback')).toHaveClass(/is-incorrect/);
      await checkBothThemes('Number Builder incorrect feedback');
      await page.getByRole('button', { name: 'Try again' }).click();
    }

    for (const value of correctOrder) {
      await page.locator(`[data-action="number-builder-pick"][data-value="${value}"]`).click();
    }
    if (round === 0) {
      await page.getByRole('button', { name: 'Check order' }).hover();
      await checkBothThemes('Number Builder check button hover');
    }
    await page.getByRole('button', { name: 'Check order' }).click();
    await expect(page.locator('#number-builder-feedback')).toHaveClass(/is-correct/);
    if (round === 0) await checkBothThemes('Number Builder correct feedback');
    await page.getByRole('button', {
      name: round === 4 ? 'Finish activity' : 'Next sequence →'
    }).click();
  }

  await expect(page.getByRole('heading', { name: 'Number Builder complete!' })).toBeVisible();
  await checkBothThemes('Number Builder results');
});

test('Shopkeeper text meets WCAG AA contrast in both themes', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await page.locator('#learning-modules-grid button[data-action="money-home"]').click();

  const checkBothThemes = async surface => {
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.ProfileManager.applyTheme(value), theme);
      const failures = await findTextContrastFailures(page);
      expect(failures, `${surface} (${theme} theme): ${JSON.stringify(failures)}`).toEqual([]);
    }
    await page.evaluate(() => window.ProfileManager.applyTheme('dark'));
  };

  await checkBothThemes('Shopkeeper game choice');
  await page.locator('[data-action="money-start"][data-activity-id="shopkeeper"][data-difficulty="medium"]').click();
  await checkBothThemes('Shopkeeper transaction');

  const question = await page.evaluate(() => window.app.moneyGame.questions[0]);
  let remaining = question.change;
  for (const denomination of [...question.denominations].sort((first, second) => second.value - first.value)) {
    while (remaining >= denomination.value) {
      await page.locator(`[data-action="money-coin"][data-value="${denomination.value}"]`).click();
      remaining -= denomination.value;
    }
  }
  expect(remaining).toBe(0);
  await page.getByRole('button', { name: 'Check change' }).click();
  await checkBothThemes('Shopkeeper feedback');
});

test('Fraction Pizza text meets WCAG AA contrast in both themes', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await page.getByRole('button', { name: 'Explore Maths World' }).click();
  await page.locator('[data-action="maths-topic"][data-topic="fractions"]').click();

  const checkBothThemes = async surface => {
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.ProfileManager.applyTheme(value), theme);
      const failures = await findTextContrastFailures(page);
      expect(failures, `${surface} (${theme} theme): ${JSON.stringify(failures)}`).toEqual([]);
    }
    await page.evaluate(() => window.ProfileManager.applyTheme('dark'));
  };

  await checkBothThemes('Fraction Pizza card');
  await page.evaluate(() => {
    window.__fractionPizzaOriginalRandom = Math.random;
    Math.random = () => 0.999999;
  });
  await page.locator('[data-action="fraction-pizza-start"][data-difficulty="easy"]').click();
  await page.evaluate(() => {
    Math.random = window.__fractionPizzaOriginalRandom;
    delete window.__fractionPizzaOriginalRandom;
  });
  await checkBothThemes('Fraction Pizza activity');

  for (let round = 0; round < 5; round++) {
    const answer = await page.evaluate(() => window.app.fractionPizzaEngine.currentQuestion.answer);
    for (let tokenId = 0; tokenId < answer; tokenId++) {
      await page.locator(`[data-action="fraction-pizza-token"][data-token="${tokenId}"]`).click();
    }
    await page.getByRole('button', { name: 'Check fraction' }).click();
    await expect(page.locator('#fraction-pizza-feedback .educational-feedback')).toHaveClass(/is-correct/);
    await checkBothThemes(`Fraction Pizza feedback ${round + 1}`);
    await page.getByRole('button', {
      name: round === 4 ? 'Finish activity' : 'Next pizza'
    }).click();
  }

  await expect(page.getByRole('heading', { name: 'Well done, pizza builder!' })).toBeVisible();
  await checkBothThemes('Fraction Pizza results');
});
