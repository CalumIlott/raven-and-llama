const NUMBER_BUILDER_LEVELS = {
  easy: { min: 0, max: 20, length: 4, maxStep: 2, label: '0–20' },
  medium: { min: 0, max: 100, length: 5, maxStep: 10, label: '0–100' },
  hard: { min: 0, max: 999, length: 6, maxStep: 20, label: '0–999' }
};

const MATHS_WORLD_TOPICS = [
  { id: 'number', label: 'Number' },
  { id: 'fractions', label: 'Fractions' },
  { id: 'money', label: 'Money' }
];

const MISSING_NUMBER_LEVELS = {
  easy: { min: 0, max: 20, length: 4, maxStep: 5, factors: [], label: '0–20' },
  medium: { min: 0, max: 100, length: 5, maxStep: 12, factors: [2, 3], label: '0–100' },
  hard: { min: 0, max: 999, length: 6, maxStep: 25, factors: [2, 3], label: '0–999' }
};

function missingNumberSequenceGroups(difficulty) {
  const level = Object.hasOwn(MISSING_NUMBER_LEVELS, difficulty)
    ? MISSING_NUMBER_LEVELS[difficulty]
    : null;
  if (!level) throw new TypeError(`Unknown Missing Number difficulty: ${difficulty}`);

  const groups = { add: [], subtract: [], multiply: [], divide: [] };
  for (let step = 1; step <= level.maxStep; step++) {
    const span = step * (level.length - 1);
    for (const direction of [1, -1]) {
      const startMin = direction === 1 ? level.min : level.min + span;
      const startMax = direction === 1 ? level.max - span : level.max;
      for (let start = startMin; start <= startMax; start++) {
        const values = Array.from({ length: level.length }, (_, index) =>
          start + direction * step * index
        );
        groups[direction === 1 ? 'add' : 'subtract'].push({
          operation: direction === 1 ? 'add' : 'subtract',
          ruleValue: step,
          values,
          sequenceKey: values.join(',')
        });
      }
    }
  }

  for (const factor of level.factors) {
    const highestValue = factor ** (level.length - 1);
    for (let start = 1; start * highestValue <= level.max; start++) {
      const ascending = Array.from({ length: level.length }, (_, index) =>
        start * factor ** index
      );
      groups.multiply.push({
        operation: 'multiply',
        ruleValue: factor,
        values: ascending,
        sequenceKey: ascending.join(',')
      });
      const descending = [...ascending].reverse();
      groups.divide.push({
        operation: 'divide',
        ruleValue: factor,
        values: descending,
        sequenceKey: descending.join(',')
      });
    }
  }

  return groups;
}

function createMissingNumberQuestion(candidate, difficulty, index) {
  const level = MISSING_NUMBER_LEVELS[difficulty];
  const missingIndex = QuestionGenerator.randomInt(1, candidate.values.length - 2);
  const answer = candidate.values[missingIndex];
  const choices = new Set([answer]);

  for (let distance = 1; distance <= level.max - level.min && choices.size < 4; distance++) {
    for (const value of [answer - distance, answer + distance]) {
      if (value >= level.min && value <= level.max) choices.add(value);
      if (choices.size === 4) break;
    }
  }
  if (choices.size !== 4) {
    throw new RangeError(`Unable to generate unique Missing Number choices for ${difficulty}.`);
  }

  const ruleText = {
    add: `add ${candidate.ruleValue} each time`,
    subtract: `subtract ${candidate.ruleValue} each time`,
    multiply: `multiply by ${candidate.ruleValue} each time`,
    divide: `divide by ${candidate.ruleValue} each time`
  }[candidate.operation];

  return {
    id: `missing-number-q${index + 1}`,
    type: 'choice',
    prompt: `Fill in the missing number. The rule is to ${ruleText}.`,
    sequence: candidate.values.map((value, position) => position === missingIndex ? null : value),
    options: QuestionGenerator.shuffle([...choices]),
    answer,
    data: {
      difficulty,
      operation: candidate.operation,
      ruleValue: candidate.ruleValue,
      missingIndex,
      values: [...candidate.values],
      sequenceKey: candidate.sequenceKey
    },
    feedback: {
      correct: 'Great pattern spotting!',
      incorrect: 'Not quite. Check the rule and look at the numbers on both sides of the gap.',
      explanation: `The pattern ${ruleText}, so the missing number is ${answer}.`
    }
  };
}

function generateMissingNumberQuestion(difficulty, index = 0) {
  const [question] = generateMissingNumberQuestions(difficulty, 1);
  return { ...question, id: `missing-number-q${index + 1}` };
}

function generateMissingNumberQuestions(difficulty, count = 5, excludedSequenceKeys = []) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 20) {
    throw new RangeError('Missing Number question count must be between 1 and 20.');
  }
  if (!Array.isArray(excludedSequenceKeys) ||
    !excludedSequenceKeys.every(key => typeof key === 'string')) {
    throw new TypeError('Missing Number excluded sequence keys must be an array of strings.');
  }

  const excluded = new Set(excludedSequenceKeys);
  const candidatesByOperation = Object.fromEntries(
    Object.entries(missingNumberSequenceGroups(difficulty)).map(([operation, candidates]) => [
      operation,
      QuestionGenerator.shuffle(candidates.filter(candidate => !excluded.has(candidate.sequenceKey)))
    ])
  );
  const operations = QuestionGenerator.shuffle(
    Object.keys(candidatesByOperation).filter(operation => candidatesByOperation[operation].length)
  );
  const availableCount = operations.reduce(
    (total, operation) => total + candidatesByOperation[operation].length,
    0
  );
  if (availableCount < count) {
    throw new RangeError(`Only ${availableCount} unique Missing Number sequences are available.`);
  }

  return Array.from({ length: count }, (_, index) => {
    for (let offset = 0; offset < operations.length; offset++) {
      const operation = operations[(index + offset) % operations.length];
      const candidate = candidatesByOperation[operation].pop();
      if (candidate) return createMissingNumberQuestion(candidate, difficulty, index);
    }
    throw new RangeError('Unable to generate a valid Missing Number sequence.');
  });
}

function generateNumberBuilderQuestion(difficulty, index) {
  const level = Object.hasOwn(NUMBER_BUILDER_LEVELS, difficulty)
    ? NUMBER_BUILDER_LEVELS[difficulty]
    : null;
  if (!level) throw new TypeError(`Unknown Number Builder difficulty: ${difficulty}`);

  const descending = Math.random() >= 0.5;
  const step = QuestionGenerator.randomInt(1, level.maxStep);
  const span = step * (level.length - 1);
  const minStart = descending ? level.min + span : level.min;
  const maxStart = descending ? level.max : level.max - span;
  const start = QuestionGenerator.randomInt(minStart, maxStart);
  const direction = descending ? -1 : 1;
  const correctOrder = Array.from({ length: level.length }, (_, position) =>
    start + direction * step * position
  );
  const directionLabel = descending ? 'largest to smallest' : 'smallest to largest';

  return {
    id: `number-builder-q${index + 1}`,
    type: 'order',
    prompt: `Place the numbers in order from ${directionLabel}.`,
    options: QuestionGenerator.shuffle(correctOrder),
    correctOrder,
    data: { difficulty, direction: descending ? 'descending' : 'ascending', step },
    feedback: {
      correct: 'Great ordering!',
      incorrect: 'Not quite. Look at the direction and compare each pair of numbers.',
      explanation: `This sequence changes by ${step} each time.`
    }
  };
}

function generateNumberBuilderQuestions(difficulty, count = 5) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 20) {
    throw new RangeError('Number Builder question count must be between 1 and 20.');
  }
  return Array.from({ length: count }, (_, index) =>
    generateNumberBuilderQuestion(difficulty, index)
  );
}

window.NumberBuilder = {
  generateQuestion: generateNumberBuilderQuestion,
  generateQuestions: generateNumberBuilderQuestions,
  levels: NUMBER_BUILDER_LEVELS
};

window.MissingNumber = {
  generateQuestion: generateMissingNumberQuestion,
  generateQuestions: generateMissingNumberQuestions,
  levels: MISSING_NUMBER_LEVELS
};

Object.assign(App.prototype, {
  showMathsWorld() {
    this.currentView = 'maths-world';
    this.navigateToPath('/learning-centre/maths');
    this.mathsWorldTopic = MATHS_WORLD_TOPICS.some(topic => topic.id === this.mathsWorldTopic)
      ? this.mathsWorldTopic
      : 'number';

    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'maths-world';
    this.updateHeader();
    this.renderMathsWorld();
  },

  renderMathsWorld() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const topicContent = this.mathsWorldTopic === 'number'
      ? `<div class="grid gap-4 lg:grid-cols-2">${this.renderNumberBuilderCard()}${this.renderMissingNumberCard()}</div>`
      : this.mathsWorldTopic === 'fractions'
        ? this.renderFractionPizzaCard()
        : `<section class="rounded-2xl border-2 border-amber-600/60 bg-slate-900 p-6">
            <h2 class="font-ninja text-xl font-bold text-white">Money Masters</h2>
            <p class="mt-2 text-sm text-slate-300">Practise Australian coins and notes, make totals, and serve customers.</p>
            <button type="button" data-action="money-home" class="mt-4 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white hover:bg-amber-800">Explore Money Masters</button>
          </section>`;

    main.innerHTML = `
      <div class="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <button type="button" data-action="learning-centre" class="maths-world-back-link mb-6 flex items-center gap-2 text-sm font-bold">
          <span aria-hidden="true">←</span> Back to Learning Centre
        </button>
        <section class="maths-world-hero mb-8 rounded-3xl border-2 border-sky-600/40 bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-6 shadow-xl sm:p-8">
          <p class="maths-world-hero__eyebrow text-xs font-bold uppercase tracking-widest text-sky-300">Maths World</p>
          <h1 class="maths-world-hero__title mt-2 font-ninja text-3xl font-bold text-white sm:text-4xl">Numbers, patterns, and problem-solving</h1>
          <p class="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">Choose a topic to find an activity, build confidence, and keep exploring.</p>
        </section>
        <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter Maths World topics">
          ${MATHS_WORLD_TOPICS.map(topic => `
            <button type="button" data-action="maths-topic" data-topic="${topic.id}"
                    aria-pressed="${this.mathsWorldTopic === topic.id}"
                    class="rounded-full border-2 px-5 py-2 text-sm font-bold ${this.mathsWorldTopic === topic.id
                      ? 'border-sky-400 bg-sky-700 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-500'}">
              ${topic.label}
            </button>
          `).join('')}
        </div>
        <section id="maths-world-topic-content" aria-live="polite">${topicContent}</section>
        <section class="mt-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h2 class="font-ninja text-xl font-bold text-white">More ways to practise</h2>
          <div class="mt-4 flex flex-wrap gap-3">
            <button type="button" data-action="dojo" class="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white hover:bg-amber-800">Maths Masters Dojo</button>
            <button type="button" data-action="times-tables" class="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">Times Tables Dojo</button>
          </div>
        </section>
      </div>
    `;
  },

  renderNumberBuilderCard() {
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const recommendedLabel = recommendedDifficulty[0].toUpperCase() + recommendedDifficulty.slice(1);
    return `
      <section class="rounded-2xl border-2 border-sky-600/60 bg-slate-900 p-6 shadow-lg">
        <p class="text-xs font-bold uppercase tracking-widest text-sky-300">Number ordering</p>
        <h2 class="mt-2 font-ninja text-2xl font-bold text-white">Number Builder</h2>
        <p class="mt-2 text-sm text-slate-300">Put number tiles in ascending or descending order. Each round gives you a new sequence.</p>
        <p class="mt-4 text-xs font-bold text-sky-200">Choose a range · Recommended for your Maths year: ${recommendedLabel}</p>
        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          ${Object.entries(NUMBER_BUILDER_LEVELS).map(([difficulty, level]) => `
            <button type="button" data-action="number-builder-start" data-difficulty="${difficulty}"
                    data-profile-recommended="${difficulty === recommendedDifficulty}"
                    class="rounded-xl ${difficulty === recommendedDifficulty ? 'bg-sky-700 hover:bg-sky-800' : 'bg-slate-800 hover:bg-slate-700'} px-4 py-3 text-left font-bold text-white">
              <span class="block capitalize">${difficulty}</span>
              <span class="mt-1 block text-xs font-medium text-slate-200">${level.length} numbers · ${level.label}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  },

  renderMissingNumberCard() {
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const recommendedLabel = recommendedDifficulty[0].toUpperCase() + recommendedDifficulty.slice(1);
    return `
      <section class="rounded-2xl border-2 border-violet-600/60 bg-slate-900 p-6 shadow-lg">
        <p class="text-xs font-bold uppercase tracking-widest text-violet-300">Number patterns</p>
        <h2 class="mt-2 font-ninja text-2xl font-bold text-white">Missing Number</h2>
        <p class="mt-2 text-sm text-slate-300">Read the rule, spot the pattern, and choose the number that completes the sequence.</p>
        <p class="mt-4 text-xs font-bold text-violet-200">Choose a range · Recommended for your Maths year: ${recommendedLabel}</p>
        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          ${Object.entries(MISSING_NUMBER_LEVELS).map(([difficulty, level]) => `
            <button type="button" data-action="missing-number-start" data-difficulty="${difficulty}"
                    data-profile-recommended="${difficulty === recommendedDifficulty}"
                    class="rounded-xl ${difficulty === recommendedDifficulty ? 'bg-violet-700 hover:bg-violet-800' : 'bg-slate-800 hover:bg-slate-700'} px-4 py-3 text-left font-bold text-white">
              <span class="block capitalize">${difficulty}</span>
              <span class="mt-1 block text-xs font-medium text-slate-200">${level.length} numbers · ${level.label}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  },

  setMathsWorldTopic(topic) {
    if (!MATHS_WORLD_TOPICS.some(item => item.id === topic)) return;
    this.mathsWorldTopic = topic;
    this.renderMathsWorld();
    document.querySelector(`[data-action="maths-topic"][data-topic="${topic}"]`)?.focus();
  },

  startNumberBuilder(difficulty = ProfileManager.getSubjectDifficulty('maths')) {
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const level = Object.hasOwn(NUMBER_BUILDER_LEVELS, difficulty) ? difficulty : recommendedDifficulty;
    const questions = NumberBuilder.generateQuestions(level, 5);
    this.currentView = 'maths-world';
    this.numberBuilderGame = {
      difficulty: level,
      questions,
      selected: [],
      index: 0,
      lastAnswerCorrect: null
    };
    this.numberBuilderEngine = new ActivityEngine();
    this.numberBuilderEngine.startQuiz({
      id: 'maths-number-builder',
      title: 'Number Builder',
      subject: 'Maths',
      skillId: 'green_order',
      questions,
      settings: { trackProgress: true, awardStars: true }
    });

    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'maths-world';
    main.innerHTML = '<div class="mx-auto max-w-3xl px-4 py-6"><div id="number-builder-arena"></div></div>';
    this.renderNumberBuilderQuestion();
  },

  renderNumberBuilderQuestion() {
    const game = this.numberBuilderGame;
    const arena = document.getElementById('number-builder-arena');
    if (!game || !arena) return;
    const focusNextTile = game.focusNextTile;
    game.focusNextTile = false;

    if (game.index >= game.questions.length) {
      arena.innerHTML = `
        <section class="rounded-3xl border-2 border-sky-500 bg-slate-900 p-7 text-center shadow-2xl">
          <div class="text-5xl" aria-hidden="true">🏆</div>
          <h1 tabindex="-1" class="mt-3 font-ninja text-2xl font-bold text-white">Number Builder complete!</h1>
          <p class="mt-2 text-slate-300">You ordered ${this.numberBuilderEngine.score} of ${game.questions.length} sequences correctly.</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" data-action="number-builder-start" data-difficulty="${game.difficulty}" class="rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800">Play again</button>
            <button type="button" data-action="maths-world" class="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white hover:bg-slate-600">Maths World topics</button>
          </div>
        </section>
      `;
      arena.querySelector('h1')?.focus();
      return;
    }

    const question = game.questions[game.index];
    const answered = this.numberBuilderEngine.answered;
    const feedback = answered
      ? EducationalFeedback.render({
        id: 'number-builder-feedback',
        correct: game.lastAnswerCorrect,
        message: question.feedback[game.lastAnswerCorrect ? 'correct' : 'incorrect'],
        explanation: question.feedback.explanation,
        retryAction: game.lastAnswerCorrect ? null : 'number-builder-retry',
        continueAction: game.lastAnswerCorrect ? 'number-builder-next' : null,
        continueLabel: game.index === game.questions.length - 1 ? 'Finish activity' : 'Next sequence →'
      })
      : '';
    const slots = question.correctOrder.map((_, index) => {
      const value = game.selected[index];
      return `<li class="flex min-h-14 min-w-14 items-center justify-center rounded-xl border-2 ${value === undefined ? 'border-dashed border-slate-600 bg-slate-950 text-slate-400' : 'number-builder-slot--filled border-sky-500 bg-sky-950 text-xl font-bold text-white'}">
        ${value === undefined ? `<span class="sr-only">Position ${index + 1}, empty</span><span aria-hidden="true">?</span>` : `<span aria-label="Position ${index + 1}: ${value}">${value}</span>`}
      </li>`;
    }).join('');
    const tiles = question.options.map(value => `
      <button type="button" data-action="number-builder-pick" data-value="${value}"
              aria-pressed="${game.selected.includes(value)}"
              ${answered || game.selected.includes(value) ? 'disabled' : ''}
              class="min-h-14 min-w-14 rounded-xl border-2 ${game.selected.includes(value) ? 'border-sky-400 bg-sky-800' : 'border-slate-600 bg-slate-800 hover:border-sky-400'} px-4 py-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        ${value}
      </button>
    `).join('');

    arena.innerHTML = `
      <section class="rounded-3xl border-2 border-sky-600/70 bg-slate-900 p-5 shadow-2xl sm:p-7">
        <div class="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <button type="button" data-action="maths-world" class="text-xs font-bold text-slate-400 hover:text-white">← Exit activity</button>
          <div class="text-center">
            <h1 class="font-ninja text-lg font-bold text-sky-300">Number Builder</h1>
            <p class="text-xs capitalize text-slate-400">${game.difficulty} · Round ${game.index + 1} of ${game.questions.length}</p>
          </div>
          <span class="text-sm font-bold text-white" aria-label="Score">${this.numberBuilderEngine.score} / ${game.questions.length}</span>
        </div>
        <h2 class="text-center font-ninja text-xl font-bold text-white">${question.prompt}</h2>
        <ol aria-label="Your number order" class="my-6 flex flex-wrap justify-center gap-2">${slots}</ol>
        <div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Choose number tiles">${tiles}</div>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" data-action="number-builder-check" ${game.selected.length !== question.correctOrder.length || answered ? 'disabled' : ''}
                  class="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">Check order</button>
          ${game.selected.length && !answered ? '<button type="button" data-action="number-builder-clear" class="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white hover:bg-slate-600">Clear sequence</button>' : ''}
        </div>
        ${feedback}
      </section>
    `;
    if (focusNextTile) {
      const nextTile = arena.querySelector('[data-action="number-builder-pick"]:not(:disabled)');
      (nextTile || arena.querySelector('[data-action="number-builder-check"]'))?.focus();
    }
  },

  pickNumberBuilderTile(value) {
    const game = this.numberBuilderGame;
    const question = game?.questions[game.index];
    if (!question || this.numberBuilderEngine.answered ||
      !Number.isInteger(value) || !question.options.includes(value) ||
      game.selected.includes(value) || game.selected.length >= question.correctOrder.length) return;
    game.selected.push(value);
    game.focusNextTile = true;
    this.renderNumberBuilderQuestion();
  },

  submitNumberBuilderAnswer() {
    const game = this.numberBuilderGame;
    const question = game?.questions[game.index];
    if (!question || game.selected.length !== question.correctOrder.length ||
      this.numberBuilderEngine.answered) return;
    game.lastAnswerCorrect = this.numberBuilderEngine.submitAnswer(game.selected);
    this.renderNumberBuilderQuestion();
    const status = document.querySelector('#number-builder-feedback [role="status"]');
    if (status) {
      status.tabIndex = -1;
      status.focus();
    }
  },

  clearNumberBuilderSequence() {
    const game = this.numberBuilderGame;
    if (!game || this.numberBuilderEngine.answered) return;
    game.selected = [];
    game.focusNextTile = true;
    this.renderNumberBuilderQuestion();
  },

  retryNumberBuilderQuestion() {
    const game = this.numberBuilderGame;
    if (!game || !this.numberBuilderEngine.allowRetry()) return;
    game.selected = [];
    game.lastAnswerCorrect = null;
    game.focusNextTile = true;
    this.renderNumberBuilderQuestion();
  },

  nextNumberBuilderQuestion() {
    const game = this.numberBuilderGame;
    if (!game?.lastAnswerCorrect) return;
    const hasNext = this.numberBuilderEngine.nextQuestion();
    game.index = hasNext ? this.numberBuilderEngine.currentIndex : game.questions.length;
    game.selected = [];
    game.lastAnswerCorrect = null;
    game.focusNextTile = true;
    this.renderNumberBuilderQuestion();
  },

  startMissingNumber(difficulty = ProfileManager.getSubjectDifficulty('maths')) {
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const level = Object.hasOwn(MISSING_NUMBER_LEVELS, difficulty) ? difficulty : recommendedDifficulty;
    const main = document.getElementById('app-main');
    if (!main) throw new Error('Missing Number activity container was not rendered');
    let questions;
    try {
      questions = MissingNumber.generateQuestions(
        level,
        5,
        this.missingNumberPreviousSequenceKeys || []
      );
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      this.currentView = 'maths-world';
      main.dataset.page = 'maths-world';
      main.innerHTML = `
        <div class="mx-auto max-w-3xl px-4 py-6">
          <section class="rounded-3xl border-2 border-amber-500 bg-slate-900 p-7 text-center shadow-2xl" role="alert">
            <h1 class="font-ninja text-2xl font-bold text-white">We couldn't make a safe sequence</h1>
            <p class="mt-2 text-slate-300">Return to Maths World and choose another activity or number range.</p>
            <button type="button" data-action="maths-world" class="mt-6 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800">Back to Maths World</button>
          </section>
        </div>`;
      return;
    }
    this.missingNumberPreviousSequenceKeys = questions.map(question => question.data.sequenceKey);
    this.currentView = 'maths-world';
    this.missingNumberGame = {
      difficulty: level,
      questions,
      selected: null,
      index: 0,
      lastAnswerCorrect: null
    };
    this.missingNumberEngine = new ActivityEngine();
    this.missingNumberEngine.startQuiz({
      id: 'maths-missing-number',
      title: 'Missing Number',
      subject: 'Maths',
      skillId: 'maths_missing_number',
      questions,
      settings: { trackProgress: true, awardStars: true }
    });

    main.dataset.page = 'maths-world';
    main.innerHTML = '<div class="mx-auto max-w-3xl px-4 py-6"><div id="missing-number-arena"></div></div>';
    this.renderMissingNumberQuestion();
  },

  renderMissingNumberQuestion() {
    const game = this.missingNumberGame;
    const arena = document.getElementById('missing-number-arena');
    if (!game || !arena) return;
    const focusSelected = game.focusSelected;
    game.focusSelected = false;
    const focusFirstOption = game.focusFirstOption;
    game.focusFirstOption = false;

    if (game.index >= game.questions.length) {
      arena.innerHTML = `
        <section class="rounded-3xl border-2 border-violet-500 bg-slate-900 p-7 text-center shadow-2xl">
          <div class="text-5xl" aria-hidden="true">🏆</div>
          <h1 tabindex="-1" class="mt-3 font-ninja text-2xl font-bold text-white">Missing Number complete!</h1>
          <p class="mt-2 text-slate-300">You found ${this.missingNumberEngine.score} of ${game.questions.length} missing numbers correctly.</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" data-action="missing-number-start" data-difficulty="${game.difficulty}" class="rounded-xl bg-violet-700 px-5 py-3 font-bold text-white hover:bg-violet-800">Play again</button>
            <button type="button" data-action="maths-world" class="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white hover:bg-slate-600">Maths World topics</button>
          </div>
        </section>
      `;
      arena.querySelector('h1')?.focus();
      return;
    }

    const question = game.questions[game.index];
    const answered = this.missingNumberEngine.answered;
    const feedback = answered
      ? EducationalFeedback.render({
        id: 'missing-number-feedback',
        correct: game.lastAnswerCorrect,
        message: question.feedback[game.lastAnswerCorrect ? 'correct' : 'incorrect'],
        explanation: question.feedback.explanation,
        retryAction: game.lastAnswerCorrect ? null : 'missing-number-retry',
        continueAction: game.lastAnswerCorrect ? 'missing-number-next' : null,
        continueLabel: game.index === game.questions.length - 1 ? 'Finish activity' : 'Next sequence →'
      })
      : '';
    const sequence = question.sequence.map((value, index) => `
      <li class="flex min-h-14 min-w-14 items-center justify-center rounded-xl border-2 ${value === null
        ? 'border-dashed border-violet-400 bg-violet-950 text-violet-200'
        : 'border-slate-600 bg-slate-950 text-white'}">
        ${value === null
          ? `<span aria-label="Missing number at position ${index + 1}">?</span>`
          : `<span aria-label="Position ${index + 1}: ${value}">${value}</span>`}
      </li>
    `).join('');
    const options = question.options.map(value => `
      <button type="button" data-action="missing-number-select" data-value="${value}"
              aria-pressed="${game.selected === value}"
              ${answered ? 'disabled' : ''}
              class="min-h-14 min-w-14 rounded-xl border-2 ${game.selected === value
                ? 'border-violet-300 bg-violet-800'
                : 'border-slate-600 bg-slate-800 hover:border-violet-400'} px-4 py-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        ${value}
      </button>
    `).join('');

    arena.innerHTML = `
      <section class="rounded-3xl border-2 border-violet-600/70 bg-slate-900 p-5 shadow-2xl sm:p-7">
        <div class="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <button type="button" data-action="maths-world" class="text-xs font-bold text-slate-400 hover:text-white">← Exit activity</button>
          <div class="text-center">
            <h1 class="font-ninja text-lg font-bold text-violet-300">Missing Number</h1>
            <p class="text-xs capitalize text-slate-400">${game.difficulty} · Round ${game.index + 1} of ${game.questions.length}</p>
          </div>
          <span class="text-sm font-bold text-white" aria-label="Score">${this.missingNumberEngine.score} / ${game.questions.length}</span>
        </div>
        <h2 class="text-center font-ninja text-xl font-bold text-white">${question.prompt}</h2>
        <ol aria-label="Number sequence" class="my-6 flex flex-wrap justify-center gap-2">${sequence}</ol>
        <div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Choose the missing number">${options}</div>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" data-action="missing-number-check" ${game.selected === null || answered ? 'disabled' : ''}
                  class="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">Check answer</button>
          ${game.selected !== null && !answered
            ? '<button type="button" data-action="missing-number-clear" class="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white hover:bg-slate-600">Clear choice</button>'
            : ''}
        </div>
        ${feedback}
      </section>
    `;
    if (focusSelected) {
      arena.querySelector('[data-action="missing-number-select"][aria-pressed="true"]')?.focus();
    } else if (focusFirstOption) {
      arena.querySelector('[data-action="missing-number-select"]')?.focus();
    }
  },

  selectMissingNumberAnswer(value) {
    const game = this.missingNumberGame;
    const question = game?.questions[game.index];
    if (!question || this.missingNumberEngine.answered ||
      !Number.isInteger(value) || !question.options.includes(value)) return;
    game.selected = value;
    game.focusSelected = true;
    this.renderMissingNumberQuestion();
  },

  submitMissingNumberAnswer() {
    const game = this.missingNumberGame;
    const question = game?.questions[game.index];
    if (!question || game.selected === null || this.missingNumberEngine.answered) return;
    game.lastAnswerCorrect = this.missingNumberEngine.submitAnswer(game.selected);
    this.renderMissingNumberQuestion();
    const status = document.querySelector('#missing-number-feedback [role="status"]');
    if (status) {
      status.tabIndex = -1;
      status.focus();
    }
  },

  clearMissingNumberSelection() {
    const game = this.missingNumberGame;
    if (!game || this.missingNumberEngine.answered) return;
    game.selected = null;
    game.focusSelected = false;
    game.focusFirstOption = true;
    this.renderMissingNumberQuestion();
  },

  retryMissingNumberQuestion() {
    const game = this.missingNumberGame;
    if (!game || !this.missingNumberEngine.allowRetry()) return;
    game.selected = null;
    game.lastAnswerCorrect = null;
    game.focusSelected = false;
    game.focusFirstOption = true;
    this.renderMissingNumberQuestion();
  },

  nextMissingNumberQuestion() {
    const game = this.missingNumberGame;
    if (!game?.lastAnswerCorrect) return;
    const hasNext = this.missingNumberEngine.nextQuestion();
    game.index = hasNext ? this.missingNumberEngine.currentIndex : game.questions.length;
    game.selected = null;
    game.lastAnswerCorrect = null;
    game.focusSelected = false;
    game.focusFirstOption = true;
    this.renderMissingNumberQuestion();
  }
});
