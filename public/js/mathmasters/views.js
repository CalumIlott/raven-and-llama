Object.assign(App.prototype, {
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
  },

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
          <p class="text-xs text-emerald-300 mb-4">Endless best: ${profile?.endlessHighScores?.[belt.id] || 0}</p>

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

          <button onclick="window.app.startEndlessBeltTest('${belt.id}')"
                  class="btn-ninja w-full mt-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-400 text-white font-ninja font-bold shadow-xl">
            ♾️ Start Endless Belt Challenge
          </button>
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
  },

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
  },

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
  },

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
  },

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
  },

  startEndlessBeltTest(beltId) {
    const belt = BELTS_DATA.find(item => item.id === beltId);
    if (!belt) return;
    this.currentView = 'game';
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `<div class="max-w-2xl mx-auto px-4 py-6"><div id="game-arena"></div></div>`;
    let previousSkillId = null;
    window.gameEngine.startEndlessQuiz(
      `${belt.name} • Endless Challenge ♾️`,
      () => {
        const question = QuestionGenerator.generateRandomBeltQuestion(beltId, 'standard', previousSkillId);
        if (question) previousSkillId = question.skillId;
        return question;
      },
      beltId,
      { beltId, baseTimeSeconds: 22 }
    );
  }
});
