Object.assign(App.prototype, {
  showRavenAndLlamaHome() {
    this.currentView = 'home';
    const main = document.getElementById('app-main');
    if (!main) return;

    const profile = ProfileManager.getActiveProfile();
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-8 sm:py-14 font-sans">

        <!-- Modern Hero Section -->
        <div class="relative bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-12 shadow-2xl overflow-hidden mb-12">
          <!-- Subtle Glow Highlights -->
          <div class="absolute -top-32 -right-32 w-80 h-80 bg-zinc-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <!-- Crisp Modern Logo Emblem -->
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-0.5 bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-700 shadow-xl flex-shrink-0">
                <img src="assets/raven-llama-logo.svg" alt="Raven &amp; Llama" class="w-full h-full object-contain rounded-2xl bg-zinc-950" />
              </div>

              <div>
                <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  Raven &amp; Llama
                </h1>
                <p class="text-zinc-400 text-sm sm:text-base mt-2 max-w-lg font-normal leading-relaxed">
                  Where curiosity meets mastery. An ecosystem of educational programs, tools, and challenges.
                </p>

                <!-- Active Account Indicator (Clean, NOT childish) -->
                <div class="mt-4 inline-flex items-center gap-2.5 bg-zinc-950/80 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs text-zinc-300">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>${ProfileManager.isAuthenticated() ? 'Signed in as:' : 'Guest:'}</span>
                  <strong class="text-zinc-100 font-semibold">${profile?.name || 'Guest'}</strong>
                  <button onclick="window.app.openProfileModal()" class="text-zinc-400 hover:text-white underline ml-1 text-xs transition">
                    Account
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Access Nav Cards -->
            <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <button onclick="window.app.showLearningHub()" class="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow transition flex items-center justify-center gap-2">
                <span>Enter Learning Hub</span>
                <span>→</span>
              </button>
              <button onclick="window.app.showParentOverview()" class="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5">
                <span>📊</span> <span>Mastery Stats</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tier 1 Section Gateways -->
        <div class="mb-6">
          <h2 class="text-lg sm:text-xl font-bold tracking-tight text-zinc-200">Programs &amp; Spaces</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mt-0.5">Explore the active learning academy and interactive activities</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          <!-- CARD 1: RAVEN & LLAMA LEARNING (FLAGSHIP SUB-PAGE) -->
          <div onclick="window.app.showLearningHub()"
               class="cursor-pointer group relative bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between md:col-span-2">
            <div>
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl shadow">
                    🎓
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Educational Academy</span>
                    <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition">
                      Raven &amp; Llama Learning
                    </h3>
                  </div>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Active Hub
                </span>
              </div>

              <p class="text-zinc-400 text-sm leading-relaxed mb-6">
                Our complete educational wing. Practice targeted mathematics with the 7-belt <strong>Maths Masters Dojo</strong> and build automaticity with <strong>Times Tables Dojo</strong>.
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80 mb-6">
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

            <div class="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">
              <span>Open Learning Academy</span>
              <span class="group-hover:translate-x-1.5 transition-transform text-base">→</span>
            </div>
          </div>

          <!-- CARD 2: ARCADE & MINI-GAMES -->
          <div onclick="window.app.showLearningHub()"
               class="cursor-pointer group bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl shadow">
                  🕹️
                </div>
                <div>
                  <span class="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Mini-Games</span>
                  <h3 class="text-lg font-bold text-white">Dojo Arcade</h3>
                </div>
              </div>

              <p class="text-zinc-400 text-xs sm:text-sm mb-4 leading-relaxed">
                Reflex mini-games including Balloon Pop, Tens Mate Potion Match, Ninja Runner, and Product Match.
              </p>
            </div>

            <div class="pt-4 border-t border-zinc-800/80 text-xs font-semibold text-zinc-300 group-hover:text-white flex items-center justify-between">
              <span>Explore Arcades</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

        </div>

        <!-- Secondary Section: Creative & Studio Preview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-500">
          <div class="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
            <span class="text-xl opacity-60">🎨</span>
            <div>
              <span class="font-semibold text-zinc-300">Creative Studio</span>
              <p class="text-[11px] text-zinc-500">Drawing, storytelling, and creative canvas tools in development.</p>
            </div>
          </div>
          <div class="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
            <span class="text-xl opacity-60">📜</span>
            <div>
              <span class="font-semibold text-zinc-300">Achievements Archive</span>
              <p class="text-[11px] text-zinc-500">Centralized storage for certificates and milestone records.</p>
            </div>
          </div>
        </div>

      </div>
    `;
  }
});
