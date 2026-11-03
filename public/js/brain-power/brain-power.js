const BRAIN_POWER_PATTERN_ACTIVITY_ID = 'brain-power-pattern-recognition';
const BRAIN_POWER_MEMORY_ACTIVITY_ID = 'brain-power-memory-match';
const BRAIN_POWER_CODE_ACTIVITY_ID = 'brain-power-code-breaker';
const BRAIN_POWER_PATTERN_ROUNDS_PER_DIFFICULTY = 100;
const BRAIN_POWER_PATTERN_QUESTIONS_PER_RUN = 10;
const BRAIN_POWER_PATTERN_DIFFICULTIES = ['easy', 'medium', 'hard'];
const BRAIN_POWER_MEMORY_PAIR_COUNTS = { easy: 4, medium: 6, hard: 8 };

const BRAIN_POWER_MEMORY_PAIRS = [
  { id: 'sun', name: 'Sun', symbol: '☀️' },
  { id: 'bird', name: 'Bird', symbol: '🐦' },
  { id: 'tree', name: 'Tree', symbol: '🌳' },
  { id: 'fish', name: 'Fish', symbol: '🐟' },
  { id: 'moon', name: 'Moon', symbol: '🌙' },
  { id: 'book', name: 'Book', symbol: '📘' },
  { id: 'apple', name: 'Apple', symbol: '🍎' },
  { id: 'flower', name: 'Flower', symbol: '🌼' },
  { id: 'star', name: 'Star', symbol: '⭐' },
  { id: 'cat', name: 'Cat', symbol: '🐈' },
  { id: 'boat', name: 'Boat', symbol: '⛵' },
  { id: 'cloud', name: 'Cloud', symbol: '☁️' }
];

const BRAIN_POWER_CODE_COLORS = [
  { id: 'ruby', name: 'Ruby', symbol: '🔴' },
  { id: 'sapphire', name: 'Sapphire', symbol: '🔵' },
  { id: 'emerald', name: 'Emerald', symbol: '🟢' },
  { id: 'amber', name: 'Amber', symbol: '🟡' },
  { id: 'amethyst', name: 'Amethyst', symbol: '🟣' },
  { id: 'coral', name: 'Coral', symbol: '🟠' }
];

const BRAIN_POWER_CODE_DIFFICULTIES = {
  easy: { colorCount: 3, length: 3, maxAttempts: 6 },
  medium: { colorCount: 5, length: 4, maxAttempts: 7 },
  hard: { colorCount: 6, length: 4, maxAttempts: 8 }
};

const BRAIN_POWER_PATTERN_ROUNDS = createBrainPowerPatternRounds('easy');
const BRAIN_POWER_CODE_PUZZLE = generateBrainPowerCodePuzzle('easy', createBrainPowerRandom(1));

function getBrainPowerPatternValues(round) {
  if (!round || !Array.isArray(round.sequence) ||
    !Number.isInteger(round.missingIndex) ||
    round.missingIndex < 0 || round.missingIndex >= round.sequence.length) return null;
  const answer = round.sequence[round.missingIndex];
  return {
    answer,
    sequence: round.sequence.map((value, index) => index === round.missingIndex ? null : value)
  };
}

function validateBrainPowerPatternRounds(rounds = BRAIN_POWER_PATTERN_ROUNDS) {
  return Array.isArray(rounds) && rounds.length > 0 && rounds.every(round => {
    const values = getBrainPowerPatternValues(round);
    return values &&
      Number.isSafeInteger(values.answer) &&
      round.sequence.every(Number.isSafeInteger) &&
      round.sequence.length >= 5 &&
      typeof round.explanation === 'string' &&
      round.explanation.trim() &&
      Array.isArray(round.options) &&
      round.options.length === 4 &&
      round.options.every(Number.isSafeInteger) &&
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

function createBrainPowerRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffleBrainPowerItems(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createBrainPowerPatternRound(difficulty, index) {
  let sequence;
  let explanation;
  let stepHint = 1;
  let patternType;

  if (difficulty === 'easy') {
    const start = 8 + index % 20;
    const step = 1 + Math.floor(index / 20);
    sequence = Array.from({ length: 5 }, (_, position) => start + step * position);
    explanation = `Add ${step} each time.`;
    stepHint = step;
    patternType = 'counting';
  } else if (difficulty === 'medium' && index < 50) {
    const start = 10 + index % 10;
    const stepA = 1 + Math.floor(index / 10) % 5;
    const stepB = 6 + Math.floor(index / 25);
    sequence = [start];
    for (let position = 1; position < 6; position++) {
      sequence.push(sequence[position - 1] + (position % 2 === 1 ? stepA : stepB));
    }
    explanation = `The jumps alternate: add ${stepA}, then add ${stepB}.`;
    stepHint = Math.min(stepA, stepB);
    patternType = 'alternating-steps';
  } else if (difficulty === 'medium') {
    const offset = 1 + (index - 50) % 25;
    const base = 1 + Math.floor((index - 50) / 25) * 100;
    sequence = Array.from({ length: 6 }, (_, position) =>
      base + offset + (position + 1) ** 2);
    explanation = `The differences grow by 2 each time, making consecutive square numbers with an offset of ${base + offset}.`;
    stepHint = 2;
    patternType = 'growing-differences';
  } else if (difficulty === 'hard' && index < 33) {
    const startEven = 1 + index % 11;
    const startOdd = 2 + Math.floor(index / 11) * 5;
    sequence = Array.from({ length: 7 }, (_, position) => position % 2 === 0
      ? startEven + Math.floor(position / 2) * 2
      : startOdd + Math.floor((position - 1) / 2) * 3);
    explanation = 'Read the odd and even positions as two separate counting patterns.';
    stepHint = 2;
    patternType = 'interleaved-sequences';
  } else if (difficulty === 'hard' && index < 67) {
    const localIndex = index - 33;
    const start = 2 + localIndex % 11;
    const addition = 1 + Math.floor(localIndex / 11) % 3;
    const multiplier = 2 + Math.floor(localIndex / 22);
    sequence = [start];
    for (let position = 1; position < 6; position++) {
      const previous = sequence[position - 1];
      sequence.push(position % 2 === 1 ? previous + addition : previous * multiplier);
    }
    explanation = `The operations alternate: add ${addition}, then multiply by ${multiplier}.`;
    stepHint = addition;
    patternType = 'alternating-operations';
  } else if (difficulty === 'hard') {
    const localIndex = index - 67;
    let previous = 1 + localIndex % 11;
    let current = 2 + Math.floor(localIndex / 11) * 2;
    sequence = [previous, current];
    while (sequence.length < 7) {
      const next = previous + current;
      sequence.push(next);
      previous = current;
      current = next;
    }
    explanation = 'Each number is the sum of the two numbers immediately before it.';
    stepHint = 2;
    patternType = 'fibonacci-like';
  } else {
    throw new RangeError(`Unknown Brain Power pattern difficulty: ${difficulty}`);
  }

  const missingIndex = 1 + index % (sequence.length - 2);
  const answer = sequence[missingIndex];
  const distractors = [...new Set([
    answer - stepHint,
    answer + stepHint,
    answer - 1,
    answer + 1,
    answer - 2 * stepHint,
    answer + 2 * stepHint,
    answer + 2
  ].filter(value => Number.isSafeInteger(value) && value > 0 && value !== answer))];
  const options = [answer, ...distractors.slice(0, 3)];
  while (options.length < 4) options.push(answer + options.length + 2);

  return {
    id: `pattern-${difficulty}-${String(index + 1).padStart(3, '0')}`,
    difficulty,
    patternType,
    sequence,
    missingIndex,
    options,
    explanation
  };
}

function createBrainPowerPatternRounds(difficulty, count = BRAIN_POWER_PATTERN_ROUNDS_PER_DIFFICULTY) {
  if (!BRAIN_POWER_PATTERN_DIFFICULTIES.includes(difficulty) ||
    !Number.isInteger(count) || count < 1) {
    throw new TypeError('Invalid Brain Power pattern difficulty or round count.');
  }
  return Array.from({ length: count }, (_, index) => createBrainPowerPatternRound(difficulty, index));
}

function selectBrainPowerPatternRounds(difficulty, count = BRAIN_POWER_PATTERN_QUESTIONS_PER_RUN, random = Math.random) {
  if (!Number.isInteger(count) || count < 1) {
    throw new TypeError('Pattern question count must be a positive integer.');
  }
  const rounds = createBrainPowerPatternRounds(difficulty);
  if (!validateBrainPowerPatternRounds(rounds)) throw new TypeError('Invalid Brain Power pattern data.');
  return shuffleBrainPowerItems(rounds, random).slice(0, Math.min(count, rounds.length)).map(round => ({
    ...round,
    options: shuffleBrainPowerItems(round.options, random)
  }));
}

function createBrainPowerMemoryCards(seed = 0, difficulty = 'easy', pairs = BRAIN_POWER_MEMORY_PAIRS) {
  if (!Object.prototype.hasOwnProperty.call(BRAIN_POWER_MEMORY_PAIR_COUNTS, difficulty)) {
    throw new RangeError(`Unknown Memory Match difficulty: ${difficulty}`);
  }
  const pairCount = BRAIN_POWER_MEMORY_PAIR_COUNTS[difficulty];
  if (!validateBrainPowerMemoryPairs(pairs)) throw new TypeError('Invalid Brain Power Memory Match pairs.');
  if (!pairCount || pairCount > pairs.length) throw new TypeError(`Invalid Memory Match difficulty: ${difficulty}`);
  const random = createBrainPowerRandom(seed);
  const selectedPairs = shuffleBrainPowerItems(pairs, random).slice(0, pairCount);
  const cards = selectedPairs.flatMap(pair => [
    { id: `${pair.id}-symbol`, pairId: pair.id, name: pair.name, label: pair.symbol, side: 'symbol' },
    { id: `${pair.id}-word`, pairId: pair.id, name: pair.name, label: pair.name, side: 'word' }
  ]);
  return shuffleBrainPowerItems(cards, random);
}

function createBrainPowerMemoryState(seed = 0, difficulty = 'easy') {
  const pairCount = BRAIN_POWER_MEMORY_PAIR_COUNTS[difficulty];
  return {
    cards: createBrainPowerMemoryCards(seed, difficulty),
    difficulty,
    pairCount,
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
    return { ...state, message: 'Choose a different card to find the pair.' };
  }

  const previousSelection = state.selectedCardIds.length === 2 ? [] : state.selectedCardIds;
  if (previousSelection.length === 0) {
    return {
      ...state,
      selectedCardIds: [cardId],
      message: 'Choose one more card to complete a pair.'
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
      message: `Pair found: ${card.name}. ${matchedPairIds.length} of ${state.pairCount} pairs found.`
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

function getBrainPowerCodeColors(difficulty) {
  if (!Object.prototype.hasOwnProperty.call(BRAIN_POWER_CODE_DIFFICULTIES, difficulty)) {
    throw new RangeError(`Unknown Code Breaker difficulty: ${difficulty}`);
  }
  const settings = BRAIN_POWER_CODE_DIFFICULTIES[difficulty];
  return BRAIN_POWER_CODE_COLORS.slice(0, settings.colorCount);
}

function validateBrainPowerCodePuzzle(puzzle = BRAIN_POWER_CODE_PUZZLE, colors) {
  if (!puzzle || !Number.isInteger(puzzle.length) || puzzle.length < 1 ||
    !Number.isInteger(puzzle.maxAttempts) || puzzle.maxAttempts < 1 ||
    !Array.isArray(puzzle.solution) || puzzle.solution.length !== puzzle.length ||
    !Array.isArray(puzzle.clues) || puzzle.clues.length < 1 ||
    (puzzle.difficulty && !Object.prototype.hasOwnProperty.call(BRAIN_POWER_CODE_DIFFICULTIES, puzzle.difficulty))) {
    return false;
  }
  const allowedColors = colors || (puzzle.difficulty
    ? getBrainPowerCodeColors(puzzle.difficulty)
    : BRAIN_POWER_CODE_COLORS);
  if (!Array.isArray(allowedColors) || allowedColors.length < 2) return false;
  const colorIds = allowedColors.map(color => typeof color === 'string' ? color : color.id);
  if (!puzzle.solution.every(color => colorIds.includes(color)) ||
    !puzzle.clues.every(clue =>
      Array.isArray(clue.guess) &&
      clue.guess.length === puzzle.length &&
      clue.guess.every(color => colorIds.includes(color)) &&
      Number.isInteger(clue.exact) &&
      Number.isInteger(clue.misplaced) &&
      clue.exact >= 0 &&
      clue.misplaced >= 0 &&
      clue.exact + clue.misplaced <= puzzle.length &&
      JSON.stringify(clue.guess) !== JSON.stringify(puzzle.solution))) return false;

  const solutions = enumerateBrainPowerCodes(colorIds, puzzle.length).filter(candidate =>
    puzzle.clues.every(clue => {
      const feedback = getBrainPowerCodeFeedback(candidate, clue.guess);
      return feedback.exact === clue.exact && feedback.misplaced === clue.misplaced;
    }));
  return solutions.length === 1 &&
    JSON.stringify(solutions[0]) === JSON.stringify(puzzle.solution);
}

function generateBrainPowerCodePuzzle(difficulty = 'easy', random = Math.random) {
  const settings = BRAIN_POWER_CODE_DIFFICULTIES[difficulty];
  if (!settings) throw new RangeError(`Unknown Code Breaker difficulty: ${difficulty}`);
  const colors = getBrainPowerCodeColors(difficulty);
  const colorIds = colors.map(color => color.id);
  const allCodes = enumerateBrainPowerCodes(colorIds, settings.length);
  const possibleSolutions = shuffleBrainPowerItems(allCodes, random);

  for (const solution of possibleSolutions) {
    let remainingCodes = allCodes;
    const clueGuesses = shuffleBrainPowerItems(
      allCodes.filter(guess => JSON.stringify(guess) !== JSON.stringify(solution)),
      random
    );
    const clues = [];

    for (const guess of clueGuesses) {
      const feedback = getBrainPowerCodeFeedback(solution, guess);
      const nextCodes = remainingCodes.filter(candidate => {
        const candidateFeedback = getBrainPowerCodeFeedback(candidate, guess);
        return candidateFeedback.exact === feedback.exact &&
          candidateFeedback.misplaced === feedback.misplaced;
      });
      if (nextCodes.length < remainingCodes.length) {
        clues.push({ guess: [...guess], ...feedback });
        remainingCodes = nextCodes;
        if (remainingCodes.length === 1) break;
      }
    }

    if (remainingCodes.length === 1) {
      return {
        difficulty,
        length: settings.length,
        maxAttempts: settings.maxAttempts,
        solution: [...solution],
        clues
      };
    }
  }

  throw new Error(`Could not generate a uniquely solvable ${difficulty} Code Breaker puzzle.`);
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
            <p>Look for number patterns, alternating rules, and sequences that take careful reasoning.</p>
            <div class="brain-power-difficulty-options" role="group" aria-label="Pattern Recognition difficulty">
              <button type="button" class="brain-power-button" data-action="brain-pattern-start" data-difficulty="easy">Easy</button>
              <button type="button" class="brain-power-button" data-action="brain-pattern-start" data-difficulty="medium">Medium</button>
              <button type="button" class="brain-power-button" data-action="brain-pattern-start" data-difficulty="hard">Hard</button>
            </div>
          </article>
          <article class="brain-power-activity">
            <span class="brain-power-activity__icon" aria-hidden="true">🧩</span>
            <p class="brain-power-activity__eyebrow">Remember and match</p>
            <h2>Memory Match</h2>
            <p>Find each matching symbol and word pair. Larger boards have more pairs; there is no timer.</p>
            <div class="brain-power-difficulty-options" role="group" aria-label="Memory Match difficulty">
              <button type="button" class="brain-power-button" data-action="brain-memory-start" data-difficulty="easy">Easy</button>
              <button type="button" class="brain-power-button" data-action="brain-memory-start" data-difficulty="medium">Medium</button>
              <button type="button" class="brain-power-button" data-action="brain-memory-start" data-difficulty="hard">Hard</button>
            </div>
          </article>
          <article class="brain-power-activity">
            <span class="brain-power-activity__icon" aria-hidden="true">🔐</span>
            <p class="brain-power-activity__eyebrow">Think through the clues</p>
            <h2>Code Breaker</h2>
            <p>Easy uses three colors. Medium and hard add more colors and a longer code.</p>
            <div class="brain-power-difficulty-options" role="group" aria-label="Code Breaker difficulty">
              <button type="button" class="brain-power-button" data-action="brain-code-start" data-difficulty="easy">Easy</button>
              <button type="button" class="brain-power-button" data-action="brain-code-start" data-difficulty="medium">Medium</button>
              <button type="button" class="brain-power-button" data-action="brain-code-start" data-difficulty="hard">Hard</button>
            </div>
          </article>
        </div>
      </div>
    `;
  },

  startBrainPowerPattern(difficulty = 'easy') {
    const rounds = selectBrainPowerPatternRounds(difficulty);
    this.currentView = 'brain-power-pattern';
    this.brainPowerPatternGame = { difficulty, rounds, message: '', complete: false };
    this.brainPowerPatternEngine = new ActivityEngine();
    startBrainPowerQuiz(
      this.brainPowerPatternEngine,
      BRAIN_POWER_PATTERN_ACTIVITY_ID,
      'Pattern Recognition',
      'logic_pattern_recognition',
      rounds.map((round, index) => {
        const values = getBrainPowerPatternValues(round);
        return {
          id: `${BRAIN_POWER_PATTERN_ACTIVITY_ID}-${round.id}`,
          type: 'choice',
          prompt: `${difficulty} pattern ${index + 1}`,
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
            <p>You spotted every number pattern in the ${game.difficulty} challenge.</p>
            <div class="brain-power-actions">
              <button type="button" class="brain-power-button" data-action="brain-pattern-start" data-difficulty="${game.difficulty}">Play Again</button>
              <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-power-home">Back to Brain Power</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const rounds = game.rounds;
    const round = rounds[engine.currentIndex];
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
              <p class="brain-power-kicker">${game.difficulty} challenge · Round ${engine.currentIndex + 1} of ${rounds.length}</p>
              <h1>What number is missing?</h1>
            </div>
            <span class="brain-power-progress" aria-label="Round ${engine.currentIndex + 1} of ${rounds.length}">${engine.currentIndex + 1}/${rounds.length}</span>
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

  startBrainPowerMemoryMatch(difficulty = 'easy') {
    if (!validateBrainPowerMemoryPairs()) throw new Error('Invalid Brain Power Memory Match data.');
    const seed = this.brainPowerMemoryRun ?? Math.floor(Math.random() * 4294967296);
    this.brainPowerMemoryRun = (seed + 1) >>> 0;
    this.currentView = 'brain-power-memory';
    this.brainPowerMemoryGame = createBrainPowerMemoryState(seed, difficulty);
    this.brainPowerMemoryEngine = new ActivityEngine();
    startBrainPowerGame(
      this.brainPowerMemoryEngine,
      BRAIN_POWER_MEMORY_ACTIVITY_ID,
      'Memory Match',
      'logic_memory_match',
      { difficulty, pairCount: this.brainPowerMemoryGame.pairCount, round: seed }
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
    game.complete = game.matchedPairIds.length === game.pairCount;
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
            <p>You found all ${game.pairCount} symbol and word pairs in ${game.attempts} turns.</p>
            <div class="brain-power-actions">
              <button type="button" class="brain-power-button" data-action="brain-memory-start" data-difficulty="${game.difficulty}">Play Again</button>
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
      return `
        <button type="button" class="brain-power-memory-card${isSelected ? ' is-selected' : ''}${isMatched ? ' is-matched' : ''}"
          data-action="brain-memory-card" data-card-id="${card.id}" aria-pressed="${isSelected}"
          aria-label="${isVisible ? `${card.name}, ${card.side} card` : `Face-down card ${index + 1}`}"
          aria-disabled="${isMatched}">
          <span class="brain-power-memory-card__face" aria-hidden="true">${isVisible ? card.label : '?'}</span>
        </button>`;
    }).join('');
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="brain-power-back" data-action="brain-power-home">← Back to Brain Power</button>
        <section class="brain-power-panel">
          <div class="brain-power-panel__heading">
            <div>
              <p class="brain-power-kicker">${game.difficulty} · Memory Match</p>
              <h1>Find the matching pairs</h1>
            </div>
            <span class="brain-power-progress">${game.matchedPairIds.length}/${game.pairCount} pairs</span>
          </div>
          <p class="brain-power-instructions">Match each picture card with its word. There is no timer, and matched cards cannot be selected again.</p>
          <div class="brain-power-memory-grid">${cards}</div>
          <p class="brain-power-status" aria-live="polite" aria-atomic="true">${game.message}</p>
          <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-memory-start" data-difficulty="${game.difficulty}">Restart Memory Match</button>
        </section>
      </div>`;
  },

  startBrainPowerCodeBreaker(difficulty = 'easy') {
    const colors = getBrainPowerCodeColors(difficulty);
    const puzzle = generateBrainPowerCodePuzzle(difficulty);
    if (!validateBrainPowerCodePuzzle(puzzle, colors)) {
      throw new Error('Invalid Brain Power Code Breaker clues.');
    }
    this.currentView = 'brain-power-code';
    this.brainPowerCodeGame = {
      difficulty,
      puzzle,
      colors,
      guess: Array(puzzle.length).fill(colors[0].id),
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
      {
        difficulty,
        colorCount: colors.length,
        codeLength: puzzle.length,
        maxAttempts: puzzle.maxAttempts
      }
    );
    this.renderBrainPowerCodeBreaker();
  },

  selectBrainPowerCodeColor(positionIndex, colorId) {
    const game = this.brainPowerCodeGame;
    if (!game || game.complete || game.failed ||
      !Number.isInteger(positionIndex) ||
      positionIndex < 0 || positionIndex >= game.puzzle.length ||
      !game.colors.some(color => color.id === colorId)) return false;
    game.guess[positionIndex] = colorId;
    this.renderBrainPowerCodeBreaker();
    return true;
  },

  submitBrainPowerCodeGuess() {
    const game = this.brainPowerCodeGame;
    const engine = this.brainPowerCodeEngine;
    if (!game || game.complete || game.failed || !engine || engine.status !== 'active') return false;
    const puzzle = game.puzzle;
    const feedback = getBrainPowerCodeFeedback(puzzle.solution, game.guess);
    game.attempts.push({ guess: [...game.guess], ...feedback });
    if (feedback.exact === puzzle.length) {
      engine.addScore(1);
      engine.complete();
      game.complete = true;
      game.message = 'Code cracked! Every color is in the correct position.';
    } else {
      game.message = `${feedback.exact} in the right place and ${feedback.misplaced} correct color${feedback.misplaced === 1 ? '' : 's'} in the wrong place.`;
      game.failed = game.attempts.length >= puzzle.maxAttempts;
      if (game.failed) game.message = `No guesses left. The code was ${puzzle.solution
        .map(colorId => game.colors.find(color => color.id === colorId).name).join(', ')}.`;
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
            <button type="button" class="brain-power-button" data-action="brain-code-start" data-difficulty="${game.difficulty}">Try a new code</button>
              <button type="button" class="brain-power-button brain-power-button--secondary" data-action="brain-power-home">Back to Brain Power</button>
            </div>
          </section>
        </div>`;
      return;
    }

    const puzzle = game.puzzle;
    const colorOptions = game.colors.map(color =>
      `<option value="${color.id}">${color.symbol} ${color.name}</option>`).join('');
    const codeSelects = game.guess.map((colorId, index) => `
      <label class="brain-power-code-slot">
        <span>Position ${index + 1}</span>
        <select data-action="brain-code-color" data-position-index="${index}" aria-label="Color for position ${index + 1}" ${game.attempts.length >= puzzle.maxAttempts ? 'disabled' : ''}>
          ${colorOptions.replace(`value="${colorId}"`, `value="${colorId}" selected`)}
        </select>
      </label>`).join('');
    const clueRows = puzzle.clues.map((clue, index) => `
      <li class="brain-power-code-clue">
        <span>Clue ${index + 1}</span>
        <span class="brain-power-code-clue__colors">${clue.guess.map(colorId => {
          const color = game.colors.find(item => item.id === colorId);
          return `<span>${color.symbol} ${color.name}</span>`;
        }).join('')}</span>
        <span>${clue.exact} in the right place, ${clue.misplaced} correct color${clue.misplaced === 1 ? '' : 's'} in the wrong place</span>
      </li>`).join('');
    const attemptRows = game.attempts.map((attempt, index) => `
      <li>Guess ${index + 1}: ${attempt.guess.map(colorId =>
        game.colors.find(color => color.id === colorId).name).join(', ')} — ${attempt.exact} in the right place, ${attempt.misplaced} correct color${attempt.misplaced === 1 ? '' : 's'} in the wrong place</li>
    `).join('');
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <button type="button" class="brain-power-back" data-action="brain-power-home">← Back to Brain Power</button>
        <section class="brain-power-panel">
          <div class="brain-power-panel__heading">
            <div>
              <p class="brain-power-kicker">${game.difficulty} · Code Breaker</p>
              <h1>Crack the ${puzzle.length}-position code</h1>
            </div>
            <span class="brain-power-progress">${game.attempts.length}/${puzzle.maxAttempts} guesses</span>
          </div>
          <p class="brain-power-instructions">Each clue shows how many colors are exact matches and how many are in the code but in a different position. A color is counted only once. This puzzle uses ${game.colors.length} colors.</p>
          <ol class="brain-power-code-clues">${clueRows}</ol>
          <div class="brain-power-code-slots" data-code-length="${puzzle.length}">${codeSelects}</div>
          <button type="button" class="brain-power-button" data-action="brain-code-submit">Check code</button>
          <p class="brain-power-status" aria-live="polite" aria-atomic="true">${game.message}</p>
          ${game.attempts.length ? `<ol class="brain-power-code-attempts" aria-label="Your guesses">${attemptRows}</ol>` : ''}
        </section>
      </div>`;
  }
});
