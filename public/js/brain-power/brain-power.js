const BRAIN_POWER_PATTERN_ACTIVITY_ID = 'brain-power-pattern-recognition';
const BRAIN_POWER_MEMORY_ACTIVITY_ID = 'brain-power-memory-match';
const BRAIN_POWER_CODE_ACTIVITY_ID = 'brain-power-code-breaker';

const BRAIN_POWER_PATTERN_ROUNDS = [
  {
    id: 'count-by-twos',
    start: 2,
    step: 2,
    length: 5,
    missingIndex: 4,
    options: [8, 10, 12, 14],
    explanation: 'The numbers increase by 2 each time.'
  },
  {
    id: 'count-by-threes',
    start: 3,
    step: 3,
    length: 5,
    missingIndex: 2,
    options: [6, 9, 12, 15],
    explanation: 'The numbers increase by 3 each time.'
  },
  {
    id: 'count-by-fives',
    start: 5,
    step: 5,
    length: 5,
    missingIndex: 3,
    options: [15, 20, 25, 30],
    explanation: 'The numbers increase by 5 each time.'
  },
  {
    id: 'count-back-by-twos',
    start: 14,
    step: -2,
    length: 5,
    missingIndex: 1,
    options: [8, 10, 12, 16],
    explanation: 'The numbers decrease by 2 each time.'
  }
];

const BRAIN_POWER_MEMORY_PAIRS = [
  { id: 'sun', name: 'Sun', symbol: '☀️' },
  { id: 'bird', name: 'Bird', symbol: '🐦' },
  { id: 'tree', name: 'Tree', symbol: '🌳' },
  { id: 'fish', name: 'Fish', symbol: '🐟' }
];

const BRAIN_POWER_CODE_COLORS = [
  { id: 'ruby', name: 'Ruby', symbol: '🔴' },
  { id: 'sapphire', name: 'Sapphire', symbol: '🔵' },
  { id: 'emerald', name: 'Emerald', symbol: '🟢' },
  { id: 'amber', name: 'Amber', symbol: '🟡' }
];

const BRAIN_POWER_CODE_PUZZLE = {
  length: 3,
  maxAttempts: 6,
  solution: ['ruby', 'sapphire', 'emerald'],
  clues: [
    { guess: ['ruby', 'ruby', 'amber'], exact: 1, misplaced: 0 },
    { guess: ['sapphire', 'emerald', 'ruby'], exact: 0, misplaced: 3 },
    { guess: ['emerald', 'ruby', 'sapphire'], exact: 0, misplaced: 3 }
  ]
};

function getBrainPowerPatternValues(round) {
  if (!round || !Number.isInteger(round.length) || !Number.isInteger(round.missingIndex) ||
    round.missingIndex < 0 || round.missingIndex >= round.length) return null;
  const answer = round.start + round.step * round.missingIndex;
  return {
    answer,
    sequence: Array.from({ length: round.length }, (_, index) =>
      index === round.missingIndex ? null : round.start + round.step * index)
  };
}

function validateBrainPowerPatternRounds(rounds = BRAIN_POWER_PATTERN_ROUNDS) {
  return Array.isArray(rounds) && rounds.length > 0 && rounds.every(round => {
    const values = getBrainPowerPatternValues(round);
    return values &&
      Number.isInteger(round.start) &&
      Number.isInteger(round.step) &&
      round.step !== 0 &&
      typeof round.explanation === 'string' &&
      round.explanation.trim() &&
      Array.isArray(round.options) &&
      new Set(round.options).size === round.options.length &&
      round.options.filter(option => option === values.answer).length === 1;
  });
}

function validateBrainPowerMemoryPairs(pairs = BRAIN_POWER_MEMORY_PAIRS) {
  if (!Array.isArray(pairs) || pairs.length < 2) return false;
  const ids = new Set();
  const names = new Set();
  return pairs.every(pair => {
    if (!pair || typeof pair.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pair.id) ||
      ids.has(pair.id) ||
      typeof pair.name !== 'string' || !pair.name.trim() || names.has(pair.name) ||
      typeof pair.symbol !== 'string' || !pair.symbol.trim()) return false;
    ids.add(pair.id);
    names.add(pair.name);
    return true;
  });
}

function shuffleBrainPowerMemoryCards(cards, seed) {
  const shuffled = [...cards];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index--) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const swapIndex = Math.floor((state / 4294967296) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createBrainPowerMemoryCards(seed = 0, pairs = BRAIN_POWER_MEMORY_PAIRS) {
  if (!validateBrainPowerMemoryPairs(pairs)) throw new TypeError('Invalid Brain Power Memory Match pairs.');
  const cards = pairs.flatMap(pair => [
    { id: `${pair.id}-symbol`, pairId: pair.id, name: pair.name, label: pair.symbol, side: 'symbol' },
    { id: `${pair.id}-word`, pairId: pair.id, name: pair.name, label: pair.name, side: 'word' }
  ]);
  return shuffleBrainPowerMemoryCards(cards, seed);
}

function createBrainPowerMemoryState(seed = 0) {
  return {
    cards: createBrainPowerMemoryCards(seed),
    matchedPairIds: [],
    selectedCardIds: [],
    attempts: 0,
    message: 'Choose two cards to find a matching symbol and word.'
  };
}

function selectBrainPowerMemoryCard(state, cardId) {
  const card = state?.cards.find(item => item.id === cardId);
  if (!card) return state;
  if (state.matchedPairIds.includes(card.pairId)) {
    return { ...state, message: `${card.name} is already matched.` };
  }
  if (state.selectedCardIds.includes(cardId)) {
    return { ...state, message: `${card.name} is already selected.` };
  }

  const previousSelection = state.selectedCardIds.length === 2 ? [] : state.selectedCardIds;
  if (previousSelection.length === 0) {
    return {
      ...state,
      selectedCardIds: [cardId],
      message: `${card.name} selected. Choose another card.`
    };
  }

  const firstCard = state.cards.find(item => item.id === previousSelection[0]);
  const attempts = state.attempts + 1;
  if (firstCard?.pairId === card.pairId) {
    const matchedPairIds = [...state.matchedPairIds, card.pairId];
    return {
      ...state,
      matchedPairIds,
      selectedCardIds: [],
      attempts,
      message: `Match found: ${card.name}. ${matchedPairIds.length} of ${BRAIN_POWER_MEMORY_PAIRS.length} pairs found.`
    };
  }

  return {
    ...state,
    selectedCardIds: [firstCard.id, cardId],
    attempts,
    message: `Those cards do not match. Choose another card to try again.`
  };
}

function getBrainPowerCodeFeedback(solution, guess) {
  if (!Array.isArray(solution) || !Array.isArray(guess) || solution.length !== guess.length) return null;
  let exact = 0;
  const remainingSolution = [];
  const remainingGuess = [];
  solution.forEach((color, index) => {
    if (color === guess[index]) exact++;
    else {
      remainingSolution.push(color);
      remainingGuess.push(guess[index]);
    }
  });

  const colorCounts = new Map();
  remainingSolution.forEach(color => colorCounts.set(color, (colorCounts.get(color) || 0) + 1));
  let misplaced = 0;
  remainingGuess.forEach(color => {
    const count = colorCounts.get(color) || 0;
    if (count > 0) {
      misplaced++;
      colorCounts.set(color, count - 1);
    }
  });
  return { exact, misplaced };
}

function enumerateBrainPowerCodes(colors, length, prefix = []) {
  if (prefix.length === length) return [prefix];
  return colors.flatMap(color => enumerateBrainPowerCodes(colors, length, [...prefix, color]));
}

function validateBrainPowerCodePuzzle(puzzle = BRAIN_POWER_CODE_PUZZLE) {
  if (!puzzle || !Number.isInteger(puzzle.length) || puzzle.length < 1 ||
    !Number.isInteger(puzzle.maxAttempts) || puzzle.maxAttempts < 1 ||
    !Array.isArray(puzzle.solution) || puzzle.solution.length !== puzzle.length ||
    !Array.isArray(puzzle.clues) || puzzle.clues.length < 1) return false;
  const colorIds = BRAIN_POWER_CODE_COLORS.map(color => color.id);
  if (!puzzle.solution.every(color => colorIds.includes(color)) ||
    !puzzle.clues.every(clue =>
      Array.isArray(clue.guess) &&
      clue.guess.length === puzzle.length &&
      clue.guess.every(color => colorIds.includes(color)) &&
      Number.isInteger(clue.exact) &&
      Number.isInteger(clue.misplaced))) return false;

  const solutions = enumerateBrainPowerCodes(colorIds, puzzle.length).filter(candidate =>
    puzzle.clues.every(clue => {
      const feedback = getBrainPowerCodeFeedback(candidate, clue.guess);
      return feedback.exact === clue.exact && feedback.misplaced === clue.misplaced;
    }));
  return solutions.length === 1 &&
    JSON.stringify(solutions[0]) === JSON.stringify(puzzle.solution);
}

function startBrainPowerQuiz(engine, id, title, skillId, questions) {
  engine.startQuiz({
    id,
    title,
    subject: 'Brain Power',
    skillId,
    questions,
    settings: {
      trackProgress: true,
      awardStars: true,
      retryIncorrect: true,
      pointsPerCorrect: 1
    }
  });
}

function startBrainPowerGame(engine, id, title, skillId, configuration) {
  engine.start({
    version: 1,
    kind: 'game',
    id,
    title,
    subject: 'Brain Power',
    skillId,
    settings: { trackProgress: true },
    game: {
      adapter: 'brain-power',
      gameId: id,
      scoreUnit: 'rounds',
      configuration
    }
  });
}

Object.assign(App.prototype, {
  showBrainPowerHub() {
    this.currentView = 'brain-power';
    this.brainPowerPatternGame = null;
    this.brainPowerMemoryGame = null;
    this.brainPowerCodeGame = null;
    this.navigateToPath('/learning-centre/brain-power');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'brain-power';
    this.updateHeader();
    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning-centre" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span aria-hidden="true">←</span>
            <span>Back to ${window.brandWordmark()} Learning Centre</span>
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <section class="brain-power-hub">
          <p class="brain-power-kicker">${window.brandWordmark()} Brain Power</p>
          <h1>Brain Power</h1>
          <p>Notice patterns, remember pairs, and use clues to crack a code. Take your time and try a new challenge whenever you are ready.</p>
        </section>
        <div class="brain-power-activities">
          <article class="brain-power-activity">
            <span class="brain-power-activity__icon" aria-hidden="true">🔷</span>
            <p class="brain-power-activity__eyebrow">Find the rule</p>
            <h2>Pattern Recognition</h2>
            <p>Look closely at number patterns and choose the missing number.</p>
            <button type="button" class="brain-power-button" data-action="brain-pattern-start">Start Pattern Recognition</button>
          </article>
          <article class="brain-power-activity">
            <span class="brain-power-activity__icon" aria-hidden="true">🧩</span>
            <p class="brain-power-activity__eyebrow">Remember and match</p>
            <h2>Memory Match</h2>
            <p>Find each matching symbol and word pair. There is no timer.</p>
            <button type="button" class="brain-power-button" data-action="brain-memory-start">Start Memory Match</button>
          </article>
          <article class="brain-power-activity">
            <span class="brain-power-activity__icon" aria-hidden="true">🔐</span>
            <p class="brain-power-activity__eyebrow">Think through the clues</p>
            <h2>Code Breaker</h2>
            <p>Use the clues to work out the three-color code in a limited number of guesses.</p>
            <button type="button" class="brain-power-button" data-action="brain-code-start">Start Code Breaker</button>
          </article>
        </div>
      </div>
    `;
  },

  startBrainPowerPattern() {
    if (!validateBrainPowerPatternRounds()) throw new Error('Invalid Brain Power pattern data.');
    this.currentView = 'brain-power-pattern';
    this.brainPowerPatternGame = { message: '', complete: false };
    this.brainPowerPatternEngine = new ActivityEngine();
    startBrainPowerQuiz(
      this.brainPowerPatternEngine,
      BRAIN_POWER_PATTERN_ACTIVITY_ID,
      'Pattern Recognition',
      'logic_pattern_recognition',
      BRAIN_POWER_PATTERN_ROUNDS.map((round, index) => {
        const values = getBrainPowerPatternValues(round);
        return {
          id: `${BRAIN_POWER_PATTERN_ACTIVITY_ID}-${round.id}`,
          type: 'choice',
          prompt: `Pattern ${index + 1}`,
          answer: values.answer,
          options: round.options,
          feedback: { explanation: round.explanation }
        };
      })
    );
    this.renderBrainPowerPattern();
  },

  submitBrainPowerPatternAnswer(answer) {
    const game = this.brainPowerPatternGame;
    const engine = this.brainPowerPatternEngine;
    if (!game || game.complete || !engine || engine.status !== 'active') return false;
    const isCorrect = engine.submitAnswer(Number(answer));
    if (isCorrect === null) return false;
    if (!isCorrect) {
      game.message = 'Not quite. Look at how the numbers change, then try again.';
      this.renderBrainPowerPattern();
      return false;
    }

    game.message = engine.currentQuestion.feedback.explanation;
    engine.nextQuestion();
    game.complete = engine.status === 'complete';
    this.renderBrainPowerPattern();
    return true;
  },

  retryBrainPowerPattern() {
    if (!this.brainPowerPatternEngine?.allowRetry()) return false;
    this.brainPowerPatternGame.message = 'Try another choice. What is the step between the numbers?';
    this.renderBrainPowerPattern();
    return true;
  },

  renderBrainPowerPattern() {
    const main = document.getElementById('app-main');
    const game = this.brainPowerPatternGame;
    const engine = this.brainPowerPatternEngine;
    if (!main || !game || !engine) return;
    main.dataset.page = 'brain-power-pattern';
    this.updateHeader();
    if (game.complete) {
      main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <section class="brain-power-panel brain-power-result">
            <span class="brain-power-result__icon" aria-hidden="true">🌟</span>
            <p class="brain-power-kicker">Pattern Recognition</p>
            <h1>Patterns Complete!</h1>
            <p>You spotted every number pattern. Each round had a rule that made the next number predictable.</p>
            <div class="brain-power-actions">
              <button type="button" class="brain-power-button" data-action="brain-pattern-start">Play Again</button>
              <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-power-home">Back to Brain Power</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const round = BRAIN_POWER_PATTERN_ROUNDS[engine.currentIndex];
    const values = getBrainPowerPatternValues(round);
    const sequence = values.sequence.map(value => value === null
      ? '<span class="brain-power-pattern__missing" aria-label="missing number">?</span>'
      : `<span class="brain-power-pattern__number">${value}</span>`).join('');
    const options = round.options.map(option => `
      <button type="button" class="brain-power-choice" data-action="brain-pattern-answer" data-answer-value="${option}">${option}</button>
    `).join('');
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="brain-power-back" data-action="brain-power-home">← Back to Brain Power</button>
        <section class="brain-power-panel">
          <div class="brain-power-panel__heading">
            <div>
              <p class="brain-power-kicker">Pattern Recognition · Round ${engine.currentIndex + 1} of ${BRAIN_POWER_PATTERN_ROUNDS.length}</p>
              <h1>What number is missing?</h1>
            </div>
            <span class="brain-power-progress" aria-label="Round ${engine.currentIndex + 1} of ${BRAIN_POWER_PATTERN_ROUNDS.length}">${engine.currentIndex + 1}/${BRAIN_POWER_PATTERN_ROUNDS.length}</span>
          </div>
          <p class="brain-power-instructions">Look for the rule. Use the same change each time to find the missing number.</p>
          <div class="brain-power-pattern" aria-label="Number pattern">${sequence}</div>
          <div class="brain-power-choices" aria-label="Choose the missing number">${options}</div>
          <p class="brain-power-status" aria-live="polite" aria-atomic="true">${game.message}</p>
          ${engine.answered && !engine.lastAnswerCorrect
            ? '<button type="button" class="brain-power-button" data-action="brain-pattern-retry">Try again</button>'
            : ''}
        </section>
      </div>`;
  },

  startBrainPowerMemoryMatch() {
    if (!validateBrainPowerMemoryPairs()) throw new Error('Invalid Brain Power Memory Match data.');
    const seed = this.brainPowerMemoryRun || 0;
    this.brainPowerMemoryRun = seed + 1;
    this.currentView = 'brain-power-memory';
    this.brainPowerMemoryGame = createBrainPowerMemoryState(seed);
    this.brainPowerMemoryEngine = new ActivityEngine();
    startBrainPowerGame(
      this.brainPowerMemoryEngine,
      BRAIN_POWER_MEMORY_ACTIVITY_ID,
      'Memory Match',
      'logic_memory_match',
      { pairCount: BRAIN_POWER_MEMORY_PAIRS.length, round: seed }
    );
    this.renderBrainPowerMemory();
  },

  selectBrainPowerMemoryCard(cardId) {
    const game = this.brainPowerMemoryGame;
    const engine = this.brainPowerMemoryEngine;
    if (!game || game.complete || !engine || engine.status !== 'active') return false;
    const previousMatchedCount = game.matchedPairIds.length;
    const nextGame = selectBrainPowerMemoryCard(game, cardId);
    if (nextGame === game) return false;
    game.cards = nextGame.cards;
    game.matchedPairIds = nextGame.matchedPairIds;
    game.selectedCardIds = nextGame.selectedCardIds;
    game.attempts = nextGame.attempts;
    game.message = nextGame.message;
    if (game.matchedPairIds.length > previousMatchedCount) engine.addScore(1);
    game.complete = game.matchedPairIds.length === BRAIN_POWER_MEMORY_PAIRS.length;
    if (game.complete) engine.complete();
    this.renderBrainPowerMemory();
    return true;
  },

  renderBrainPowerMemory() {
    const main = document.getElementById('app-main');
    const game = this.brainPowerMemoryGame;
    if (!main || !game) return;
    main.dataset.page = 'brain-power-memory';
    this.updateHeader();
    if (game.complete) {
      main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <section class="brain-power-panel brain-power-result">
            <span class="brain-power-result__icon" aria-hidden="true">🧠</span>
            <p class="brain-power-kicker">Memory Match</p>
            <h1>All pairs matched!</h1>
            <p>You found all ${BRAIN_POWER_MEMORY_PAIRS.length} symbol and word pairs in ${game.attempts} turns.</p>
            <div class="brain-power-actions">
              <button type="button" class="brain-power-button" data-action="brain-memory-start">Play Again</button>
              <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-power-home">Back to Brain Power</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const cards = game.cards.map((card, index) => {
      const isMatched = game.matchedPairIds.includes(card.pairId);
      const isSelected = game.selectedCardIds.includes(card.id);
      const isVisible = isMatched || isSelected;
      const stateLabel = isMatched ? 'Matched' : isSelected ? 'Selected' : 'Hidden';
      return `
        <button type="button" class="brain-power-memory-card${isSelected ? ' is-selected' : ''}${isMatched ? ' is-matched' : ''}"
          data-action="brain-memory-card" data-card-id="${card.id}" aria-pressed="${isSelected}"
          aria-label="${isMatched ? `Matched: ${card.name}` : isVisible ? `${card.name}, ${card.side} card` : `Hidden card ${index + 1}`}"
          aria-disabled="${isMatched}">
          <span class="brain-power-memory-card__face" aria-hidden="true">${isVisible ? card.label : '?'}</span>
          <span class="brain-power-memory-card__state">${stateLabel}</span>
        </button>`;
    }).join('');
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="brain-power-back" data-action="brain-power-home">← Back to Brain Power</button>
        <section class="brain-power-panel">
          <div class="brain-power-panel__heading">
            <div>
              <p class="brain-power-kicker">Memory Match</p>
              <h1>Find the matching pairs</h1>
            </div>
            <span class="brain-power-progress">${game.matchedPairIds.length}/${BRAIN_POWER_MEMORY_PAIRS.length} pairs</span>
          </div>
          <p class="brain-power-instructions">Match each picture card with its word. There is no timer, and matched cards cannot be selected again.</p>
          <div class="brain-power-memory-grid">${cards}</div>
          <p class="brain-power-status" aria-live="polite" aria-atomic="true">${game.message}</p>
          <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-memory-start">Restart Memory Match</button>
        </section>
      </div>`;
  },

  startBrainPowerCodeBreaker() {
    if (!validateBrainPowerCodePuzzle()) throw new Error('Invalid Brain Power Code Breaker clues.');
    this.currentView = 'brain-power-code';
    this.brainPowerCodeGame = {
      guess: Array(BRAIN_POWER_CODE_PUZZLE.length).fill(BRAIN_POWER_CODE_COLORS[0].id),
      attempts: [],
      message: 'Use each clue to work out the secret code.',
      complete: false,
      failed: false
    };
    this.brainPowerCodeEngine = new ActivityEngine();
    startBrainPowerGame(
      this.brainPowerCodeEngine,
      BRAIN_POWER_CODE_ACTIVITY_ID,
      'Code Breaker',
      'logic_code_breaker',
      { codeLength: BRAIN_POWER_CODE_PUZZLE.length, maxAttempts: BRAIN_POWER_CODE_PUZZLE.maxAttempts }
    );
    this.renderBrainPowerCodeBreaker();
  },

  selectBrainPowerCodeColor(positionIndex, colorId) {
    const game = this.brainPowerCodeGame;
    if (!game || game.complete || game.failed ||
      !Number.isInteger(positionIndex) ||
      positionIndex < 0 || positionIndex >= BRAIN_POWER_CODE_PUZZLE.length ||
      !BRAIN_POWER_CODE_COLORS.some(color => color.id === colorId)) return false;
    game.guess[positionIndex] = colorId;
    this.renderBrainPowerCodeBreaker();
    return true;
  },

  submitBrainPowerCodeGuess() {
    const game = this.brainPowerCodeGame;
    const engine = this.brainPowerCodeEngine;
    if (!game || game.complete || game.failed || !engine || engine.status !== 'active') return false;
    const feedback = getBrainPowerCodeFeedback(BRAIN_POWER_CODE_PUZZLE.solution, game.guess);
    game.attempts.push({ guess: [...game.guess], ...feedback });
    if (feedback.exact === BRAIN_POWER_CODE_PUZZLE.length) {
      engine.addScore(1);
      engine.complete();
      game.complete = true;
      game.message = 'Code cracked! Every color is in the correct position.';
    } else {
      game.message = `${feedback.exact} in the right place and ${feedback.misplaced} correct color${feedback.misplaced === 1 ? '' : 's'} in the wrong place.`;
      game.failed = game.attempts.length >= BRAIN_POWER_CODE_PUZZLE.maxAttempts;
      if (game.failed) game.message = `No guesses left. The code was ${BRAIN_POWER_CODE_PUZZLE.solution
        .map(colorId => BRAIN_POWER_CODE_COLORS.find(color => color.id === colorId).name).join(', ')}.`;
    }
    this.renderBrainPowerCodeBreaker();
    return game.complete;
  },

  renderBrainPowerCodeBreaker() {
    const main = document.getElementById('app-main');
    const game = this.brainPowerCodeGame;
    if (!main || !game) return;
    main.dataset.page = 'brain-power-code';
    this.updateHeader();
    if (game.complete || game.failed) {
      main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <section class="brain-power-panel brain-power-result">
            <span class="brain-power-result__icon" aria-hidden="true">${game.complete ? '🔓' : '🔐'}</span>
            <p class="brain-power-kicker">Code Breaker</p>
            <h1>${game.complete ? 'Code cracked!' : 'Puzzle complete'}</h1>
            <p class="brain-power-status" aria-live="polite">${game.message}</p>
            <div class="brain-power-actions">
              <button type="button" class="brain-power-button" data-action="brain-code-start">Try a new code</button>
              <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-power-home">Back to Brain Power</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const colorOptions = BRAIN_POWER_CODE_COLORS.map(color =>
      `<option value="${color.id}">${color.symbol} ${color.name}</option>`).join('');
    const codeSelects = game.guess.map((colorId, index) => `
      <label class="brain-power-code-slot">
        <span>Position ${index + 1}</span>
        <select data-action="brain-code-color" data-position-index="${index}" aria-label="Color for position ${index + 1}" ${game.attempts.length >= BRAIN_POWER_CODE_PUZZLE.maxAttempts ? 'disabled' : ''}>
          ${colorOptions.replace(`value="${colorId}"`, `value="${colorId}" selected`)}
        </select>
      </label>`).join('');
    const clueRows = BRAIN_POWER_CODE_PUZZLE.clues.map((clue, index) => `
      <li class="brain-power-code-clue">
        <span>Clue ${index + 1}</span>
        <span class="brain-power-code-clue__colors">${clue.guess.map(colorId => {
          const color = BRAIN_POWER_CODE_COLORS.find(item => item.id === colorId);
          return `<span>${color.symbol} ${color.name}</span>`;
        }).join('')}</span>
        <span>${clue.exact} in the right place, ${clue.misplaced} correct color${clue.misplaced === 1 ? '' : 's'} in the wrong place</span>
      </li>`).join('');
    const attemptRows = game.attempts.map((attempt, index) => `
      <li>Guess ${index + 1}: ${attempt.guess.map(colorId =>
        BRAIN_POWER_CODE_COLORS.find(color => color.id === colorId).name).join(', ')} — ${attempt.exact} in the right place, ${attempt.misplaced} correct color${attempt.misplaced === 1 ? '' : 's'} in the wrong place</li>
    `).join('');
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="brain-power-back" data-action="brain-power-home">← Back to Brain Power</button>
        <section class="brain-power-panel">
          <div class="brain-power-panel__heading">
            <div>
              <p class="brain-power-kicker">Code Breaker</p>
              <h1>Crack the three-color code</h1>
            </div>
            <span class="brain-power-progress">${game.attempts.length}/${BRAIN_POWER_CODE_PUZZLE.maxAttempts} guesses</span>
          </div>
          <p class="brain-power-instructions">Each clue shows how many colors are exact matches and how many are in the code but in a different position. A color is counted only once.</p>
          <ol class="brain-power-code-clues">${clueRows}</ol>
          <div class="brain-power-code-slots">${codeSelects}</div>
          <button type="button" class="brain-power-button" data-action="brain-code-submit">Check code</button>
          <p class="brain-power-status" aria-live="polite" aria-atomic="true">${game.message}</p>
          ${game.attempts.length ? `<ol class="brain-power-code-attempts" aria-label="Your guesses">${attemptRows}</ol>` : ''}
        </section>
      </div>`;
  }
});
