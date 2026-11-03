const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function createHistoryContext() {
  const context = createBrowserContext();
  context.main = { innerHTML: '', dataset: {} };
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

test('history event data is sourced and covers distinct periods with approximate dates', () => {
  const context = createHistoryContext();
  const events = Array.from(context.HistoryTimeline.events);

  assert.equal(context.HistoryTimeline.isValidEventData(context.HISTORY_EVENT_DATA), true);
  assert.equal(events.length, 6);
  assert.deepEqual(
    Array.from(context.HistoryTimeline.canonicalOrder(), event => event.id),
    ['early-farming', 'early-writing', 'great-pyramid', 'gutenberg-bible', 'powered-flight', 'apollo-11']
  );
  assert.ok(events.every(event =>
    event.title && event.approximateDate && event.clue && event.explanation &&
    event.sourceName && event.sourceUrl.startsWith('https://')
  ));
});

test('history event validation rejects duplicate IDs, dates, and insecure sources', () => {
  const context = createHistoryContext();
  const data = context.eval('window.HISTORY_EVENT_DATA');
  const firstEvent = data.events[0];

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
  const order = Array.from(context.HistoryTimeline.canonicalOrder(), event => event.id);
  const empty = Array(order.length).fill(null);
  const firstPlacement = context.HistoryTimeline.placeEvent(empty, order[0], 0);
  const movedPlacement = context.HistoryTimeline.placeEvent(firstPlacement, order[0], 2);
  const incorrect = [...order].reverse();

  assert.deepEqual(Array.from(firstPlacement), [order[0], null, null, null, null, null]);
  assert.deepEqual(Array.from(movedPlacement), [null, null, order[0], null, null, null]);
  assert.deepEqual(empty, Array(order.length).fill(null));
  assert.equal(context.HistoryTimeline.placeEvent(empty, 'unknown-event', 0), null);
  assert.equal(context.HistoryTimeline.isCompletePlacement([order[0], order[0], ...order.slice(2)]), false);
  assert.equal(context.HistoryTimeline.isCompletePlacement(incorrect), true);
  assert.equal(context.HistoryTimeline.getMismatches(incorrect).length, order.length);
});

test('timeline completes through ActivityEngine and records progress only once', () => {
  const context = createHistoryContext();
  const app = context.app;
  const order = Array.from(context.HistoryTimeline.canonicalOrder(), event => event.id);

  app.startHistoryTimelineActivity();
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
