// Raven & Llama: Multi-Tiered Educational Platform Controller
class App {
  constructor() {
    this.currentView = 'home';
    this.selectedBeltId = null;
  }

  async init() {
    await ProfileManager.initialize();
    this.updateHeader();
    this.showRavenAndLlamaHome();
    this.attachEventListeners();
  }

  attachEventListeners() {
    const initAudio = () => {
      window.soundFX?.init();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
  }

  updateHeader() {
    const profile = ProfileManager.getActiveProfile();
    const nameEl = document.getElementById('header-profile-name');
    const avatarEl = document.getElementById('header-profile-avatar');
    const starsEl = document.getElementById('header-stars-count');
    const soundBtn = document.getElementById('header-sound-btn');
    const accountButton = document.querySelector('header button[title="Account"]');
    const statusBanner = document.getElementById('account-status-banner');
    const statusMessage = document.getElementById('account-status-message');
    const statusAction = document.getElementById('account-status-action');
    const subBadge = document.getElementById('header-sub-badge');
    const homeBtn = document.getElementById('nav-btn-home');
    const learningBtn = document.getElementById('nav-btn-learning');

    if (nameEl) nameEl.textContent = ProfileManager.account?.username || 'Guest';
    if (accountButton) accountButton.title = ProfileManager.isAuthenticated() ? 'Account settings' : 'Sign in or create an account';
    if (avatarEl) {
      avatarEl.innerHTML = profile?.avatar?.emoji || '🪶';
      avatarEl.className = `w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm shadow ${profile?.avatar?.color || 'bg-black text-white border border-zinc-700'}`;
    }
    if (starsEl) starsEl.textContent = profile?.stars || 0;
    if (statusBanner && statusMessage) {
      const notice = ProfileManager.lastSaveError || (!ProfileManager.isAuthenticated()
        ? ProfileManager.accountServiceAvailable
          ? 'Guest mode: progress will not be saved after this visit.'
          : 'Account service is unavailable. Guest progress will not be saved.'
        : '');
      statusMessage.textContent = notice;
      statusBanner.classList.toggle('hidden', !notice);
      if (statusAction) statusAction.textContent = ProfileManager.isAuthenticated() ? 'Account settings' : 'Sign in';
    }
    if (soundBtn) {
      const isMuted = window.soundFX?.isMuted();
      soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
    }

    // Dynamic header subtitle: Only show badge when within learning or dojo!
    if (subBadge) {
      if (this.currentView === 'home') {
        subBadge.classList.add('hidden');
      } else if (this.currentView === 'learning') {
        subBadge.textContent = 'Learning';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'dojo' || this.currentView === 'belt_detail') {
        subBadge.textContent = 'Maths Dojo';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'timetables') {
        subBadge.textContent = 'Times Tables';
        subBadge.classList.remove('hidden');
      } else {
        subBadge.classList.add('hidden');
      }
    }

    if (homeBtn && learningBtn) {
      if (this.currentView === 'home') {
        homeBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-white bg-zinc-800 transition';
        learningBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition flex items-center gap-1';
      } else {
        homeBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition';
        learningBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 transition flex items-center gap-1';
      }
    }
  }

  toggleSound() {
    const isMuted = window.soundFX?.toggleMute();
    const soundBtn = document.getElementById('header-sound-btn');
    if (soundBtn) soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
  }

  refreshCurrentView() {
    this.updateHeader();
    if (this.currentView === 'home') {
      this.showRavenAndLlamaHome();
    } else if (this.currentView === 'learning') {
      this.showLearningHub();
    } else if (this.currentView === 'dojo') {
      this.showDojoHub();
    } else if (this.currentView === 'belt_detail' && this.selectedBeltId) {
      this.showBeltDetails(this.selectedBeltId);
    } else if (this.currentView === 'timetables') {
      this.showTimesTables();
    } else if (this.currentView === 'trophy') {
      this.showTrophyRoom();
    }
  }

  showPortal() {
    return this.showRavenAndLlamaHome();
  }

  // =========================================================================
  // LEVEL 1: OVERARCHING "RAVEN & LLAMA" PAGE (THE MAIN FLAGSHIP HOME)
  // =========================================================================
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

  // =========================================================================
  // LEVEL 2: "RAVEN & LLAMA LEARNING" SUB-PAGE
  // =========================================================================
  showLearningHub() {
    this.currentView = 'learning';
    const main = document.getElementById('app-main');
    if (!main) return;

    const profile = ProfileManager.getActiveProfile();
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        <!-- Breadcrumb: Back to Raven & Llama Top Level Page -->
        <button onclick="window.app.showRavenAndLlamaHome()" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-6 transition font-bold group">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Raven &amp; Llama Home</span>
        </button>

        <!-- Learning Sub-Page Header Banner -->
        <div class="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
              <span>🪶 Raven &amp; Llama</span>
              <span>•</span>
              <span>Learning Academy Sub-Page</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">
              Raven &amp; Llama <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-300 to-yellow-400">Learning</span>
            </h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
              Choose your math learning module below: complete school belt challenges or master multiplication times tables!
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3">
            <button onclick="window.app.showTrophyRoom()" class="btn-ninja px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-ninja font-bold flex items-center gap-2 shadow-lg text-sm">
              🏆 Trophy Room
            </button>
            <button onclick="window.app.showParentOverview()" class="btn-ninja px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 font-medium flex items-center gap-2 shadow-lg text-xs sm:text-sm">
              📊 Progress Stats
            </button>
          </div>
        </div>

        <!-- Level 3 Programs: MathMasters and Times Tables -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-ninja text-2xl text-white font-bold">Mathematics Modules</h2>
          <span class="text-xs text-slate-400">Select a program to start practicing</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <!-- 1. MATHS MASTERS DOJO -->
          <div onclick="window.app.showDojoHub()"
               class="cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
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
          </div>

          <!-- 2. TIMES TABLES DOJO -->
          <div onclick="window.app.showTimesTables()"
               class="cursor-pointer group relative bg-slate-900/95 border-2 border-slate-700/80 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
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
          </div>

        </div>

        <!-- Upcoming Subjects Preview -->
        <h3 class="font-ninja text-lg text-slate-400 font-bold mb-3 flex items-center gap-2">
          <span>🚀</span> <span>Future Subjects in Raven &amp; Llama Learning</span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 opacity-70">
            <div class="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-2xl">
              🦁
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-ninja text-base font-bold text-slate-300">Spelling Safari</h4>
                <span class="text-[10px] bg-slate-800 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">Coming Soon</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Phonics adventures, tricky words, sight words &amp; vocabulary builder.</p>
            </div>
          </div>

          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 opacity-70">
            <div class="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-2xl">
              🔬
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-ninja text-base font-bold text-slate-300">Science Explorers</h4>
                <span class="text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">Coming Soon</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Solar system journeys, biology mysteries, chemistry &amp; nature quests.</p>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // LEVEL 3: MATHS MASTERS DOJO (BELT HUB)
  // =========================================================================
  showDojoHub() {
    this.currentView = 'dojo';
    const main = document.getElementById('app-main');
    if (!main) return;

    const profile = ProfileManager.getActiveProfile();
    this.updateHeader();

    let beltsGridHtml = '';
    BELTS_DATA.forEach(belt => {
      const isPassed = (profile?.passedBelts || []).includes(belt.id);
      const isStage1 = (profile?.stage1PassedBelts || []).includes(belt.id);
      const isCurrent = profile?.currentBelt === belt.id;
      const trainingStatus = ProfileManager.getSkillsTrainingStatus(belt.id);

      beltsGridHtml += `
        <div onclick="window.app.showBeltDetails('${belt.id}')"
             class="cursor-pointer group relative bg-slate-900/90 rounded-3xl border-2 border-slate-700/80 hover:${belt.borderColor} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${isPassed ? 'border-emerald-500/80' : ''}">

          <div class="absolute top-0 left-0 right-0 h-3 ${belt.ribbonClass}"></div>

          <div class="flex items-start justify-between gap-3 mt-2 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl ${belt.ribbonClass} flex items-center justify-center text-2xl shadow-md font-bold">
                🥋
              </div>
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Level ${belt.level}</span>
                <h3 class="font-ninja text-xl font-bold text-white group-hover:text-amber-400 transition">${belt.name}</h3>
              </div>
            </div>

            ${isPassed ? `
              <div class="bg-emerald-950 text-emerald-400 border border-emerald-600/60 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                ✓ MASTERED
              </div>
            ` : isStage1 ? `
              <div class="bg-sky-950 text-sky-300 border border-sky-600/60 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                STAGE 1 PASSED
              </div>
            ` : isCurrent ? `
              <div class="bg-amber-950 text-amber-300 border border-amber-600/60 text-xs font-bold px-2.5 py-1 rounded-full shadow animate-pulse">
                ACTIVE
              </div>
            ` : ''}
          </div>

          <p class="text-slate-400 text-xs sm:text-sm line-clamp-2 mb-4 h-10">${belt.description}</p>

          <div class="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 mb-4">
            <span>10/10 Skills Mastery:</span>
            <span class="font-ninja font-bold ${trainingStatus.masterCount === trainingStatus.total ? 'text-yellow-400' : 'text-slate-400'}">
              ${trainingStatus.masterCount} / ${trainingStatus.total} 🌟
            </span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span class="text-amber-400 font-semibold flex items-center gap-1">
              🕹️ ${belt.arcadeGame.title.split(' ')[0]} Arcade
            </span>
            <span class="text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
              Enter Belt Dojo →
            </span>
          </div>
        </div>
      `;
    });

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6">

        <!-- Breadcrumb Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button onclick="window.app.showLearningHub()" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">
            🏠 Raven &amp; Llama Home
          </button>
        </div>

        <!-- Dojo Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 mb-2">
              <span>🪶</span> <span>Raven &amp; Llama Learning Curriculum</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">
              Maths Masters <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">Ninja Dojo</span>
            </h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
              Train each skill in the component grounds, pass three timed exams per belt, and play the Dojo Arcade games!
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3">
            <button onclick="window.app.showTrophyRoom()" class="btn-ninja px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-ninja font-bold flex items-center gap-2 shadow-lg">
              🏆 Trophy Room
            </button>
            <button onclick="window.app.showParentOverview()" class="btn-ninja px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 font-medium flex items-center gap-2 shadow-lg text-sm">
              📊 Progress Stats
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${beltsGridHtml}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // LEVEL 3: BELT DETAILS & EXAMS
  // =========================================================================
  showBeltDetails(beltId) {
    this.currentView = 'belt_detail';
    this.selectedBeltId = beltId;
    const main = document.getElementById('app-main');
    if (!main) return;

    const belt = BELTS_DATA.find(b => b.id === beltId);
    if (!belt) return this.showDojoHub();

    const profile = ProfileManager.getActiveProfile();
    const isStage1Passed = (profile?.stage1PassedBelts || []).includes(belt.id);
    const isStage2Passed = (profile?.stage2PassedBelts || []).includes(belt.id);
    const isStage3Passed = (profile?.stage3PassedBelts || []).includes(belt.id);
    const canTakeFinal = ProfileManager.canTakeFinalTest(belt.id);
    const trainingStatus = ProfileManager.getSkillsTrainingStatus(belt.id);

    let skillsListHtml = '';
    belt.skills.forEach(skill => {
      const stat = profile?.skillsProgress?.[skill.id] || { correct: 0, total: 0, bestScore: 0, timesTrained: 0, stars: 0 };
      const isTrained = (stat.timesTrained || 0) > 0;
      const is10 = (stat.bestScore || 0) >= 10;

      skillsListHtml += `
        <div class="bg-slate-900 border-2 ${is10 ? 'border-amber-400/80 bg-amber-950/10' : isTrained ? 'border-sky-500/60' : 'border-slate-700/80'} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sky-400 transition-all shadow-lg">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-slate-800 border ${is10 ? 'border-yellow-400 bg-amber-500/20' : 'border-slate-700'} flex items-center justify-center text-2xl shadow">
              ${is10 ? '🌟' : isTrained ? '🎯' : '⚪'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-ninja text-lg font-bold text-white">${skill.name}</h4>
                ${is10 ? `<span class="bg-yellow-400 text-slate-950 text-[10px] font-ninja font-bold px-2 py-0.5 rounded-md">10/10 MASTER</span>` : isTrained ? `<span class="bg-sky-950 text-sky-300 border border-sky-600 text-[10px] font-ninja font-bold px-2 py-0.5 rounded-md">Trained (${stat.bestScore}/10)</span>` : `<span class="bg-slate-800 text-slate-400 text-[10px] font-ninja px-2 py-0.5 rounded-md">Not Trained Yet</span>`}
              </div>
              <p class="text-slate-400 text-xs sm:text-sm mt-0.5">${skill.description}</p>
              <div class="text-[11px] text-slate-500 mt-1">
                Best Training Score: <strong class="${is10 ? 'text-yellow-400' : 'text-slate-300'}">${stat.bestScore || 0} / 10</strong> • Times Practiced: ${stat.timesTrained || 0} • Speed limit: ${Math.max(5, Math.round(skill.timeLimitSeconds * 0.7))}s
              </div>
            </div>
          </div>

          <button onclick="window.app.startSkillGame('${belt.id}', '${skill.id}')"
                  class="btn-ninja w-full sm:w-auto px-5 py-2.5 rounded-xl ${is10 ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'} text-white font-ninja font-bold text-sm shadow-md whitespace-nowrap">
            Train Skill ⚔️
          </button>
        </div>
      `;
    });

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-6">
          <button onclick="window.app.showDojoHub()" class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
            ← Back to Maths Masters Belts
          </button>
          <div class="flex items-center gap-3">
            <button onclick="window.app.showLearningHub()" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
              Raven &amp; Llama Learning
            </button>
            <span class="text-slate-600">•</span>
            <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">
              🏠 Home
            </button>
          </div>
        </div>

        <!-- Belt Header Banner -->
        <div class="bg-slate-900 border-2 ${belt.borderColor} rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-6">
          <div class="absolute top-0 left-0 right-0 h-3 ${belt.ribbonClass}"></div>

          <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div class="w-20 h-20 rounded-3xl ${belt.ribbonClass} flex items-center justify-center text-4xl shadow-xl font-bold">
                🥋
              </div>
              <div>
                <span class="text-xs uppercase tracking-widest text-slate-400 font-bold">Level ${belt.level} Dojo</span>
                <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold">${belt.name}</h1>
                <p class="text-slate-300 text-sm mt-1 max-w-lg">${belt.description}</p>
              </div>
            </div>

            <button onclick="window.app.launchArcade('${belt.id}')"
                    class="btn-ninja px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-ninja font-bold shadow-xl flex items-center gap-2">
              <span>🕹️</span> <span>Play ${belt.arcadeGame.title.split(' ')[0]} Arcade!</span>
            </button>
          </div>
        </div>

        <!-- 3-Stage Testing Arena Section -->
        <div class="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl mb-8">
          <h3 class="font-ninja text-xl text-yellow-400 font-bold mb-1">Belt Examination Hall</h3>
          <p class="text-xs text-slate-400 mb-4">Pass three quizzes in order with faster timers. Complete 10/10 training on all skills for the Stage 3 Final!</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Stage 1 Test Box -->
            <div class="p-5 rounded-2xl border-2 ${isStage1Passed ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 bg-slate-950/60'} flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs uppercase tracking-wider text-slate-400 font-bold">Stage 1</span>
                  ${isStage1Passed ? '<span class="text-xs text-emerald-400 font-bold">✓ PASSED</span>' : ''}
                </div>
                <h4 class="font-ninja text-lg text-white font-bold mb-1">Proficiency Exam</h4>
                <p class="text-xs text-slate-400 mb-4">10 questions covering all belt skills. 80% to pass.</p>
              </div>
              <button onclick="window.app.startBeltTestGame('${belt.id}', 1)"
                      class="btn-ninja w-full py-3 rounded-xl ${isStage1Passed ? 'bg-slate-800 text-slate-200' : 'bg-sky-600 text-white'} font-ninja font-bold text-sm shadow">
                ${isStage1Passed ? 'Retake Stage 1 Exam' : 'Take Stage 1 Exam 🥋'}
              </button>
            </div>

            <!-- Stage 2 Test Box -->
            <div class="p-5 rounded-2xl border-2 ${isStage2Passed ? 'border-yellow-400 bg-amber-950/20' : isStage1Passed ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-950/40 opacity-70'} flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs uppercase tracking-wider text-slate-400 font-bold">Stage 2</span>
                  ${isStage2Passed ? '<span class="text-xs text-yellow-400 font-bold">✓ PASSED</span>' : !isStage1Passed ? '<span class="text-xs text-rose-400 font-bold">🔒 LOCKED</span>' : '<span class="text-xs text-amber-400 font-bold">READY</span>'}
                </div>
                <h4 class="font-ninja text-lg text-white font-bold mb-1">Stage 2 Speed Quiz 🔥</h4>
                <p class="text-xs text-slate-400 mb-2">10 questions with a faster timer than Stage 1.</p>
                <div class="text-[11px] ${isStage1Passed ? 'text-emerald-400' : 'text-amber-400'} bg-slate-900 p-2.5 rounded-xl border border-slate-800 mb-4 font-medium">
                  Prerequisite: Stage 1 Passed (${isStage1Passed ? '✓' : '✗'})
                </div>
              </div>

              ${isStage1Passed ? `
                <button onclick="window.app.startBeltTestGame('${belt.id}', 2)"
                        class="btn-ninja w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-ninja font-bold text-sm shadow-xl">
                  ${isStage2Passed ? 'Retake' : 'Take'} Stage 2 Quiz ⚔️
                </button>
              ` : `
                <button disabled class="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-ninja font-bold text-xs border border-slate-700 cursor-not-allowed">
                  🔒 Complete Stage 1 to Unlock
                </button>
              `}
            </div>
          </div>

          <!-- Stage 3 Final Box -->
          <div class="mt-4 p-5 rounded-2xl border-2 ${isStage3Passed ? 'border-emerald-500 bg-emerald-950/20' : canTakeFinal ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-950/40 opacity-70'}">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase tracking-wider text-slate-400 font-bold">Stage 3 (Final Grand Master)</span>
              ${isStage3Passed ? '<span class="text-xs text-emerald-400 font-bold">✓ PASSED &amp; CERTIFIED 🏆</span>' : canTakeFinal ? '<span class="text-xs text-amber-400 font-bold">READY FOR FINAL</span>' : '<span class="text-xs text-rose-400 font-bold">🔒 LOCKED</span>'}
            </div>
            <h4 class="font-ninja text-lg text-white font-bold mb-1">Stage 3 Grand Master Final Exam 🏆</h4>
            <p class="text-xs text-slate-400 mb-3">8 high-speed questions. Requires Stage 2 passed AND 10/10 mastery on all component skills (${trainingStatus.masterCount}/${trainingStatus.total} Mastered).</p>
            ${canTakeFinal ? `
              <button onclick="window.app.startBeltTestGame('${belt.id}', 3)" class="btn-ninja w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-ninja font-bold shadow-xl">
                ${isStage3Passed ? 'Retake' : 'Take'} Stage 3 Final Exam! 🏆
              </button>
            ` : `
              <button onclick="window.app.showPrerequisiteChecklist('${belt.id}')" class="w-full py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-ninja font-bold text-xs border border-slate-700">
                🔒 View Missing Prerequisites (${trainingStatus.masterCount}/${trainingStatus.total} Mastered)
              </button>
            `}
          </div>
        </div>

        <!-- Skills List -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-ninja text-xl text-yellow-400 font-bold">Component Skills Training Grounds:</h2>
          <span class="text-xs text-slate-400">${belt.skills.length} Skills</span>
        </div>

        <div class="flex flex-col gap-3">
          ${skillsListHtml}
        </div>
      </div>
    `;
  }

  showPrerequisiteChecklist(beltId) {
    const status = ProfileManager.getSkillsTrainingStatus(beltId);
    const profile = ProfileManager.getActiveProfile();
    const isStage2 = (profile?.stage2PassedBelts || []).includes(beltId);

    alert(`Prerequisites for Stage 3 Final Exam:\n\n` +
      `1. Stage 2 Speed Quiz Passed: ${isStage2 ? '✓ Complete' : '✗ Incomplete'}\n` +
      `2. 10/10 Skills Mastery (${status.masterCount}/${status.total} Mastered):\n` +
      status.skills.map(s => `   - ${s.name}: ${s.isMaster10 ? '✓ (10/10)' : s.isTrained ? `✗ (Current: ${s.bestScore}/10)` : '✗ (Not Trained)'}`).join('\n') +
      `\n\nTrain all incomplete skills to 10/10 in the Training Grounds below to unlock the Final Exam!`
    );
  }

  // =========================================================================
  // LEVEL 3: TIMES TABLES DOJO
  // =========================================================================
  showTimesTables() {
    this.currentView = 'timetables';
    const main = document.getElementById('app-main');
    if (!main) return;

    const buttons = Array.from({length: 11}, (_, i) => i + 2).map(n => `
      <button onclick="window.app.startTimesTable(${n})"
              class="btn-ninja p-4 rounded-2xl bg-slate-900 border-2 border-emerald-700 hover:border-emerald-400 text-white font-ninja text-xl font-bold hover:scale-105 transition shadow-lg flex flex-col items-center justify-center">
        <span>${n}×</span>
        <span class="text-[10px] text-slate-400 font-normal mt-0.5">Table</span>
      </button>
    `).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-5">
          <button onclick="window.app.showLearningHub()" class="text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <div class="flex items-center gap-3">
            <button onclick="window.app.showDojoHub()" class="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              🥋 Maths Masters Belts
            </button>
            <span class="text-slate-600">•</span>
            <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">
              🏠 Home
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">✖️</span>
            <h1 class="font-ninja text-3xl text-emerald-400 font-bold">Times Tables Dojo</h1>
          </div>
          <p class="text-slate-300 text-sm max-w-xl">
            Choose any individual times table from 2× to 12×, challenge yourself with a mixed sprint, or complete the 33-question mastery test!
          </p>
        </div>

        <h2 class="font-ninja text-xl text-white mb-3">Individual Tables Practice (2× to 12×):</h2>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          ${buttons}
        </div>

        <h2 class="font-ninja text-xl text-white mb-3">All-Tables Mixed Challenges:</h2>
        <div class="grid sm:grid-cols-2 gap-4 mb-4">
          <button onclick="window.app.startTimesTableQuiz(false)"
                  class="btn-ninja p-5 rounded-2xl bg-sky-800 hover:bg-sky-700 border-2 border-sky-400 text-white font-ninja font-bold text-left shadow-xl transition flex items-center justify-between">
            <div>
              <div class="text-lg">Quick Mixed Quiz ⚡</div>
              <div class="text-xs text-slate-300 font-normal mt-0.5">12 random questions across all tables (2×–12×)</div>
            </div>
            <span class="text-2xl">➔</span>
          </button>

          <button onclick="window.app.startTimesTableQuiz(true)"
                  class="btn-ninja p-5 rounded-2xl bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-400 text-white font-ninja font-bold text-left shadow-xl transition flex items-center justify-between">
            <div>
              <div class="text-lg">Grand Completion Test 🏆</div>
              <div class="text-xs text-slate-300 font-normal mt-0.5">33 questions covering the full times tables curriculum</div>
            </div>
            <span class="text-2xl">➔</span>
          </button>
        </div>

        <button onclick="window.app.startTimetableArcade()"
                class="btn-ninja w-full p-5 rounded-2xl bg-amber-600 hover:bg-amber-500 border-2 border-amber-300 text-slate-950 font-ninja font-bold text-lg shadow-xl transition flex items-center justify-center gap-3">
          <span>🕹️</span> <span>Play Product Pair Match Arcade!</span>
        </button>
      </div>
    `;
  }

  startTimesTableQuiz(allTables, table = null) {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `<div class="max-w-2xl mx-auto px-4 py-6"><div id="game-arena"></div></div>`;
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
  }

  startTimesTable(table) {
    this.startTimesTableQuiz(false, table);
  }

  startTimetableArcade() {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-6">
        <div class="bg-slate-900 border-2 border-amber-600 rounded-3xl p-5 text-center shadow-2xl">
          <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <button onclick="window.app.showTimesTables()" class="btn-ninja text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-slate-300">
              ← Exit Arcade
            </button>
            <h2 class="font-ninja text-xl text-amber-400 font-bold">Product Pair Match 🕹️</h2>
            <div class="text-emerald-400 font-bold text-sm">Score: <span id="tt-score">0</span></div>
          </div>
          <p class="text-slate-300 text-xs mb-3">Tap two numbers whose multiplication equals the target product!</p>
          <div class="text-yellow-300 font-ninja text-2xl font-bold mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800" id="tt-target"></div>
          <div id="tt-cards" class="grid grid-cols-4 gap-3 my-2"></div>
        </div>
      </div>
    `;
    this.ttScore = 0;
    this.ttNextRound();
  }

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
              class="btn-ninja aspect-square bg-indigo-950 border-2 border-indigo-600 hover:border-yellow-400 rounded-2xl text-white text-2xl font-ninja font-bold transition flex items-center justify-center shadow-lg"
              onclick="window.app.ttPick(${c.i}, ${c.v})">
        ${c.v}
      </button>
    `).join('');

    this.ttPick = (id, val) => {
      if (this.ttResolving || picked.some(p => p.id === id)) return;
      const card = document.getElementById(`tt-card-${id}`);
      picked.push({ id, val });
      card?.classList.add('ring-4', 'ring-yellow-300', 'scale-105', 'border-yellow-300');

      if (picked.length < 2) return;
      this.ttResolving = true;
      const isMatch = picked[0].val * picked[1].val === target;

      picked.forEach(({ id: pickedId }) => {
        const pickedCard = document.getElementById(`tt-card-${pickedId}`);
        pickedCard?.classList.remove('ring-4', 'ring-yellow-300', 'scale-105', 'border-yellow-300');
        pickedCard?.classList.add(isMatch ? 'bg-emerald-700' : 'bg-rose-800', isMatch ? 'border-emerald-300' : 'border-rose-400');
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

  // =========================================================================
  // ARCADE & TRAINING QUIZ RUNNERS
  // =========================================================================
  launchArcade(beltId) {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-6">
        <div id="game-arena"></div>
      </div>
    `;

    switch (beltId) {
      case 'white': window.arcadeEngine.startBalloonPop('game-arena'); break;
      case 'yellow': window.arcadeEngine.startPotionMatch('game-arena'); break;
      case 'green': window.arcadeEngine.startPlatformRunner('game-arena'); break;
      case 'blue': window.arcadeEngine.startShurikenGallery('game-arena'); break;
      case 'brown': window.arcadeEngine.startAsteroidBlaster('game-arena'); break;
      case 'black': window.arcadeEngine.startGemSorter('game-arena'); break;
      case 'platinum': window.arcadeEngine.startCyberDefense('game-arena'); break;
      default: window.arcadeEngine.startBalloonPop('game-arena');
    }
  }

  startSkillGame(beltId, skillId) {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-6">
        <div id="game-arena"></div>
      </div>
    `;

    window.gameEngine.startTraining(beltId, skillId);
  }

  startBeltTestGame(beltId, stage = 1) {
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 py-6">
        <div id="game-arena"></div>
      </div>
    `;

    window.gameEngine.startBeltTest(beltId, stage);
  }

  // =========================================================================
  // TROPHY ROOM
  // =========================================================================
  showTrophyRoom() {
    this.currentView = 'trophy';
    const main = document.getElementById('app-main');
    if (!main) return;

    const profile = ProfileManager.getActiveProfile();
    const passedBelts = profile?.passedBelts || [];
    const certificates = profile?.certificates || [];

    let certificatesHtml = certificates.length === 0
      ? `<div class="text-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
           <div class="text-3xl mb-2">📜</div>
           <p class="text-sm">No Grand Master certificates earned yet.</p>
           <p class="text-xs text-slate-500 mt-1">Master all component skills to 10/10 and pass all three belt quizzes to earn certificates!</p>
         </div>`
      : certificates.map(c => `
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl">
              📜
            </div>
            <div>
              <h4 class="font-ninja text-lg text-yellow-300 font-bold">${c.beltName} Mastery</h4>
              <div class="text-xs text-slate-400">Awarded on ${c.date} • Score: ${c.score}</div>
            </div>
          </div>
          <span class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-600 px-3 py-1 rounded-full font-bold">
            GRADUATED 🏆
          </span>
        </div>
      `).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-6">
          <button onclick="window.app.showLearningHub()" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">
            🏠 Raven &amp; Llama Home
          </button>
        </div>

        <div class="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
              🏆
            </div>
            <div>
              <h1 class="font-ninja text-3xl text-white font-bold">${profile?.name || 'Explorer'}'s Trophy Hall</h1>
              <p class="text-slate-400 text-sm">Total Stars: <span class="text-yellow-400 font-bold">${profile?.stars || 0} ⭐</span> • Belts Graduated: <span class="text-emerald-400 font-bold">${passedBelts.length} / 7</span></p>
            </div>
          </div>

          <h3 class="font-ninja text-lg text-yellow-400 font-bold mb-3">Belt Graduation Shelf:</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            ${BELTS_DATA.map(belt => {
              const hasPassed = passedBelts.includes(belt.id);
              return `
                <div class="p-3 rounded-2xl text-center border ${hasPassed ? 'border-amber-400 bg-slate-800' : 'border-slate-800 bg-slate-950/40 opacity-40'}">
                  <div class="w-10 h-10 mx-auto rounded-xl ${belt.ribbonClass} flex items-center justify-center text-xl shadow mb-2">
                    🥋
                  </div>
                  <div class="font-ninja text-xs font-bold text-white truncate">${belt.name.replace(' Belt', '')}</div>
                  <div class="text-[10px] mt-1 ${hasPassed ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
                    ${hasPassed ? 'PASSED 🏆' : 'LOCKED'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <h3 class="font-ninja text-lg text-yellow-400 font-bold mb-3">Earned Certificates:</h3>
          <div class="flex flex-col gap-3">
            ${certificatesHtml}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CROSS-DEVICE LEARNER SELECTOR / CREATOR
  // =========================================================================
  openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    const authenticated = ProfileManager.isAuthenticated();
    const guestPanel = document.getElementById('account-guest-panel');
    const signedInPanel = document.getElementById('account-signed-in-panel');
    const description = document.getElementById('account-modal-description');
    const username = document.getElementById('account-username-display');
    const serviceWarning = document.getElementById('account-service-warning');
    const message = document.getElementById('account-message');
    if (guestPanel) guestPanel.classList.toggle('hidden', authenticated);
    if (signedInPanel) signedInPanel.classList.toggle('hidden', !authenticated);
    if (description) description.textContent = authenticated
      ? 'Manage your password or sign out of this account.'
      : 'Sign in to save progress across your devices.';
    if (username) username.textContent = ProfileManager.account?.username || '';
    if (serviceWarning) serviceWarning.classList.toggle('hidden', ProfileManager.accountServiceAvailable);
    if (message) {
      message.textContent = '';
      message.classList.add('hidden');
    }
    if (!authenticated) this.setAccountMode('login');
    modal.classList.remove('hidden');
  }

  setAccountMode(mode) {
    this.accountMode = mode === 'register' ? 'register' : 'login';
    const register = this.accountMode === 'register';
    const loginTab = document.getElementById('account-login-tab');
    const registerTab = document.getElementById('account-register-tab');
    const confirmField = document.getElementById('account-confirm-field');
    const passwordInput = document.getElementById('account-password');
    const passwordLabel = document.getElementById('account-password-label');
    const submitButton = document.getElementById('account-submit-button');
    const message = document.getElementById('account-message');
    if (loginTab) {
      loginTab.setAttribute('aria-pressed', String(!register));
      loginTab.className = `px-3 py-2 rounded-md text-sm font-semibold ${register ? 'text-zinc-400 hover:text-white' : 'bg-zinc-700 text-white'}`;
    }
    if (registerTab) {
      registerTab.setAttribute('aria-pressed', String(register));
      registerTab.className = `px-3 py-2 rounded-md text-sm font-semibold ${register ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`;
    }
    if (confirmField) confirmField.classList.toggle('hidden', !register);
    if (passwordInput) passwordInput.autocomplete = register ? 'new-password' : 'current-password';
    if (passwordLabel) passwordLabel.textContent = register ? 'Password (12 characters minimum)' : 'Password';
    if (submitButton) submitButton.textContent = register ? 'Create account' : 'Sign in';
    if (message) message.classList.add('hidden');
  }

  setAccountMessage(text, isError = true) {
    const message = document.getElementById('account-message');
    if (!message) return;
    message.textContent = text;
    message.className = `mb-4 p-3 rounded-lg text-sm ${isError ? 'bg-rose-950/70 text-rose-200 border border-rose-800' : 'bg-emerald-950/70 text-emerald-200 border border-emerald-800'}`;
  }

  async submitAccountForm(event) {
    event.preventDefault();
    const username = document.getElementById('account-username')?.value.trim() || '';
    const password = document.getElementById('account-password')?.value || '';
    const confirmPassword = document.getElementById('account-confirm-password')?.value || '';
    const submitButton = document.getElementById('account-submit-button');
    if (this.accountMode === 'register' && password !== confirmPassword) {
      this.setAccountMessage('Passwords do not match.');
      return;
    }

    if (submitButton) submitButton.disabled = true;
    try {
      if (this.accountMode === 'register') await ProfileManager.registerAccount(username, password);
      else await ProfileManager.login(username, password);
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to access this account.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  async changePasswordSubmit(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('account-current-password')?.value || '';
    const newPassword = document.getElementById('account-new-password')?.value || '';
    const confirmPassword = document.getElementById('account-new-password-confirm')?.value || '';
    if (newPassword !== confirmPassword) {
      this.setAccountMessage('New passwords do not match.');
      return;
    }
    try {
      await ProfileManager.changePassword(currentPassword, newPassword);
      document.getElementById('account-password-form')?.reset();
      this.setAccountMessage('Password updated.', false);
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to update password.');
    }
  }

  async logoutAccount() {
    try {
      await ProfileManager.logout();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to sign out.');
    }
    this.closeProfileModal();
    this.updateHeader();
    this.refreshCurrentView();
  }

  async deleteAccount(event) {
    event?.preventDefault();
    const form = document.getElementById('delete-account-confirmation');
    if (!form) return;
    if (!form.reportValidity()) return;
    const password = document.getElementById('delete-account-password')?.value || '';
    try {
      await ProfileManager.deleteAccount(password);
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to delete account.');
    }
  }

  showDeleteAccountConfirmation() {
    document.getElementById('delete-account-toggle')?.classList.add('hidden');
    document.getElementById('delete-account-confirmation')?.classList.remove('hidden');
    document.getElementById('delete-account-password')?.focus();
  }

  cancelDeleteAccount() {
    document.getElementById('delete-account-confirmation')?.classList.add('hidden');
    document.getElementById('delete-account-toggle')?.classList.remove('hidden');
    document.getElementById('delete-account-confirmation')?.reset();
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
  }

  selectProfile(profileId) {
    ProfileManager.setActiveProfile(profileId);
    this.closeProfileModal();
    this.updateHeader();
    this.refreshCurrentView();
  }

  confirmDeleteProfile(profileId, profileName) {
    if (confirm(`Are you sure you want to delete ${profileName}'s profile and progress across devices?`)) {
      ProfileManager.deleteProfile(profileId);
      this.openProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    }
  }

  createNewProfileSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('new-profile-name');
    const selectedAvatar = document.querySelector('input[name="new_avatar"]:checked');
    const name = nameInput ? nameInput.value.trim() : '';
    const avatarId = selectedAvatar ? selectedAvatar.value : 'raven';

    if (name) {
      ProfileManager.createProfile(name, avatarId);
      if (nameInput) nameInput.value = '';
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    }
  }

  // =========================================================================
  // PARENT / TEACHER PROGRESS REPORT
  // =========================================================================
  showParentOverview() {
    const modal = document.getElementById('parent-modal');
    if (!modal) return;

    const profile = ProfileManager.getActiveProfile();
    const progress = profile?.skillsProgress || {};

    let tableRows = '';
    BELTS_DATA.forEach(belt => {
      belt.skills.forEach(skill => {
        const stat = progress[skill.id] || { correct: 0, total: 0, bestScore: 0, timesTrained: 0, stars: 0 };
        const is10 = (stat.bestScore || 0) >= 10;
        tableRows += `
          <tr class="border-b border-slate-800 text-xs sm:text-sm">
            <td class="py-2.5 px-3 font-ninja text-white">${belt.name.replace(' Belt', '')}</td>
            <td class="py-2.5 px-3 text-slate-300 font-medium">${skill.name}</td>
            <td class="py-2.5 px-3 text-center text-slate-400">${stat.timesTrained || 0}</td>
            <td class="py-2.5 px-3 text-center font-bold ${is10 ? 'text-yellow-400' : 'text-slate-300'}">${stat.bestScore || 0} / 10</td>
            <td class="py-2.5 px-3 text-center font-bold ${is10 ? 'text-yellow-400' : 'text-slate-500'}">${is10 ? '🌟 10/10 MASTER' : (stat.timesTrained > 0 ? 'Trained' : 'Untrained')}</td>
          </tr>
        `;
      });
    });

    const tbody = document.getElementById('parent-stats-tbody');
    if (tbody) tbody.innerHTML = tableRows;

    const studentNameEl = document.getElementById('parent-student-name');
    if (studentNameEl) studentNameEl.textContent = profile ? profile.name : 'Learner';

    modal.classList.remove('hidden');
  }

  closeParentModal() {
    const modal = document.getElementById('parent-modal');
    if (modal) modal.classList.add('hidden');
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
