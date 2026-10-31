const { expect } = require('@playwright/test');

async function setupApp(page) {
  const profiles = [{
    id: 'profile_default',
    name: 'Profile 1',
    avatar: 'raven',
    currentBelt: 'white',
    stage1PassedBelts: [],
    stage2PassedBelts: [],
    stage3PassedBelts: [],
    passedBelts: [],
    stars: 0,
    skillsProgress: {},
    certificates: []
  }];

  await page.route('**/api/profiles', async route => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, json: { profiles } });
      return;
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      if (body.profile) {
        const index = profiles.findIndex(profile => profile.id === body.profile.id);
        if (index === -1) profiles.push(body.profile);
        else profiles[index] = body.profile;
      } else if (body.deleteProfileId) {
        const remaining = profiles.filter(profile => profile.id !== body.deleteProfileId);
        profiles.splice(0, profiles.length, ...remaining);
      } else if (Array.isArray(body.profiles)) {
        profiles.splice(0, profiles.length, ...body.profiles);
      }
      await route.fulfill({ status: 200, json: { status: 'saved' } });
      return;
    }

    await route.fallback();
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Raven & Llama', exact: true })).toBeVisible();
  return { profiles };
}

async function openLearningHub(page) {
  await page.getByRole('button', { name: /Enter Learning Hub/ }).click();
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
  openLearningHub,
  openMathsDojo,
  openTimesTables,
  setupApp
};