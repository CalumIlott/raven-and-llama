const { expect } = require('@playwright/test');

async function setupApp(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Programs & Spaces', exact: true })).toBeVisible();
  await expect(page.locator('#account-status-banner')).toContainText('Guest mode: progress will not be saved');
}

function uniqueUsername(prefix = 'learner') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

async function openAccountModal(page) {
  await page.locator('header button').filter({ has: page.locator('#header-profile-name') }).click();
  await expect(page.getByRole('dialog', { name: 'Account' })).toBeVisible();
}

async function openParentDashboard(page, password) {
  const accountDialog = page.getByRole('dialog', { name: 'Account' });
  if (await accountDialog.isVisible()) {
    await accountDialog.getByRole('button', { name: /Parent Dashboard & settings/ }).click();
  } else {
    const reportActions = page.locator('[data-action="parent-report"]:visible');
    if (await reportActions.count()) await reportActions.last().click();
    else await page.locator('.home-stats-link').click();
  }
  await expect(page.getByRole('dialog', { name: 'Parent Dashboard' })).toBeVisible();
  if (password !== undefined) {
    await expect(page.locator('#parent-access-gate')).toBeVisible();
    await page.locator('#parent-access-password').fill(password);
    await page.getByRole('button', { name: 'Continue to Parent Dashboard' }).click();
    await expect(page.locator('#parent-dashboard-content')).toBeVisible();
  }
}

async function registerAccount(page, username = uniqueUsername(), password = 'correct horse battery 42') {
  await openAccountModal(page);
  await page.locator('#account-register-tab').click();
  await page.locator('#account-username').fill(username);
  await page.locator('#account-password').fill(password);
  await page.locator('#account-confirm-password').fill(password);
  await page.locator('#account-submit-button').click();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
  return { username, password };
}

async function loginAccount(page, username, password) {
  await openAccountModal(page);
  await page.locator('#account-login-tab').click();
  await page.locator('#account-username').fill(username);
  await page.locator('#account-password').fill(password);
  await page.locator('#account-submit-button').click();
  await expect(page.locator('#header-profile-name')).toHaveText(username);
}

async function openLearningCentre(page) {
  await page.locator('#nav-btn-learning').click();
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning Centre', exact: true })).toBeVisible();
}

async function openMathsDojo(page) {
  await openLearningCentre(page);
  await page.getByText('Open Maths Masters Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
}

async function openTimesTables(page) {
  await openLearningCentre(page);
  await page.getByText('Open Times Tables Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Times Tables Dojo', exact: true })).toBeVisible();
}

async function chooseQuestionAnswer(page, correct = true) {
  const question = await page.evaluate(() => {
    const engine = window.gameEngine;
    const currentQuestion = engine.questions[engine.currentIndex];
    return {
      answer: currentQuestion.answer,
      correctOrder: currentQuestion.correctOrder,
      items: currentQuestion.items,
      type: currentQuestion.type
    };
  });

  if (question.type === 'numeric_input' || question.type === 'short_answer') {
    const answer = correct
      ? String(question.answer)
      : question.type === 'numeric_input'
        ? String(Number(question.answer) + 1)
        : `not ${question.answer}`;
    await page.locator('#game-answer-input').fill(answer);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    return;
  }

  if (question.type === 'order_drag') {
    const order = question.correctOrder.map(String);
    if (!correct) order.reverse();
    const used = new Set();
    for (const value of order) {
      const index = question.items.findIndex((item, itemIndex) =>
        String(item) === value && !used.has(itemIndex)
      );
      used.add(index);
      await page.locator(`#order-btn-${index}`).click();
    }
    return;
  }

  const answer = question.answer;
  const options = await page.locator('#game-arena button[id^="opt-btn-"]').allTextContents();
  const answerText = String(answer);
  const choice = correct
    ? answerText
    : options.find(option => option.trim() !== answerText);

  expect(choice).toBeTruthy();
  await page.getByRole('button', { name: choice.trim(), exact: true }).click();
}

module.exports = {
  chooseQuestionAnswer,
  loginAccount,
  openAccountModal,
  openParentDashboard,
  openLearningCentre,
  openMathsDojo,
  openTimesTables,
  registerAccount,
  setupApp
};
