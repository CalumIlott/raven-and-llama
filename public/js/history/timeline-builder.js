const HISTORY_TIMELINE_ACTIVITY_ID = 'history-timeline-sequence';
const HISTORY_TIMELINE_SKILL_ID = 'history_event_chronology';

function isValidHistoryEventData(data) {
  if (!data || !Array.isArray(data.events) || data.events.length < 4) return false;
  const ids = new Set();
  const years = new Set();
  return data.events.every(event => {
    if (!event || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id) ||
      ids.has(event.id) ||
      !['title', 'era', 'approximateDate', 'icon', 'clue', 'explanation', 'sourceName', 'sourceUrl']
        .every(key => typeof event[key] === 'string' && event[key].trim()) ||
      !Number.isSafeInteger(event.sortYear) ||
      years.has(event.sortYear) ||
      !event.sourceUrl.startsWith('https://')) {
      return false;
    }
    ids.add(event.id);
    years.add(event.sortYear);
    return true;
  });
}

if (!isValidHistoryEventData(window.HISTORY_EVENT_DATA)) {
  throw new TypeError('History event data is missing or invalid.');
}

const HISTORY_EVENTS = window.HISTORY_EVENT_DATA.events;

function historyEventById(eventId) {
  return HISTORY_EVENTS.find(event => event.id === eventId) || null;
}

function historyTimelineCanonicalOrder() {
  return [...HISTORY_EVENTS].sort((left, right) => left.sortYear - right.sortYear);
}

function shuffleHistoryEvents(random = Math.random) {
  const events = [...HISTORY_EVENTS];
  for (let index = events.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [events[index], events[swapIndex]] = [events[swapIndex], events[index]];
  }
  return events;
}

function isCompleteHistoryTimelinePlacement(placements) {
  const eventIds = new Set(HISTORY_EVENTS.map(event => event.id));
  return Array.isArray(placements) &&
    placements.length === HISTORY_EVENTS.length &&
    placements.every(eventId => eventIds.has(eventId)) &&
    new Set(placements).size === HISTORY_EVENTS.length;
}

function placeHistoryEvent(placements, eventId, positionIndex) {
  if (!Array.isArray(placements) ||
    placements.length !== HISTORY_EVENTS.length ||
    !historyEventById(eventId) ||
    !Number.isInteger(positionIndex) ||
    positionIndex < 0 ||
    positionIndex >= HISTORY_EVENTS.length) {
    return null;
  }

  const nextPlacements = [...placements];
  const previousPosition = nextPlacements.indexOf(eventId);
  if (previousPosition >= 0) nextPlacements[previousPosition] = null;
  nextPlacements[positionIndex] = eventId;
  return nextPlacements;
}

function getHistoryTimelineMismatches(placements) {
  return historyTimelineCanonicalOrder().flatMap((expectedEvent, index) => {
    const eventId = placements[index];
    if (eventId === expectedEvent.id) return [];
    return [{
      position: index + 1,
      current: historyEventById(eventId)?.title || 'An empty position',
      expected: expectedEvent.title,
      approximateDate: expectedEvent.approximateDate
    }];
  });
}

function escapeHistoryHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderHistoryEventFact(event) {
  if (!event) {
    return '<p class="history-event-fact__empty">Choose an event card to read its clue and learn more.</p>';
  }
  return `
    <article aria-labelledby="history-event-fact-title">
      <p class="history-event-fact__era">${escapeHistoryHtml(event.era)}</p>
      <h3 id="history-event-fact-title">${escapeHistoryHtml(event.title)}</h3>
      <p class="history-event-fact__clue">${escapeHistoryHtml(event.clue)}</p>
      <p>${escapeHistoryHtml(event.explanation)}</p>
      <p class="history-event-fact__source">
        Source: <a href="${escapeHistoryHtml(event.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHistoryHtml(event.sourceName)}</a>
      </p>
    </article>
  `;
}

function getHistoryTimelineFeedback(game) {
  if (game.complete) {
    return window.EducationalFeedback.render({
      id: 'history-timeline-feedback',
      correct: true,
      message: 'Your timeline is in chronological order!',
      explanation: 'The dates are approximate. Events in different places do not always fit into one simple story.',
      continueAction: 'history-hub',
      continueLabel: 'Return to History & Discovery'
    });
  }
  if (!game.submitted) return '';
  const explanations = game.mismatches.map(item =>
    `Position ${item.position}: ${item.expected} (${item.approximateDate}) belongs here, not ${item.current}.`
  );
  return window.EducationalFeedback.render({
    id: 'history-timeline-feedback',
    correct: false,
    message: 'Some events are out of order. Use the clues and try again.',
    explanation: explanations.join(' '),
    retryAction: 'history-timeline-retry'
  });
}

Object.assign(App.prototype, {
  showHistoryHub() {
    this.currentView = 'history-discovery';
    this.historyTimelineGame = null;
    this.historyTimelineActivityEngine = null;
    this.rememberModule('history-discovery', '/learning-centre/history');
    const main = document.getElementById('app-main');
    if (!main) return;
    main.dataset.page = 'history-discovery';
    this.updateHeader();
    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button type="button" data-action="learning-centre" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform" aria-hidden="true">←</span>
            <span>Back to ${window.brandWordmark()} Learning Centre</span>
          </button>
          <button type="button" data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <section class="module-intro history-intro">
          <div class="module-intro__copy">
            <div class="module-eyebrow history-badge">
              ${window.brandWordmark()} <span>History &amp; Discovery</span>
            </div>
            <h1 class="font-ninja text-3xl sm:text-4xl text-white font-bold tracking-wide">Travel Through Time</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">Explore selected events from different places and times. This sample timeline is not a complete history of the world.</p>
          </div>
          <div class="module-banner-aside">
            <p>Ask what happened, where, and when.</p>
          </div>
        </section>

        <section class="history-timeline-launch" aria-labelledby="history-timeline-launch-title">
          <div class="history-timeline-launch__icon" aria-hidden="true">⌛</div>
          <div class="history-timeline-launch__copy">
            <p class="history-eyebrow">Interactive activity</p>
            <h2 id="history-timeline-launch-title">Timeline Builder</h2>
            <p>Read each event clue, then place the cards from earliest to most recent. Approximate dates are shown when you finish.</p>
          </div>
          <button type="button" data-action="history-timeline-start" class="history-primary-button">Build a Timeline</button>
        </section>

        <p class="history-content-note">Dates are approximate, and events from different regions happened on their own timelines.</p>
      </div>
    `;
  },

  startHistoryTimelineActivity() {
    this.currentView = 'history-timeline';
    this.historyTimelineGame = {
      eventTray: shuffleHistoryEvents(),
      placements: Array(HISTORY_EVENTS.length).fill(null),
      selectedEventId: null,
      inspectedEventId: null,
      submitted: false,
      complete: false,
      mismatches: [],
      message: 'Select an event card, then choose a timeline position.'
    };
    const correctOrder = historyTimelineCanonicalOrder().map(event => event.id);
    this.historyTimelineActivityEngine = new ActivityEngine();
    this.historyTimelineActivityEngine.startQuiz({
      id: HISTORY_TIMELINE_ACTIVITY_ID,
      title: 'Timeline Builder',
      subject: 'History & Discovery',
      skillId: HISTORY_TIMELINE_SKILL_ID,
      questions: [{
        id: `${HISTORY_TIMELINE_ACTIVITY_ID}-events`,
        type: 'ordering',
        prompt: 'Put these selected events in chronological order.',
        hint: 'Use the approximate dates as clues and look for the earliest event first.',
        answer: correctOrder,
        correctOrder
      }],
      settings: {
        trackProgress: true,
        awardStars: true,
        pointsPerCorrect: HISTORY_EVENTS.length
      }
    });
    this.renderHistoryTimelineActivity();
  },

  renderHistoryTimelineActivity() {
    const game = this.historyTimelineGame;
    const main = document.getElementById('app-main');
    if (!game || !main) return;
    main.dataset.page = 'history-timeline';
    this.updateHeader();

    const placedEventIds = new Set(game.placements.filter(Boolean));
    const selectedEvent = historyEventById(game.selectedEventId);
    const inspectedEvent = historyEventById(game.inspectedEventId);
    const complete = game.complete;
    main.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center justify-between mb-6">
          <button type="button" data-action="history-hub" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform" aria-hidden="true">←</span>
            <span>Back to History &amp; Discovery</span>
          </button>
          <button type="button" data-action="home" class="text-xs text-slate-400 hover:text-white">🏠 Home</button>
        </div>

        <section class="history-timeline-workspace" aria-labelledby="history-timeline-title">
          <div class="history-timeline-workspace__heading">
            <div>
              <p class="history-eyebrow">History &amp; Discovery</p>
              <h1 id="history-timeline-title">${complete ? 'Timeline Complete!' : 'Timeline Builder'}</h1>
              <p>Put these selected events in chronological order. Arrange them from earliest to most recent; their dates are approximate and appear after you finish.</p>
            </div>
            <span class="history-timeline-count">${game.placements.filter(Boolean).length} of ${HISTORY_EVENTS.length} placed</span>
          </div>

          <p id="history-timeline-status" class="history-timeline-status" role="status" aria-live="polite">${escapeHistoryHtml(game.message)}</p>

          <section class="history-event-fact" id="history-event-fact" aria-live="polite"></section>

          <section class="history-event-tray" aria-labelledby="history-event-tray-title">
            <div class="history-subheading">
              <h2 id="history-event-tray-title">Event cards</h2>
              <p>Choose a card to read its clue, then choose a position.</p>
            </div>
            <div class="history-event-tray__cards">
              ${game.eventTray.filter(event => !placedEventIds.has(event.id)).map(event => `
                <button type="button" class="history-event-card ${game.selectedEventId === event.id ? 'is-selected' : ''}" data-action="history-event-select" data-event-id="${event.id}" aria-pressed="${game.selectedEventId === event.id}" ${complete ? 'disabled' : ''}>
                  <span class="history-event-card__icon" aria-hidden="true">${escapeHistoryHtml(event.icon)}</span>
                  <span class="history-event-card__copy">
                    <span class="history-event-card__era">${escapeHistoryHtml(event.era)}</span>
                    <span class="history-event-card__title">${escapeHistoryHtml(event.title)}</span>
                  </span>
                </button>
              `).join('') || `<p class="history-event-tray__empty">All event cards have been placed.</p>`}
            </div>
          </section>

          <section class="history-timeline-board" aria-labelledby="history-timeline-board-title">
            <div class="history-subheading">
              <h2 id="history-timeline-board-title">Timeline</h2>
              <p>Earliest event first <span aria-hidden="true">→</span> most recent event</p>
            </div>
            <ol class="history-timeline-slots">
              ${game.placements.map((eventId, index) => {
                const event = historyEventById(eventId);
                const label = event
                  ? `Position ${index + 1}: ${event.title}${complete ? `, ${event.approximateDate}` : ''}.`
                  : `Position ${index + 1}, empty.`;
                return `
                  <li class="history-timeline-slot" data-history-position-index="${index}">
                    <button type="button" class="history-timeline-slot__place ${event ? 'has-event' : ''} ${selectedEvent?.id === event?.id ? 'is-selected' : ''}" data-action="history-timeline-place" data-position-index="${index}" aria-label="${escapeHistoryHtml(label)} ${selectedEvent ? 'Place the selected event here.' : event ? 'Select this event to move it.' : 'Choose an event card first.'}" aria-pressed="${selectedEvent?.id === event?.id}" ${complete ? 'disabled' : ''}>
                      <span class="history-timeline-slot__number">${index + 1}</span>
                      ${event ? `
                        <span class="history-timeline-slot__event">
                          <span>${escapeHistoryHtml(event.title)}</span>
                          ${complete ? `<small>${escapeHistoryHtml(event.approximateDate)}</small>` : ''}
                        </span>
                      ` : `<span class="history-timeline-slot__empty">Choose an event</span>`}
                    </button>
                    ${event && !complete ? `<button type="button" class="history-timeline-slot__remove" data-action="history-timeline-remove" data-position-index="${index}" aria-label="Remove ${escapeHistoryHtml(event.title)} from position ${index + 1}">Remove</button>` : ''}
                  </li>
                `;
              }).join('')}
            </ol>
          </section>

          <div class="history-timeline-actions">
            ${complete
              ? `<button type="button" data-action="history-timeline-reset" class="history-secondary-button">Build another timeline</button>`
              : `<button type="button" data-action="history-timeline-submit" class="history-primary-button" ${isCompleteHistoryTimelinePlacement(game.placements) && !game.submitted ? '' : 'disabled'}>Check the timeline</button>
                 <button type="button" data-action="history-timeline-reset" class="history-secondary-button">Reset timeline</button>`}
          </div>
          ${getHistoryTimelineFeedback(game)}
        </section>
      </div>
    `;
    document.getElementById('history-event-fact').innerHTML = renderHistoryEventFact(inspectedEvent);
  },

  selectHistoryEvent(eventId) {
    const game = this.historyTimelineGame;
    const event = historyEventById(eventId);
    if (!game || game.complete || game.submitted) return false;
    if (!event) throw new RangeError(`Unknown history event: ${eventId}`);
    game.selectedEventId = event.id;
    game.inspectedEventId = event.id;
    game.message = `${event.title} selected. Choose a timeline position.`;
    this.renderHistoryTimelineActivity();
    return true;
  },

  placeSelectedHistoryEvent(positionIndex) {
    const game = this.historyTimelineGame;
    if (!game || game.complete || game.submitted) return false;
    if (!game.selectedEventId) {
      const eventId = game.placements[positionIndex];
      if (eventId) return this.selectHistoryEvent(eventId);
      game.message = 'Choose an event card before choosing an empty position.';
      this.renderHistoryTimelineActivity();
      return false;
    }
    const placements = placeHistoryEvent(game.placements, game.selectedEventId, positionIndex);
    if (!placements) throw new RangeError(`Invalid timeline position: ${positionIndex}`);
    game.placements = placements;
    game.selectedEventId = null;
    game.message = 'Event placed. Choose another card or check the timeline when all positions are filled.';
    this.renderHistoryTimelineActivity();
    return true;
  },

  removeHistoryEvent(positionIndex) {
    const game = this.historyTimelineGame;
    if (!game || game.complete || game.submitted ||
      !Number.isInteger(positionIndex) || positionIndex < 0 ||
      positionIndex >= game.placements.length || !game.placements[positionIndex]) {
      return false;
    }
    game.placements[positionIndex] = null;
    game.selectedEventId = null;
    game.message = `Position ${positionIndex + 1} cleared. The event is back in the card tray.`;
    this.renderHistoryTimelineActivity();
    return true;
  },

  submitHistoryTimelineAnswer() {
    const game = this.historyTimelineGame;
    const engine = this.historyTimelineActivityEngine;
    if (!game || !engine || game.complete || game.submitted) return false;
    if (!isCompleteHistoryTimelinePlacement(game.placements)) {
      game.message = 'Place each event once before checking the timeline.';
      this.renderHistoryTimelineActivity();
      return false;
    }
    const correct = engine.submitAnswer(game.placements);
    game.submitted = true;
    if (correct) {
      game.complete = true;
      game.message = 'Your timeline is in chronological order!';
      engine.complete();
    } else {
      game.mismatches = getHistoryTimelineMismatches(game.placements);
      game.message = 'Some events are out of order. Use the clues and try again.';
    }
    this.renderHistoryTimelineActivity();
    return correct;
  },

  retryHistoryTimeline() {
    const game = this.historyTimelineGame;
    const engine = this.historyTimelineActivityEngine;
    if (!game || !engine || game.complete || !game.submitted || !engine.allowRetry()) return false;
    game.submitted = false;
    game.mismatches = [];
    game.message = 'Move the misplaced events, then check the timeline again.';
    this.renderHistoryTimelineActivity();
    return true;
  },

  resetHistoryTimeline() {
    if (!this.historyTimelineGame) return false;
    this.startHistoryTimelineActivity();
    return true;
  }
});

window.HistoryTimeline = Object.freeze({
  activityId: HISTORY_TIMELINE_ACTIVITY_ID,
  skillId: HISTORY_TIMELINE_SKILL_ID,
  events: HISTORY_EVENTS,
  canonicalOrder: historyTimelineCanonicalOrder,
  eventById: historyEventById,
  getMismatches: getHistoryTimelineMismatches,
  isCompletePlacement: isCompleteHistoryTimelinePlacement,
  isValidEventData: isValidHistoryEventData,
  placeEvent: placeHistoryEvent,
  shuffleEvents: shuffleHistoryEvents
});
