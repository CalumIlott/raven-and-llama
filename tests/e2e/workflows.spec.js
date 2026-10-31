const { expect, test } = require('@playwright/test');
const {
  chooseQuestionAnswer,
  openMathsDojo,
  openLearningHub,
  openTimesTables,
  setupApp
} = require('./support');

test.beforeEach(async ({ page }) => {
  await setupApp(page);
});

test('a perfect practice round records mastery and updates the dojo', async ({ page }) => {
  await openMathsDojo(page);
  await page.getByRole('heading', { name: 'White Belt', exact: true }).click();
  await page.getByRole('button', { name: /Train Skill/ }).first().click();
  await expect(page.getByText('Question 1 of 10', { exact: true })).toBeVisible();

  for (let question = 1; question <= 10; question++) {
    await chooseQuestionAnswer(page);
    if (question < 10) {
      await expect(page.getByText(`Question ${question + 1} of 10`, { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Training Finished!' })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#game-arena')).toContainText('10 / 10');
  await page.getByRole('button', { name: 'Dojo Skills' }).click();
  await expect(page.getByText('10 / 10', { exact: true }).first()).toBeVisible();
});

test('individual, mixed, and mastery Times Tables quizzes advance questions', async ({ page }) => {
  await openTimesTables(page);

  await page.getByRole('button', { name: '2× Table', exact: true }).click();
  await expect(page.getByText('Question 1 of 12', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '2× Times Table Practice' })).toBeVisible();
  await chooseQuestionAnswer(page);
  await expect(page.getByText('Question 2 of 12', { exact: true })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Exit/ }).click();

  await page.getByRole('button', { name: /Quick Mixed Quiz/ }).click();
  await expect(page.getByText('Question 1 of 12', { exact: true })).toBeVisible();
  await chooseQuestionAnswer(page);
  await expect(page.getByText('Question 2 of 12', { exact: true })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Exit/ }).click();

  await page.getByRole('button', { name: /Grand Completion Test/ }).click();
  await expect(page.getByText('Question 1 of 33', { exact: true })).toBeVisible();
  await chooseQuestionAnswer(page);
  await expect(page.getByText('Question 2 of 33', { exact: true })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Exit/ }).click();

  await page.getByRole('button', { name: /Play Product Pair Match Arcade/ }).click();
  const targetText = await page.locator('#tt-target').textContent();
  const target = Number(targetText.match(/\d+/)[0]);
  const cards = await page.locator('#tt-cards button').evaluateAll(elements => elements.map(element => ({
    id: element.id,
    value: Number(element.textContent.trim())
  })));
  const pair = cards.flatMap((first, index) => cards.slice(index + 1).map(second => [first, second]))
    .find(([first, second]) => first.value * second.value === target);

  expect(pair).toBeTruthy();
  await page.locator(`#${pair[0].id}`).click();
  await page.locator(`#${pair[1].id}`).click();
  await expect(page.locator('#tt-score')).toHaveText('15');
  await page.getByRole('button', { name: /Exit Arcade/ }).click();
  await expect(page.getByRole('heading', { name: 'Times Tables Dojo' })).toBeVisible();
});

test('all seven Maths Masters arcades launch and return to their belt dojo', async ({ page }) => {
  const belts = ['White Belt', 'Yellow Belt', 'Green Belt', 'Blue Belt', 'Brown Belt', 'Black Belt', 'Platinum Belt'];
  await openMathsDojo(page);

  for (let index = 0; index < belts.length; index++) {
    await page.getByRole('heading', { name: belts[index], exact: true }).click();
    await page.getByRole('button', { name: /Play .* Arcade!/ }).click();
    await expect(page.locator('#game-arena canvas, #game-arena button').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Exit Arcade/ })).toBeVisible();
    await page.getByRole('button', { name: /Exit Arcade/ }).click();
    await expect(page.getByRole('heading', { name: belts[index], exact: true })).toBeVisible();

    if (index < belts.length - 1) {
      await page.getByRole('button', { name: /Back to Maths Masters Belts/ }).click();
    }
  }
});

test('Science Explorers missions teach concepts, award stars, and return to the mission map', async ({ page }) => {
  await openLearningHub(page);
  await expect(page.getByRole('heading', { name: 'Learning Modules', exact: true })).toBeVisible();
  await page.getByText('Explore Science Explorers', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Science Explorers', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Orbit Rescue/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Habitat Match/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Matter Lab/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Nature Detectives/ })).toBeVisible();

  const missions = await page.evaluate(() => window.SCIENCE_MISSIONS.map(mission => mission.id));
  let totalStars = 0;
  for (const [missionIndex, missionId] of missions.entries()) {
    const title = await page.evaluate(id => window.SCIENCE_MISSIONS.find(mission => mission.id === id).title, missionId);
    await page.getByRole('button', { name: new RegExp(title) }).click();

    for (let questionIndex = 0; questionIndex < 5; questionIndex++) {
      const { answer, choices } = await page.evaluate(() => {
        const game = window.app.scienceGame;
        return game.mission.questions[game.index];
      });
      const answerIndex = missionIndex === 0 && questionIndex === 0 ? (answer + 1) % choices.length : answer;
      await page.locator(`[data-science-choice="${answerIndex}"]`).click();

      if (missionIndex === 0 && questionIndex === 0) {
        await expect(page.locator('#app-main [role="status"]')).toContainText('Not quite!');
      } else {
        await expect(page.locator('#app-main [role="status"]')).toContainText('Great discovery!');
        totalStars++;
      }

      await page.getByRole('button', { name: questionIndex === 4 ? /Finish Mission/ : /Next Clue/ }).click();
    }

    await expect(page.getByRole('heading', { name: 'Mission Complete!' })).toBeVisible();
    if (missionIndex < missions.length - 1) {
      await page.getByRole('button', { name: 'Choose Another Mission' }).click();
    }
  }

  await expect(page.locator('#header-stars-count')).toHaveText(String(totalStars));
  await page.getByRole('button', { name: 'Play Again' }).click();
  await expect(page.getByText('Clue 1 of 5', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /Back to missions/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose a Mission' })).toBeVisible();
});