const MATHS_ACTIVITY_CATALOG = {
  white: [
    { id: 'subitising-snap', title: 'Subitising Snap', description: 'Recognise a dot pattern before the timer runs out.' },
    { id: 'number-models', title: 'Number Models', description: 'Move from real objects, to a picture, to a numeral.' },
    { id: 'partition-playground', title: 'Partitioning Playground', description: 'Share a small group of objects into two parts.' }
  ],
  yellow: [
    { id: 'tens-frame-fill', title: 'Tens Frame Fill', description: 'Fill a ten or twenty frame to match the target.' },
    { id: 'tens-mate-match', title: 'Tens Mate Match', description: 'Match number cards that make ten.' },
    { id: 'quick-fire', title: 'Quick-Fire Dash', description: 'Race through counting, doubles, and more-or-less questions.' }
  ],
  green: [
    { id: 'quick-fire', title: 'Near Doubles Dash', description: 'Race through addition, halving, and skip-counting facts.' },
    { id: 'partition-puzzles', title: 'Partitioning Puzzles', description: 'Break 100 apart and rename numbers using place value.' },
    { id: 'renaming-riddles', title: 'Renaming Riddles', description: 'Solve place-value riddles with a typed answer.' }
  ],
  blue: [
    { id: 'balance-scales', title: 'Balance the Scales', description: 'Find the missing value that balances both sides.' },
    { id: 'partition-puzzles', title: 'Partitioning Puzzles', description: 'Find different ways to partition 100 and split 2-digit numbers.' },
    { id: 'quick-fire', title: 'Quick-Fire Dash', description: 'Race through flexible addition, subtraction, and factor facts.' }
  ],
  brown: [
    { id: 'array-architect', title: 'Array Architect', description: 'Build a rectangular array and calculate its total.' },
    { id: 'fraction-fold', title: 'Fraction Fold & Colour', description: 'Shade equal parts to model a fraction.' },
    { id: 'word-problems', title: 'Multiplicative Word Problems', description: 'Solve a times-as-many story with a typed answer.' },
    { id: 'renaming-riddles', title: 'Renaming Riddles', description: 'Rename thousands, hundreds, tens, and ones.' }
  ],
  black: [
    { id: 'decimal-order', title: 'Decimal Number Line', description: 'Order decimals to thousandths from smallest to largest.' },
    { id: 'conversion-match', title: 'Conversion Match', description: 'Match equivalent fractions, decimals, and percentages.' },
    { id: 'word-problems', title: 'Multiplicative Word Problems', description: 'Work through a multi-step rate or multiplication story.' },
    { id: 'quick-fire', title: 'Quick-Fire Dash', description: 'Race through mental maths and fraction facts.' }
  ],
  platinum: [
    { id: 'bodmas-builder', title: 'BODMAS Builder', description: 'Use each digit in 2018 once to build a target expression.' },
    { id: 'conversion-match', title: 'Conversion Match', description: 'Match equivalent fractions, decimals, and percentages.' },
    { id: 'word-problems', title: 'Problem-Solving Steps', description: 'Solve a multi-step story and enter the final value.' }
  ]
};

function evaluateBodmasExpression(expression) {
  const source = String(expression).trim();
  if (!source || source.length > 64 || !/^[0-9+\-*/^().\s]+$/.test(source)) return NaN;
  if (source.replace(/\D/g, '').split('').sort().join('') !== '0128') return NaN;
  const compact = source.replace(/\s/g, '');
  const tokens = compact.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) || [];
  if (tokens.join('') !== compact) return NaN;

  let index = 0;
  const parsePrimary = () => {
    const token = tokens[index++];
    if (token === '(') {
      const value = parseSum();
      if (tokens[index++] !== ')') throw new Error('Unclosed bracket.');
      return value;
    }
    if (token === '+' || token === '-') {
      const value = parsePrimary();
      return token === '-' ? -value : value;
    }
    if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error('Expected a number.');
    return Number(token);
  };
  const parsePower = () => {
    const base = parsePrimary();
    if (tokens[index] !== '^') return base;
    index++;
    const exponent = parsePower();
    if (Math.abs(exponent) > 8) throw new Error('Exponent is too large.');
    return Math.pow(base, exponent);
  };
  const parseProduct = () => {
    let value = parsePower();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const operator = tokens[index++];
      const next = parsePower();
      if (operator === '/' && next === 0) throw new Error('Cannot divide by zero.');
      value = operator === '*' ? value * next : value / next;
    }
    return value;
  };
  const parseSum = () => {
    let value = parseProduct();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++];
      const next = parseProduct();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  };

  try {
    const value = parseSum();
    return index === tokens.length && Number.isFinite(value) && Math.abs(value) < 1e9 ? value : NaN;
  } catch {
    return NaN;
  }
}

Object.assign(ArcadeEngine.prototype, {
  startMathsActivity(containerId, beltId, activityId) {
    this.stopGame();
    const activity = MATHS_ACTIVITY_CATALOG[beltId]?.find(item => item.id === activityId);
    const belt = BELTS_DATA.find(item => item.id === beltId);
    const container = document.getElementById(containerId);
    if (!activity || !belt || !container) return;

    this.startActivitySession(`maths-${beltId}-${activityId}`, activity.title);
    this.score = 0;
    this.mathsActivity = {
      activityId,
      beltId,
      activity,
      containerId,
      round: 0,
      maxRounds: activityId === 'quick-fire' ? Infinity : 5,
      question: null,
      userOrder: [],
      selectedCells: new Set(),
      assignments: [],
      matchedPairs: new Set(),
      selectedLeft: null,
      stage: 0,
      target: 0
    };

    container.innerHTML = this.renderArcadeShell(
      beltId,
      activity.title,
      'ma-score',
      '⭐',
      activity.description,
      '<div id="ma-body"></div>'
    );

    if (activityId === 'quick-fire') {
      this.mathsActivity.timeLeft = 45;
      this.gameInterval = setInterval(() => {
        this.mathsActivity.timeLeft--;
        const timer = document.getElementById('ma-time');
        if (timer) timer.textContent = this.mathsActivity.timeLeft;
        if (this.mathsActivity.timeLeft <= 0) this.finishMathsActivity();
      }, 1000);
    }

    if (activityId === 'number-models') {
      this.mathsActivity.target = QuestionGenerator.randomInt(1, 10);
      this.mathsActivity.stage = 0;
      this.renderNumberModelStage();
    } else if (activityId === 'tens-frame-fill') {
      this.mathsActivity.target = QuestionGenerator.randomInt(1, 20);
      this.mathsActivity.selectedCells = new Set();
      this.renderTensFrame();
    } else if (activityId === 'tens-mate-match') {
      this.renderPairMatch('tens');
    } else if (activityId === 'conversion-match') {
      this.renderPairMatch('conversion');
    } else if (activityId === 'partition-playground') {
      this.startPartitionRound();
    } else if (activityId === 'partition-puzzles') {
      this.renderMathsQuestion(this.makePartitionQuestion());
    } else if (activityId === 'fraction-fold') {
      this.startFractionRound();
    } else if (activityId === 'array-architect') {
      this.startArrayRound();
    } else if (activityId === 'bodmas-builder') {
      this.startBodmasRound();
    } else {
      this.renderNextMathsQuestion();
    }
  },

  startMathsActivityRound(activityId) {
    if (activityId === 'tens-frame-fill') {
      this.mathsActivity.target = QuestionGenerator.randomInt(1, 20);
      this.mathsActivity.selectedCells = new Set();
      this.renderTensFrame();
    } else if (activityId === 'partition-playground') {
      this.startPartitionRound();
    } else if (activityId === 'fraction-fold') {
      this.startFractionRound();
    } else if (activityId === 'array-architect') {
      this.startArrayRound();
    } else if (activityId === 'bodmas-builder') {
      this.startBodmasRound();
    }
  },

  getMathsActivityQuestion() {
    const { activityId, beltId } = this.mathsActivity;
    if (activityId === 'subitising-snap') return QuestionGenerator.genWhiteSubitise();
    if (activityId === 'balance-scales') return QuestionGenerator.genBlueBalancedEquation();
    if (activityId === 'decimal-order') return QuestionGenerator.genBlackDecimalOrder();
    if (activityId === 'partition-puzzles') return this.makePartitionQuestion();
    if (activityId === 'word-problems') {
      if (beltId === 'brown') return QuestionGenerator.genBrownMultiplicative();
      if (beltId === 'black') return QuestionGenerator.genBlackMultiplicative();
      return QuestionGenerator.genPlatinumProblemSolving();
    }
    if (activityId === 'renaming-riddles') return QuestionGenerator.genBrownRenaming();
    if (activityId === 'quick-fire') {
      const belt = BELTS_DATA.find(item => item.id === beltId);
      const skill = belt.skills[QuestionGenerator.randomInt(0, belt.skills.length - 1)];
      return QuestionGenerator.getQuestionForSkill(skill.id);
    }
    return QuestionGenerator.genPlatinumConversions();
  },

  renderNextMathsQuestion() {
    const question = this.getMathsActivityQuestion();
    if (!QuestionGenerator.isValidQuestion(question)) {
      throw new Error(`Maths activity generated an invalid question: ${this.mathsActivity.activityId}`);
    }
    this.renderMathsQuestion(question);
  },

  renderMathsQuestion(question) {
    const activity = this.mathsActivity;
    activity.question = question;
    activity.userOrder = [];
    const body = document.getElementById('ma-body');
    if (!body) return;
    let visual = '';
    if (question.type === 'subitise') {
      visual = VisualRenderers.renderSubitise(question.targetNumber, question.layout, question.itemIcon || '🔵');
    } else if (question.type === 'ten_frame') {
      visual = VisualRenderers.renderTenFrame(question.count, question.totalCells, question.itemIcon || '⭐');
    } else if (question.type === 'balance_scale') {
      visual = VisualRenderers.renderBalanceScale(question.leftA, question.leftB, question.rightA, '?');
    } else if (question.type === 'array_grid') {
      visual = VisualRenderers.renderArrayGrid(question.rows, question.cols, '🟠');
    } else if (question.type === 'fraction_visual') {
      visual = VisualRenderers.renderFractionVisual(question.numerator, question.denominator);
    }
    let controls;
    if (question.type === 'order_drag') {
      controls = `
        <p class="mb-3 text-center text-sm text-slate-300">Tap the values from smallest to largest.</p>
        <div id="ma-order-slots" class="mb-4 flex min-h-14 justify-center gap-2"></div>
        <div class="flex flex-wrap justify-center gap-2">
          ${question.items.map((item, index) => `<button data-action="arcade-maths-order" data-index="${index}" data-value="${encodeURIComponent(String(item))}" class="btn-ninja rounded-xl border-2 border-sky-500 bg-slate-800 px-4 py-3 text-lg font-bold text-white">${item}</button>`).join('')}
        </div>`;
    } else if (question.type === 'numeric_input' || question.type === 'short_answer') {
      const inputMode = question.type === 'numeric_input' ? 'decimal' : 'text';
      controls = `
        <form data-submit-action="arcade-maths-answer" class="mx-auto mt-5 flex max-w-sm gap-3">
          <label class="sr-only" for="ma-answer">Your answer</label>
          <input id="ma-answer" name="answer" type="text" inputmode="${inputMode}" autocomplete="off" class="min-w-0 flex-1 rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-3 text-center text-xl text-white">
          <button type="submit" class="btn-ninja rounded-xl bg-sky-600 px-5 py-3 font-bold text-white">Check</button>
        </form>`;
    } else {
      controls = `
        <div class="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-3">
          ${(question.options || []).map(option => `<button data-action="arcade-maths-answer" data-value="${encodeURIComponent(String(option))}" class="arcade-game__tile btn-ninja rounded-xl border-2 border-slate-600 bg-slate-800 p-4 text-lg font-bold text-white">${option}</button>`).join('')}
        </div>`;
    }
    body.innerHTML = `
      ${activity.activityId === 'quick-fire' ? `<p class="mb-2 text-center font-bold text-amber-300">Time left: <span id="ma-time">${activity.timeLeft}</span>s</p>` : ''}
      <div class="mb-4 flex justify-between text-sm text-slate-300"><span>Round ${activity.round + 1}${Number.isFinite(activity.maxRounds) ? ` / ${activity.maxRounds}` : ''}</span><span>${question.title || activity.activity.title}</span></div>
      <h3 class="text-center text-xl font-bold text-white">${question.prompt || question.subtitle || question.title || 'Solve the challenge'}</h3>
      ${question.subtitle && question.prompt ? `<p class="mt-1 text-center text-sm text-slate-300">${question.subtitle}</p>` : ''}
      ${visual}
      ${question.hint ? `<p class="mt-3 text-center text-sm text-sky-300">${question.hint}</p>` : ''}
      ${controls}
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  answerMathsActivity(answer) {
    const question = this.mathsActivity?.question;
    if (!question) return;
    const isNumeric = question.type === 'numeric_input' &&
      Number.isFinite(Number(answer)) && Number.isFinite(Number(question.answer));
    const isCorrect = isNumeric
      ? Number(answer) === Number(question.answer)
      : String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
    this.finishMathsRound(isCorrect);
  },

  finishMathsRound(isCorrect) {
    const feedback = document.getElementById('ma-feedback');
    if (isCorrect) {
      this.addScore(10, 'ma-score');
      this.mathsActivity.round++;
      if (this.mathsActivity.round >= this.mathsActivity.maxRounds) return this.finishMathsActivity();
      if (feedback) feedback.textContent = 'Correct! Next challenge…';
      setTimeout(() => {
        const { activityId } = this.mathsActivity;
        if (activityId === 'tens-frame-fill') this.startMathsActivityRound('tens-frame-fill');
        else if (activityId === 'partition-playground') this.startMathsActivityRound('partition-playground');
        else if (activityId === 'fraction-fold') this.startMathsActivityRound('fraction-fold');
        else if (activityId === 'array-architect') this.startMathsActivityRound('array-architect');
        else if (activityId === 'bodmas-builder') this.startMathsActivityRound('bodmas-builder');
        else this.renderNextMathsQuestion();
      }, 350);
      return;
    }
    this.deductScore(2, 'ma-score');
    if (feedback) feedback.textContent = 'Not quite—try another answer.';
  },

  pickMathsOrderItem(index, value) {
    const activity = this.mathsActivity;
    const question = activity?.question;
    if (!question || activity.userOrder.some(item => item.index === index)) return;
    activity.userOrder.push({ index, value });
    const slots = document.getElementById('ma-order-slots');
    if (slots) slots.innerHTML = activity.userOrder.map(item =>
      `<span class="rounded-lg border border-sky-500 bg-sky-950 px-3 py-2 font-bold text-white">${item.value}</span>`
    ).join('');
    if (activity.userOrder.length === question.correctOrder.length) {
      this.finishMathsRound(activity.userOrder.every((item, slot) =>
        String(item.value) === String(question.correctOrder[slot])));
    }
  },

  renderNumberModelStage() {
    const activity = this.mathsActivity;
    const body = document.getElementById('ma-body');
    if (!body) return;
    const count = activity.target;
    const objects = Array.from({ length: count }, () => '<span aria-hidden="true">🍎</span>').join(' ');
    const stage = activity.stage;
    const labels = ['Concrete objects', 'Pictorial representation', 'Abstract numeral'];
    const model = stage === 0
      ? `<div class="my-6 flex flex-wrap justify-center gap-3 text-3xl" aria-label="${count} apples">${objects}</div>`
      : stage === 1
      ? `<div class="my-6">${VisualRenderers.renderSubitise(count, 'dots', '🔵')}</div>`
      : `<p class="my-6 text-center text-5xl font-bold text-amber-300" aria-label="The numeral for the group">?</p>`;
    body.innerHTML = `
      <p class="text-center text-sm text-slate-300">Step ${stage + 1} of 3 · ${labels[stage]}</p>
      <h3 class="mt-3 text-center text-xl font-bold text-white">${stage < 2 ? `How many objects are there?` : 'Type the numeral for this quantity.'}</h3>
      ${model}
      <form data-submit-action="arcade-maths-stage" class="mx-auto flex max-w-sm gap-3">
        <label class="sr-only" for="ma-stage-answer">Your answer</label>
        <input id="ma-stage-answer" name="answer" type="text" inputmode="numeric" autocomplete="off" class="min-w-0 flex-1 rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-3 text-center text-xl text-white">
        <button type="submit" class="btn-ninja rounded-xl bg-sky-600 px-5 py-3 font-bold text-white">${stage === 2 ? 'Finish' : 'Next'}</button>
      </form>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  submitNumberModelStage(answer) {
    if (Number(answer) !== this.mathsActivity.target) {
      const feedback = document.getElementById('ma-feedback');
      if (feedback) feedback.textContent = 'Look closely at the objects or picture, then try again.';
      return;
    }
    this.mathsActivity.stage++;
    if (this.mathsActivity.stage === 3) {
      this.addScore(30, 'ma-score');
      this.finishMathsActivity();
    } else {
      this.renderNumberModelStage();
    }
  },

  renderTensFrame() {
    const activity = this.mathsActivity;
    const totalCells = 20;
    const body = document.getElementById('ma-body');
    if (!body) return;
    body.innerHTML = `
      <h3 class="text-center text-xl font-bold text-white">Fill ${activity.target} cells in the frame.</h3>
      <div class="mx-auto my-5 grid max-w-sm grid-cols-5 gap-2">
        ${Array.from({ length: totalCells }, (_, index) => {
          const filled = activity.selectedCells.has(index);
          return `<button data-action="arcade-maths-cell" data-index="${index}" aria-pressed="${filled}" aria-label="Frame cell ${index + 1}${filled ? ', filled' : ', empty'}" class="h-12 rounded-lg border-2 ${filled ? 'border-amber-300 bg-amber-400 text-slate-950' : 'border-slate-600 bg-slate-950 text-slate-500'}">${filled ? '●' : '○'}</button>`;
        }).join('')}
      </div>
      <p class="text-center text-slate-300"><span id="ma-filled-count">${activity.selectedCells.size}</span> of ${activity.target} filled</p>
      <div class="mt-4 flex justify-center gap-3">
        <button data-action="arcade-maths-submit" class="btn-ninja rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Check frame</button>
        <button data-action="arcade-maths-clear" class="btn-ninja rounded-xl bg-slate-700 px-5 py-3 font-bold text-white">Clear</button>
      </div>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  toggleMathsActivityCell(index) {
    const cells = this.mathsActivity.selectedCells;
    if (cells.has(index)) cells.delete(index);
    else cells.add(index);
    if (this.mathsActivity.activityId === 'fraction-fold') this.renderFractionFold();
    else this.renderTensFrame();
  },

  clearMathsActivitySelection() {
    const activity = this.mathsActivity;
    activity.selectedCells.clear();
    if (activity.activityId === 'fraction-fold') this.renderFractionFold();
    else if (activity.activityId === 'tens-frame-fill') this.renderTensFrame();
  },

  renderPairMatch(kind) {
    const activity = this.mathsActivity;
    activity.matchKind = kind;
    if (kind === 'tens') {
      activity.pairs = [1, 2, 3, 4, 5].map(number => ({ left: number, right: 10 - number }));
    } else {
      const pairs = [
        ['1/2', '0.5 = 50%'], ['1/4', '0.25 = 25%'], ['3/4', '0.75 = 75%'],
        ['1/5', '0.2 = 20%'], ['3/5', '0.6 = 60%']
      ];
      activity.pairs = QuestionGenerator.shuffle(pairs).map(([left, right]) => ({ left, right }));
    }
    const leftValues = QuestionGenerator.shuffle(activity.pairs.map((pair, index) => ({ value: pair.left, index })));
    const rightValues = QuestionGenerator.shuffle(activity.pairs.map((pair, index) => ({ value: pair.right, index })));
    activity.leftValues = leftValues;
    activity.rightValues = rightValues;
    const body = document.getElementById('ma-body');
    if (!body) return;
    const renderCards = (items, side) => items.map(item =>
      `<button data-action="arcade-maths-pair" data-side="${side}" data-index="${item.index}" class="arcade-game__tile btn-ninja rounded-xl border-2 border-slate-600 bg-slate-800 p-3 text-lg font-bold text-white">${item.value}</button>`
    ).join('');
    body.innerHTML = `
      <p class="mb-4 text-center text-slate-300">${kind === 'tens' ? 'Match each left card with its friend to make 10.' : 'Match each fraction with an equivalent percentage.'}</p>
      <div class="grid grid-cols-2 gap-4">
        <div class="grid gap-2">${renderCards(leftValues, 'left')}</div>
        <div class="grid gap-2">${renderCards(rightValues, 'right')}</div>
      </div>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  selectMathsPair(side, index) {
    const activity = this.mathsActivity;
    const selected = document.querySelector(`[data-action="arcade-maths-pair"][data-side="${side}"][data-index="${index}"]`);
    if (!selected || selected.disabled || activity.matchedPairs.has(index)) return;
    if (side === 'left') {
      activity.selectedLeft = index;
      selected.classList.add('is-selected');
      return;
    }
    if (activity.selectedLeft === null) return;
    const left = activity.pairs[activity.selectedLeft];
    const right = activity.pairs[index];
    const isCorrect = activity.matchKind === 'tens'
      ? left.left + right.right === 10
      : activity.selectedLeft === index;
    const leftButton = document.querySelector(`[data-action="arcade-maths-pair"][data-side="left"][data-index="${activity.selectedLeft}"]`);
    if (isCorrect) {
      activity.matchedPairs.add(activity.selectedLeft);
      if (leftButton) leftButton.disabled = true;
      selected.disabled = true;
      this.addScore(10, 'ma-score');
      if (activity.matchedPairs.size === activity.pairs.length) this.finishMathsActivity();
    } else {
      this.deductScore(2, 'ma-score');
      if (leftButton) leftButton.classList.remove('is-selected');
      const feedback = document.getElementById('ma-feedback');
      if (feedback) feedback.textContent = 'Those cards do not match. Try another pair.';
    }
    activity.selectedLeft = null;
  },

  startPartitionRound() {
    const activity = this.mathsActivity;
    activity.target = QuestionGenerator.randomInt(3, 9);
    activity.assignments = Array(activity.target).fill(0);
    this.renderPartitionRound();
  },

  renderPartitionRound() {
    const activity = this.mathsActivity;
    const body = document.getElementById('ma-body');
    if (!body) return;
    const first = activity.assignments.filter(value => value === 0).length;
    const second = activity.assignments.filter(value => value === 1).length;
    body.innerHTML = `
      <h3 class="text-center text-xl font-bold text-white">Share ${activity.target} objects between the two bowls.</h3>
      <p class="my-2 text-center text-slate-300">Tap each object to move it to the other bowl. Try a different split each round.</p>
      <div class="grid grid-cols-2 gap-4">
          ${[0, 1].map((bowl, index) => `
            <div class="min-h-28 rounded-2xl border-2 border-slate-600 bg-slate-950 p-3">
              <p class="mb-2 text-center font-bold text-amber-300">Bowl ${index + 1}: <span>${index === 0 ? first : second}</span></p>
              <div class="flex flex-wrap justify-center gap-1">
                ${activity.assignments.map((assigned, objectIndex) => assigned === bowl
                  ? `<button data-action="arcade-maths-object" data-index="${objectIndex}" aria-label="Move object ${objectIndex + 1} from bowl ${index + 1} to the other bowl" class="rounded-lg bg-slate-800 p-1 text-2xl">🍎</button>`
                  : '').join('')}
            </div>
          </div>`).join('')}
      </div>
      <p class="mt-3 text-center text-slate-300">${first} + ${second} = ${activity.target}</p>
      <div class="mt-4 text-center"><button data-action="arcade-maths-submit" class="btn-ninja rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Check split</button></div>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  movePartitionObject(index) {
    const assignments = this.mathsActivity.assignments;
    assignments[index] = assignments[index] === 0 ? 1 : 0;
    this.renderPartitionRound();
  },

  makePartitionQuestion() {
    if (QuestionGenerator.randomInt(0, 1) === 1) {
      const firstTens = QuestionGenerator.randomInt(1, 6) * 10;
      const firstOnes = QuestionGenerator.randomInt(0, 9);
      const secondTens = QuestionGenerator.randomInt(1, 8 - Math.floor(firstTens / 10)) * 10;
      const secondOnes = QuestionGenerator.randomInt(0, 9);
      const first = firstTens + firstOnes;
      const second = secondTens + secondOnes;
      return {
        type: 'numeric_input',
        title: 'Partitioning Puzzle',
        prompt: `Split ${first} and ${second} into tens and ones, then add: ${first} + ${second} = ?`,
        hint: `Add ${firstTens} + ${secondTens}, then add ${firstOnes} + ${secondOnes}.`,
        answer: first + second,
        timeLimitSeconds: 30
      };
    }
    const total = 100;
    const first = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80][QuestionGenerator.randomInt(0, 9)];
    return {
      type: 'numeric_input',
      title: 'Partitioning Puzzle',
      prompt: `${first} + ? = ${total}`,
      hint: 'Think of 100 as 10 tens. What value completes the total?',
      answer: total - first,
      timeLimitSeconds: 30
    };
  },

  startArrayRound() {
    const activity = this.mathsActivity;
    activity.rows = QuestionGenerator.randomInt(2, 7);
    activity.columns = QuestionGenerator.randomInt(2, 8);
    this.renderArrayRound();
  },

  renderArrayRound() {
    const activity = this.mathsActivity;
    const body = document.getElementById('ma-body');
    if (!body) return;
    const count = activity.rows * activity.columns;
    const cells = Array.from({ length: count }, () =>
      '<span class="flex aspect-square items-center justify-center rounded bg-amber-400 text-slate-950">●</span>'
    ).join('');
    body.innerHTML = `
      <h3 class="text-center text-xl font-bold text-white">Build an array with ${activity.rows} rows and ${activity.columns} columns.</h3>
      <div role="img" aria-label="${activity.rows} rows of ${activity.columns} counters" class="mx-auto my-5 grid max-w-sm gap-1" style="grid-template-columns: repeat(${activity.columns}, minmax(0, 1fr))">${cells}</div>
      <p class="mb-3 text-center text-slate-300">How many counters are there altogether?</p>
      <form data-submit-action="arcade-maths-answer" class="mx-auto flex max-w-sm gap-3">
        <label class="sr-only" for="ma-answer">Total counters</label>
        <input id="ma-answer" name="answer" type="text" inputmode="numeric" autocomplete="off" class="min-w-0 flex-1 rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-3 text-center text-xl text-white">
        <button type="submit" class="btn-ninja rounded-xl bg-sky-600 px-5 py-3 font-bold text-white">Check</button>
      </form>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
    activity.question = { type: 'numeric_input', answer: count };
  },

  startFractionRound() {
    const activity = this.mathsActivity;
    activity.denominator = [2, 3, 4, 8][QuestionGenerator.randomInt(0, 3)];
    activity.target = QuestionGenerator.randomInt(1, activity.denominator - 1);
    activity.selectedCells = new Set();
    this.renderFractionFold();
  },

  renderFractionFold() {
    const activity = this.mathsActivity;
    const body = document.getElementById('ma-body');
    if (!body) return;
    body.innerHTML = `
      <h3 class="text-center text-xl font-bold text-white">Fold a shape into ${activity.denominator} equal parts, then colour ${activity.target}.</h3>
      <p class="my-2 text-center text-slate-300">Tap the sections you want to colour.</p>
      <div class="mx-auto my-5 grid max-w-md gap-2" style="grid-template-columns: repeat(${Math.min(activity.denominator, 4)}, minmax(0, 1fr))">
        ${Array.from({ length: activity.denominator }, (_, index) => {
          const shaded = activity.selectedCells.has(index);
          return `<button data-action="arcade-maths-cell" data-index="${index}" aria-pressed="${shaded}" aria-label="Fraction part ${index + 1}${shaded ? ', coloured' : ', uncoloured'}" class="aspect-square rounded-xl border-2 ${shaded ? 'border-pink-300 bg-pink-500 text-white' : 'border-slate-500 bg-slate-950 text-slate-400'}">${shaded ? '■' : '□'}</button>`;
        }).join('')}
      </div>
      <p class="text-center text-slate-300">${activity.selectedCells.size} of ${activity.denominator} parts coloured</p>
      <div class="mt-4 text-center"><button data-action="arcade-maths-submit" class="btn-ninja rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Check fraction</button></div>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  startBodmasRound() {
    const activity = this.mathsActivity;
    activity.target = QuestionGenerator.randomInt(1, 20);
    const body = document.getElementById('ma-body');
    if (!body) return;
    body.innerHTML = `
      <p class="text-center text-slate-300">Use each digit 2, 0, 1, and 8 exactly once. Add brackets and operations to make:</p>
      <h3 class="my-4 text-center text-5xl font-bold text-amber-300">${activity.target}</h3>
      <form data-submit-action="arcade-maths-bodmas" class="mx-auto flex max-w-lg flex-col gap-3">
        <label for="ma-expression" class="text-sm font-bold text-slate-200">Your expression</label>
        <input id="ma-expression" name="expression" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. 20 - 18" class="rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-3 text-center text-xl text-white">
        <button type="submit" class="btn-ninja rounded-xl bg-sky-600 px-5 py-3 font-bold text-white">Check expression</button>
      </form>
      <p class="mt-3 text-center text-xs text-slate-400">Use +, −, ×, ÷, powers, and brackets. Standard operation order applies.</p>
      <p id="ma-feedback" class="mt-4 text-center font-bold text-sky-200" aria-live="polite"></p>`;
  },

  submitBodmasExpression(expression) {
    const value = evaluateBodmasExpression(expression);
    const feedback = document.getElementById('ma-feedback');
    if (Number.isFinite(value) && Math.abs(value - this.mathsActivity.target) < 1e-9) {
      this.finishMathsRound(true);
      return;
    }
    if (feedback) feedback.textContent = Number.isFinite(value)
      ? `That expression equals ${Number(value.toFixed(4))}. Check the brackets and operation order.`
      : 'Use each digit 2, 0, 1, and 8 once in a valid arithmetic expression.';
  },

  submitMathsActivity() {
    const activity = this.mathsActivity;
    if (activity.activityId === 'tens-frame-fill') {
      this.finishMathsRound(activity.selectedCells.size === activity.target);
    } else if (activity.activityId === 'partition-playground') {
      const firstPart = activity.assignments.filter(value => value === 0).length;
      const secondPart = activity.assignments.filter(value => value === 1).length;
      this.finishMathsRound(firstPart > 0 && secondPart > 0 && firstPart + secondPart === activity.target);
    } else if (activity.activityId === 'fraction-fold') {
      this.finishMathsRound(activity.selectedCells.size === activity.target);
    }
  },

  finishMathsActivity() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    this.activitySession?.complete();
    const activity = this.mathsActivity;
    const body = document.getElementById('ma-body');
    if (!body || !activity) return;
    body.innerHTML = `
      <div class="mx-auto max-w-md rounded-3xl border-2 border-emerald-500 bg-slate-900 p-8 text-center">
        <div class="mb-3 text-5xl">🏆</div>
        <h3 class="text-2xl font-bold text-white">Activity complete!</h3>
        <p class="my-3 text-slate-300">Score: <b class="text-amber-300">${this.score}</b>${Number.isFinite(activity.maxRounds) ? ` · Rounds: ${activity.round} / ${activity.maxRounds}` : ` · Correct: ${activity.matchKind ? activity.matchedPairs.size : activity.round}`}</p>
        <button data-action="maths-activity-start" data-belt-id="${activity.beltId}" data-activity-id="${activity.activityId}" class="btn-ninja rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Play again</button>
        <button data-action="arcade-return" data-belt-id="${activity.beltId}" class="btn-ninja ml-2 rounded-xl bg-slate-700 px-5 py-3 text-white">Dojo skills</button>
      </div>`;
  }
});

window.MATHS_ACTIVITY_CATALOG = MATHS_ACTIVITY_CATALOG;
window.MathsActivityGames = { evaluateBodmasExpression };
