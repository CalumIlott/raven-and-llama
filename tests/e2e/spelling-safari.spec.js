const { expect, test } = require('@playwright/test');
const { openLearningCentre, openParentDashboard, registerAccount, setupApp } = require('./support');

test('Spelling & Words is a direct, refresh-safe hub for the existing Safari adventures', async ({ page }) => {
  await page.goto('/learning-centre/spelling');
  await expect(page.getByRole('heading', { name: 'Spelling & Words', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose your adventure' })).toBeVisible();
  await expect(page.locator('[data-action="spelling-start"]')).toHaveCount(12);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Spelling & Words', exact: true })).toBeVisible();
  await page.goto('/spelling');
  await expect(page.getByRole('heading', { name: 'Spelling & Words', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/learning-centre\/spelling$/);
  await page.getByRole('button', { name: /Back to .* Learning Centre/ }).click();
  await expect(page).toHaveURL(/\/learning-centre$/);
  await expect(page.getByRole('heading', { name: 'Explore by subject' })).toBeVisible();
});

test('Spelling Safari pronunciation can be replayed without exposing the answer in prompt labels', async ({ page }) => {
  await page.addInitScript(() => {
    const calls = { spoken: [], cancelled: 0 };
    window.__spellingSpeechCalls = calls;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      }
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [{ name: 'Australian English', lang: 'en-AU' }],
        addEventListener() {},
        removeEventListener() {},
        cancel() {
          calls.cancelled++;
        },
        speak(utterance) {
          calls.spoken.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate });
        }
      }
    });
  });

  await page.goto('/learning-centre');
  await page.getByRole('button', { name: /Spelling & Words/ }).click();
  await page.locator('[data-activity-id="jungle-jumble"][data-difficulty="medium"]').click();
  const answer = await page.evaluate(() => window.app.spellingSafariGame.questions[0].answer);
  const prompt = await page.locator('.play-prompt').textContent();
  expect(prompt.toLowerCase()).not.toContain(answer.toLowerCase());
  await expect(page.getByRole('button', { name: 'Hear the word' })).toHaveAttribute('aria-label', 'Hear the word pronunciation');

  await page.getByRole('button', { name: 'Hear the word' }).click();
  await expect(page.locator('#spelling-pronunciation-status')).toHaveText('Playing word pronunciation.');
  await page.getByRole('button', { name: 'Hear the word' }).click();

  const calls = await page.evaluate(() => window.__spellingSpeechCalls);
  expect(calls.spoken).toEqual([
    { text: answer, lang: 'en-AU', rate: 0.82 },
    { text: answer, lang: 'en-AU', rate: 0.82 }
  ]);
  expect(calls.cancelled).toBeGreaterThanOrEqual(2);
  const cancelledBeforeNavigation = calls.cancelled;
  const accessibleLabels = await page.locator('#app-main [aria-label]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('aria-label').toLowerCase())
  );
  expect(accessibleLabels.every(label => !label.includes(answer.toLowerCase()))).toBe(true);

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Explore by subject' })).toBeVisible();
  expect((await page.evaluate(() => window.__spellingSpeechCalls)).cancelled).toBeGreaterThan(cancelledBeforeNavigation);
});

test('parent spelling-list CRUD syncs to Spell It and typed answers stay hidden until submitted', async ({ page }) => {
  await page.addInitScript(() => {
    const spoken = [];
    window.__spellItSpoken = spoken;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      }
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [{ name: 'Australian English', lang: 'en-AU' }],
        addEventListener() {},
        removeEventListener() {},
        cancel() {},
        speak(utterance) {
          spoken.push(utterance.text);
        }
      }
    });
  });
  await setupApp(page);
  const account = await registerAccount(page);
  await page.goto('/learning-centre/spelling');
  await page.getByRole('button', { name: 'Start Spell It' }).click();
  await expect(page.locator('#spell-it-list-status')).toContainText('No spelling lists yet');
  await page.getByRole('button', { name: 'Manage weekly lists' }).click();
  await expect(page.getByRole('dialog', { name: 'Parent Dashboard' })).toBeVisible();
  await page.locator('#parent-access-password').fill(account.password);
  await page.getByRole('button', { name: 'Continue to Parent Dashboard' }).click();
  await expect(page.locator('#parent-dashboard-content')).toBeVisible();
  await page.locator('#parent-spelling-list-name').fill('Week One');
  await page.locator('#parent-spelling-list-words').fill('quokka');
  await page.getByRole('button', { name: 'Create list' }).click();
  await expect(page.locator('#parent-spelling-list-items')).toContainText('Week One');
  await expect(page.locator('#parent-spelling-list-items')).toContainText('Active for Spell It');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('#spell-it-list-options')).toContainText('Week One');

  await page.reload();
  await page.getByRole('button', { name: 'Start Spell It' }).click();
  await page.getByRole('button', { name: 'Practise this list' }).click();
  await expect(page.getByLabel('Your spelling')).toBeVisible();
  const prompt = await page.locator('#app-main').innerText();
  expect(prompt.toLowerCase()).not.toContain('quokka');
  const accessibleLabels = await page.locator('#app-main [aria-label]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('aria-label').toLowerCase())
  );
  expect(accessibleLabels.every(label => !label.includes('quokka'))).toBe(true);

  await page.getByRole('button', { name: 'Hear the word' }).click();
  await expect(page.locator('#spell-it-pronunciation-status')).toHaveText('Playing word pronunciation.');
  expect(await page.evaluate(() => window.__spellItSpoken)).toEqual(['quokka']);
  await page.getByLabel('Your spelling').fill('wrong');
  await page.getByLabel('Your spelling').press('Enter');
  await expect(page.locator('#spell-it-feedback')).toContainText('Not quite');
  await expect(page.locator('#spell-it-feedback')).not.toContainText('quokka');
  await page.getByLabel('Your spelling').fill(' QUOKKA ');
  await page.getByLabel('Your spelling').press('Enter');
  await expect(page.locator('#spell-it-feedback')).toHaveText('Correct! Great spelling.');
  await page.getByRole('button', { name: 'Next word' }).click();
  await expect(page.getByRole('heading', { name: 'Spell It complete!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.app.spellItActivityEngine.definition.skillId))
    .toBe('spelling_spell_it');

  await page.getByRole('button', { name: 'Play this list again' }).click();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByLabel('Your spelling').fill('wrong');
    await page.getByLabel('Your spelling').press('Enter');
    await expect(page.locator('#spell-it-feedback')).not.toContainText('quokka');
  }
  await page.getByLabel('Your spelling').fill('wrong');
  await page.getByLabel('Your spelling').press('Enter');
  await expect(page.locator('#spell-it-feedback')).toContainText('The correct spelling is quokka.');
  await page.getByRole('button', { name: 'Try this word again' }).click();
  await page.getByLabel('Your spelling').fill('quokka');
  await page.getByLabel('Your spelling').press('Enter');
  await expect(page.locator('#spell-it-feedback')).toHaveText('Correct! Great spelling.');
  await page.getByRole('button', { name: 'Next word' }).click();

  await page.getByRole('button', { name: 'Choose another list' }).click();
  await page.getByRole('button', { name: 'Manage weekly lists' }).click();
  await page.locator('#parent-access-password').fill(account.password);
  await page.getByRole('button', { name: 'Continue to Parent Dashboard' }).click();
  await expect(page.locator('#parent-dashboard-content')).toBeVisible();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#parent-spelling-list-name').fill('Week Two');
  await page.locator('#parent-spelling-list-words').fill('echidna');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('#parent-spelling-list-items')).toContainText('Week Two');
  await page.getByRole('button', { name: 'Delete Week Two' }).click();
  await expect(page.locator('#parent-spelling-list-items')).toContainText('No weekly spelling lists yet');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('#spell-it-list-status')).toContainText('No spelling lists yet');
  await expect(page.locator('#spell-it-list-options [data-action="spell-it-start"]')).toHaveCount(0);
  await page.goto('/learning-centre');
  await openParentDashboard(page, account.password);
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('Spell It');
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('2 plays');
  await expect(page.locator('#parent-activity-stats-tbody')).toContainText('2 / 2 (100%)');
});

async function answerCurrentQuestion(page) {
  const question = await page.evaluate(() => {
    const game = window.app.spellingSafariGame;
    return game.questions[game.index];
  });

  if (question.type === 'scramble') {
    const tileIndexes = [];
    const usedIndexes = new Set();
    for (const letter of question.answer) {
      const tileIndex = question.scramble.findIndex((tile, index) => tile === letter && !usedIndexes.has(index));
      usedIndexes.add(tileIndex);
      tileIndexes.push(tileIndex);
    }
    for (const tileIndex of tileIndexes) await page.locator(`#safari-letter-${tileIndex}`).click();
  } else {
    await page.getByRole('button', { name: question.answer, exact: true }).click();
  }
}

test('Spelling Safari offers and completes all four word-game adventures', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setupApp(page);
  await openLearningCentre(page);
  await expect(page.getByRole('heading', { name: 'Explore by subject' })).toBeVisible();
  await expect(page.locator('#learning-modules-grid > .learning-subject-card')).toHaveCount(7);
  await expect(page.locator('#learning-modules-grid [data-subject="spelling-words"] button[data-action="spelling-home"]')).toBeVisible();
  await page.getByRole('button', { name: /Spelling & Words/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose your adventure' })).toBeVisible();

  for (const activity of ['Spelling Sprint', 'Phonics Trail', 'Word Explorer', 'Jungle Jumble']) {
    const activityId = {
      'Spelling Sprint': 'spelling-sprint',
      'Phonics Trail': 'phonics-trail',
      'Word Explorer': 'word-explorer',
      'Jungle Jumble': 'jungle-jumble'
    }[activity];
    if (activity === 'Jungle Jumble') {
      const card = page.locator('[data-activity-id="jungle-jumble"][data-difficulty="medium"]');
      await expect(card).toHaveText('Medium');
      await card.click();
      await expect(page.getByText('medium difficulty')).toBeVisible();
    } else {
      await page.locator(`[data-activity-id="${activityId}"][data-difficulty="medium"]`).click();
    }
    await expect(page.getByRole('heading', { name: new RegExp(activity) })).toBeVisible();

    for (let round = 1; round <= 6; round++) {
      if (activity === 'Jungle Jumble' && round === 1) {
        const question = await page.evaluate(() => {
          const game = window.app.spellingSafariGame;
          return game.questions[game.index];
        });
        for (let index = 0; index < question.scramble.length; index++) {
          await page.locator(`#safari-letter-${index}`).click();
        }
        await expect(page.locator('#safari-feedback')).toContainText('Not quite! Keep exploring!');
        await expect(page.locator('#safari-feedback')).not.toContainText(question.answer);
        await page.getByRole('button', { name: 'Try again' }).click();
      }

      await answerCurrentQuestion(page);
      await expect(page.locator('#safari-feedback')).toContainText('Great work!');
      await page.getByRole('button', { name: 'Next word' }).click();
      if (round < 6) {
        await expect(page.getByText(`Round ${round + 1} of 6`)).toBeVisible();
      }
    }

    await expect(page.getByRole('heading', { name: 'Safari Complete!' })).toBeVisible();
    await expect(page.locator('#safari-arena')).toContainText('6 / 6');
    if (activity === 'Jungle Jumble') {
      await page.getByRole('button', { name: 'Play again' }).click();
      await expect(page.getByText('medium difficulty')).toBeVisible();
      await page.getByRole('button', { name: 'Exit' }).click();
    } else {
      await page.getByRole('button', { name: 'Choose another adventure' }).click();
    }
  }
});

test('Jungle Jumble has safe empty-pool and speech-fallback states', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: undefined
    });
  });
  await setupApp(page);
  await openLearningCentre(page);
  await page.getByRole('button', { name: /Spelling & Words/ }).click();
  await page.evaluate(() => {
    window.__createSpellingQuestions = window.SpellingSafari.createQuestions;
    window.SpellingSafari.createQuestions = () => [];
  });

  await page.locator('[data-activity-id="jungle-jumble"][data-difficulty="easy"]').click();
  await expect(page.getByRole('alert')).toContainText('No questions are ready for this adventure');
  await page.getByRole('button', { name: 'Back to Spelling & Words' }).click();

  await page.evaluate(() => {
    window.SpellingSafari.createQuestions = window.__createSpellingQuestions;
    delete window.__createSpellingQuestions;
  });
  await page.locator('[data-activity-id="jungle-jumble"][data-difficulty="easy"]').click();
  const answer = await page.evaluate(() => window.app.spellingSafariGame.questions[0].answer);
  await expect(page.locator('.spelling-hint')).toBeVisible();
  expect((await page.locator('#app-main').innerText()).toLowerCase()).not.toContain(answer.toLowerCase());
  await page.getByRole('button', { name: 'Hear the word pronunciation' }).click();
  await expect(page.locator('#spelling-pronunciation-status'))
    .toContainText('Speech playback is unavailable');

  await page.evaluate(value => window.app.submitSpellingSafariAnswer(` ${value.toUpperCase()} `), answer);
  await expect(page.locator('#safari-feedback')).toContainText('Great work!');
});

test('Phonics Easy uses a picture clue and Medium uses a simple text clue', async ({ page }) => {
  await setupApp(page);
  await openLearningCentre(page);
  await page.getByRole('button', { name: /Spelling & Words/ }).click();

  await page.locator('[data-activity-id="phonics-trail"][data-difficulty="easy"]').click();
  await expect(page.locator('.spelling-picture-clue[role="img"]')).toBeVisible();
  await expect(page.locator('.spelling-picture-clue')).toHaveAttribute('aria-label', /^Picture clue:/);
  await expect(page.locator('.spelling-hint')).toHaveCount(0);

  await page.getByRole('button', { name: 'Exit' }).click();
  await page.locator('[data-activity-id="phonics-trail"][data-difficulty="medium"]').click();
  await expect(page.locator('.spelling-hint')).toBeVisible();
  await expect(page.locator('.spelling-picture-clue')).toHaveCount(0);
});

test('Spelling Safari does not reveal the correct answer on incorrect guesses', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setupApp(page);
  await openLearningCentre(page);
  await page.getByRole('button', { name: /Spelling & Words/ }).click();
  await page.locator('[data-activity-id="spelling-sprint"][data-difficulty="medium"]').click();

  const question = await page.evaluate(() => {
    const game = window.app.spellingSafariGame;
    return game.questions[game.index];
  });

  const wrongAnswer = question.options.find(opt => opt.toLowerCase() !== question.answer.toLowerCase());
  await page.getByRole('button', { name: wrongAnswer, exact: true }).click();

  await expect(page.locator('#safari-feedback')).toContainText('Not quite! Keep exploring!');
  await expect(page.locator('#safari-feedback')).not.toContainText('The answer was');
  await expect(page.locator('#safari-feedback')).not.toContainText(question.answer);
});
