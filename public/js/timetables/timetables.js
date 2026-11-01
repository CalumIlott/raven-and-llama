Object.assign(App.prototype, {
  showTimesTables() {
    this.currentView = 'timetables';
    this.rememberModule('timetables');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'timetables';
    this.updateHeader();

    const buttons = Array.from({length: 11}, (_, i) => i + 2).map(n => `
      <button data-action="times-table-start" data-table="${n}"
              class="btn-ninja p-4 rounded-2xl bg-slate-900 border-2 border-emerald-700 hover:border-emerald-400 text-white font-ninja text-xl font-bold hover:scale-105 transition shadow-lg flex flex-col items-center justify-center">
        <span>${n}×</span>
        <span class="text-[10px] text-slate-400 font-normal mt-0.5">Table</span>
      </button>
    `).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-5">
          <button data-action="learning" class="text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to ${window.brandWordmark()} Learning</span>
          </button>
          <div class="flex items-center gap-3">
            <button data-action="dojo" class="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              🥋 Maths Masters Belts
            </button>
            <span class="text-slate-600">•</span>
            <button data-action="home" class="text-xs text-slate-400 hover:text-white">
              🏠 Home
            </button>
          </div>
        </div>

        <section class="module-intro module-intro--timetables">
          <div class="module-intro__copy">
            <h1 class="font-ninja font-bold">Times Tables Dojo</h1>
          <p class="text-slate-300 text-sm max-w-xl">
            Choose any individual times table from 2× to 12×, challenge yourself with a mixed sprint, or complete the 33-question mastery test!
          </p>
          </div>
        </section>

        <div class="mb-6">
          ${ProfileManager.renderLeaderboard('times_tables', 'Times Tables Leaderboard')}
        </div>

        <h2 class="font-ninja text-xl text-white mb-3">Individual Tables Practice (2× to 12×):</h2>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          ${buttons}
        </div>

        <h2 class="font-ninja text-xl text-white mb-3">All-Tables Mixed Challenges:</h2>
        <div class="grid sm:grid-cols-2 gap-4 mb-4">
          <button data-action="times-table-quiz" data-all-tables="false"
                  class="btn-ninja p-5 rounded-2xl bg-sky-800 hover:bg-sky-700 border-2 border-sky-400 text-white font-ninja font-bold text-left shadow-xl transition flex items-center justify-between">
            <div>
              <div class="text-lg">Quick Mixed Quiz ⚡</div>
              <div class="text-xs text-slate-300 font-normal mt-0.5">12 random questions across all tables (2×–12×)</div>
            </div>
            <span class="text-2xl">➔</span>
          </button>

          <button data-action="times-table-quiz" data-all-tables="true"
                  class="btn-ninja p-5 rounded-2xl bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-400 text-white font-ninja font-bold text-left shadow-xl transition flex items-center justify-between">
            <div>
              <div class="text-lg">Grand Completion Test 🏆</div>
              <div class="text-xs text-slate-300 font-normal mt-0.5">33 questions covering the full times tables curriculum</div>
            </div>
            <span class="text-2xl">➔</span>
          </button>
        </div>

  <button data-action="endless-timetables"
                class="btn-ninja w-full p-5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 border-2 border-emerald-400 text-white font-ninja font-bold text-left shadow-xl transition flex items-center justify-between mb-4">
          <div>
            <div class="text-lg">Endless Timetables Challenge ♾️</div>
            <div class="text-xs text-slate-300 font-normal mt-0.5">Keep answering mixed multiplication questions as the timer gets faster</div>
            <div class="text-xs text-emerald-200 font-normal mt-1">Best score: ${ProfileManager.getActiveProfile().endlessHighScores?.timetables || 0}</div>
          </div>
          <span class="text-2xl">➔</span>
        </button>

        <button data-action="times-table-arcade"
                class="btn-ninja w-full p-5 rounded-2xl bg-amber-600 hover:bg-amber-500 border-2 border-amber-300 text-slate-950 font-ninja font-bold text-lg shadow-xl transition flex items-center justify-center gap-3">
          <span>🕹️</span> <span>Play Product Pair Match Arcade!</span>
        </button>
      </div>
    `;
    ProfileManager.loadLeaderboard('times_tables');
  },

  startTimesTableQuiz(allTables, table = null) {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `<div class="play-shell play-shell--quiz play-shell--times max-w-2xl mx-auto px-4 py-6"><div id="game-arena"></div></div>`;
    const count = allTables ? 33 : 12;
    const questions = QuestionGenerator.generateUniqueQuestions(() => {
      const a = table || QuestionGenerator.randomInt(2, 12);
      const b = QuestionGenerator.randomInt(1, 12);
      const answer = a * b;
      return {
        type: 'standard_choice',
        prompt: `${a} × ${b} = ?`,
        answer: answer,
        timeLimitSeconds: allTables ? 16 : 20,
        options: QuestionGenerator.generateChoices(answer, 4, 12)
      };
    }, count);

    window.gameEngine.startCustomQuiz(
      table ? `${table}× Times Table Practice` : allTables ? 'Grand Timetables Completion Test 🏆' : 'Mixed Timetables Sprint ⚡',
      questions,
      true
    );
  },

  startTimesTable(table) {
    this.startTimesTableQuiz(false, table);
  },

  startEndlessTimetables() {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `<div class="play-shell play-shell--quiz play-shell--times max-w-2xl mx-auto px-4 py-6"><div id="game-arena"></div></div>`;
    window.gameEngine.startEndlessQuiz(
      'Endless Timetables Challenge ♾️',
      () => {
        const a = QuestionGenerator.randomInt(2, 12);
        const b = QuestionGenerator.randomInt(1, 12);
        const answer = a * b;
        return {
          type: 'standard_choice',
          prompt: `${a} × ${b} = ?`,
          answer,
          timeLimitSeconds: 20,
          options: QuestionGenerator.generateChoices(answer, 4, 12)
        };
      },
      'timetables',
      { baseTimeSeconds: 20 }
    );
  },

  startTimetableArcade() {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `
      <div class="play-shell play-shell--product-match max-w-xl mx-auto px-4 py-6">
        <div class="play-arcade-panel bg-slate-900 border-2 border-amber-600 rounded-3xl p-5 text-center shadow-2xl">
          <div class="play-arcade-hud flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <button data-action="timetable-exit" class="play-hud__exit btn-ninja text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-slate-300">
              ← Exit Arcade
            </button>
            <h2 class="play-arcade-title font-ninja text-xl text-amber-400 font-bold">Product Pair Match 🕹️</h2>
            <div class="play-arcade-score text-emerald-400 font-bold text-sm">Score: <span id="tt-score">0</span></div>
          </div>
          <p class="text-slate-300 text-xs mb-3">Tap two numbers whose multiplication equals the target product!</p>
          <div class="play-arcade-target text-yellow-300 font-ninja text-2xl font-bold mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800" id="tt-target"></div>
          <div id="tt-cards" class="play-arcade-grid grid grid-cols-4 gap-3 my-2"></div>
        </div>
      </div>
    `;
    this.ttScore = 0;
    this.ttNextRound();
  },

  ttNextRound() {
    const a = QuestionGenerator.randomInt(2, 12);
    const b = QuestionGenerator.randomInt(2, 12);
    const target = a * b;
    const targetEl = document.getElementById('tt-target');
    if (!targetEl) return;
    targetEl.textContent = `Target Product: ${target}`;

    const factors = [a, b, QuestionGenerator.randomInt(2, 12), QuestionGenerator.randomInt(2, 12)];
    const cards = QuestionGenerator.shuffle(factors.map((v, i) => ({ v, i })));
    let picked = [];
    this.ttResolving = false;

    const cardsContainer = document.getElementById('tt-cards');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = cards.map(c => `
      <button id="tt-card-${c.i}"
              class="play-arcade-card btn-ninja aspect-square bg-indigo-950 border-2 border-indigo-600 hover:border-yellow-400 rounded-2xl text-white text-2xl font-ninja font-bold transition flex items-center justify-center shadow-lg"
              data-action="times-table-pick" data-id="${c.i}" data-value="${c.v}">
        ${c.v}
      </button>
    `).join('');

    this.ttPick = (id, val) => {
      if (this.ttResolving || picked.some(p => p.id === id)) return;
      const card = document.getElementById(`tt-card-${id}`);
      picked.push({ id, val });
      card?.classList.add('is-selected');

      if (picked.length < 2) return;
      this.ttResolving = true;
      const isMatch = picked[0].val * picked[1].val === target;

      picked.forEach(({ id: pickedId }) => {
        const pickedCard = document.getElementById(`tt-card-${pickedId}`);
        pickedCard?.classList.remove('is-selected');
        pickedCard?.classList.add(isMatch ? 'is-correct' : 'is-wrong');
      });

      if (isMatch) {
        this.ttScore += 15;
        const scoreEl = document.getElementById('tt-score');
        if (scoreEl) scoreEl.textContent = this.ttScore;
        window.soundFX?.playCorrect();
      } else {
        this.ttScore = Math.max(0, this.ttScore - 5);
        const scoreEl = document.getElementById('tt-score');
        if (scoreEl) scoreEl.textContent = this.ttScore;
        window.soundFX?.playWrong();
      }

      setTimeout(() => {
        if (document.getElementById('tt-cards')) this.ttNextRound();
      }, 700);
    };
  }
});
