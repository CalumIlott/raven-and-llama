Object.assign(App.prototype, {
  showRavenAndLlamaHome() {
    this.currentView = 'home';
    this.showHomeRoute();
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'home';

    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-8 sm:py-14">

        <div class="home-brand-heading">
          <h1>${window.brandWordmark()}</h1>
        </div>

        <div class="mb-8">
          ${ProfileManager.renderLeaderboard('all', window.brandWordmark() + ' Leaderboard', 'Raven & Llama Leaderboard', 'home-leaderboard')}
        </div>

        <!-- Tier 1 Section Gateways -->
        <div class="home-section-heading mb-6">
          <div>
          <h2 class="text-lg sm:text-xl font-bold tracking-tight text-zinc-200">Programs &amp; Spaces</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mt-0.5">Explore the active learning academy and interactive activities</p>
          </div>
          <button data-action="parent-report" class="home-stats-link">
            <span aria-hidden="true">📊</span><span>Mastery Stats</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          <!-- CARD 1: RAVEN & LLAMA LEARNING (FLAGSHIP SUB-PAGE) -->
           <div class="app-card-link home-hub-card home-learning-card group relative p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3.5">
                  <div class="home-learning-icon w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow">
                    🎓
                  </div>
                  <div>
                    <span class="home-learning-eyebrow text-[11px] font-semibold uppercase tracking-wider">Educational Academy</span>
                    <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition">
                      ${window.brandWordmark()} Learning
                    </h3>
                  </div>
                </div>
                <span class="home-hub-status">
                  Active Hub
                </span>
              </div>

              <p class="text-zinc-400 text-sm leading-relaxed mb-6">
                Our educational wing: practice maths with the 7-belt <strong>Maths Masters Dojo</strong>, build fluency in <strong>Times Tables Dojo</strong>, and explore science missions.
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-6">
                <div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Curriculum</div>
                  <div class="font-bold text-zinc-200 mt-0.5">Maths Masters Dojo</div>
                  <div class="text-[11px] text-zinc-400">${BELTS_DATA.length} Belt Levels • ${BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0)} Skills</div>
                </div>
                <div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Multiplication</div>
                  <div class="font-bold text-zinc-200 mt-0.5">Times Tables Dojo</div>
                  <div class="text-[11px] text-zinc-400">2× through 12× Tables</div>
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Assessment</div>
                  <div class="font-bold text-zinc-200 mt-0.5">Speed Exams</div>
                  <div class="text-[11px] text-zinc-400">3-Stage Tests &amp; Arcades</div>
                </div>
              </div>
            </div>

            <a href="#learning" data-action="learning" class="home-learning-action flex items-center justify-between pt-4 border-t border-zinc-800/80 text-sm font-semibold no-underline">
              <span>Open Learning Academy</span>
              <span class="group-hover:translate-x-1.5 transition-transform text-base">→</span>
            </a>
          </div>

       <!-- CARD 2: GAMES HUB -->
       <a href="#games" data-action="games-hub"
         class="app-card-link home-hub-card home-games-card group p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="home-games-icon w-11 h-11 rounded-xl border flex items-center justify-center text-xl shadow">
                  🎮
                </div>
                <div>
                  <span class="home-games-label text-[11px] font-semibold uppercase tracking-wider">Play for fun</span>
                  <h3 class="text-lg font-bold text-white">Games Hub</h3>
                </div>
              </div>

              <p class="text-zinc-400 text-xs sm:text-sm mb-4 leading-relaxed">
                Take a break from learning with Critter Catch, a quick arcade game anyone can play.
              </p>
            </div>

            <div class="home-games-action pt-4 border-t border-zinc-800/80 text-xs font-semibold flex items-center justify-between">
              <span>Play Critter Catch</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>

        </div>

        <!-- Secondary Section: Creative & Studio Preview -->
        <div class="home-studio-note flex items-center gap-3.5 text-xs text-zinc-500">
            <span class="text-xl opacity-60">🎨</span>
            <div>
              <span class="font-semibold text-zinc-300">Creative Studio</span>
              <p class="text-[11px] text-zinc-500">Drawing, storytelling, and creative canvas tools in development.</p>
            </div>
        </div>

      </div>
    `;
    ProfileManager.loadLeaderboard('all');
  }
});
