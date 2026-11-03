class MoneyMasters {
  static DENOMINATIONS = [
    { value: 5, label: '5c', type: 'coin', colour: 'silver', shape: 'round', size: 'small' },
    { value: 10, label: '10c', type: 'coin', colour: 'silver', shape: 'round', size: 'medium' },
    { value: 20, label: '20c', type: 'coin', colour: 'silver', shape: 'round', size: 'large' },
    { value: 50, label: '50c', type: 'coin', colour: 'silver', shape: 'dodecagon', size: 'xlarge' },
    { value: 100, label: '$1', type: 'coin', colour: 'gold', shape: 'round', size: 'large' },
    { value: 200, label: '$2', type: 'coin', colour: 'gold', shape: 'round', size: 'small' },
    { value: 500, label: '$5', type: 'note', colour: 'pink', shape: 'rectangle', size: 'small' },
    { value: 1000, label: '$10', type: 'note', colour: 'blue', shape: 'rectangle', size: 'medium' },
    { value: 2000, label: '$20', type: 'note', colour: 'red', shape: 'rectangle', size: 'large' },
    { value: 5000, label: '$50', type: 'note', colour: 'yellow', shape: 'rectangle', size: 'xlarge' },
    { value: 10000, label: '$100', type: 'note', colour: 'green', shape: 'rectangle', size: 'xxlarge' }
  ];

  static ACTIVITIES = [
    {
      id: 'coin-recognition',
      skillId: 'money_coin_recognition',
      title: 'Coin & Note Match',
      emoji: '🪙',
      description: 'Learn to recognise Australian coins and notes and remember what each one is worth.'
    },
    {
      id: 'build-total',
      skillId: 'money_build_total',
      title: 'Build the Amount',
      emoji: '🛍️',
      description: 'Choose coins and notes to make an exact amount. Try different combinations!'
    },
    {
      id: 'give-change',
      skillId: 'money_give_change',
      title: 'Change Challenge',
      emoji: '🇦🇺',
      description: 'Work out how much change to give when someone pays for an item.'
    },
    {
      id: 'shopkeeper',
      skillId: 'money_shopkeeper',
      title: 'Shopkeeper',
      emoji: '🧾',
      description: 'Serve a customer by adding up a basket and giving exact change.'
    }
  ];

  static SHOPKEEPER_PRODUCTS = {
    easy: [
      { name: 'Apple', price: 25 },
      { name: 'Banana', price: 30 },
      { name: 'Juice box', price: 45 },
      { name: 'Pencil', price: 50 }
    ],
    medium: [
      { name: 'Notebook', price: 125 },
      { name: 'Storybook', price: 250 },
      { name: 'Ball', price: 325 },
      { name: 'Puzzle', price: 450 }
    ],
    hard: [
      { name: 'Toy car', price: 625 },
      { name: 'Sports ball', price: 750 },
      { name: 'Board game', price: 950 },
      { name: 'Backpack', price: 1250 }
    ]
  };

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const swapIndex = this.randomInt(0, index);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  static formatMoney(value) {
    return value < 100 ? `${value}c` : `$${(value / 100).toFixed(2)}`;
  }

  static renderDenomination(denomination, compact = false) {
    const classes = [
      'money-currency',
      `money-currency--${denomination.type}`,
      `money-currency--${denomination.colour}`,
      `money-currency--${denomination.shape}`,
      `money-currency--${denomination.size}`,
      compact ? 'money-currency--compact' : ''
    ].filter(Boolean).join(' ');
    return `<span class="${classes}" aria-hidden="true">
      ${denomination.type === 'note' ? '<span class="money-currency__window"></span>' : ''}
      <span class="money-currency__value">${denomination.label}</span>
      <span class="money-currency__mark">AU</span>
    </span>`;
  }

  static renderMoneyAmount(value, compact = false) {
    if (!Number.isInteger(value) || value < 0 || value % 5 !== 0) {
      throw new RangeError('Australian currency amounts must be non-negative whole cents in 5-cent increments.');
    }

    let remaining = value;
    const pieces = [];
    for (const denomination of [...this.DENOMINATIONS].reverse()) {
      while (remaining >= denomination.value) {
        pieces.push(denomination);
        remaining -= denomination.value;
      }
    }

    return `<span class="money-amount-visual${compact ? ' money-amount-visual--compact' : ''}" aria-hidden="true">
      ${pieces.map(denomination => this.renderDenomination(denomination, compact)).join('')}
    </span>`;
  }

  static randomAmount(min, max) {
    return this.randomInt(Math.ceil(min / 5), Math.floor(max / 5)) * 5;
  }

  static getDenominations(difficulty) {
    const maxValue = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 200 : 10000;
    return this.DENOMINATIONS.filter(denomination => denomination.value <= maxValue);
  }

  static createShopkeeperQuestion(items, payment, difficulty) {
    if (!Array.isArray(items) || items.length < 1 || items.length > 3) {
      throw new RangeError('A shopkeeper basket must contain between one and three items.');
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new TypeError('Shopkeeper difficulty must be easy, medium, or hard.');
    }
    if (items.some(item =>
      !item || typeof item.name !== 'string' || !item.name.trim() ||
      !Number.isInteger(item.price) || item.price <= 0 || item.price % 5 !== 0
    )) {
      throw new TypeError('Shopkeeper items need a name and a positive price in 5-cent increments.');
    }
    if (!Number.isInteger(payment) || payment <= 0 || payment % 5 !== 0) {
      throw new TypeError('Shopkeeper tender must be a positive amount in 5-cent increments.');
    }

    const basket = items.map(({ name, price }) => ({ name: name.trim(), price }));
    const total = basket.reduce((sum, item) => sum + item.price, 0);
    if (payment < total) {
      throw new RangeError('Shopkeeper tender must cover the basket total.');
    }

    const change = payment - total;
    return {
      prompt: 'Help the customer by giving the exact change.',
      items: basket,
      total,
      payment,
      change,
      answer: change,
      target: change,
      denominations: this.getDenominations(difficulty)
    };
  }

  static generateShopkeeperQuestion(difficulty) {
    const products = this.SHOPKEEPER_PRODUCTS[difficulty];
    const itemCount = this.randomInt(1, difficulty === 'easy' ? 2 : 3);
    const items = this.shuffle(products).slice(0, itemCount);
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const tenderOptions = difficulty === 'easy'
      ? [100, 200]
      : difficulty === 'medium'
        ? [500, 1000, 2000]
        : [2000, 5000, 10000];
    const payment = this.randomInt(1, 5) === 1
      ? total
      : tenderOptions.find(amount => amount > total);
    if (payment === undefined) {
      throw new RangeError(`No tender amount covers a ${difficulty} shopkeeper basket.`);
    }
    return this.createShopkeeperQuestion(items, payment, difficulty);
  }

  static generateChoices(answer, min, max) {
    const choices = new Set([answer]);
    while (choices.size < 4) {
      choices.add(this.randomAmount(min, max));
    }
    return this.shuffle(Array.from(choices));
  }

  static generateQuestion(activityId, difficulty = 'easy') {
    const activity = this.ACTIVITIES.find(item => item.id === activityId);
    if (!activity) return null;

    const level = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
    const denominations = this.getDenominations(level);

    if (activityId === 'coin-recognition') {
      const coin = denominations[this.randomInt(0, denominations.length - 1)];
      const options = this.shuffle(denominations).slice(0, 4);
      if (!options.some(option => option.value === coin.value)) options[0] = coin;
      return {
        prompt: 'What is this coin or note worth?',
        denomination: coin,
        answer: coin.value,
        options: this.shuffle(options)
      };
    }

    if (activityId === 'build-total') {
      const [min, max] = level === 'easy' ? [5, 60] : level === 'medium' ? [100, 1000] : [500, 5000];
      return {
        prompt: 'Choose coins and notes to make this exact amount.',
        target: this.randomAmount(min, max),
        denominations
      };
    }

    if (activityId === 'shopkeeper') {
      return this.generateShopkeeperQuestion(level);
    }

    const paymentOptions = level === 'easy'
      ? [20, 50, 100]
      : level === 'medium'
        ? [100, 200, 500, 1000]
        : [500, 1000, 2000, 5000];
    const payment = paymentOptions[this.randomInt(0, paymentOptions.length - 1)];
    const price = this.randomAmount(5, payment - 5);
    const answer = payment - price;
    return {
      prompt: `An item costs ${this.formatMoney(price)}. You pay with ${this.formatMoney(payment)}. How much change do you get?`,
      price,
      payment,
      answer,
      options: this.generateChoices(answer, 0, payment)
    };
  }
}

window.MoneyMasters = MoneyMasters;

Object.assign(App.prototype, {
  showMoneyActivity() {
    this.currentView = 'money';
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const recommendedLabel = recommendedDifficulty[0].toUpperCase() + recommendedDifficulty.slice(1);
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'money';
    this.updateHeader();
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning-centre" class="money-back-link flex items-center gap-2 text-sm font-bold">
            ← Back to Raven &amp; Llama Learning Centre
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <div class="money-hero bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <span class="text-3xl" aria-hidden="true">🇦🇺</span>
          <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold mt-2">Money Masters</h1>
          <p class="text-slate-300 text-sm sm:text-base mt-2">Explore Australian coins and notes, make totals, and practise giving change.</p>
        </div>
        <h2 class="font-ninja text-xl text-white font-bold mb-3">Choose a money game</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${MoneyMasters.ACTIVITIES.map(activity => `
            <section class="text-left bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg">
              <span class="text-3xl">${activity.emoji}</span>
              <h3 class="font-ninja text-xl font-bold text-white mt-2">${activity.title}</h3>
              <p class="text-sm text-slate-400 mt-1">${activity.description}</p>
              <p class="mt-4 text-xs font-bold text-amber-300">Choose a difficulty · 6 rounds · Recommended: ${recommendedLabel}</p>
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${[recommendedDifficulty, ...['easy', 'medium', 'hard'].filter(level => level !== recommendedDifficulty)].map(difficulty => `
                  <button type="button" data-action="money-start" data-activity-id="${activity.id}" data-difficulty="${difficulty}"
                          data-profile-recommended="${difficulty === recommendedDifficulty}"
                          class="money-difficulty-button rounded-xl border-2 ${difficulty === recommendedDifficulty ? 'border-amber-300' : 'border-slate-600'} px-2 py-2 text-sm font-bold capitalize">
                    ${difficulty}
                  </button>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </div>
      </div>
    `;
  },

  startMoneyGame(activityId, difficulty) {
    const activity = MoneyMasters.ACTIVITIES.find(item => item.id === activityId);
    if (!activity) return this.showMoneyActivity();
    const recommendedDifficulty = ProfileManager.getSubjectDifficulty('maths');
    const level = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : recommendedDifficulty;
    const feedback = {
      'coin-recognition': {
        explanation: 'Compare the shape, colour, and printed value to identify the denomination.',
        audioHint: 'Look at the shape, colour, and printed value.',
        workedExample: {
          title: 'Identify a denomination',
          steps: [
            { label: 'Check the shape', detail: 'Coins are round and notes are rectangular.' },
            { label: 'Read the value', detail: 'Use the printed denomination to confirm your choice.' }
          ]
        }
      },
      'build-total': {
        explanation: 'Combine the values you chose and compare the running total with the target.',
        audioHint: 'Add each coin or note to your running total and compare it with the target.',
        workedExample: {
          title: 'Build an amount',
          steps: [
            { label: 'Choose a denomination', detail: 'Start with a value that fits the target.' },
            { label: 'Update the total', detail: 'Add each value before choosing the next one.' }
          ]
        }
      },
      'give-change': {
        explanation: 'Count up from the price to the amount paid. The amount you add is the change.',
        audioHint: 'Count up from the price until you reach the payment.',
        workedExample: {
          title: 'Work out change',
          steps: [
            { label: 'Start at the price', detail: 'Keep the price as your starting amount.' },
            { label: 'Count up to payment', detail: 'The jumps you make add up to the change.' }
          ]
        }
      },
      shopkeeper: {
        explanation: 'Add the item prices to find the basket total, then subtract that total from the amount paid.',
        audioHint: 'Add the basket prices, then count up from the total to the amount paid.',
        workedExample: {
          title: 'Serve a customer',
          steps: [
            { label: 'Add the basket', detail: 'Combine each item price to find the total cost.' },
            { label: 'Count up to the payment', detail: 'The coins and notes you add make the exact change.' }
          ]
        }
      }
    }[activityId];
    this.moneyGame = {
      activity,
      difficulty: level,
      questions: Array.from({ length: 6 }, () => ({
        ...MoneyMasters.generateQuestion(activityId, level),
        feedback: {
          correct: 'Correct! Great work! 🌟',
          incorrect: 'Not quite — review the amounts and try again.',
          ...feedback
        }
      })),
      index: 0,
      score: 0,
      selectedCoins: [],
      answered: false,
      lastAnswerCorrect: false
    };
    this.moneyActivityEngine = new ActivityEngine();
    this.moneyActivityEngine.startQuiz({
      id: `money-${activity.id}`,
      title: activity.title,
      subject: 'Life Skills',
      skillId: activity.skillId,
      questions: this.moneyGame.questions,
      settings: { trackProgress: true }
    });
    this.currentView = 'money';
    const main = document.getElementById('app-main');
    if (!main) return;
    if (activityId === 'shopkeeper') this.bindShopkeeperDragAndDrop(main);
    main.innerHTML = '<div class="max-w-2xl mx-auto px-4 py-6"><div id="money-arena"></div></div>';
    this.renderMoneyQuestion();
  },

  bindShopkeeperDragAndDrop(main) {
    if (main.dataset.moneyDragBound === 'true') return;
    main.dataset.moneyDragBound = 'true';
    main.addEventListener('dragstart', event => {
      const button = event.target.closest?.('[data-money-draggable="true"]');
      if (!button || !event.dataTransfer) return;
      event.dataTransfer.setData('text/plain', button.dataset.value);
      event.dataTransfer.effectAllowed = 'copy';
    });
    main.addEventListener('dragover', event => {
      if (!event.target.closest?.('[data-money-change-drop-target]')) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    });
    main.addEventListener('drop', event => {
      if (!event.target.closest?.('[data-money-change-drop-target]')) return;
      const value = event.dataTransfer?.getData('text/plain');
      if (value === undefined || value === '') return;
      event.preventDefault();
      this.addMoneyCoin(Number(value));
    });
  },

  renderMoneyQuestion() {
    const game = this.moneyGame;
    const arena = document.getElementById('money-arena');
    if (!game || !arena) return;

    if (game.index >= game.questions.length) {
      arena.innerHTML = `
        <div class="text-center bg-slate-900 border-2 border-amber-500 rounded-3xl p-7 shadow-2xl">
          <div class="text-5xl mb-3">🏆</div>
          <h2 class="font-ninja text-2xl text-white font-bold">Money Game Complete!</h2>
          <p class="text-slate-300 mt-2">You scored <strong class="money-change-emphasis">${game.score} / ${game.questions.length}</strong> in ${game.activity.title}.</p>
          <div class="flex flex-wrap justify-center gap-3 mt-6">
            <button type="button" data-action="money-start" data-activity-id="${game.activity.id}" data-difficulty="${game.difficulty}"
                    class="money-play-again-button px-5 py-3 rounded-xl font-bold">Play again</button>
            <button type="button" data-action="money-home" class="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold">Choose another game</button>
          </div>
        </div>
      `;
      return;
    }

    const question = game.questions[game.index];
    const selectedTotal = game.selectedCoins.reduce((total, value) => total + value, 0);
    const isShopkeeper = game.activity.id === 'shopkeeper';
    const targetAmount = isShopkeeper ? question.change : question.target;
    const choices = ['build-total', 'shopkeeper'].includes(game.activity.id)
      ? `
        ${isShopkeeper ? `
          <section class="my-5 rounded-2xl bg-slate-950 border border-slate-700 p-4" aria-label="Customer transaction">
            <h3 class="font-bold text-white">Customer's basket</h3>
            <ul data-shopkeeper-basket class="mt-2 space-y-1 text-sm text-slate-300">
              ${question.items.map(item => `<li class="money-basket-item"><span>${item.name}</span><span class="money-basket-item__amount">${MoneyMasters.formatMoney(item.price)}${MoneyMasters.renderMoneyAmount(item.price, true)}</span></li>`).join('')}
            </ul>
            <dl class="mt-3 grid grid-cols-3 gap-2 border-t border-slate-700 pt-3 text-center text-xs">
              <div><dt class="text-slate-400">Basket total</dt><dd class="money-transaction-amount mt-1 font-bold text-white">${MoneyMasters.formatMoney(question.total)}${MoneyMasters.renderMoneyAmount(question.total, true)}</dd></div>
              <div><dt class="text-slate-400">Paid</dt><dd class="money-transaction-amount mt-1 font-bold text-white">${MoneyMasters.formatMoney(question.payment)}${MoneyMasters.renderMoneyAmount(question.payment, true)}</dd></div>
              <div><dt class="text-slate-400">Change due</dt><dd class="money-transaction-amount money-change-emphasis mt-1 font-bold">${MoneyMasters.formatMoney(question.change)}${MoneyMasters.renderMoneyAmount(question.change, true)}</dd></div>
            </dl>
          </section>
        ` : ''}
        <div ${isShopkeeper ? 'role="group" data-money-change-drop-target data-drag-drop-target data-drag-drop-effect="copy" aria-label="Selected change; drop coins and notes here"' : ''} class="my-5 rounded-2xl ${isShopkeeper ? 'border-2 border-dashed border-amber-500' : 'border border-slate-700'} bg-slate-950 p-4 text-center">
          <p class="text-xs uppercase tracking-wider text-slate-400">${isShopkeeper ? 'Your change' : 'Your amount'}</p>
          <p id="money-selected-total" class="font-ninja text-3xl font-bold text-amber-300">${MoneyMasters.formatMoney(selectedTotal)}</p>
          ${isShopkeeper ? `<p class="mt-1 text-sm text-slate-300">Drag a coin or note here, or select its button with a tap, Enter, or Space.</p>
            <ul aria-label="Selected coins and notes" aria-live="polite" class="mt-2 flex min-h-8 flex-wrap justify-center gap-2">
              ${game.selectedCoins.map(value => {
                const denomination = MoneyMasters.DENOMINATIONS.find(item => item.value === value);
                return `<li aria-label="${denomination.label} ${denomination.type}">${MoneyMasters.renderDenomination(denomination, true)}</li>`;
              }).join('')}
            </ul>` : ''}
          <div class="flex justify-center gap-3 mt-3">
            <button type="button" data-action="money-undo" ${game.answered || !game.selectedCoins.length ? 'disabled' : ''}
                    class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-40">Undo last</button>
            <button type="button" data-action="money-clear" ${game.answered || !game.selectedCoins.length ? 'disabled' : ''}
                    class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-40">Clear</button>
          </div>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          ${question.denominations.map(item => `
            <button type="button" data-action="money-coin" data-value="${item.value}" ${isShopkeeper ? 'draggable="true" data-money-draggable="true"' : ''} ${game.answered || selectedTotal + item.value > targetAmount ? 'disabled' : ''}
                    aria-label="Add ${item.label}" class="money-denomination-button money-denomination-${item.type} rounded-xl border-2 px-2 py-3 font-bold disabled:opacity-40">
              <span class="block text-xs">${item.type === 'note' ? 'NOTE' : 'COIN'}</span>
              ${MoneyMasters.renderDenomination(item)}
            </button>
          `).join('')}
        </div>
        <button type="button" data-action="money-submit" ${game.answered ? 'disabled' : ''}
                class="money-submit-button mt-4 w-full rounded-xl px-4 py-3 font-bold disabled:opacity-50">${isShopkeeper ? 'Check change' : 'Check amount'}</button>
      `
      : `
        <div class="grid grid-cols-2 gap-3 mt-6">
          ${question.options.map(option => {
            const value = typeof option === 'number' ? option : option.value;
            const label = typeof option === 'number' ? MoneyMasters.formatMoney(option) : option.label;
            const visual = typeof option === 'number'
              ? MoneyMasters.renderMoneyAmount(option, true)
              : MoneyMasters.renderDenomination(option, true);
            const isSelected = game.selectedAnswer === value;
            const stateClass = game.answered && isSelected
              ? game.lastAnswerCorrect ? 'border-emerald-400 bg-emerald-950' : 'border-rose-400 bg-rose-950'
              : 'border-slate-700 bg-slate-950 hover:border-amber-400';
            return `
              <button type="button" data-action="money-answer" data-answer="${value}" ${game.answered ? 'disabled' : ''}
                      aria-label="${label}" class="rounded-xl border-2 ${stateClass} p-4 font-ninja text-lg font-bold text-white disabled:opacity-70">
                ${visual}
                <span class="money-answer-label">${label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    const coinImage = game.activity.id === 'coin-recognition'
      ? `<div role="img" aria-label="${question.denomination.label} Australian ${question.denomination.type}" class="money-recognition-currency mx-auto my-5">${MoneyMasters.renderDenomination(question.denomination)}</div>`
      : '';
    const feedback = game.answered
      ? EducationalFeedback.render({
        id: 'money-feedback',
        correct: game.lastAnswerCorrect,
        message: game.lastAnswerCorrect ? question.feedback.correct : question.feedback.incorrect,
        explanation: question.feedback.explanation,
        workedExample: question.feedback.workedExample,
        audioHint: question.feedback.audioHint,
        retryAction: game.lastAnswerCorrect ? null : 'money-retry',
        continueAction: 'money-next',
        continueLabel: 'Next round →'
      })
      : '';
    const prompt = game.activity.id === 'build-total'
      ? `${question.prompt} Target: ${MoneyMasters.formatMoney(question.target)}`
      : question.prompt;
    const transactionVisual = game.activity.id === 'give-change'
      ? `<dl class="money-transaction-visual" aria-label="Item price and amount paid">
          <div><dt>Item price</dt><dd>${MoneyMasters.formatMoney(question.price)}${MoneyMasters.renderMoneyAmount(question.price, true)}</dd></div>
          <div><dt>Amount paid</dt><dd>${MoneyMasters.formatMoney(question.payment)}${MoneyMasters.renderMoneyAmount(question.payment, true)}</dd></div>
        </dl>`
      : '';

    arena.innerHTML = `
      <div class="bg-slate-900 border-2 border-amber-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <button type="button" data-action="money-home" class="text-xs text-slate-400 hover:text-white">← Exit</button>
          <div class="text-center">
            <h2 class="font-ninja text-lg text-amber-300 font-bold">${game.activity.title}</h2>
            <p class="text-xs text-slate-400 capitalize">${game.difficulty} difficulty</p>
            <p class="text-xs text-slate-400">Round ${game.index + 1} of ${game.questions.length}</p>
          </div>
          <span class="text-sm font-bold text-white">⭐ ${game.score}</span>
        </div>
        <p class="text-center font-ninja text-xl sm:text-2xl text-white font-bold">${prompt}</p>
        ${coinImage}
        ${transactionVisual}
        ${choices}
        ${feedback}
      </div>
    `;
  },

  answerMoneyQuestion(answer) {
    const game = this.moneyGame;
    if (!game || game.answered) return;
    const question = game.questions[game.index];
    game.answered = true;
    game.selectedAnswer = Number(answer);
    game.lastAnswerCorrect = this.moneyActivityEngine.submitAnswer(game.selectedAnswer);
    game.score = this.moneyActivityEngine.score;
    this.renderMoneyQuestion();
  },

  retryMoneyQuestion() {
    const game = this.moneyGame;
    if (!game?.answered || !this.moneyActivityEngine.allowRetry()) return;
    game.answered = false;
    game.lastAnswerCorrect = false;
    game.selectedAnswer = null;
    game.selectedCoins = [];
    this.renderMoneyQuestion();
  },

  addMoneyCoin(value) {
    const game = this.moneyGame;
    if (!game || game.answered) return;
    const question = game.questions[game.index];
    const amount = Number(value);
    const total = game.selectedCoins.reduce((sum, coin) => sum + coin, 0);
    if (!question.denominations.some(item => item.value === amount) || total + amount > question.target) return;
    game.selectedCoins.push(amount);
    this.renderMoneyQuestion();
  },

  undoMoneyCoin() {
    const game = this.moneyGame;
    if (!game || game.answered || !game.selectedCoins.length) return;
    game.selectedCoins.pop();
    this.renderMoneyQuestion();
  },

  clearMoneyCoins() {
    const game = this.moneyGame;
    if (!game || game.answered) return;
    game.selectedCoins = [];
    this.renderMoneyQuestion();
  },

  submitMoneyAmount() {
    const game = this.moneyGame;
    if (!game || game.answered) return;
    const question = game.questions[game.index];
    const total = game.selectedCoins.reduce((sum, value) => sum + value, 0);
    if (total !== question.target) {
      game.answered = true;
      game.lastAnswerCorrect = this.moneyActivityEngine.recordOutcome(false);
    } else {
      game.answered = true;
      game.lastAnswerCorrect = this.moneyActivityEngine.recordOutcome(true);
    }
    game.score = this.moneyActivityEngine.score;
    this.renderMoneyQuestion();
  },

  nextMoneyQuestion() {
    const game = this.moneyGame;
    if (!game || !game.answered) return;
    const hasNextQuestion = this.moneyActivityEngine.nextQuestion();
    game.index = hasNextQuestion ? this.moneyActivityEngine.currentIndex : game.questions.length;
    game.selectedCoins = [];
    game.selectedAnswer = null;
    game.answered = false;
    game.lastAnswerCorrect = false;
    this.renderMoneyQuestion();
  }
});
