const MASCOT_PAGE_GUIDANCE = Object.freeze({
  home: {
    title: 'Welcome, explorer!',
    message: 'Choose a program and start discovering.',
    instructions: 'Pick an activity that sounds fun. You can come back here whenever you like.'
  },
  'learning-centre': {
    title: 'Welcome to the Learning Centre!',
    message: 'There are lots of ways to learn and play.',
    instructions: 'Choose a subject card to find activities and challenges.'
  },
  'science-lab': {
    title: 'Welcome to the Science Lab!',
    message: 'Get ready to explore the natural world.',
    instructions: 'Choose a mission, then follow its clues and instructions.'
  },
  science: {
    title: 'Science explorers, assemble!',
    message: 'Take your time and look for useful clues.',
    instructions: 'Choose an answer or arrange the items, then check your work.'
  },
  'science-solar-system': {
    title: 'Welcome, space explorer!',
    message: 'Use the clues to put the planets in order.',
    instructions: 'Choose a planet and a position. You can move a planet if you change your mind.'
  },
  'science-plant-life-cycle': {
    title: 'Welcome, nature explorer!',
    message: 'Help put the life-cycle stages in order.',
    instructions: 'Choose a stage, then choose where it belongs. You can use the keyboard too.'
  },
  'science-virtual-lab': {
    title: 'Welcome to the Virtual Lab!',
    message: 'Try a safe combination and observe what happens.',
    instructions: 'Choose materials, place them in the workspace, and read the explanation.'
  },
  'history-discovery': {
    title: 'Welcome, time traveller!',
    message: 'Explore events from different places and times.',
    instructions: 'Read the clues and remember that dates on the timeline are approximate.'
  },
  'history-timeline': {
    title: 'Let us build a timeline!',
    message: 'Read each event clue and place the events from earliest to most recent.',
    instructions: 'Select an event card, then choose a timeline position. You can move cards before checking.'
  },
  geography: {
    title: 'Welcome, world explorer!',
    message: 'Discover countries, flags, capitals, and places.',
    instructions: 'Choose a country on the map or use the country list as a keyboard-friendly alternative.'
  },
  'geography-world': {
    title: 'Welcome, world explorer!',
    message: 'Discover countries, flags, capitals, and places.',
    instructions: 'Choose a country on the map or use the country list as a keyboard-friendly alternative.'
  },
  spelling: {
    title: 'Welcome, word explorer!',
    message: 'Listen carefully, look for clues, and try your best.',
    instructions: 'Choose an adventure and use the hint if you need help.'
  },
  'brain-power': {
    title: 'Welcome to Brain Power!',
    message: 'Puzzles are a great way to practise careful thinking.',
    instructions: 'Choose a puzzle and look for a pattern or clue.'
  },
  'brain-power-pattern': {
    title: 'Ready to spot a pattern?',
    message: 'Look at how the numbers change from one step to the next.',
    instructions: 'Choose your answer, then check it. You can try again if you need to.'
  },
  'brain-power-memory': {
    title: 'Ready for a memory challenge?',
    message: 'Take a careful look at the cards.',
    instructions: 'Choose two cards to find a matching pair.'
  },
  'brain-power-code': {
    title: 'Ready to crack the code?',
    message: 'Use each clue to narrow down the possibilities.',
    instructions: 'Enter your guess and check the clues before your next try.'
  },
  'life-skills-party': {
    title: 'Welcome, party planner!',
    message: 'Plan carefully and keep an eye on your budget.',
    instructions: 'Choose the items you need, then check the total.'
  },
  'maths-world': {
    title: 'Welcome, maths explorer!',
    message: 'Choose a topic and practise one step at a time.',
    instructions: 'Read the question, use the clues, and check your answer.'
  },
  dojo: {
    title: 'Welcome to the Dojo!',
    message: 'Every practice session helps you grow.',
    instructions: 'Choose a skill or activity and follow the on-screen instructions.'
  },
  'dojo-arcade': {
    title: 'Ready to play?',
    message: 'Have fun and watch your score grow.',
    instructions: 'Use the controls shown in the game. You can pause or leave at any time.'
  },
  'timetables': {
    title: 'Welcome, time explorer!',
    message: 'Look closely at the clock and the answer choices.',
    instructions: 'Choose the time that matches the clock.'
  }
});

function mascotGuidanceForPage(page) {
  return MASCOT_PAGE_GUIDANCE[page] || {
    title: 'Need a hand?',
    message: 'You can explore at your own pace.',
    instructions: 'Read the activity instructions and try one step at a time.'
  };
}

function mascotHintRevealsAnswer(question, hint) {
  const expected = question?.correctOrder ?? question?.answer;
  const choices = question?.choices || question?.options;
  const answer = Number.isInteger(expected) && Array.isArray(choices)
    ? choices[expected]
    : expected;
  const answers = Array.isArray(answer) ? answer : [answer];
  return answers.some(value => {
    const text = String(value ?? '').trim();
    if (!text) return false;
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'iu').test(hint);
  });
}

function getVisibleMascotActivity(main) {
  const engine = window.activeActivityEngine;
  const question = engine?.currentQuestion;
  if (!engine || engine.status !== 'active' || !question ||
    typeof question.prompt !== 'string' || !main.textContent.includes(question.prompt)) {
    return null;
  }
  const maxHints = engine.definition.settings.maxHintsPerQuestion ?? 1;
  const hint = typeof question.hint === 'string' ? question.hint : question.hint?.text;
  if (engine.answered || engine.hintsUsed >= maxHints ||
    typeof hint !== 'string' || !hint.trim() ||
    mascotHintRevealsAnswer(question, hint)) {
    return null;
  }
  return engine;
}

Object.assign(App.prototype, {
  initMascotCompanion() {
    if (this.mascotCompanionState?.initialized) return false;
    const main = document.getElementById('app-main');
    const root = document.getElementById('mascot-companion-root');
    if (!main || !root) throw new Error('The mascot companion shell is missing.');

    this.mascotCompanionState = {
      initialized: true,
      page: null,
      questionKey: null,
      title: '',
      message: '',
      instructions: '',
      celebrationTitle: '',
      announcement: '',
      hint: '',
      panelOpen: false
    };

    this.mascotCompanionObserver = new MutationObserver(() => this.updateMascotCompanion());
    this.mascotCompanionObserver.observe(main, {
      attributes: true,
      attributeFilter: ['data-page'],
      childList: true,
      subtree: true
    });
    window.addEventListener('raven-llama:activity-completed', event => {
      this.celebrateMascotActivity(event);
    });
    this.updateMascotCompanion();
    return true;
  },

  updateMascotCompanion() {
    const state = this.mascotCompanionState;
    const main = document.getElementById('app-main');
    if (!state || !main) return false;

    const page = main.dataset.page || this.currentView || 'home';
    const engine = getVisibleMascotActivity(main);
    const questionKey = engine
      ? `${engine.definition.id}:${engine.currentIndex}:${engine.currentQuestion.id}`
      : '';
    const pageChanged = page !== state.page;
    const questionChanged = questionKey !== state.questionKey;
    if (pageChanged || questionChanged) {
      if (pageChanged || questionKey) state.celebrationTitle = '';
      state.page = page;
      state.questionKey = questionKey;
      state.hint = '';
      if (!state.celebrationTitle) {
        const guidance = mascotGuidanceForPage(page);
        state.title = engine ? `Need a hand with ${engine.definition.title}?` : guidance.title;
        state.message = engine
          ? `You are working on ${engine.definition.title}. Use the clues and take it one step at a time.`
          : guidance.message;
        state.instructions = guidance.instructions;
      }
      state.panelOpen = false;
    }
    return this.renderMascotCompanion();
  },

  renderMascotCompanion() {
    const state = this.mascotCompanionState;
    const root = document.getElementById('mascot-companion-root');
    if (!state || !root) return false;

    const panel = root.querySelector('[data-mascot-panel]');
    const title = root.querySelector('[data-mascot-title]');
    const message = root.querySelector('[data-mascot-message]');
    const instructions = root.querySelector('[data-mascot-instructions]');
    const toggle = root.querySelector('[data-action="mascot-toggle"]');
    const toggleLabel = toggle?.querySelector('span:last-child');
    const hintButton = root.querySelector('[data-action="mascot-hint"]');
    const hintText = root.querySelector('[data-mascot-hint]');
    const announcement = root.querySelector('[data-mascot-announcement]');
    if (!panel || !title || !message || !instructions || !toggle || !toggleLabel ||
      !hintButton || !hintText || !announcement) {
      throw new Error('The mascot companion markup is incomplete.');
    }

    const main = document.getElementById('app-main');
    const engine = main ? getVisibleMascotActivity(main) : null;
    title.textContent = state.celebrationTitle ? 'Amazing work!' : state.title;
    message.textContent = state.celebrationTitle
      ? `You completed ${state.celebrationTitle}. Keep up the great work!`
      : state.message;
    instructions.textContent = state.instructions;
    panel.hidden = !state.panelOpen;
    toggle.setAttribute('aria-expanded', String(state.panelOpen));
    toggle.setAttribute('aria-label', state.panelOpen
      ? 'Close Raven & Llama helper'
      : 'Open Raven & Llama helper');
    toggleLabel.textContent = state.panelOpen ? 'Close helper' : 'Need a hand?';
    hintButton.hidden = !engine;
    hintButton.disabled = Boolean(state.hint);
    hintButton.textContent = state.hint ? 'Hint shown' : 'Get a hint';
    hintText.textContent = state.hint;
    hintText.hidden = !state.hint;
    announcement.textContent = state.announcement;
    return true;
  },

  toggleMascotCompanion() {
    const state = this.mascotCompanionState;
    if (!state) return false;
    state.panelOpen = !state.panelOpen;
    this.renderMascotCompanion();
    return state.panelOpen;
  },

  dismissMascotCompanion() {
    const state = this.mascotCompanionState;
    if (!state) return false;
    state.panelOpen = false;
    this.renderMascotCompanion();
    return true;
  },

  showMascotHint() {
    const main = document.getElementById('app-main');
    const engine = main ? getVisibleMascotActivity(main) : null;
    if (!engine) return false;
    const hint = engine.useHint();
    const hintText = typeof hint === 'string' ? hint : hint?.text;
    if (typeof hintText !== 'string' || !hintText.trim()) return false;
    this.mascotCompanionState.hint = hintText;
    this.renderMascotCompanion();
    return true;
  },

  celebrateMascotActivity(event) {
    const detail = event?.detail;
    if (!detail || typeof detail.id !== 'string' || typeof detail.title !== 'string') {
      throw new TypeError('Invalid activity completion event for mascot celebration.');
    }
    const state = this.mascotCompanionState;
    if (state) {
      state.celebrationTitle = detail.title;
      state.message = `You completed ${detail.title}. Keep up the great work!`;
      state.announcement = `Great work. You completed ${detail.title}.`;
      this.renderMascotCompanion();
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    if (!prefersReducedMotion && typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 48,
        spread: 62,
        origin: { y: 0.72 },
        disableForReducedMotion: true
      });
    }
    return true;
  }
});

window.MascotCompanion = Object.freeze({
  guidanceForPage: mascotGuidanceForPage,
  hintRevealsAnswer: mascotHintRevealsAnswer
});

if (typeof document !== 'undefined') {
  const initializeMascotCompanion = () => window.app.initMascotCompanion();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMascotCompanion, { once: true });
  } else {
    initializeMascotCompanion();
  }
}
