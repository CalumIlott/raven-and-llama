const GEOGRAPHY_COUNTRY_ACTIVITY_ROUND_LENGTH = 5;
const GEOGRAPHY_COUNTRY_ACTIVITY_CHOICE_COUNT = 4;
const GEOGRAPHY_COUNTRY_ACTIVITY_MODES = Object.freeze({
  flags: {
    id: 'geography-flag-detective',
    title: 'Flag Detective',
    path: '/learning-centre/geography/flag-detective',
    uniqueField: 'flag',
    answerField: 'name',
    subject: 'Geography & The World'
  },
  capitals: {
    id: 'geography-capital-cities',
    title: 'Capital Cities',
    path: '/learning-centre/geography/capital-cities',
    uniqueField: 'name',
    answerField: 'capital',
    subject: 'Geography & The World'
  }
});

function getGeographyActivityMode(mode) {
  const definition = GEOGRAPHY_COUNTRY_ACTIVITY_MODES[mode];
  if (!definition) throw new RangeError(`Unknown geography activity mode: ${mode}`);
  return definition;
}

function shuffleGeographyActivityItems(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getGeographyActivityCountries(countries, mode) {
  const definition = getGeographyActivityMode(mode);
  if (!Array.isArray(countries)) return [];

  const candidates = countries.filter(country =>
    country &&
    typeof country.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(country.id) &&
    typeof country.name === 'string' && country.name.trim() &&
    typeof country[definition.uniqueField] === 'string' && country[definition.uniqueField].trim() &&
    typeof country[definition.answerField] === 'string' && country[definition.answerField].trim()
  );
  const counts = new Map();
  for (const country of candidates) {
    for (const field of ['id', definition.uniqueField, definition.answerField]) {
      const value = country[field].trim().toLocaleLowerCase();
      const key = `${field}:${value}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return candidates.filter(country =>
    ['id', definition.uniqueField, definition.answerField].every(field => {
      const value = country[field].trim().toLocaleLowerCase();
      return counts.get(`${field}:${value}`) === 1;
    })
  );
}

function generateGeographyCountryQuestions(countries, mode, random = Math.random) {
  const definition = getGeographyActivityMode(mode);
  const eligibleCountries = getGeographyActivityCountries(countries, mode);
  if (eligibleCountries.length < 2) return { questions: [], countryIds: [] };

  const roundCountries = shuffleGeographyActivityItems(eligibleCountries, random)
    .slice(0, GEOGRAPHY_COUNTRY_ACTIVITY_ROUND_LENGTH);
  const optionCount = Math.min(GEOGRAPHY_COUNTRY_ACTIVITY_CHOICE_COUNT, eligibleCountries.length);
  const countryIds = [];
  const questions = roundCountries.map((country, questionIndex) => {
    const distractors = shuffleGeographyActivityItems(
      eligibleCountries.filter(candidate => candidate.id !== country.id),
      random
    ).slice(0, optionCount - 1);
    const options = shuffleGeographyActivityItems([country, ...distractors], random);
    countryIds.push(country.id);
    return {
      id: `${definition.id}-q${questionIndex + 1}`,
      type: 'choice',
      prompt: mode === 'flags'
        ? 'Which country uses this flag?'
        : `What is the capital city of ${country.name}?`,
      choices: options.map(option => option[definition.answerField]),
      answer: options.findIndex(option => option.id === country.id)
    };
  });

  return { questions, countryIds };
}

function escapeGeographyActivityHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function geographyCountryForQuestion(app, questionIndex = app.geographyCountryQuizEngine?.currentIndex) {
  const countryId = app.geographyCountryQuiz?.countryIds[questionIndex];
  const country = window.GeographyWorld.countryById(countryId);
  if (!country) throw new Error(`Missing country for geography quiz question: ${countryId}`);
  return country;
}

Object.assign(App.prototype, {
  startGeographyFlagDetective() {
    return this.startGeographyCountryActivity('flags');
  },

  startGeographyCapitalCities() {
    return this.startGeographyCountryActivity('capitals');
  },

  startGeographyCountryActivity(mode) {
    const definition = getGeographyActivityMode(mode);
    const { questions, countryIds } = generateGeographyCountryQuestions(
      window.GeographyWorld.countries,
      mode
    );
    this.currentView = definition.id;
    this.geographyCountryQuiz = { mode, countryIds, feedback: null };
    this.geographyCountryQuizEngine = null;
    if (questions.length > 0) {
      this.geographyCountryQuizEngine = new ActivityEngine();
      this.geographyCountryQuizEngine.startQuiz({
        id: definition.id,
        title: definition.title,
        subject: definition.subject,
        questions,
        settings: {
          trackProgress: true,
          awardStars: true,
          pointsPerCorrect: 1
        }
      });
    }
    this.rememberModule(definition.id, definition.path);
    this.renderGeographyCountryActivity();
    return questions.length > 0;
  },

  renderGeographyCountryActivity() {
    const game = this.geographyCountryQuiz;
    const main = document.getElementById('app-main');
    if (!game || !main) return false;
    const definition = getGeographyActivityMode(game.mode);
    main.dataset.page = definition.id;
    this.updateHeader();

    const pageStart = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div class="mb-6 flex items-center justify-between gap-4">
          <button type="button" data-action="geography-world" class="flex items-center gap-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300">
            <span aria-hidden="true">←</span><span>Back to Geography &amp; The World</span>
          </button>
          <button type="button" data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
    `;

    if (!this.geographyCountryQuizEngine) {
      main.innerHTML = `${pageStart}
        <section class="rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8">
          <h1 class="font-ninja text-3xl font-bold text-white">${definition.title}</h1>
          <p class="mt-4 text-slate-200" role="status">There are not enough countries with complete, unique answers to start this round.</p>
        </section>
      </div>`;
      return true;
    }

    const engine = this.geographyCountryQuizEngine;
    if (engine.status === 'complete') {
      main.innerHTML = `${pageStart}
        <section class="rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8" aria-labelledby="geography-quiz-complete-title">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Round complete</p>
          <h1 id="geography-quiz-complete-title" class="mt-2 font-ninja text-3xl font-bold text-white">${definition.title} complete!</h1>
          <p class="mt-4 text-lg text-slate-200">You scored ${engine.score} out of ${engine.definition.questions.length}. Great exploring!</p>
          <button type="button" data-action="geography-world" class="mt-6 rounded-xl border border-cyan-300 bg-cyan-400/20 px-5 py-3 font-bold text-cyan-100 transition hover:bg-cyan-400/30">Back to Geography &amp; The World</button>
        </section>
      </div>`;
      return true;
    }

    const question = engine.currentQuestion;
    if (!question) throw new Error('The active geography quiz has no current question.');
    const country = geographyCountryForQuestion(this);
    const answered = engine.answered;
    const correctChoice = question.choices[question.answer];
    const feedback = game.feedback;
    const flag = game.mode === 'flags'
      ? `<span class="mb-4 block text-6xl" role="img" aria-label="Flag of ${escapeGeographyActivityHtml(country.name)}">${escapeGeographyActivityHtml(country.flag)}</span>`
      : `<span class="mb-3 block text-4xl" aria-hidden="true">${escapeGeographyActivityHtml(country.flag)}</span>`;
    const feedbackText = feedback
      ? feedback.correct
        ? (game.mode === 'flags'
          ? `Correct! That's the flag of ${country.name}.`
          : `Correct! ${country.capital} is the capital city of ${country.name}.`)
        : `Not quite. The correct answer is ${correctChoice}. ${country.fact || ''} You can try again or move on.`
      : '';
    const continueLabel = engine.currentIndex === engine.definition.questions.length - 1
      ? 'Finish round'
      : 'Next question';

    main.innerHTML = `${pageStart}
      <section class="rounded-3xl border border-cyan-500/30 bg-slate-900 p-5 sm:p-8" aria-labelledby="geography-country-quiz-title">
        <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Geography challenge</p>
            <h1 id="geography-country-quiz-title" class="mt-1 font-ninja text-3xl font-bold text-white">${definition.title}</h1>
          </div>
          <p class="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm font-bold text-slate-200">Question ${engine.currentIndex + 1} of ${engine.definition.questions.length}</p>
        </div>
        <div class="rounded-2xl border border-slate-700 bg-slate-950/70 p-5 sm:p-7">
          ${flag}
          <h2 id="geography-country-question" class="text-xl font-bold text-white sm:text-2xl">${escapeGeographyActivityHtml(question.prompt)}</h2>
          <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-labelledby="geography-country-question">
            ${question.choices.map((choice, index) => `
              <button type="button" data-action="geography-country-answer" data-answer-index="${index}" aria-pressed="${game.selectedAnswer === index}" ${answered ? 'disabled' : ''} class="min-h-12 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-left font-semibold text-slate-100 transition hover:border-cyan-300 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-default disabled:opacity-70">
                ${escapeGeographyActivityHtml(choice)}
              </button>
            `).join('')}
          </div>
        </div>
        <p id="geography-country-quiz-feedback" class="mt-4 min-h-7 text-sm font-semibold ${feedback?.correct ? 'text-emerald-300' : 'text-amber-200'}" role="status" aria-live="polite">${escapeGeographyActivityHtml(feedbackText)}</p>
        ${answered ? `
          <div class="mt-4 flex flex-wrap gap-3">
            ${feedback?.correct === false ? '<button type="button" data-action="geography-country-retry" class="rounded-xl border border-amber-300 bg-amber-400/20 px-5 py-3 font-bold text-amber-100 transition hover:bg-amber-400/30">Try again</button>' : ''}
            <button type="button" data-action="geography-country-next" class="rounded-xl border border-cyan-300 bg-cyan-400/20 px-5 py-3 font-bold text-cyan-100 transition hover:bg-cyan-400/30">${continueLabel}</button>
          </div>
        ` : ''}
      </section>
    </div>`;
    return true;
  },

  answerGeographyCountryQuestion(answerIndex) {
    const engine = this.geographyCountryQuizEngine;
    const question = engine?.currentQuestion;
    if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.choices.length) {
      throw new RangeError('Choose a valid answer for the current geography question.');
    }
    const correct = engine.submitAnswer(answerIndex);
    if (correct === null) return false;
    this.geographyCountryQuiz.selectedAnswer = answerIndex;
    this.geographyCountryQuiz.feedback = { correct };
    this.renderGeographyCountryActivity();
    return correct;
  },

  retryGeographyCountryQuestion() {
    if (this.geographyCountryQuizEngine?.allowRetry() !== true) return false;
    this.geographyCountryQuiz.selectedAnswer = null;
    this.geographyCountryQuiz.feedback = null;
    this.renderGeographyCountryActivity();
    return true;
  },

  advanceGeographyCountryQuestion() {
    const engine = this.geographyCountryQuizEngine;
    if (engine?.status !== 'active' || !engine.answered) return false;
    engine.nextQuestion();
    if (engine.status === 'complete') this.geographyCountryQuiz.complete = true;
    this.geographyCountryQuiz.selectedAnswer = null;
    this.geographyCountryQuiz.feedback = null;
    this.renderGeographyCountryActivity();
    return true;
  }
});

window.GeographyCountryActivities = Object.freeze({
  generateQuestions: generateGeographyCountryQuestions,
  getEligibleCountries: getGeographyActivityCountries,
  roundLength: GEOGRAPHY_COUNTRY_ACTIVITY_ROUND_LENGTH
});
