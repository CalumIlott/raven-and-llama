const { expect, test } = require('@playwright/test');
const { setupApp } = require('./support');

async function chooseCurrentCorrectAnswer(page, testInfo, keyboard = false) {
  const answerIndex = await page.evaluate(() =>
    window.app.geographyCountryQuizEngine.currentQuestion.answer
  );
  const answer = page.locator('[data-action="geography-country-answer"]').nth(answerIndex);
  if (keyboard) {
    await answer.focus();
    await answer.press('Enter');
  } else if (testInfo.project.name === 'mobile-chromium') {
    await answer.tap();
  } else {
    await answer.click();
  }
}

test('Flag Detective supports keyboard answers, completion, and return navigation', async ({ page }, testInfo) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');
  await page.getByRole('button', { name: 'Play Flag Detective' }).click();

  await expect(page).toHaveURL(/\/learning-centre\/geography\/flag-detective$/);
  await expect(page.getByRole('heading', { name: 'Flag Detective', exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /^Flag of / })).toBeVisible();
  await chooseCurrentCorrectAnswer(page, testInfo, true);
  await expect(page.locator('#geography-country-quiz-feedback')).toContainText('Correct!');

  for (let questionIndex = 1; questionIndex < 5; questionIndex++) {
    await page.getByRole('button', { name: 'Next question' }).click();
    await chooseCurrentCorrectAnswer(page, testInfo);
    await expect(page.locator('#geography-country-quiz-feedback')).toContainText('Correct!');
  }
  await page.getByRole('button', { name: 'Finish round' }).click();
  await expect(page.getByRole('heading', { name: 'Flag Detective complete!' })).toBeVisible();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'geography-flag-detective');
  await page.getByRole('button', { name: 'Back to Geography & The World' }).first().click();
  await expect(page).toHaveURL(/\/learning-centre\/geography$/);
  await expect(page.getByRole('heading', { name: 'Our World', exact: true })).toBeVisible();
});

test('Capital Cities supports retry, touch answers, direct routes, and completion', async ({ page }, testInfo) => {
  await setupApp(page);
  await page.goto('/learning-centre/geography');
  await page.getByRole('button', { name: 'Play Capital Cities' }).click();
  await expect(page).toHaveURL(/\/learning-centre\/geography\/capital-cities$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Capital Cities', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^What is the capital city of / })).toBeVisible();

  const answerIndex = await page.evaluate(() =>
    window.app.geographyCountryQuizEngine.currentQuestion.answer
  );
  const wrongAnswer = page.locator('[data-action="geography-country-answer"]').nth((answerIndex + 1) % 4);
  if (testInfo.project.name === 'mobile-chromium') await wrongAnswer.tap();
  else await wrongAnswer.click();
  await expect(page.locator('#geography-country-quiz-feedback')).toContainText('Not quite');
  await page.getByRole('button', { name: 'Try again' }).click();
  await chooseCurrentCorrectAnswer(page, testInfo);
  await expect(page.locator('#geography-country-quiz-feedback')).toContainText('Correct!');

  for (let questionIndex = 1; questionIndex < 5; questionIndex++) {
    await page.getByRole('button', { name: 'Next question' }).click();
    await chooseCurrentCorrectAnswer(page, testInfo);
  }
  await page.getByRole('button', { name: 'Finish round' }).click();
  await expect(page.getByRole('heading', { name: 'Capital Cities complete!' })).toBeVisible();
  await expect(page.locator('#app-main')).toHaveAttribute('data-page', 'geography-capital-cities');
  await page.getByRole('button', { name: 'Back to Geography & The World' }).first().click();
  await expect(page).toHaveURL(/\/learning-centre\/geography$/);
});
