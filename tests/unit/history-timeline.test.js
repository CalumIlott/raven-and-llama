const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createHistoryContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {}, querySelectorAll: () => [] };
  context.factPanel = { innerHTML: '' };
  context.document = {
    getElementById(id) {
      if (id === 'app-main') return context.main;
      if (id === 'history-event-fact') return context.factPanel;
      return null;
    },
    querySelectorAll: () => []
  };
  context.activityScores = [];
  context.ProfileManager = {
    recordActivityScore: (...score) => context.activityScores.push(score)
  };
  context.brandWordmark = () => 'Raven &amp; Llama';
  context.eval = source => require('node:vm').runInContext(source, context);
  context.eval('class App { updateHeader() {} rememberModule() {} }; window.app = new App();');
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/history/events.js', 'public/js/history/timeline-builder.js');
  return context;
}

test('history event data contains at least 100 sourced events with distinct IDs and dates', () => {
  const context = createHistoryContext();
  const events = Array.from(context.HistoryTimeline.events);

  assert.equal(context.HistoryTimeline.isValidEventData(context.HISTORY_EVENT_DATA), true);
  assert.ok(events.length >= 100);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  assert.equal(new Set(events.map(event => event.sortYear)).size, events.length);
  assert.ok(events.every(event =>
    event.title && event.era && event.approximateDate && event.clue && event.explanation &&
    event.sourceName && event.sourceUrl.startsWith('https://')
  ));
  assert.ok(events.every(event =>
    typeof event.icon === 'string' && event.icon.length >= 1 &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}{2}/u.test(event.icon)
  ));
  assert.ok(events.every(event => !/^\?+$/.test(event.icon)));
  const canonicalYears = Array.from(context.HistoryTimeline.canonicalOrder(), event => event.sortYear);
  assert.deepEqual(canonicalYears, [...canonicalYears].sort((left, right) => left - right));
});

test('timeline rounds sample six unique events from the full pool and vary by random source', () => {
  const context = createHistoryContext();
  const events = Array.from(context.HistoryTimeline.events);
  const firstRound = Array.from(context.HistoryTimeline.selectEvents(6, () => 0));
  const secondRound = Array.from(context.HistoryTimeline.selectEvents(6, () => 0.99));

  for (const round of [firstRound, secondRound]) {
    assert.equal(round.length, 6);
    assert.equal(new Set(round.map(event => event.id)).size, round.length);
    assert.ok(round.every(event => events.some(candidate => candidate.id === event.id)));
  }
  assert.notDeepEqual(firstRound.map(event => event.id), secondRound.map(event => event.id));
  assert.throws(() => context.HistoryTimeline.selectEvents(0), /positive integer/);
});

test('history event validation rejects duplicate IDs, dates, and insecure sources', () => {
  const context = createHistoryContext();
  const data = context.eval('window.HISTORY_EVENT_DATA');
  const firstEvent = data.events[0];

  assert.equal(context.HistoryTimeline.isValidEventData({
    events: data.events.slice(0, 99)
  }), false);
  assert.equal(context.HistoryTimeline.isValidEventData({
    events: [firstEvent, firstEvent, ...data.events.slice(2)]
  }), false);
  assert.equal(context.HistoryTimeline.isValidEventData({
    events: data.events.map((event, index) => index === 1
      ? { ...event, sortYear: firstEvent.sortYear }
      : event)
  }), false);
  assert.equal(context.HistoryTimeline.isValidEventData({
    events: data.events.map((event, index) => index === 0
      ? { ...event, sourceUrl: 'http://example.test' }
      : event)
  }), false);
});

test('timeline placement supports moving, rejects duplicates, and reports incorrect positions', () => {
  const context = createHistoryContext();
  const events = Array.from(context.HistoryTimeline.selectEvents(6, () => 0));
  const order = Array.from(context.HistoryTimeline.canonicalOrder(events), event => event.id);
  const empty = Array(order.length).fill(null);
  const firstPlacement = context.HistoryTimeline.placeEvent(empty, order[0], 0, events);
  const movedPlacement = context.HistoryTimeline.placeEvent(firstPlacement, order[0], 2, events);
  const incorrect = [...order].reverse();

  assert.deepEqual(Array.from(firstPlacement), [order[0], null, null, null, null, null]);
  assert.deepEqual(Array.from(movedPlacement), [null, null, order[0], null, null, null]);
  assert.deepEqual(empty, Array(order.length).fill(null));
  assert.equal(context.HistoryTimeline.placeEvent(empty, 'unknown-event', 0, events), null);
  assert.equal(context.HistoryTimeline.isCompletePlacement([order[0], order[0], ...order.slice(2)], events), false);
  assert.equal(context.HistoryTimeline.isCompletePlacement(incorrect, events), true);
  assert.equal(context.HistoryTimeline.getMismatches(incorrect, events).length, order.length);
});

test('moving an event between filled timeline positions reorders by swapping', () => {
  const context = createHistoryContext();
  const events = Array.from(context.HistoryTimeline.selectEvents(6, () => 0));
  const order = Array.from(context.HistoryTimeline.canonicalOrder(events), event => event.id);
  const placement = [...order];
  const reordered = context.HistoryTimeline.placeEvent(placement, order[0], 1, events);

  assert.deepEqual(Array.from(reordered), [order[1], order[0], ...order.slice(2)]);
  assert.deepEqual(placement, order);
  assert.equal(new Set(reordered).size, order.length);
});

test('timeline completes through ActivityEngine and records progress only once', () => {
  const context = createHistoryContext();
  const app = context.app;

  app.startHistoryTimelineActivity(() => 0);
  const order = Array.from(
    context.HistoryTimeline.canonicalOrder(app.historyTimelineGame.events),
    event => event.id
  );
  assert.equal(app.historyTimelineActivityEngine.definition.id, 'history-timeline-sequence');
  assert.equal(app.historyTimelineActivityEngine.definition.skillId, 'history_event_chronology');
  for (const [positionIndex, eventId] of order.entries()) {
    app.selectHistoryEvent(eventId);
    app.placeSelectedHistoryEvent(positionIndex);
  }

  assert.equal(app.submitHistoryTimelineAnswer(), true);
  assert.equal(app.historyTimelineActivityEngine.status, 'complete');
  assert.equal(app.historyTimelineActivityEngine.score, order.length);
  assert.equal(app.historyTimelineActivityEngine.definition.settings.awardStars, true);
  assert.equal(context.activityScores.length, 1);
  assert.equal(app.submitHistoryTimelineAnswer(), false);
  assert.equal(context.activityScores.length, 1);
});
