const TIME_ACTIVITY_MODES = [
  {
    id: 'hours',
    title: "O'Clock & Half Past",
    description: 'Read an analogue clock showing an hour or half past.',
    minutes: [0, 30],
    display: 'analogue'
  },
  {
    id: 'quarters',
    title: 'Quarter Past & To',
    description: 'Match quarter past and quarter to on the clock.',
    minutes: [0, 15, 30, 45],
    display: 'analogue'
  },
  {
    id: 'five-minute',
    title: 'Five-Minute Clock Match',
    description: 'Read analogue clocks in five-minute steps.',
    minutes: Array.from({ length: 12 }, (_, index) => index * 5),
    display: 'analogue'
  },
  {
    id: 'digital',
    title: 'Digital to Analogue',
    description: 'Choose the analogue clock that matches the digital time.',
    minutes: Array.from({ length: 12 }, (_, index) => index * 5),
    display: 'digital'
  }
];

class TimeTelling {
  static formatTime(hour, minute) {
    return `${hour}:${String(minute).padStart(2, '0')}`;
  }

  static formatClockSvg(time, size = 200) {
    const [hour, minute] = time.split(':').map(Number);
    const minuteAngle = minute * 6;
    const hourAngle = ((hour % 12) + minute / 60) * 30;
    const marks = Array.from({ length: 12 }, (_, index) => {
      const angle = (index * 30 - 90) * Math.PI / 180;
      const x1 = 100 + 78 * Math.cos(angle);
      const y1 = 100 + 78 * Math.sin(angle);
      const x2 = 100 + 86 * Math.cos(angle);
      const y2 = 100 + 86 * Math.sin(angle);
      const numberX = 100 + 64 * Math.cos(angle);
      const numberY = 104 + 64 * Math.sin(angle);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#64748b" stroke-width="2" /><text x="${numberX.toFixed(1)}" y="${numberY.toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#e2e8f0">${index || 12}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Analogue clock showing ${time}">
        <circle cx="100" cy="100" r="94" fill="#0f172a" stroke="#fbbf24" stroke-width="4" />
        ${marks}
        <line x1="100" y1="100" x2="100" y2="43" stroke="#38bdf8" stroke-width="7" stroke-linecap="round" transform="rotate(${hourAngle} 100 100)" />
        <line x1="100" y1="100" x2="100" y2="25" stroke="#f8fafc" stroke-width="4" stroke-linecap="round" transform="rotate(${minuteAngle} 100 100)" />
        <circle cx="100" cy="100" r="5" fill="#fbbf24" />
      </svg>
    `;
  }

  static generateQuestion(modeId, random = Math.random) {
    const mode = TIME_ACTIVITY_MODES.find(item => item.id === modeId);
    if (!mode) return null;

    const hour = Math.floor(random() * 12) + 1;
    const minute = mode.minutes[Math.floor(random() * mode.minutes.length)];
    const answer = TimeTelling.formatTime(hour, minute);
    const distractors = [];
    for (let otherHour = 1; otherHour <= 12; otherHour++) {
      for (const otherMinute of mode.minutes) {
        const option = TimeTelling.formatTime(otherHour, otherMinute);
        if (option !== answer) distractors.push(option);
      }
    }

    for (let index = distractors.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [distractors[index], distractors[swapIndex]] = [distractors[swapIndex], distractors[index]];
    }

    const options = [answer, ...distractors.slice(0, 3)];
    for (let index = options.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }

    return { answer, hour, minute, options, display: mode.display };
  }
}

Object.assign(App.prototype, {
  showTellingTime() {
    this.currentView = 'telling-time';
    this.rememberModule('telling-time');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'telling-time';
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold">
            ← Back to Learning
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-4xl" aria-hidden="true">🕰️</span>
            <h1 class="font-ninja text-3xl sm:text-4xl text-amber-300 font-bold">Telling Time</h1>
          </div>
          <p class="text-slate-300 max-w-2xl">Practise reading analogue clock faces and matching them with digital times. Choose an activity to get started!</p>
        </div>
        <h2 class="font-ninja text-2xl text-white font-bold mb-4">Choose an activity</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${TIME_ACTIVITY_MODES.map((mode, index) => `
            <button type="button" data-action="time-mode" data-time-mode="${mode.id}"
                    class="text-left p-5 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-amber-400 transition shadow-xl">
              <span class="text-2xl" aria-hidden="true">${['🕒', '🕓', '⏰', '⌚'][index]}</span>
              <h3 class="font-ninja text-xl text-amber-300 font-bold mt-2">${mode.title}</h3>
              <p class="text-sm text-slate-300 mt-1">${mode.description}</p>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  startTimeActivity(modeId) {
    const mode = TIME_ACTIVITY_MODES.find(item => item.id === modeId);
    if (!mode) return;
    this.timeActivity = {
      mode,
      questions: Array.from({ length: 10 }, () => TimeTelling.generateQuestion(mode.id)),
      index: 0,
      score: 0,
      selected: null
    };
    this.renderTimeActivity();
  },

  answerTimeActivity(answer) {
    const activity = this.timeActivity;
    const question = activity?.questions[activity.index];
    if (!question || activity.selected !== null || !question.options.includes(answer)) return;
    activity.selected = answer;
    if (answer === question.answer) activity.score++;
    this.renderTimeActivity();
  },

  advanceTimeActivity() {
    const activity = this.timeActivity;
    if (!activity || activity.selected === null) return;
    if (activity.index === activity.questions.length - 1) {
      activity.complete = true;
    } else {
      activity.index++;
      activity.selected = null;
    }
    this.renderTimeActivity();
  },

  renderTimeActivity() {
    const activity = this.timeActivity;
    const main = document.getElementById('app-main');
    if (!activity || !main) return;
    main.dataset.page = 'telling-time';

    if (activity.complete) {
      main.innerHTML = `
        <div class="max-w-xl mx-auto px-4 py-12 text-center">
          <div class="text-5xl mb-4" aria-hidden="true">🎉</div>
          <h1 class="font-ninja text-3xl text-amber-300 font-bold mb-3">Activity complete!</h1>
          <p class="text-white text-xl mb-2">${activity.score} out of ${activity.questions.length} correct</p>
          <p class="text-slate-400 mb-8">${activity.mode.title}</p>
          <div class="flex flex-col sm:flex-row justify-center gap-3">
            <button data-action="time-retry" class="btn-ninja px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Play again</button>
            <button data-action="time-menu" class="btn-ninja px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold">Choose another activity</button>
          </div>
        </div>
      `;
      return;
    }

    const question = activity.questions[activity.index];
    const answered = activity.selected !== null;
    const options = question.options.map(option => {
      const correct = option === question.answer;
      const selected = option === activity.selected;
      const stateClass = answered && correct
        ? 'border-emerald-400 bg-emerald-950 text-emerald-200'
        : selected ? 'border-rose-400 bg-rose-950 text-rose-200' : 'border-slate-600 bg-slate-800 hover:border-amber-400 text-white';
      const content = question.display === 'digital'
        ? TimeTelling.formatClockSvg(option, 128)
        : option;
      return `
        <button type="button" data-action="time-answer" data-answer="${option}" ${answered ? 'disabled' : ''}
                aria-label="${question.display === 'digital' ? `Analogue clock showing ${option}` : option}"
                class="min-h-20 ${question.display === 'digital' ? 'flex items-center justify-center' : 'font-ninja text-2xl'} p-3 rounded-2xl border-2 ${stateClass} shadow-lg transition disabled:cursor-default">
          ${content}
        </button>
      `;
    }).join('');
    const prompt = question.display === 'digital'
      ? `<div class="inline-flex items-center gap-2 rounded-2xl bg-slate-950 border-2 border-sky-500 px-6 py-3 font-mono text-4xl text-sky-300 shadow-lg" aria-label="Digital time ${question.answer}">${question.answer}</div>`
      : TimeTelling.formatClockSvg(question.answer);
    const feedback = answered
      ? `<div class="text-center mt-5 text-lg font-bold ${activity.selected === question.answer ? 'text-emerald-300' : 'text-rose-300'}" role="status" aria-live="polite">
          ${activity.selected === question.answer ? 'Correct! Great time telling!' : `Not quite — the time is ${question.answer}.`}
        </div>`
      : '';

    main.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between gap-3 mb-5">
          <button data-action="time-menu" class="text-sm text-cyan-400 hover:text-cyan-300 font-semibold">← Activities</button>
          <p class="text-sm text-slate-400">${activity.mode.title}</p>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>
        <div class="flex items-center justify-between text-sm text-slate-300 mb-2">
          <span>Question ${activity.index + 1} of ${activity.questions.length}</span>
          <span>Score: ${activity.score}</span>
        </div>
        <div class="h-2 rounded-full bg-slate-800 mb-6" role="progressbar" aria-label="Activity progress" aria-valuenow="${activity.index + 1}" aria-valuemin="1" aria-valuemax="${activity.questions.length}">
          <div class="h-2 rounded-full bg-amber-400" style="width: ${((activity.index + 1) / activity.questions.length) * 100}%"></div>
        </div>
        <section class="rounded-3xl bg-slate-900 border-2 border-slate-700 p-5 sm:p-8 text-center">
          <h1 class="font-ninja text-xl sm:text-2xl text-white font-bold mb-5">${question.display === 'digital' ? 'Which analogue clock shows this time?' : 'What digital time does this clock show?'}</h1>
          <div class="flex justify-center mb-6">${prompt}</div>
          <div class="grid grid-cols-2 gap-3 max-w-xl mx-auto">${options}</div>
          ${feedback}
          ${answered ? `<button data-action="time-next" class="btn-ninja mt-6 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">${activity.index === activity.questions.length - 1 ? 'See results' : 'Next question'} →</button>` : ''}
        </section>
      </div>
    `;
  }
});

window.TIME_ACTIVITY_MODES = TIME_ACTIVITY_MODES;
window.TimeTelling = TimeTelling;
