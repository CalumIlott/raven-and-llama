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

async function openLearningHub(page) {
  await page.locator('#nav-btn-learning').click();
  await expect(page.getByRole('heading', { name: 'Raven & Llama Learning', exact: true })).toBeVisible();
}

async function openMathsDojo(page) {
  await openLearningHub(page);
  await page.getByText('Open Maths Masters Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Maths Masters Ninja Dojo', exact: true })).toBeVisible();
}

async function openTimesTables(page) {
  await openLearningHub(page);
  await page.getByText('Open Times Tables Dojo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Times Tables Dojo', exact: true })).toBeVisible();
}

async function chooseQuestionAnswer(page, correct = true) {
  const answer = await page.evaluate(() => {
    const engine = window.gameEngine;
    return engine.questions[engine.currentIndex].answer;
  });
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
  openLearningHub,
  openMathsDojo,
  openTimesTables,
  registerAccount,
  setupApp
};