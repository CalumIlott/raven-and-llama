Object.assign(App.prototype, {
  showLearningHub() {
    this.currentView = 'learning';
    this.rememberModule('learning');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'learning';

    const profile = ProfileManager.getActiveProfile();
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        <!-- Breadcrumb: Back to Raven & Llama Top Level Page -->
        <button data-action="home" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-6 transition font-bold group">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Raven &amp; Llama Home</span>
        </button>

        <!-- Learning Sub-Page Header Banner -->
        <div class="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
              <span>🪶 Academy for curious minds</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">
              Raven &amp; Llama <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-300 to-yellow-400">Learning</span>
            </h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
              Train your maths skills, master times tables, explore spelling, or set off on a science discovery mission!
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3">
            <button data-action="trophy-room" class="btn-ninja px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-ninja font-bold flex items-center gap-2 shadow-lg text-sm">
              🏆 Trophy Room
            </button>
            <button data-action="parent-report" class="btn-ninja px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 font-medium flex items-center gap-2 shadow-lg text-xs sm:text-sm">
              📊 Progress Stats
            </button>
          </div>
        </div>

        <div class="mb-8">
          ${ProfileManager.renderLeaderboard('learning', 'Learning Hub Leaderboard')}
        </div>

        <!-- Learning Modules -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-ninja text-2xl text-white font-bold">Learning Modules</h2>
          <span class="text-xs text-slate-400">Choose a program to start exploring</span>
        </div>

        <div id="learning-modules-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

          <!-- 1. MATHS MASTERS DOJO -->
          <a href="#maths-masters" data-action="dojo"
             class="app-card-link group relative p-6 sm:p-8 shadow-xl flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300"></div>

            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-3xl shadow-lg border border-yellow-300">
                    🥋
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-amber-400 font-bold">School Program</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-amber-300 transition">Maths Masters Dojo</h3>
                  </div>
                </div>
                <span class="bg-amber-950 text-amber-300 border border-amber-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  7 Belts 🏅
                </span>
              </div>

              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                The complete Raven &amp; Llama Maths Masters curriculum! Train skills in the dojo grounds, pass 3-stage timed belt exams, and graduate from White to Platinum Grand Master.
              </p>

              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Curriculum</div>
                  <div class="font-ninja font-bold text-white mt-0.5">${BELTS_DATA.reduce((total, belt) => total + belt.skills.length, 0)} Skills</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Exams</div>
                  <div class="font-ninja font-bold text-yellow-400 mt-0.5">3 Quizzes/Belt</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Mini-Games</div>
                  <div class="font-ninja font-bold text-emerald-400 mt-0.5">7 Arcades</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-amber-400 group-hover:text-yellow-300">
              <span>Open Maths Masters Dojo</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </a>

          <!-- 2. TIMES TABLES DOJO -->
          <a href="#times-tables" data-action="times-tables"
             class="app-card-link group relative p-6 sm:p-8 shadow-xl flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"></div>

            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl shadow-lg border border-emerald-300">
                    ✖️
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-emerald-400 font-bold">Speed Fluency</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-emerald-300 transition">Times Tables Dojo</h3>
                  </div>
                </div>
                <span class="bg-emerald-950 text-emerald-300 border border-emerald-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  2× to 12× ⚡
                </span>
              </div>

              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                Complete multiplication tables training. Focused drills for every table from 2× to 12×, quick mixed sprints, 33-question completion test, and factor match arcade.
              </p>

              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Tables</div>
                  <div class="font-ninja font-bold text-white mt-0.5">2× through 12×</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Mastery Test</div>
                  <div class="font-ninja font-bold text-cyan-300 mt-0.5">33 Questions</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Arcade</div>
                  <div class="font-ninja font-bold text-amber-400 mt-0.5">Product Match</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Open Times Tables Dojo</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </a>

          <button type="button" data-action="telling-time"
                  class="w-full text-left cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400"></div>
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-3xl shadow-lg border border-yellow-300">
                    🕒
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-amber-400 font-bold">Maths Skills</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-amber-300 transition">Telling Time</h3>
                  </div>
                </div>
                <span class="bg-amber-950 text-amber-300 border border-amber-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  4 Activities 🕰️
                </span>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                Learn to read and match analogue and digital clocks, from o'clock and half past to five-minute intervals.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Learn</div>
                  <div class="font-ninja font-bold text-white mt-0.5">Clock Faces</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Match</div>
                  <div class="font-ninja font-bold text-yellow-300 mt-0.5">Digital Time</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Practise</div>
                  <div class="font-ninja font-bold text-amber-300 mt-0.5">4 Games</div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-amber-400 group-hover:text-yellow-300">
              <span>Explore Telling Time</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </button>

          <!-- 3. SCIENCE EXPLORERS -->
          <button type="button" data-action="science-home"
                  class="w-full text-left cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-sky-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"></div>
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-3xl shadow-lg border border-cyan-300">
                    🔬
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-sky-400 font-bold">Discovery Program</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-sky-300 transition">Science Explorers</h3>
                  </div>
                </div>
                <span class="bg-sky-950 text-sky-300 border border-sky-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  4 Missions 🚀
                </span>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                Journey through space, explore animal habitats, experiment with states of matter, and investigate the natural world.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Space</div>
                  <div class="font-ninja font-bold text-white mt-0.5">Orbit Rescue</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Life</div>
                  <div class="font-ninja font-bold text-emerald-300 mt-0.5">Habitat Match</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">More</div>
                  <div class="font-ninja font-bold text-cyan-300 mt-0.5">2 Lab Missions</div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-sky-400 group-hover:text-cyan-300">
              <span>Explore Science Explorers</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </button>

          <button type="button" data-action="spelling-home"
                  class="w-full text-left cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-sky-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"></div>
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-3xl shadow-lg border border-cyan-300">
                    🦁
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-sky-400 font-bold">Word Adventures</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-sky-300 transition">Spelling Safari</h3>
                  </div>
                </div>
                <span class="bg-sky-950 text-sky-300 border border-sky-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  4 Adventures 🦁
                </span>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                Phonics, tricky spelling, vocabulary and word-scramble adventures.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Phonics</div>
                  <div class="font-ninja font-bold text-white mt-0.5">Trail</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Vocabulary</div>
                  <div class="font-ninja font-bold text-emerald-300 mt-0.5">Explorer</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Word Game</div>
                  <div class="font-ninja font-bold text-cyan-300 mt-0.5">Jumble</div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-sky-400 group-hover:text-cyan-300">
              <span>Explore Spelling Safari</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </button>

          <button type="button" data-action="money-home"
                  class="w-full text-left cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400"></div>
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-3xl shadow-lg border border-yellow-300">
                    🇦🇺
                  </div>
                  <div>
                    <span class="text-xs uppercase tracking-wider text-amber-400 font-bold">Everyday Maths</span>
                    <h3 class="font-ninja text-2xl font-bold text-white group-hover:text-amber-300 transition">Money Masters</h3>
                  </div>
                </div>
                <span class="bg-amber-950 text-amber-300 border border-amber-600/60 text-xs font-bold px-3 py-1 rounded-full">
                  3 Money Games 💰
                </span>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">
                Recognise Australian coins and notes, build exact totals, and practise giving change at easy, medium, or hard difficulty.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-6">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Recognise</div>
                  <div class="font-ninja font-bold text-white mt-0.5">Coins &amp; Notes</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Practise</div>
                  <div class="font-ninja font-bold text-emerald-300 mt-0.5">Make a Total</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Challenge</div>
                  <div class="font-ninja font-bold text-cyan-300 mt-0.5">Give Change</div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-sm font-ninja font-bold text-amber-400 group-hover:text-yellow-300">
              <span>Explore Money Masters</span>
              <span class="group-hover:translate-x-2 transition-transform text-lg">→</span>
            </div>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          ${ProfileManager.renderLeaderboard('maths', 'Maths Masters Top Scores')}
          ${ProfileManager.renderLeaderboard('times_tables', 'Times Tables Top Scores')}
        </div>

      </div>
    `;
    ProfileManager.loadLeaderboard('learning');
    ProfileManager.loadLeaderboard('maths');
    ProfileManager.loadLeaderboard('times_tables');
  }
});
