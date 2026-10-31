const SPELLING_SAFARI_ACTIVITIES = [
  {
    id: 'spelling-sprint',
    title: 'Spelling Sprint',
    emoji: '⚡',
    description: 'Spot the correctly spelled word and race along the trail.',
    type: 'spelling',
    questions: [
      { prompt: 'The reason something happens.', answer: 'because', options: ['becaus', 'becuase', 'because', 'beacause'] },
      { prompt: 'Someone you like and trust.', answer: 'friend', options: ['freind', 'friend', 'frend', 'friand'] },
      { prompt: 'More than one person.', answer: 'people', options: ['peeple', 'people', 'peopel', 'pepole'] },
      { prompt: 'Not the same as something else.', answer: 'different', options: ['diferent', 'different', 'differant', 'diffrent'] },
      { prompt: 'Very pleasing to look at.', answer: 'beautiful', options: ['beautifull', 'beutiful', 'beautiful', 'beautifal'] },
      { prompt: 'As much as is needed.', answer: 'enough', options: ['enouf', 'enogh', 'enough', 'enouph'] },
      { prompt: 'To bring something back to mind.', answer: 'remember', options: ['remeber', 'remember', 'remembur', 'remmember'] },
      { prompt: 'A place where you can borrow books.', answer: 'library', options: ['libary', 'librery', 'library', 'liberry'] }
    ]
  },
  {
    id: 'phonics-trail',
    title: 'Phonics Trail',
    emoji: '🔤',
    description: 'Listen for the missing sound and complete each word.',
    type: 'phonics',
    questions: [
      { prompt: 'sh_p', hint: 'A boat that travels on the water.', answer: 'i', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'fr_g', hint: 'A small animal that can hop.', answer: 'o', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'cl_p', hint: 'To bring your hands together to make a sound.', answer: 'a', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'br_sh', hint: 'You use one to tidy your hair.', answer: 'u', options: ['a', 'e', 'i', 'u'] },
      { prompt: 'ch_ck', hint: 'A young bird, or a small piece of chocolate.', answer: 'i', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'wh_le', hint: 'A very large animal that lives in the sea.', answer: 'a', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'st_ne', hint: 'A small piece of rock.', answer: 'o', options: ['a', 'e', 'i', 'o'] },
      { prompt: 'sm_le', hint: 'A happy expression on your face.', answer: 'i', options: ['a', 'e', 'i', 'o'] }
    ]
  },
  {
    id: 'word-explorer',
    title: 'Word Explorer',
    emoji: '🧭',
    description: 'Match each meaning to the word that belongs there.',
    type: 'vocabulary',
    questions: [
      { prompt: 'Which word means “very large”?', answer: 'enormous', options: ['enormous', 'tiny', 'gentle', 'swift'] },
      { prompt: 'Which word means “eager to learn or know”?', answer: 'curious', options: ['sleepy', 'curious', 'careful', 'silent'] },
      { prompt: 'Which word means “not afraid when something is difficult”?', answer: 'brave', options: ['brave', 'shy', 'calm', 'polite'] },
      { prompt: 'Which word means “to move quietly without being noticed”?', answer: 'sneak', options: ['shout', 'sneak', 'wander', 'gather'] },
      { prompt: 'Which word means “a home for a plant or animal”?', answer: 'habitat', options: ['journey', 'habitat', 'weather', 'pattern'] },
      { prompt: 'Which word means “to travel from one place to another”?', answer: 'journey', options: ['journey', 'puddle', 'whisper', 'shelter'] },
      { prompt: 'Which word means “to speak very softly”?', answer: 'whisper', options: ['whisper', 'cheer', 'wonder', 'giggle'] },
      { prompt: 'Which word means “a way of hiding by blending in”?', answer: 'camouflage', options: ['camouflage', 'direction', 'celebration', 'discovery'] }
    ]
  },
  {
    id: 'jungle-jumble',
    title: 'Jungle Jumble',
    emoji: '🔀',
    description: 'Unscramble the letters to uncover each hidden word.',
    type: 'scramble',
    questions: [
      { answer: 'tiger', hint: 'A big striped cat.' },
      { answer: 'monkey', hint: 'A clever animal that can climb trees.' },
      { answer: 'rabbit', hint: 'A furry animal with long ears.' },
      { answer: 'flower', hint: 'A colourful part of a plant.' },
      { answer: 'planet', hint: 'A large world that travels around a star.' },
      { answer: 'forest', hint: 'A large area filled with trees.' },
      { answer: 'giraffe', hint: 'A tall animal with a very long neck.' },
      { answer: 'rainbow', hint: 'A colourful arc that can appear after rain.' }
    ]
  }
];

const SpellingSafari = {
  getActivities() {
    return SPELLING_SAFARI_ACTIVITIES;
  },

  getActivity(activityId) {
    return SPELLING_SAFARI_ACTIVITIES.find(activity => activity.id === activityId) || null;
  },

  shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  },

  createQuestions(activityId, count = 6) {
    const activity = this.getActivity(activityId);
    if (!activity || !Number.isFinite(count) || count < 1) return [];

    const questionCount = Math.min(Math.floor(count), activity.questions.length);
    return this.shuffle(activity.questions).slice(0, questionCount).map(question => {
      const result = { ...question };
      if (question.options) result.options = this.shuffle(question.options);
      if (activity.type === 'scramble') {
        const letters = this.shuffle(Array.from(question.answer));
        if (letters.join('') === question.answer) letters.push(letters.shift());
        result.scramble = letters;
      }
      result.activityId = activity.id;
      result.type = activity.type;
      return result;
    });
  }
};

window.SpellingSafari = SpellingSafari;

Object.assign(App.prototype, {
  showSpellingSafari() {
    this.currentView = 'spelling';
    this.rememberModule('spelling');
    const main = document.getElementById('app-main');
    if (!main) return;
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button onclick="window.app.showLearningHub()" class="text-sm text-cyan-400 hover:text-cyan-300 font-semibold">← Back to Learning</button>
          <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <div class="bg-gradient-to-r from-purple-950 via-emerald-950 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 mb-7 shadow-2xl">
          <div class="text-center">
            <div class="text-5xl mb-2">🦁🌿</div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold">Spelling Safari</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2">Explore sounds, spell tricky words, discover new meanings, and unscramble the jungle!</p>
          </div>
        </div>
        <h2 class="font-ninja text-xl text-white font-bold mb-3">Choose your adventure</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${SpellingSafari.getActivities().map(activity => `
            <button onclick="window.app.startSpellingSafari('${activity.id}')"
                    class="text-left bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 rounded-2xl p-5 transition shadow-lg group">
              <span class="text-3xl">${activity.emoji}</span>
              <h3 class="font-ninja text-xl font-bold text-white group-hover:text-emerald-300 mt-2">${activity.title}</h3>
              <p class="text-sm text-slate-400 mt-1">${activity.description}</p>
              <span class="inline-block mt-4 text-xs font-bold text-emerald-300">6 rounds · Play now →</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  startSpellingSafari(activityId) {
    const activity = SpellingSafari.getActivity(activityId);
    if (!activity) return this.showSpellingSafari();
    this.spellingSafariGame = {
      activity,
      questions: SpellingSafari.createQuestions(activityId),
      index: 0,
      score: 0,
      selectedLetters: [],
      mistakes: []
    };
    this.currentView = 'spelling';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = '<div class="max-w-2xl mx-auto px-4 py-6"><div id="safari-arena"></div></div>';
    this.renderSpellingSafariQuestion();
  },

  renderSpellingSafariQuestion() {
    const game = this.spellingSafariGame;
    const arena = document.getElementById('safari-arena');
    if (!game || !arena) return;

    if (game.index >= game.questions.length) {
      const missedWords = game.mistakes.length
        ? `<p class="text-sm text-slate-400 mt-4">Keep practising: ${game.mistakes.join(', ')}</p>`
        : '<p class="text-sm text-emerald-300 mt-4">Perfect trail! You got every word right.</p>';
      arena.innerHTML = `
        <div class="text-center bg-slate-900 border-2 border-emerald-500 rounded-3xl p-7 shadow-2xl">
          <div class="text-5xl mb-3">🏆</div>
          <h2 class="font-ninja text-2xl text-white font-bold">Safari Complete!</h2>
          <p class="text-slate-300 mt-2">You scored <strong class="text-yellow-300">${game.score} / ${game.questions.length}</strong> in ${game.activity.title}.</p>
          ${missedWords}
          <div class="flex flex-wrap justify-center gap-3 mt-6">
            <button onclick="window.app.startSpellingSafari('${game.activity.id}')" class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Play again</button>
            <button onclick="window.app.showSpellingSafari()" class="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold">Choose another adventure</button>
          </div>
        </div>
      `;
      return;
    }

    const question = game.questions[game.index];
    const selected = game.selectedLetters.map(index => question.scramble[index]).join('');
    const choices = question.type === 'scramble'
      ? `
        <div class="min-h-12 flex items-center justify-center gap-1 my-5 text-2xl font-bold text-yellow-300" aria-label="Your word">
          ${Array.from({ length: question.answer.length }, (_, index) => `<span class="w-8 border-b-2 border-yellow-400">${selected[index] || '_'}</span>`).join('')}
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          ${question.scramble.map((letter, index) => `
            <button id="safari-letter-${index}" onclick="window.app.pickSpellingSafariLetter(${index})" ${game.selectedLetters.includes(index) || game.answered ? 'disabled' : ''}
                    aria-label="Letter ${letter}" class="w-11 h-11 rounded-xl bg-purple-800 hover:bg-purple-700 border border-purple-400 text-white text-xl font-bold disabled:opacity-40">${letter}</button>
          `).join('')}
        </div>
        ${game.selectedLetters.length ? '<button onclick="window.app.clearSpellingSafariLetters()" class="mt-4 text-xs text-slate-400 underline">Clear letters</button>' : ''}
      `
      : `
        <div class="grid grid-cols-2 gap-3 mt-6">
          ${question.options.map(option => `
            <button onclick="window.app.submitSpellingSafariAnswer('${option}')" ${game.answered ? 'disabled' : ''}
                    class="p-4 rounded-xl bg-slate-800 hover:bg-emerald-700 border-2 border-slate-600 hover:border-emerald-400 text-white font-ninja text-lg font-bold disabled:opacity-60">${option}</button>
          `).join('')}
        </div>
      `;
    const prompt = question.type === 'phonics' ? `Complete the word: ${question.prompt}` : question.prompt || `Unscramble: ${question.scramble.join(' ')}`;
    const feedback = game.answered
      ? `<div id="safari-feedback" role="status" class="mt-5 p-3 rounded-xl ${game.lastAnswerCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-200'}">${game.lastAnswerCorrect ? 'Great work! 🌟' : `The answer was ${question.answer}. Keep exploring!`}</div>
         <button onclick="window.app.nextSpellingSafariQuestion()" class="mt-4 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Next word →</button>`
      : '';

    arena.innerHTML = `
      <div class="bg-slate-900 border-2 border-emerald-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <button onclick="window.app.showSpellingSafari()" class="text-xs text-slate-400 hover:text-white">← Exit</button>
          <div class="text-center">
            <h2 class="font-ninja text-lg text-emerald-300 font-bold">${game.activity.title} ${game.activity.emoji}</h2>
            <p class="text-xs text-slate-400">Round ${game.index + 1} of ${game.questions.length}</p>
          </div>
          <span class="text-sm text-yellow-300 font-bold">⭐ ${game.score}</span>
        </div>
        <div class="text-center">
          <p class="font-ninja text-xl sm:text-2xl text-white font-bold">${prompt}</p>
          ${question.hint ? `<p class="text-sm text-slate-400 mt-2">${question.hint}</p>` : ''}
        </div>
        ${choices}
        ${feedback}
      </div>
    `;
  },

  submitSpellingSafariAnswer(answer) {
    const game = this.spellingSafariGame;
    if (!game || game.answered) return;
    const question = game.questions[game.index];
    game.answered = true;
    game.lastAnswerCorrect = String(answer).toLowerCase() === question.answer.toLowerCase();
    if (game.lastAnswerCorrect) game.score++;
    else game.mistakes.push(question.answer);
    this.renderSpellingSafariQuestion();
  },

  pickSpellingSafariLetter(index) {
    const game = this.spellingSafariGame;
    if (!game || game.answered || game.selectedLetters.includes(index)) return;
    const question = game.questions[game.index];
    game.selectedLetters.push(index);
    if (game.selectedLetters.length === question.answer.length) {
      this.submitSpellingSafariAnswer(game.selectedLetters.map(tile => question.scramble[tile]).join(''));
      return;
    }
    this.renderSpellingSafariQuestion();
  },

  clearSpellingSafariLetters() {
    const game = this.spellingSafariGame;
    if (!game || game.answered) return;
    game.selectedLetters = [];
    this.renderSpellingSafariQuestion();
  },

  nextSpellingSafariQuestion() {
    const game = this.spellingSafariGame;
    if (!game?.answered) return;
    game.index++;
    game.answered = false;
    game.selectedLetters = [];
    this.renderSpellingSafariQuestion();
  }
});
