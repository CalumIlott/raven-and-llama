class MoneyMasters {
  static DENOMINATIONS = [
    { value: 1, label: '1p', type: 'coin' },
    { value: 2, label: '2p', type: 'coin' },
    { value: 5, label: '5p', type: 'coin' },
    { value: 10, label: '10p', type: 'coin' },
    { value: 20, label: '20p', type: 'coin' },
    { value: 50, label: '50p', type: 'coin' },
    { value: 100, label: '£1', type: 'coin' },
    { value: 200, label: '£2', type: 'coin' },
    { value: 500, label: '£5', type: 'note' },
    { value: 1000, label: '£10', type: 'note' },
    { value: 2000, label: '£20', type: 'note' },
    { value: 5000, label: '£50', type: 'note' }
  ];

  static ACTIVITIES = [
    {
      id: 'coin-recognition',
      title: 'Coin & Note Match',
      emoji: '🪙',
      description: 'Learn to recognise British coins and notes and remember what each one is worth.'
    },
    {
      id: 'build-total',
      title: 'Build the Amount',
      emoji: '🛍️',
      description: 'Choose coins and notes to make an exact amount. Try different combinations!'
    },
    {
      id: 'give-change',
      title: 'Change Challenge',
      emoji: '💷',
      description: 'Work out how much change to give when someone pays for an item.'
    }
  ];

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
    return value < 100 ? `${value}p` : `£${(value / 100).toFixed(2)}`;
  }

  static getDenominations(difficulty) {
    const maxValue = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 200 : 5000;
    return this.DENOMINATIONS.filter(denomination => denomination.value <= maxValue);
  }

  static generateChoices(answer, min, max) {
    const choices = new Set([answer]);
    while (choices.size < 4) {
      choices.add(this.randomInt(min, max));
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
        target: this.randomInt(min, max),
        denominations
      };
    }

    const paymentOptions = level === 'easy'
      ? [20, 50, 100]
      : level === 'medium'
        ? [100, 200, 500, 1000]
        : [500, 1000, 2000, 5000];
    const payment = paymentOptions[this.randomInt(0, paymentOptions.length - 1)];
    const price = this.randomInt(1, payment - 1);
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
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'money';
    this.updateHeader();
    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold">
            ← Back to Raven &amp; Llama Learning
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <div class="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <span class="text-3xl">💷</span>
          <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold mt-2">Money Masters</h1>
          <p class="text-slate-300 text-sm sm:text-base mt-2">Explore British coins and notes, make totals, and practise giving change.</p>
        </div>
        <h2 class="font-ninja text-xl text-white font-bold mb-3">Choose a money game</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${MoneyMasters.ACTIVITIES.map(activity => `
            <section class="text-left bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg">
              <span class="text-3xl">${activity.emoji}</span>
              <h3 class="font-ninja text-xl font-bold text-white mt-2">${activity.title}</h3>
              <p class="text-sm text-slate-400 mt-1">${activity.description}</p>
              <p class="mt-4 text-xs font-bold text-amber-300">Choose a difficulty · 6 rounds</p>
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${['easy', 'medium', 'hard'].map(difficulty => `
                  <button type="button" data-action="money-start" data-activity-id="${activity.id}" data-difficulty="${difficulty}"
                          class="rounded-xl bg-amber-900 hover:bg-amber-800 px-2 py-2 text-sm font-bold text-white capitalize">${difficulty}</button>
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
    const level = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
    this.moneyGame = {
      activity,
      difficulty: level,
      questions: Array.from({ length: 6 }, () => MoneyMasters.generateQuestion(activityId, level)),
      index: 0,
      score: 0,
      selectedCoins: [],
      answered: false,
      lastAnswerCorrect: false
    };
    this.currentView = 'money';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = '<div class="max-w-2xl mx-auto px-4 py-6"><div id="money-arena"></div></div>';
    this.renderMoneyQuestion();
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
          <p class="text-slate-300 mt-2">You scored <strong class="text-yellow-300">${game.score} / ${game.questions.length}</strong> in ${game.activity.title}.</p>
          <div class="flex flex-wrap justify-center gap-3 mt-6">
            <button type="button" data-action="money-start" data-activity-id="${game.activity.id}" data-difficulty="${game.difficulty}"
                    class="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">Play again</button>
            <button type="button" data-action="money-home" class="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold">Choose another game</button>
          </div>
        </div>
      `;
      return;
    }

    const question = game.questions[game.index];
    const selectedTotal = game.selectedCoins.reduce((total, value) => total + value, 0);
    const choices = game.activity.id === 'build-total'
      ? `
        <div class="my-5 rounded-2xl bg-slate-950 border border-slate-700 p-4 text-center">
          <p class="text-xs uppercase tracking-wider text-slate-400">Your amount</p>
          <p id="money-selected-total" class="font-ninja text-3xl font-bold text-amber-300">${MoneyMasters.formatMoney(selectedTotal)}</p>
          <div class="flex justify-center gap-3 mt-3">
            <button type="button" data-action="money-undo" ${game.answered || !game.selectedCoins.length ? 'disabled' : ''}
                    class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-40">Undo last</button>
            <button type="button" data-action="money-clear" ${game.answered || !game.selectedCoins.length ? 'disabled' : ''}
                    class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-40">Clear</button>
          </div>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          ${question.denominations.map(item => `
            <button type="button" data-action="money-coin" data-value="${item.value}" ${game.answered || selectedTotal + item.value > question.target ? 'disabled' : ''}
                    aria-label="Add ${item.label}" class="rounded-xl border-2 ${item.type === 'note' ? 'border-emerald-500 bg-emerald-950' : 'border-amber-500 bg-amber-950'} px-2 py-3 text-white font-bold disabled:opacity-40">
              <span class="block text-xs">${item.type === 'note' ? 'NOTE' : 'COIN'}</span>
              <span class="block text-lg">${item.label}</span>
            </button>
          `).join('')}
        </div>
        <button type="button" data-action="money-submit" ${game.answered ? 'disabled' : ''}
                class="mt-4 w-full rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-3 font-bold text-white disabled:opacity-50">Check amount</button>
      `
      : `
        <div class="grid grid-cols-2 gap-3 mt-6">
          ${question.options.map(option => {
            const value = typeof option === 'number' ? option : option.value;
            const label = typeof option === 'number' ? MoneyMasters.formatMoney(option) : option.label;
            const isSelected = game.selectedAnswer === value;
            const stateClass = game.answered && isSelected
              ? game.lastAnswerCorrect ? 'border-emerald-400 bg-emerald-950' : 'border-rose-400 bg-rose-950'
              : 'border-slate-700 bg-slate-950 hover:border-amber-400';
            return `
              <button type="button" data-action="money-answer" data-answer="${value}" ${game.answered ? 'disabled' : ''}
                      aria-label="${label}" class="rounded-xl border-2 ${stateClass} p-4 font-ninja text-lg font-bold text-white disabled:opacity-70">
                ${label}
              </button>
            `;
          }).join('')}
        </div>
      `;
    const coinImage = game.activity.id === 'coin-recognition'
      ? `<div role="img" aria-label="${question.denomination.label} coin or note" class="mx-auto my-5 flex h-24 w-24 items-center justify-center border-4 ${question.denomination.type === 'note' ? 'rounded-xl border-emerald-400 bg-emerald-900' : 'rounded-full border-amber-400 bg-amber-900'} font-ninja text-2xl font-bold text-white">${question.denomination.label}</div>`
      : '';
    const feedback = game.answered
      ? `<div id="money-feedback" role="status" class="mt-5 rounded-xl p-3 ${game.lastAnswerCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}">
          ${game.lastAnswerCorrect ? 'Correct! Great work! 🌟' : `Not quite. The answer is ${MoneyMasters.formatMoney(question.answer ?? question.target)}.`}
        </div>
        <button type="button" data-action="money-next" class="mt-4 w-full rounded-xl bg-amber-600 hover:bg-amber-500 py-3 font-bold text-white">Next round →</button>`
      : '';
    const prompt = game.activity.id === 'build-total'
      ? `${question.prompt} Target: ${MoneyMasters.formatMoney(question.target)}`
      : question.prompt;

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
    game.lastAnswerCorrect = game.selectedAnswer === question.answer;
    if (game.lastAnswerCorrect) game.score++;
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
      game.lastAnswerCorrect = false;
    } else {
      game.answered = true;
      game.lastAnswerCorrect = true;
      game.score++;
    }
    this.renderMoneyQuestion();
  },

  nextMoneyQuestion() {
    const game = this.moneyGame;
    if (!game || !game.answered) return;
    game.index++;
    game.selectedCoins = [];
    game.selectedAnswer = null;
    game.answered = false;
    game.lastAnswerCorrect = false;
    this.renderMoneyQuestion();
  }
});
