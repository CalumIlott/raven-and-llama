// Game Engine for Skill Training and 2-Stage Belt Tests with Timed Fluency
class GameEngine {
  constructor() {
    this.mode = 'training';
    this.currentBelt = null;
    this.currentSkill = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.totalQuestions = 10;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = 3;
    this.isAnswering = false;
    this.userOrder = [];
    this.timerInterval = null;
    this.timeLeft = 0;
    this.totalTime = 0;
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startTimer(seconds) {
    this.stopTimer();
    // Curriculum and generated question limits share one clean 30% reduction.
    seconds = Math.max(5, Math.round(seconds * 0.7));
    if (this.mode.startsWith('belt_test')) {
      const stage = Number(this.mode.slice(-1));
      seconds = Math.max(5, Math.round(seconds * (1 - (stage - 1) * 0.12)));
    }
    this.timeLeft = seconds;
    this.totalTime = seconds;
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      if (this.timeLeft <= 3.0 && Math.floor(this.timeLeft * 10) % 10 === 0 && this.timeLeft > 0.1) {
        window.soundFX?.playTick();
      }
      this.updateTimerUI();

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 100);
  }

  updateTimerUI() {
    const timerBar = document.getElementById('question-timer-bar');
    const timerText = document.getElementById('question-timer-text');
    if (!timerBar) return;

    const pct = Math.max(0, Math.min(100, (this.timeLeft / this.totalTime) * 100));
    timerBar.style.width = `${pct}%`;

    if (pct < 30) {
      timerBar.className = 'h-2 rounded-full transition-all duration-100 bg-rose-500';
    } else if (pct < 60) {
      timerBar.className = 'h-2 rounded-full transition-all duration-100 bg-amber-400';
    } else {
      timerBar.className = 'h-2 rounded-full transition-all duration-100 bg-emerald-400';
    }

    if (timerText) {
      timerText.textContent = `${Math.ceil(Math.max(0, this.timeLeft))}s`;
    }
  }

  handleTimeout() {
    if (this.isAnswering) return;
    this.isAnswering = true;
    const q = this.questions[this.currentIndex];
    this.evaluateAnswer(false, `${q.answer} (Time Expired!)`);
  }

  startTraining(beltId, skillId) {
    this.stopTimer();
    this.mode = 'training';
    this.currentBelt = BELTS_DATA.find(b => b.id === beltId);
    this.currentSkill = this.currentBelt.skills.find(s => s.id === skillId);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.questions = QuestionGenerator.generateUniqueQuestions(() => QuestionGenerator.getQuestionForSkill(skillId, 'standard'), 10);
    this.totalQuestions = this.questions.length; // use actual count, not hardcoded 10
    this.renderCurrentQuestion();
  }

  startBeltTest(beltId, stage = 1) {
    this.stopTimer();
    this.mode = `belt_test_${stage}`;
    this.currentBelt = BELTS_DATA.find(b => b.id === beltId);
    this.currentSkill = null;
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = stage === 1 ? 3 : 2;
    const diff = stage === 1 ? 'standard' : 'hard';
    this.questions = QuestionGenerator.generateBeltTest(beltId, diff, stage === 3 ? 8 : 10);
    this.totalQuestions = this.questions.length;
    this.renderCurrentQuestion();
  }

  startCustomQuiz(title, questions, onExit) {
    this.stopTimer();
    this.mode = 'training'; this.currentBelt = { id: 'brown', name: title };
    this.currentSkill = { id: 'timetable_practice', name: title };
    this.currentIndex = 0; this.score = 0; this.streak = 0; this.maxStreak = 0;
    this.questions = questions; this.totalQuestions = questions.length;
    this.customExit = onExit;
    this.renderCurrentQuestion();
  }
  renderCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    const container = document.getElementById('game-arena');
    if (!container || !q) return;

    this.isAnswering = false;
    this.userOrder = [];

    const progressPct = Math.round((this.currentIndex / this.totalQuestions) * 100);
    const titleText = this.mode === 'belt_test_1'
      ? `🥋 ${this.currentBelt.name} Stage 1 Proficiency Exam`
      : this.mode === 'belt_test_2' || this.mode === 'belt_test_3'
      ? `🥋 ${this.currentBelt.name} Stage ${this.mode.slice(-1)} ${this.mode === 'belt_test_3' ? 'Final' : 'Proficiency'} Exam 🔥`
      : `${this.currentBelt.name} • ${this.currentSkill?.name || ''}`;

    let visualWidgetHtml = '';
    const itemIcon = q.itemIcon || '🥋';

    if (q.type === 'subitise') {
      visualWidgetHtml = VisualRenderers.renderSubitise(q.targetNumber, q.layout, itemIcon);
    } else if (q.type === 'ten_frame') {
      visualWidgetHtml = VisualRenderers.renderTenFrame(q.count, q.totalCells, itemIcon === '🥋' ? '⭐' : itemIcon);
    } else if (q.type === 'count_objects') {
      visualWidgetHtml = VisualRenderers.renderSubitise(q.count, 'dots', itemIcon);
    } else if (q.type === 'balance_scale') {
      visualWidgetHtml = VisualRenderers.renderBalanceScale(q.leftA, q.leftB, q.rightA, '?');
    } else if (q.type === 'array_grid') {
      visualWidgetHtml = VisualRenderers.renderArrayGrid(q.rows, q.cols, '🗡️');
    } else if (q.type === 'fraction_visual') {
      visualWidgetHtml = VisualRenderers.renderFractionVisual(q.numerator, q.denominator);
    } else if (q.type === 'partition_balance') {
      visualWidgetHtml = VisualRenderers.renderPartitionBaskets(q.total, q.part1, q.part2, '🍎');
    }

    let controlsHtml = '';
    if (q.type === 'order_drag') {
      controlsHtml = this.renderOrderControls(q);
    } else if (q.options && q.options.length > 0) {
      controlsHtml = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto mt-6">
          ${q.options.map((opt, idx) => `
            <button onclick="window.gameEngine.submitAnswer('${opt}')"
                    id="opt-btn-${idx}"
                    class="btn-ninja p-4 sm:p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border-2 border-slate-600 hover:border-sky-400 text-white font-bold text-xl sm:text-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-500/50">
              ${opt}
            </button>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Top HUD -->
      <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <button onclick="window.gameEngine.stopTimer(); ${this.customExit ? 'window.app.showTimesTables()' : `window.app.showBeltDetails('${this.currentBelt.id}')`}" class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          ← Exit
        </button>

        <div class="text-center">
          <h2 class="font-ninja text-lg sm:text-xl text-yellow-400 font-bold">${titleText}</h2>
          <div class="text-xs text-slate-400">Question ${this.currentIndex + 1} of ${this.totalQuestions}</div>
        </div>

        <div class="flex items-center gap-3">
          ${this.mode.startsWith('belt_test') ? `
            <div class="flex items-center gap-1 text-red-400 font-bold text-sm bg-red-950/60 px-3 py-1 rounded-full border border-red-800">
              <span>❤️</span> <span>${this.lives}</span>
            </div>
          ` : `
            <div class="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
              <span>🔥</span> <span>${this.streak}x</span>
            </div>
          `}
        </div>
      </div>

      <!-- Question Countdown Timer Bar -->
      <div class="mb-4">
        <div class="flex justify-between items-center text-xs font-ninja mb-1 text-slate-400">
          <span>Speed Timer</span>
          <span id="question-timer-text" class="text-yellow-400 font-bold"></span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div id="question-timer-bar" class="bg-emerald-400 h-2 rounded-full transition-all duration-100" style="width: 100%"></div>
        </div>
      </div>

      <!-- Question Card -->
      <div id="question-card" class="bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div class="text-center mb-6">
          <h3 class="font-ninja text-2xl sm:text-3xl text-white font-bold tracking-wide">${q.prompt || q.title || 'Solve:'}</h3>
          ${q.subtitle ? `<p class="text-slate-400 text-sm sm:text-base mt-1 font-medium">${q.subtitle}</p>` : ''}
          ${q.hint ? `<div class="mt-2 text-xs text-sky-300 bg-sky-950/40 inline-block px-3 py-1 rounded-full border border-sky-800">${q.hint}</div>` : ''}
        </div>

        ${visualWidgetHtml}
        ${controlsHtml}

        <div id="feedback-banner" class="hidden mt-6 p-4 rounded-2xl text-center font-ninja text-xl font-bold transition-all"></div>
      </div>
    `;

    const timeLimit = q.timeLimitSeconds || 16;
    this.startTimer(timeLimit);
  }

  renderOrderControls(q) {
    return `
      <div class="max-w-md mx-auto mt-6">
        <div class="text-xs text-center text-slate-400 mb-2">Tap numbers in order from smallest to largest:</div>
        <div id="order-slots" class="flex items-center justify-center gap-2 mb-4 min-h-[56px] p-2 bg-slate-950/60 rounded-2xl border border-slate-700">
          ${q.correctOrder.map(() => `
            <div class="slot-item w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center font-ninja text-lg text-slate-500">
              ?
            </div>
          `).join('')}
        </div>
        <div id="order-choices" class="flex flex-wrap items-center justify-center gap-3">
          ${q.items.map((item, idx) => `
            <button onclick="window.gameEngine.pickOrderItem(${idx}, '${item}')"
                    id="order-btn-${idx}"
                    class="btn-ninja w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400 text-white font-bold text-xl shadow-lg flex items-center justify-center">
              ${item}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  pickOrderItem(btnIndex, value) {
    if (this.isAnswering) return;
    const btn = document.getElementById(`order-btn-${btnIndex}`);
    if (!btn || btn.disabled) return;

    window.soundFX?.playClick();
    btn.disabled = true;
    btn.classList.add('opacity-30', 'scale-90');

    this.userOrder.push({ val: value, btnId: `order-btn-${btnIndex}` });
    this.updateOrderSlots();

    const q = this.questions[this.currentIndex];
    if (this.userOrder.length === q.correctOrder.length) {
      const isMatch = this.userOrder.every((item, i) => String(item.val) === String(q.correctOrder[i]));
      this.evaluateAnswer(isMatch, q.correctOrder.join(' < '));
    }
  }

  updateOrderSlots() {
    const q = this.questions[this.currentIndex];
    const container = document.getElementById('order-slots');
    if (!container || !q) return;

    container.innerHTML = q.correctOrder.map((_, i) => {
      const placed = this.userOrder[i];
      if (placed) {
        return `<div class="w-14 h-14 rounded-xl bg-sky-600 border-2 border-sky-300 flex items-center justify-center font-ninja text-xl text-white shadow font-bold animate-pop">${placed.val}</div>`;
      }
      return `<div class="slot-item w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center font-ninja text-lg text-slate-500">${i + 1}</div>`;
    }).join('');
  }

  submitAnswer(selectedAnswer) {
    if (this.isAnswering) return;
    this.isAnswering = true;
    this.stopTimer();

    const q = this.questions[this.currentIndex];
    const isCorrect = String(selectedAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    this.evaluateAnswer(isCorrect, q.answer);
  }

  evaluateAnswer(isCorrect, expectedAnswer) {
    this.stopTimer();
    const feedback = document.getElementById('feedback-banner');
    const qCard = document.getElementById('question-card');

    if (isCorrect) {
      this.score += 1;
      this.streak += 1;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      window.soundFX?.playCorrect();
      if (this.streak >= 3) {
        window.soundFX?.playStreak(this.streak);
        if (window.confetti) window.confetti({ particleCount: 30, spread: 50 });
      }

      if (feedback) {
        feedback.className = 'mt-6 p-4 rounded-2xl text-center font-ninja text-xl font-bold bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 animate-pop block';
        feedback.innerHTML = `✨ Outstanding Ninja Strike! Correct! ✨`;
      }
    } else {
      this.streak = 0;
      if (this.mode.startsWith('belt_test')) {
        this.lives -= 1;
      }
      window.soundFX?.playWrong();

      if (qCard) {
        qCard.classList.add('animate-shake');
        setTimeout(() => qCard.classList.remove('animate-shake'), 500);
      }

      if (feedback) {
        feedback.className = 'mt-6 p-4 rounded-2xl text-center font-ninja text-base sm:text-lg font-bold bg-rose-950/80 border-2 border-rose-500 text-rose-300 animate-pop block';
        feedback.innerHTML = `The correct answer was: <span class="text-yellow-400 font-bold ml-1">${expectedAnswer}</span>`;
      }
    }

    setTimeout(() => {
      if (this.mode.startsWith('belt_test') && this.lives <= 0) {
        this.showTestResults(false);
      } else {
        this.currentIndex += 1;
        if (this.currentIndex >= this.totalQuestions) {
          this.showFinishedScreen();
        } else {
          this.renderCurrentQuestion();
        }
      }
    }, isCorrect ? 900 : 1800);
  }

  showFinishedScreen() {
    this.stopTimer();
    if (this.mode.startsWith('belt_test')) {
      const passPct = this.score / this.totalQuestions;
      const passed = passPct >= 0.8;
      this.showTestResults(passed);
    } else {
      this.showTrainingSummary();
    }
  }

  showTrainingSummary() {
    const container = document.getElementById('game-arena');
    if (!container) return;

    ProfileManager.recordTrainingScore(this.currentSkill.id, this.score, this.totalQuestions);

    window.soundFX?.playFanfare();
    if (window.confetti) window.confetti({ particleCount: 70, spread: 80 });

    const is10 = this.score === 10;

    container.innerHTML = `
      <div class="max-w-md mx-auto text-center p-8 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl animate-pop">
        <div class="w-20 h-20 mx-auto mb-4 rounded-3xl ${is10 ? 'bg-yellow-500/30 border-2 border-yellow-400' : 'bg-slate-800'} flex items-center justify-center text-4xl shadow-lg">
          ${is10 ? '🌟' : '🥋'}
        </div>
        <h2 class="font-ninja text-3xl text-white font-bold mb-1">Training Finished!</h2>
        <p class="text-slate-400 text-sm mb-4">${this.currentSkill?.name}</p>

        ${is10 ? `
          <div class="bg-amber-950/60 border border-yellow-400 p-3 rounded-2xl mb-4 text-yellow-300 font-ninja font-bold text-sm">
            🏆 PERFECT 10/10 MASTERY BADGE UNLOCKED!
          </div>
        ` : ''}

        <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-6 grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-400">Score</div>
            <div class="text-2xl font-ninja ${is10 ? 'text-yellow-400' : 'text-emerald-400'} font-bold">${this.score} / ${this.totalQuestions}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Best Streak</div>
            <div class="text-2xl font-ninja text-amber-400 font-bold">${this.maxStreak} 🔥</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          ${this.customExit ? `<button onclick="window.app.showTimesTables()" class="btn-ninja flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg">Timetables ↻</button>` : `<button onclick="window.gameEngine.startTraining('${this.currentBelt.id}', '${this.currentSkill.id}')"
                  class="btn-ninja flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg">
            Train Again ↻
          </button>`}
          <button onclick="${this.customExit ? 'window.app.showTimesTables()' : `window.app.showBeltDetails('${this.currentBelt.id}')` }"
                  class="btn-ninja flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600">
            ${this.customExit ? 'Timetables' : 'Dojo Skills'}
          </button>
        </div>
      </div>
    `;
  }

  showTestResults(passed) {
    const container = document.getElementById('game-arena');
    if (!container) return;

    const stageNum = Number(this.mode.slice(-1));
    const profile = ProfileManager.getActiveProfile();

    if (passed) {
      window.soundFX?.playFanfare();
      if (window.confetti) window.confetti({ particleCount: 120, spread: 100 });

      ProfileManager.recordTestPass(this.currentBelt.id, stageNum, this.score, this.totalQuestions);

      if (stageNum < 3) {
        container.innerHTML = `
          <div class="max-w-md mx-auto text-center p-8 bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl animate-pop">
            <div class="text-4xl mb-3">🎉</div>
            <h2 class="font-ninja text-2xl text-emerald-400 font-bold mb-2">Stage ${stageNum} Test Passed!</h2>
            <p class="text-slate-300 text-sm mb-4">You scored <strong class="text-white">${this.score}/${this.totalQuestions}</strong> on the Proficiency Exam!</p>

            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 mb-6">
              Continue to Stage ${stageNum + 1}; each stage has a shorter timer. Complete all three exams and achieve <strong class="text-amber-400">10/10 Mastery</strong> on all skills to graduate.
            </div>

            <button onclick="window.app.showBeltDetails('${this.currentBelt.id}')" class="btn-ninja w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-ninja font-bold shadow-lg">
              Return to Dojo 🥋
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="max-w-xl mx-auto p-6 sm:p-8 certificate-border rounded-3xl shadow-2xl text-center animate-pop relative">
            <div class="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">Raven &amp; Llama Learning</div>
            <h1 class="font-ninja text-2xl sm:text-3xl text-yellow-300 font-bold mb-1">MATHS MASTERS</h1>
            <div class="text-xs text-slate-400 italic mb-4">Official Grand Master Belt Certificate</div>

            <div class="w-24 h-24 mx-auto my-3 rounded-full bg-slate-900 border-4 border-yellow-400 flex items-center justify-center text-5xl shadow-2xl">
              🥋
            </div>

            <div class="text-base text-slate-300">This certifies that</div>
            <div class="font-ninja text-2xl sm:text-3xl text-sky-400 font-bold my-1">${profile.name}</div>
            <div class="text-sm text-slate-300">has completed all 10/10 prerequisites & passed all three exams for</div>
            <div class="font-ninja text-2xl sm:text-3xl text-yellow-400 font-bold my-2">${this.currentBelt.name}</div>

            <div class="flex items-center justify-center gap-6 my-4 py-2 border-y border-yellow-500/30 text-xs text-slate-300">
              <div>Final Score: <strong class="text-emerald-400 font-bold text-sm">${this.score}/${this.totalQuestions}</strong></div>
              <div>Grade: <strong class="text-yellow-400">Grand Master</strong></div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mt-6">
              <button onclick="window.app.showDojoHub()" class="btn-ninja flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-bold shadow-lg">
                Continue to Next Belt 🥋
              </button>
              <button onclick="window.print()" class="btn-ninja py-3 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium text-sm border border-slate-700">
                🖨️ Print Certificate
              </button>
            </div>
          </div>
        `;
      }
    } else {
      window.soundFX?.playWrong();
      container.innerHTML = `
        <div class="max-w-md mx-auto text-center p-8 bg-slate-900 border-2 border-rose-800 rounded-3xl shadow-2xl animate-pop">
          <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-4xl">
            🥋
          </div>
          <h2 class="font-ninja text-2xl text-white font-bold mb-2">Test Incomplete</h2>
          <p class="text-slate-400 text-sm mb-4">You scored <strong class="text-rose-400">${this.score} / ${this.totalQuestions}</strong> (80% required to pass).</p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="window.gameEngine.startBeltTest('${this.currentBelt.id}', ${stageNum})"
                    class="btn-ninja flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg">
              Retry Test ⚔️
            </button>
            <button onclick="window.app.showBeltDetails('${this.currentBelt.id}')"
                    class="btn-ninja flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600">
              Train Skills 🥋
            </button>
          </div>
        </div>
      `;
    }
  }
}

window.gameEngine = new GameEngine();
