const SCIENCE_MISSIONS = [
  {
    id: 'orbit-rescue',
    title: 'Orbit Rescue',
    topic: 'Space',
    icon: '🚀',
    theme: { border: 'hover:border-sky-400', icon: 'bg-sky-950 border-sky-700/70', topic: 'text-sky-300', title: 'group-hover:text-sky-300', arrow: 'text-sky-300' },
    description: 'Navigate the solar system and help the space crew find their way.',
    questions: [
      { prompt: 'Which object is the star at the centre of our solar system?', choices: ['The Moon', 'The Sun', 'Earth'], answer: 1, fact: 'The Sun is a star. Its gravity keeps the planets in orbit.' },
      { prompt: 'Which planet is our home, third from the Sun?', choices: ['Mars', 'Venus', 'Earth'], answer: 2, fact: 'Earth is the third planet from the Sun and the only world we know has life.' },
      { prompt: 'Which planet is famous for its rusty-red colour?', choices: ['Mars', 'Neptune', 'Mercury'], answer: 0, fact: 'Iron-rich dust gives Mars its red colour, which is why it is called the Red Planet.' },
      { prompt: 'Why does the Moon look bright in our night sky?', choices: ['It makes its own light', 'It reflects sunlight', 'It is a star'], answer: 1, fact: 'The Moon does not make its own light; its surface reflects light from the Sun.' },
      { prompt: 'Which planet is the largest in our solar system?', choices: ['Saturn', 'Jupiter', 'Earth'], answer: 1, fact: 'Jupiter is the largest planet. More than 1,000 Earths could fit inside it.' }
    ]
  },
  {
    id: 'habitat-match',
    title: 'Habitat Match',
    topic: 'Animals & habitats',
    icon: '🦋',
    theme: { border: 'hover:border-emerald-400', icon: 'bg-emerald-950 border-emerald-700/70', topic: 'text-emerald-300', title: 'group-hover:text-emerald-300', arrow: 'text-emerald-300' },
    description: 'Meet remarkable animals and discover the places they call home.',
    questions: [
      { prompt: 'Which animal uses gills to take oxygen from water?', choices: ['A fish', 'A rabbit', 'A butterfly'], answer: 0, fact: 'Fish use gills to take oxygen from water as it flows over them.' },
      { prompt: 'Where is a cactus best adapted to grow?', choices: ['A rainforest', 'A desert', 'The Arctic'], answer: 1, fact: 'Cacti store water and have spines instead of leaves, helping them survive in dry deserts.' },
      { prompt: 'A frog begins life as a tadpole. Which animal group does it belong to?', choices: ['Reptiles', 'Amphibians', 'Birds'], answer: 1, fact: 'Frogs are amphibians. They can live in water and on land during different parts of their life.' },
      { prompt: 'Which group does a bat belong to?', choices: ['Mammals', 'Birds', 'Insects'], answer: 0, fact: 'Bats are mammals: they have fur and mothers feed their babies milk.' },
      { prompt: 'Which part of a plant takes in water from the soil?', choices: ['Flowers', 'Roots', 'Petals'], answer: 1, fact: 'Roots anchor a plant and absorb water and minerals from the soil.' }
    ]
  },
  {
    id: 'matter-lab',
    title: 'Matter Lab',
    topic: 'Chemistry',
    icon: '🧪',
    theme: { border: 'hover:border-violet-400', icon: 'bg-violet-950 border-violet-700/70', topic: 'text-violet-300', title: 'group-hover:text-violet-300', arrow: 'text-violet-300' },
    description: 'Investigate solids, liquids, and gases in the junior science lab.',
    questions: [
      { prompt: 'A cold ice cube keeps its own shape. What state of matter is it?', choices: ['Solid', 'Liquid', 'Gas'], answer: 0, fact: 'A solid keeps its own shape. Ice is water in its solid state.' },
      { prompt: 'Which state of matter spreads out to fill its container?', choices: ['Solid', 'Liquid', 'Gas'], answer: 2, fact: 'A gas spreads out to fill the space available, unlike a solid or a liquid.' },
      { prompt: 'Water takes the shape of its cup but keeps the same amount. What state is it?', choices: ['Solid', 'Liquid', 'Gas'], answer: 1, fact: 'A liquid flows and takes the shape of its container, but it keeps a fixed volume.' },
      { prompt: 'What happens when a solid ice cube warms and turns into liquid water?', choices: ['It melts', 'It freezes', 'It condenses'], answer: 0, fact: 'Melting happens when a solid gains heat and changes into a liquid.' },
      { prompt: 'What is it called when water vapour cools and becomes liquid droplets?', choices: ['Evaporation', 'Condensation', 'Melting'], answer: 1, fact: 'Condensation changes a gas into a liquid, like droplets forming on a cold window.' }
    ]
  },
  {
    id: 'nature-detectives',
    title: 'Nature Detectives',
    topic: 'Nature',
    icon: '🌿',
    theme: { border: 'hover:border-amber-400', icon: 'bg-amber-950 border-amber-700/70', topic: 'text-amber-300', title: 'group-hover:text-amber-300', arrow: 'text-amber-300' },
    description: 'Follow clues from gardens, forests, and the water cycle.',
    questions: [
      { prompt: 'What do bees help flowers do when they carry pollen between them?', choices: ['Make seeds', 'Make rain', 'Grow roots'], answer: 0, fact: 'Moving pollen between flowers helps plants make seeds. This process is called pollination.' },
      { prompt: 'Which tiny living things help break down dead leaves in a forest?', choices: ['Fungi', 'Clouds', 'Rocks'], answer: 0, fact: 'Fungi are decomposers. They break down dead material and return nutrients to the soil.' },
      { prompt: 'What do green leaves take in from sunlight to help a plant make food?', choices: ['Energy', 'Sand', 'Moonlight'], answer: 0, fact: 'Leaves capture energy from sunlight to help plants make their own food.' },
      { prompt: 'What does a caterpillar usually change into?', choices: ['A beetle', 'A butterfly or moth', 'A spider'], answer: 1, fact: 'Caterpillars change into adult butterflies or moths in a process called metamorphosis.' },
      { prompt: 'What is the name for liquid water changing into water vapour?', choices: ['Freezing', 'Evaporation', 'Condensation'], answer: 1, fact: 'The Sun warms water and turns some of it into vapour. This step is called evaporation.' }
    ]
  }
];

window.SCIENCE_MISSIONS = SCIENCE_MISSIONS;

Object.assign(App.prototype, {
  showScienceExplorers() {
    this.currentView = 'science';
    this.scienceGame = null;
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'science';
    this.updateHeader();

    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button data-action="learning" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <div class="relative bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 overflow-hidden">
          <div class="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30 mb-2">
                <span>🔬</span><span>Raven &amp; Llama Discovery Lab</span>
              </div>
              <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Science Explorers</h1>
              <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">Ask questions, follow the clues, and earn a star for every correct discovery.</p>
            </div>
            <div class="text-center bg-slate-950/60 border border-sky-800/70 rounded-2xl px-5 py-3">
              <div class="text-3xl">🪶 🦙</div>
              <p class="text-xs text-sky-200 mt-1">Curiosity is your superpower!</p>
            </div>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-ninja text-2xl text-white font-bold">Choose a Mission</h2>
          <span class="text-xs text-slate-400">5 clues in every mission</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          ${SCIENCE_MISSIONS.map(mission => `
            <button type="button" data-action="science-start" data-mission-id="${mission.id}"
                    class="group w-full text-left relative bg-slate-900 border-2 border-slate-700 ${mission.theme.border} rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl ${mission.theme.icon} border flex items-center justify-center text-3xl">${mission.icon}</div>
                <div class="flex-1">
                  <span class="science-mission-topic text-[10px] uppercase tracking-wider ${mission.theme.topic} font-bold">${mission.topic}</span>
                  <h3 class="font-ninja text-xl font-bold text-white ${mission.theme.title}">${mission.title}</h3>
                </div>
                <span class="${mission.theme.arrow} text-xl" aria-hidden="true">→</span>
              </div>
              <p class="text-slate-300 text-sm mt-4">${mission.description}</p>
              <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400">5 questions · Learn as you play</span>
                <span class="science-mission-reward text-amber-300 font-bold">⭐ 5 stars to find</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  startScienceMission(missionId) {
    const mission = SCIENCE_MISSIONS.find(item => item.id === missionId);
    if (!mission) return this.showScienceExplorers();
    this.scienceGame = { mission, index: 0, correct: 0, answered: false, lastAnswerCorrect: false, awarded: false };
    this.renderScienceQuestion();
  },

  renderScienceQuestion() {
    const main = document.getElementById('app-main');
    const game = this.scienceGame;
    if (!main || !game) return;
    if (game.index >= game.mission.questions.length) return this.finishScienceMission();

    const question = game.mission.questions[game.index];
    const progress = ((game.index + 1) / game.mission.questions.length) * 100;
    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div class="play-hud flex items-center justify-between mb-6">
          <button data-action="science-home" class="play-hud__exit text-sm text-sky-300 hover:text-white font-bold">← Back to missions</button>
          <span class="play-hud__title text-xs text-slate-400">${game.mission.icon} ${game.mission.title}</span>
        </div>
        <div class="play-question-card science-question-card bg-slate-900 border-2 border-sky-800/70 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div class="flex items-center justify-between gap-4 mb-3">
            <span class="text-xs uppercase tracking-wider text-sky-300 font-bold">${game.mission.topic}</span>
            <span class="text-sm text-slate-300 font-bold">Clue ${game.index + 1} of ${game.mission.questions.length} <span class="text-amber-300 ml-2">⭐ ${game.correct}</span></span>
          </div>
          <progress class="play-progress science-progress w-full mb-6" aria-label="Mission progress" max="${game.mission.questions.length}" value="${game.index + 1}"></progress>
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">${game.mission.icon}</div>
            <h2 class="play-prompt font-ninja text-2xl sm:text-3xl text-white font-bold">${question.prompt}</h2>
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${question.choices.map((choice, index) => `
              <button type="button" data-action="science-answer" data-index="${index}" data-science-choice="${index}" ${game.answered ? 'disabled' : ''}
                      class="science-choice w-full text-left px-4 py-3 rounded-xl border-2 ${game.answered && index === question.answer ? 'is-correct border-emerald-400 bg-emerald-950/50 text-emerald-100' : 'border-slate-700 bg-slate-950/70 hover:border-sky-400 text-white'} disabled:cursor-default font-semibold transition">
                <span class="inline-flex w-7 h-7 rounded-lg bg-slate-800 items-center justify-center text-xs text-sky-300 mr-2">${String.fromCharCode(65 + index)}</span>${choice}
              </button>
            `).join('')}
          </div>
          ${game.answered ? `
            <div class="play-feedback science-feedback mt-5 p-4 rounded-2xl ${game.lastAnswerCorrect ? 'is-correct bg-emerald-950/60 border border-emerald-700' : 'is-incorrect bg-amber-950/50 border border-amber-800'}" role="status" aria-live="polite">
              <p class="font-bold ${game.lastAnswerCorrect ? 'text-emerald-300' : 'text-amber-200'}">${game.lastAnswerCorrect ? 'Great discovery! +1 star ⭐' : `Not quite! The answer is ${question.choices[question.answer]}.`}</p>
              <p class="text-sm text-slate-200 mt-1">${question.fact}</p>
            </div>
            <button type="button" data-action="science-continue" class="btn-ninja w-full mt-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-ninja font-bold">
              ${game.index + 1 === game.mission.questions.length ? 'Finish Mission 🏁' : 'Next Clue →'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  answerScienceQuestion(choiceIndex) {
    const game = this.scienceGame;
    if (!game || game.answered) return;
    const question = game.mission.questions[game.index];
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= question.choices.length) return;
    game.answered = true;
    game.lastAnswerCorrect = choiceIndex === question.answer;
    if (game.lastAnswerCorrect) game.correct++;
    window.soundFX?.[game.lastAnswerCorrect ? 'playCorrect' : 'playWrong']();
    this.renderScienceQuestion();
  },

  continueScienceMission() {
    const game = this.scienceGame;
    if (!game?.answered) return;
    game.index++;
    game.answered = false;
    this.renderScienceQuestion();
  },

  finishScienceMission() {
    const game = this.scienceGame;
    const main = document.getElementById('app-main');
    if (!game || !main) return;
    if (!game.awarded) {
      game.awarded = true;
      if (game.correct > 0) {
        const profile = ProfileManager.getActiveProfile();
        profile.stars += game.correct;
        ProfileManager.updateProfile(profile);
      }
    }

    main.innerHTML = `
      <div class="play-shell play-shell--science max-w-xl mx-auto px-4 py-10 text-center">
        <div class="play-question-card science-result-card bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-7 sm:p-10 shadow-2xl">
          <div class="text-6xl mb-4">${game.correct === game.mission.questions.length ? '🏆' : '🔬'}</div>
          <p class="text-xs uppercase tracking-widest text-emerald-300 font-bold">${game.mission.title}</p>
          <h1 class="font-ninja text-3xl text-white font-bold mt-1">Mission Complete!</h1>
          <p class="text-slate-300 mt-3">You solved <strong class="text-white">${game.correct} of ${game.mission.questions.length}</strong> clues and earned <strong class="text-amber-300">⭐ ${game.correct} ${game.correct === 1 ? 'star' : 'stars'}</strong>.</p>
          <p class="text-sm text-slate-400 mt-2">${game.correct === game.mission.questions.length ? 'Fantastic science detective work!' : 'Every clue is a chance to discover something new!'}</p>
          <div class="flex flex-col sm:flex-row gap-3 mt-7">
            <button type="button" data-action="science-start" data-mission-id="${game.mission.id}" class="btn-ninja flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Play Again 🔁</button>
            <button type="button" data-action="science-home" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold">Choose Another Mission</button>
          </div>
        </div>
      </div>
    `;
  }
});
