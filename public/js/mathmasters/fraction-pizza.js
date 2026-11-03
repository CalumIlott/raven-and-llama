const FRACTION_PIZZA_LEVELS = {
  easy: {
    label: 'Fractions of one pizza',
    description: 'Build halves, thirds, and quarters.',
    modes: ['proper'],
    denominators: [2, 3, 4]
  },
  medium: {
    label: 'Equivalent fractions',
    description: 'Build a fraction with a different number of slices.',
    modes: ['proper', 'equivalent'],
    denominators: [2, 3, 4, 6, 8]
  },
  hard: {
    label: 'Mixed-number pizzas',
    description: 'Build equivalent fractions and mixed numbers.',
    modes: ['proper', 'equivalent', 'mixed'],
    denominators: [2, 3, 4, 6, 8]
  }
};

const FRACTION_PIZZA_GRID_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2',
  6: 'grid-cols-3',
  8: 'grid-cols-4'
};

const FRACTION_PIZZA_DRAG_TYPE = 'text/plain';

function fractionPizzaRandomItem(values) {
  return values[QuestionGenerator.randomInt(0, values.length - 1)];
}

function fractionPizzaGcd(left, right) {
  let a = left;
  let b = right;
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function fractionPizzaEquivalentOptions() {
  const options = [];
  [2, 3, 4].forEach(baseDenominator => {
    for (let numerator = 1; numerator < baseDenominator; numerator++) {
      if (fractionPizzaGcd(numerator, baseDenominator) !== 1) continue;
      for (let multiplier = 2; baseDenominator * multiplier <= 8; multiplier++) {
        options.push({ numerator, baseDenominator, multiplier });
      }
    }
  });
  return options;
}

function generateFractionPizzaQuestion(difficulty, index = 0) {
  const level = FRACTION_PIZZA_LEVELS[difficulty];
  if (!level) throw new RangeError(`Unknown Fraction Pizza difficulty: ${difficulty}`);

  const mode = fractionPizzaRandomItem(level.modes);
  let numerator;
  let denominator;
  let targetNumerator;
  let targetDenominator;
  let whole = 0;
  let pizzas = 1;
  let answer;
  let prompt;
  let explanation;

  if (mode === 'equivalent') {
    const option = fractionPizzaRandomItem(fractionPizzaEquivalentOptions());
    const pizzaDenominator = option.baseDenominator * option.multiplier;
    targetNumerator = option.numerator;
    targetDenominator = option.baseDenominator;
    numerator = option.numerator * option.multiplier;
    denominator = pizzaDenominator;
    answer = numerator;
    prompt = `Build a fraction equivalent to ${option.numerator}/${option.baseDenominator} using a pizza cut into ${pizzaDenominator} equal slices.`;
    explanation = `The pizzas must show the same share. ${option.numerator}/${option.baseDenominator} is equivalent to ${numerator}/${pizzaDenominator}.`;
  } else {
    denominator = fractionPizzaRandomItem(level.denominators);
    numerator = QuestionGenerator.randomInt(1, denominator - 1);
    targetNumerator = numerator;
    targetDenominator = denominator;
    if (mode === 'mixed') {
      whole = QuestionGenerator.randomInt(1, 2);
      pizzas = whole + 1;
      answer = whole * denominator + numerator;
      prompt = `Build ${whole} whole pizza${whole === 1 ? '' : 's'} and ${numerator}/${denominator} of another pizza.`;
      explanation = `Each whole pizza has ${denominator} equal slices. Count the whole pizzas first, then the extra ${numerator} slices.`;
    } else {
      answer = numerator;
      prompt = `Build ${numerator}/${denominator} of one pizza.`;
      explanation = `The numerator counts selected slices and the denominator counts all equal slices in one whole pizza.`;
    }
  }

  return {
    id: `fraction-pizza-${difficulty}-${index + 1}`,
    type: 'fraction-pizza',
    prompt,
    answer,
    feedback: {
      correct: 'Great job! Your pizza shows the requested fraction.',
      incorrect: 'That pizza does not show the requested fraction.',
      explanation
    },
    data: {
      mode,
      numerator,
      denominator,
      targetNumerator,
      targetDenominator,
      whole,
      pizzas,
      answer
    }
  };
}

function generateFractionPizzaQuestions(difficulty, count = 5) {
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new RangeError('Fraction Pizza question count must be between 1 and 20.');
  }
  return Array.from({ length: count }, (_, index) =>
    generateFractionPizzaQuestion(difficulty, index)
  );
}

Object.assign(App.prototype, {
  renderFractionPizzaCard() {
    const difficulties = Object.entries(FRACTION_PIZZA_LEVELS).map(([id, level]) => `
      <button type="button" data-action="fraction-pizza-start" data-difficulty="${id}"
        class="rounded-xl border-2 border-amber-500 bg-amber-950 px-4 py-3 text-left font-bold text-amber-100 transition hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
        <span class="block">${level.label}</span>
        <span class="mt-1 block text-sm font-normal text-amber-200">${level.description}</span>
      </button>
    `).join('');

    return `
      <section class="rounded-2xl border-2 border-amber-700 bg-slate-900 p-6">
        <p class="fraction-pizza-eyebrow text-sm font-bold uppercase tracking-wide">Maths World activity</p>
        <h2 class="mt-1 font-ninja text-2xl font-bold text-white">Fraction Pizza</h2>
        <p class="mt-2 max-w-2xl text-sm text-slate-300">Build fractions by placing equal pizza slices. Tap a slice to place it in the next space, or drag it to a pizza. You can also use the keyboard.</p>
        <div class="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Choose a Fraction Pizza level">
          ${difficulties}
        </div>
      </section>
    `;
  },

  startFractionPizza(difficulty = 'medium') {
    if (!Object.hasOwn(FRACTION_PIZZA_LEVELS, difficulty)) {
      throw new RangeError(`Unknown Fraction Pizza difficulty: ${difficulty}`);
    }

    this.fractionPizzaDifficulty = difficulty;
    this.fractionPizzaQuestions = generateFractionPizzaQuestions(difficulty);
    this.fractionPizzaEngine = new ActivityEngine();
    this.fractionPizzaEngine.startQuiz({
      id: 'fraction-pizza',
      title: 'Fraction Pizza',
      subject: 'Maths',
      skillId: 'brown_fraction',
      questions: this.fractionPizzaQuestions,
      settings: { trackProgress: true, awardStars: true }
    });
    this.fractionPizzaGame = {
      slots: [],
      statusMessage: 'Tap a slice to place it in the next empty space, or drag it onto a pizza.',
      focusSelector: null
    };
    this.renderFractionPizzaQuestion();
  },

  attachFractionPizzaDragHandlers(arena) {
    if (arena.dataset.fractionPizzaDragBound === 'true') return;
    arena.dataset.fractionPizzaDragBound = 'true';

    arena.addEventListener('dragstart', event => {
      const source = event.target.closest('[data-fraction-drag-token]');
      if (!source || !event.dataTransfer) return;
      const sourceSlot = source.dataset.fractionSource === 'slot'
        ? source.dataset.fractionSlot
        : '-1';
      event.dataTransfer.setData(
        FRACTION_PIZZA_DRAG_TYPE,
        `${source.dataset.fractionDragToken}:${sourceSlot}`
      );
      event.dataTransfer.effectAllowed = 'move';
    });

    arena.addEventListener('dragover', event => {
      if (event.target.closest('[data-fraction-drop-pizza], [data-fraction-pizza-tray]')) {
        event.preventDefault();
      }
    });

    arena.addEventListener('drop', event => {
      const dropZone = event.target.closest(
        '[data-action="fraction-pizza-slot"], [data-fraction-drop-pizza], [data-fraction-pizza-tray]'
      );
      if (!dropZone || !event.dataTransfer) return;
      event.preventDefault();

      const values = event.dataTransfer.getData(FRACTION_PIZZA_DRAG_TYPE).split(':');
      if (values.length !== 2 || !/^\d+$/.test(values[0]) || !/^-?\d+$/.test(values[1])) return;
      const tokenId = Number(values[0]);
      const sourceSlot = Number(values[1]);
      if (!Number.isSafeInteger(tokenId) || !Number.isSafeInteger(sourceSlot) || sourceSlot < -1) return;

      if (dropZone.matches('[data-action="fraction-pizza-slot"]')) {
        this.moveFractionPizzaToken(tokenId, sourceSlot, Number(dropZone.dataset.slot));
      } else if (dropZone.matches('[data-fraction-drop-pizza]')) {
        const pizzaIndex = Number(dropZone.dataset.fractionDropPizza);
        const question = this.fractionPizzaEngine.currentQuestion;
        const start = pizzaIndex * question.data.denominator;
        const end = start + question.data.denominator;
        const slot = this.fractionPizzaGame.slots.findIndex(
          (value, index) => index >= start && index < end && value === null
        );
        if (slot !== -1) this.moveFractionPizzaToken(tokenId, sourceSlot, slot);
      } else if (sourceSlot >= 0) {
        this.removeFractionPizzaSlice(sourceSlot);
      }
    });
  },

  moveFractionPizzaToken(tokenId, sourceSlot, targetSlot) {
    const game = this.fractionPizzaGame;
    const question = this.fractionPizzaEngine.currentQuestion;
    if (!question || this.fractionPizzaEngine.answered ||
      !Number.isInteger(targetSlot) || targetSlot < 0 ||
      targetSlot >= question.data.denominator * question.data.pizzas ||
      !Number.isInteger(tokenId) || tokenId < 0 ||
      tokenId >= question.data.denominator * question.data.pizzas ||
      game.slots[targetSlot] !== null) return false;

    if (sourceSlot === -1) {
      if (game.slots.includes(tokenId)) return false;
    } else if (sourceSlot < 0 || game.slots[sourceSlot] !== tokenId) {
      return false;
    }

    if (sourceSlot >= 0) game.slots[sourceSlot] = null;
    game.slots[targetSlot] = tokenId;
    game.statusMessage = `${game.slots.filter(value => value !== null).length} pizza slices placed.`;
    game.focusSelector = `[data-action="fraction-pizza-slot"][data-slot="${targetSlot}"]`;
    this.renderFractionPizzaQuestion();
    return true;
  },

  placeFractionPizzaToken(tokenId) {
    const game = this.fractionPizzaGame;
    const nextSlot = game.slots.indexOf(null);
    if (nextSlot === -1) {
      game.statusMessage = 'All pizza spaces are filled. Tap a placed slice to return it.';
      this.renderFractionPizzaQuestion(`[data-action="fraction-pizza-token"][data-token="${tokenId}"]`);
      return false;
    }
    return this.moveFractionPizzaToken(tokenId, -1, nextSlot);
  },

  toggleFractionPizzaSlot(slotIndex) {
    const game = this.fractionPizzaGame;
    if (this.fractionPizzaEngine.answered) return;
    if (game.slots[slotIndex] !== null && game.slots[slotIndex] !== undefined) {
      this.removeFractionPizzaSlice(slotIndex);
      return;
    }
    game.statusMessage = 'Choose a slice from the tray first, or drag one onto this space.';
    game.focusSelector = `[data-action="fraction-pizza-slot"][data-slot="${slotIndex}"]`;
    this.renderFractionPizzaQuestion();
  },

  removeFractionPizzaSlice(slotIndex) {
    const game = this.fractionPizzaGame;
    if (this.fractionPizzaEngine.answered || !Number.isInteger(slotIndex) ||
      slotIndex < 0 || slotIndex >= game.slots.length || game.slots[slotIndex] === null) return false;
    game.slots[slotIndex] = null;
    game.statusMessage = `${game.slots.filter(value => value !== null).length} pizza slices placed.`;
    game.focusSelector = `[data-action="fraction-pizza-slot"][data-slot="${slotIndex}"]`;
    this.renderFractionPizzaQuestion();
    return true;
  },

  clearFractionPizza() {
    if (this.fractionPizzaEngine.answered) return;
    this.fractionPizzaGame.slots.fill(null);
    this.fractionPizzaGame.statusMessage = 'Pizza cleared. Add slices to build the fraction.';
    this.fractionPizzaGame.focusSelector = '[data-action="fraction-pizza-token"]';
    this.renderFractionPizzaQuestion();
  },

  submitFractionPizzaAnswer() {
    const game = this.fractionPizzaGame;
    const question = this.fractionPizzaEngine.currentQuestion;
    if (!question || this.fractionPizzaEngine.answered) return;
    const selectedCount = game.slots.filter(value => value !== null).length;
    const isCorrect = this.fractionPizzaEngine.recordOutcome(selectedCount === question.answer);
    game.statusMessage = isCorrect
      ? 'Correct! Your pizza shows the requested fraction.'
      : `${selectedCount} slices placed. Try the fraction again.`;
    this.renderFractionPizzaQuestion('#fraction-pizza-feedback');
  },

  retryFractionPizzaQuestion() {
    if (!this.fractionPizzaEngine.allowRetry()) return;
    this.fractionPizzaGame.slots.fill(null);
    this.fractionPizzaGame.statusMessage = 'Try again. Add the right number of equal slices.';
    this.fractionPizzaGame.focusSelector = '[data-action="fraction-pizza-token"]';
    this.renderFractionPizzaQuestion();
  },

  nextFractionPizzaQuestion() {
    if (!this.fractionPizzaEngine.nextQuestion()) {
      this.fractionPizzaGame.statusMessage = '';
      this.renderFractionPizzaResult();
      return;
    }
    this.fractionPizzaGame.slots = [];
    this.fractionPizzaGame.statusMessage = 'Tap a slice to place it in the next empty space, or drag it onto a pizza.';
    this.fractionPizzaGame.focusSelector = '[data-action="fraction-pizza-token"]';
    this.renderFractionPizzaQuestion();
  },

  renderFractionPizzaQuestion(focusSelector = null) {
    const main = document.querySelector('main');
    const engine = this.fractionPizzaEngine;
    const game = this.fractionPizzaGame;
    if (!main || !engine || !game) return;
    const question = engine.currentQuestion;
    const questionIndex = engine.currentIndex;
    const slotCount = question.data.denominator * question.data.pizzas;
    if (game.slots.length !== slotCount) game.slots = Array(slotCount).fill(null);

    const selectedCount = game.slots.filter(value => value !== null).length;
    const targetFraction = question.data.whole
      ? `${question.data.whole} ${question.data.targetNumerator}/${question.data.targetDenominator}`
      : `${question.data.targetNumerator}/${question.data.targetDenominator}`;
    const pizzaMarkup = Array.from({ length: question.data.pizzas }, (_, pizzaIndex) => {
      const firstSlot = pizzaIndex * question.data.denominator;
      const slots = Array.from({ length: question.data.denominator }, (_, sliceIndex) => {
        const slotIndex = firstSlot + sliceIndex;
        const tokenId = game.slots[slotIndex];
        const filled = tokenId !== null;
        const dragAttributes = filled
          ? `draggable="true" data-fraction-drag-token="${tokenId}" data-fraction-source="slot" data-fraction-slot="${slotIndex}"`
          : '';
        return `
          <button type="button" data-action="fraction-pizza-slot" data-slot="${slotIndex}"
            aria-label="Pizza ${pizzaIndex + 1}, slice ${sliceIndex + 1} of ${question.data.denominator}, ${filled ? 'filled' : 'empty'}"
            aria-pressed="${filled}" ${dragAttributes} ${engine.answered ? 'disabled' : ''}
            class="fraction-pizza__slice flex aspect-square min-h-0 items-center justify-center rounded-lg border-2 border-amber-900 text-2xl font-bold text-amber-950 transition hover:brightness-110 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-300 disabled:cursor-default">
            <span aria-hidden="true">${filled ? '🍕' : '<span class="text-xl">+</span>'}</span>
          </button>
        `;
      }).join('');
      return `
        <section class="min-w-0" aria-label="Pizza ${pizzaIndex + 1}">
          <h3 class="mb-2 text-center font-bold text-amber-100">Pizza ${pizzaIndex + 1}</h3>
          <div class="fraction-pizza__plate mx-auto grid aspect-square w-56 ${FRACTION_PIZZA_GRID_COLUMNS[question.data.denominator]} gap-1 p-3 sm:w-64"
            data-fraction-drop-pizza="${pizzaIndex}" role="group"
            aria-label="Pizza ${pizzaIndex + 1}, divided into ${question.data.denominator} equal slices">
            ${slots}
          </div>
        </section>
      `;
    }).join('');
    const availableTokens = Array.from({ length: slotCount }, (_, tokenId) => tokenId)
      .filter(tokenId => !game.slots.includes(tokenId));
    const tokenMarkup = availableTokens.map(tokenId => `
      <button type="button" data-action="fraction-pizza-token" data-token="${tokenId}"
        data-fraction-drag-token="${tokenId}" aria-label="Pizza slice ${tokenId + 1}, available"
        draggable="true" ${engine.answered ? 'disabled' : ''}
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-amber-500 bg-amber-100 text-3xl shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-300 disabled:cursor-default">
        <span aria-hidden="true">🍕</span>
      </button>
    `).join('');

    const feedbackMarkup = engine.answered
      ? EducationalFeedback.render({
          correct: engine.lastAnswerCorrect,
          message: engine.lastAnswerCorrect
            ? question.feedback.correct
            : question.feedback.incorrect,
          explanation: question.feedback.explanation,
          retryAction: engine.lastAnswerCorrect ? null : 'fraction-pizza-retry',
          retryLabel: 'Try again',
          continueAction: engine.lastAnswerCorrect ? 'fraction-pizza-next' : null,
          continueLabel: questionIndex === engine.definition.questions.length - 1
            ? 'Finish activity'
            : 'Next pizza'
        })
      : '';

    main.innerHTML = `
      <section class="mx-auto max-w-5xl space-y-5 px-4 py-6" aria-labelledby="fraction-pizza-title">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="fraction-pizza-eyebrow text-sm font-bold uppercase tracking-wide">Fraction Pizza · ${this.fractionPizzaDifficulty}</p>
            <h1 id="fraction-pizza-title" class="font-ninja text-3xl font-bold text-white">Build ${targetFraction}</h1>
          </div>
          <div class="text-right text-sm text-slate-200">
            <p>Pizza ${questionIndex + 1} of ${engine.definition.questions.length}</p>
            <p>Correct: ${engine.score}</p>
          </div>
        </div>
        <p class="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200">${question.prompt}</p>
        <div class="grid gap-6 md:grid-cols-2" data-fraction-pizza-arena>
          ${pizzaMarkup}
        </div>
        <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4" aria-labelledby="fraction-pizza-tray-title">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="fraction-pizza-tray-title" class="font-bold text-white">Slice tray</h2>
            <p class="text-sm text-slate-300">${selectedCount} slice${selectedCount === 1 ? '' : 's'} placed</p>
          </div>
          <div class="mt-3 flex min-h-16 flex-wrap gap-2 rounded-xl border-2 border-dashed border-slate-600 p-3"
            data-fraction-pizza-tray role="group" aria-label="Available pizza slices">
            ${tokenMarkup || '<p class="self-center text-sm text-slate-400">All slices are on the pizzas.</p>'}
          </div>
          <p class="mt-3 text-sm text-slate-300" role="status" aria-live="polite">${game.statusMessage}</p>
        </section>
        <div class="flex flex-wrap gap-3">
          <button type="button" data-action="fraction-pizza-clear" ${engine.answered ? 'disabled' : ''}
            class="rounded-xl border border-slate-500 px-4 py-2 font-bold text-slate-100 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 disabled:opacity-50">Clear pizza</button>
          <button type="button" data-action="fraction-pizza-check" ${engine.answered ? 'disabled' : ''}
            class="rounded-xl bg-emerald-500 px-5 py-2 font-bold text-emerald-950 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:opacity-50">Check fraction</button>
          <button type="button" data-action="maths-world"
            class="rounded-xl border border-slate-500 px-4 py-2 font-bold text-slate-100 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">Maths World</button>
        </div>
        <div id="fraction-pizza-feedback" aria-live="polite">${feedbackMarkup}</div>
      </section>
    `;

    this.attachFractionPizzaDragHandlers(main);
    const focusTarget = focusSelector || game.focusSelector;
    game.focusSelector = null;
    if (focusTarget) main.querySelector(focusTarget)?.focus();
  },

  renderFractionPizzaResult() {
    const main = document.querySelector('main');
    const engine = this.fractionPizzaEngine;
    if (!main || !engine) return;
    main.innerHTML = `
      <section class="mx-auto max-w-2xl rounded-2xl border-2 border-amber-700 bg-slate-900 p-6 text-center" aria-labelledby="fraction-pizza-result-title">
        <p class="fraction-pizza-eyebrow text-sm font-bold uppercase tracking-wide">Fraction Pizza complete</p>
        <h1 id="fraction-pizza-result-title" tabindex="-1" class="mt-2 font-ninja text-3xl font-bold text-white">Well done, pizza builder!</h1>
        <p class="mt-3 text-lg text-slate-200">Correct pizzas: ${engine.score} / ${engine.definition.questions.length}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" data-action="fraction-pizza-start" data-difficulty="${this.fractionPizzaDifficulty}"
            class="rounded-xl bg-amber-400 px-5 py-3 font-bold text-amber-950 hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Play again</button>
          <button type="button" data-action="maths-world"
            class="rounded-xl border border-slate-500 px-5 py-3 font-bold text-slate-100 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">Maths World</button>
        </div>
      </section>
    `;
    main.querySelector('#fraction-pizza-result-title')?.focus();
  }
});

window.FractionPizza = {
  levels: FRACTION_PIZZA_LEVELS,
  generateQuestion: generateFractionPizzaQuestion,
  generateQuestions: generateFractionPizzaQuestions
};
