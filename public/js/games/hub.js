const CRITTER_CATCH_ANIMALS = [
  { emoji: '🦊', name: 'fox' },
  { emoji: '🐸', name: 'frog' },
  { emoji: '🦉', name: 'owl' },
  { emoji: '🐼', name: 'panda' },
  { emoji: '🐵', name: 'monkey' },
  { emoji: '🐰', name: 'rabbit' }
];

Object.assign(App.prototype, {
  showGamesHub() {
    this.stopCritterCatch();
    this.currentView = 'games';
    this.critterCatchState = {
      score: 0,
      secondsLeft: 30,
      streak: 0,
      targetIndex: null,
      targetCritter: null,
      running: false
    };
    const main = document.getElementById('app-main');
    if (!main) return;

    this.updateHeader();
    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <button onclick="window.app.showRavenAndLlamaHome()" class="flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200 mb-6 transition font-bold group">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Raven &amp; Llama Home</span>
        </button>

        <div class="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950 via-zinc-900 to-zinc-950 p-6 sm:p-10 mb-8">
          <div class="relative z-10 max-w-2xl">
            <div class="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200 mb-3">
              🎮 Just for fun
            </div>
            <h1 class="font-ninja text-3xl sm:text-5xl font-bold text-white">Games Hub</h1>
            <p class="mt-3 text-sm sm:text-base text-zinc-300">Pick up a game, play at your own pace, and enjoy the fun. No lessons or scores to study — just play!</p>
          </div>
          <div aria-hidden="true" class="absolute -right-8 -bottom-14 text-[10rem] opacity-10">🎉</div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] gap-6 items-start">
          <section aria-labelledby="critter-catch-title" class="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-7 shadow-xl">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Quick arcade</span>
                <h2 id="critter-catch-title" class="font-ninja text-2xl sm:text-3xl font-bold text-white">Critter Catch</h2>
              </div>
              <div class="flex gap-2 text-center">
                <div class="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2">
                  <div class="text-[10px] uppercase tracking-wide text-zinc-400">Score</div>
                  <div id="critter-catch-score" class="font-bold text-amber-300">0</div>
                </div>
                <div class="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2">
                  <div class="text-[10px] uppercase tracking-wide text-zinc-400">Time</div>
                  <div id="critter-catch-time" class="font-bold text-cyan-300">30s</div>
                </div>
              </div>
            </div>

            <p class="text-sm text-zinc-300 mb-4">Catch the friendly critters when they pop up! Every fifth catch in a row earns bonus points.</p>
            <p id="critter-catch-status" class="min-h-6 text-sm font-semibold text-emerald-300 mb-3" role="status" aria-live="polite">Press play when you’re ready.</p>
            <div id="critter-catch-board" role="group" aria-label="Critter Catch game board" class="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-5"></div>
            <div class="text-center">
              <button id="critter-catch-start" onclick="window.app.startCritterCatch()" class="rounded-xl bg-violet-500 hover:bg-violet-400 px-6 py-3 font-bold text-white shadow-lg transition">
                Play 30-second round
              </button>
            </div>
          </section>

          <aside class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6">
            <h2 class="font-ninja text-xl font-bold text-white mb-3">How to play</h2>
            <ul class="space-y-3 text-sm text-zinc-300">
              <li class="flex gap-2"><span>👀</span><span>Watch the burrows for a pop-up critter.</span></li>
              <li class="flex gap-2"><span>👆</span><span>Tap or click it before it disappears to score points.</span></li>
              <li class="flex gap-2"><span>✨</span><span>Keep your catch streak going for a bonus every five catches.</span></li>
            </ul>
            <p class="mt-5 border-t border-zinc-800 pt-4 text-xs leading-relaxed text-zinc-400">Missed a catch? No problem — there’s no penalty. Play again whenever you like.</p>
          </aside>
        </div>
      </div>
    `;
    this.renderCritterCatchBoard();
  },

  startCritterCatch() {
    if (this.currentView !== 'games') return;
    this.stopCritterCatch();
    this.critterCatchState = {
      score: 0,
      secondsLeft: 30,
      streak: 0,
      targetIndex: Math.floor(Math.random() * 9),
      targetCritter: CRITTER_CATCH_ANIMALS[Math.floor(Math.random() * CRITTER_CATCH_ANIMALS.length)],
      running: true
    };
    document.getElementById('critter-catch-status').textContent = 'Catch a critter before it hops away!';
    document.getElementById('critter-catch-start').textContent = 'Restart round';
    this.renderCritterCatchBoard();

    this.critterCatchTargetInterval = setInterval(() => {
      if (this.currentView !== 'games' || !this.critterCatchState.running) {
        this.stopCritterCatch();
        return;
      }
      this.critterCatchState.targetIndex = Math.floor(Math.random() * 9);
      this.critterCatchState.targetCritter = CRITTER_CATCH_ANIMALS[Math.floor(Math.random() * CRITTER_CATCH_ANIMALS.length)];
      this.renderCritterCatchBoard();
    }, 850);
    this.critterCatchTimer = setInterval(() => {
      if (this.currentView !== 'games' || !this.critterCatchState.running) {
        this.stopCritterCatch();
        return;
      }
      this.critterCatchState.secondsLeft--;
      document.getElementById('critter-catch-time').textContent = `${this.critterCatchState.secondsLeft}s`;
      if (this.critterCatchState.secondsLeft <= 0) {
        this.stopCritterCatch();
        this.critterCatchState.running = false;
        this.critterCatchState.targetIndex = null;
        this.critterCatchState.targetCritter = null;
        document.getElementById('critter-catch-status').textContent = `Time’s up! You scored ${this.critterCatchState.score} points. Play again?`;
        document.getElementById('critter-catch-start').textContent = 'Play again';
        this.renderCritterCatchBoard();
      }
    }, 1000);
  },

  selectCritterHole(index) {
    const state = this.critterCatchState;
    if (this.currentView !== 'games' || !state?.running) return;
    if (state.targetIndex !== index) {
      state.streak = 0;
      document.getElementById('critter-catch-status').textContent = 'No critter there — keep looking!';
      return;
    }

    state.streak++;
    const bonus = state.streak % 5 === 0;
    state.score += bonus ? 35 : 10;
    state.targetIndex = null;
    state.targetCritter = null;
    document.getElementById('critter-catch-status').textContent = bonus
      ? 'Five in a row! Bonus points!'
      : `Nice catch! ${state.streak} in a row.`;
    this.renderCritterCatchBoard();
  },

  renderCritterCatchBoard() {
    const board = document.getElementById('critter-catch-board');
    if (!board || !this.critterCatchState) return;
    const focusedHole = document.activeElement?.closest?.('#critter-catch-board button')?.dataset.holeIndex;
    const state = this.critterCatchState;
    document.getElementById('critter-catch-score').textContent = state.score;
    document.getElementById('critter-catch-time').textContent = `${state.secondsLeft}s`;
    board.innerHTML = Array.from({ length: 9 }, (_, index) => {
      const critter = state.running && state.targetIndex === index
        ? state.targetCritter
        : null;
      const label = critter ? `Catch the ${critter.name}` : 'Empty burrow';
      return `
        <button type="button" data-hole-index="${index}" aria-label="${label}" onclick="window.app.selectCritterHole(${index})"
          ${state.running ? '' : 'disabled'}
          class="aspect-square rounded-2xl border-2 ${critter ? 'border-emerald-300 bg-emerald-900/60 text-4xl sm:text-5xl animate-pop' : 'border-zinc-700 bg-zinc-950/80 text-zinc-600'} flex items-center justify-center shadow-inner transition disabled:cursor-not-allowed enabled:hover:border-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
          ${critter ? critter.emoji : '🌱'}
        </button>
      `;
    }).join('');
    if (focusedHole !== undefined) {
      board.querySelector(`[data-hole-index="${focusedHole}"]`)?.focus();
    }
  },

  stopCritterCatch() {
    if (this.critterCatchTargetInterval) {
      clearInterval(this.critterCatchTargetInterval);
      this.critterCatchTargetInterval = null;
    }
    if (this.critterCatchTimer) {
      clearInterval(this.critterCatchTimer);
      this.critterCatchTimer = null;
    }
  }
});
