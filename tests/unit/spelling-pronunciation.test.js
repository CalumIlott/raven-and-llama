const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function createPronunciationContext({
  voices = [{ name: 'Australian English', lang: 'en-AU' }],
  muted = false,
  speechOverrides = {}
} = {}) {
  const spoken = [];
  let cancelCount = 0;
  const speech = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {
      cancelCount++;
    },
    speak(utterance) {
      spoken.push(utterance);
    },
    ...speechOverrides
  };
  const context = createBrowserContext({
    speechSynthesis: speech,
    SpeechSynthesisUtterance: class {
      constructor(text) {
        this.text = text;
      }
    },
    soundFX: { isMuted: () => muted }
  });
  context.App = class {};
  context.ProfileManager = { getSubjectDifficulty: () => 'medium', recordActivityScore() {} };
  loadBrowserScripts(context, 'public/js/spelling/safari.js');
  return {
    context,
    speech,
    spoken,
    get cancelCount() {
      return cancelCount;
    }
  };
}

test('Spelling pronunciation uses an available Australian English voice at a child-friendly pace', async () => {
  const voice = { name: 'Australian English', lang: 'en-AU' };
  const { context, spoken } = createPronunciationContext({ voices: [voice] });
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('kangaroo', status), true);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, 'kangaroo');
  assert.equal(spoken[0].lang, 'en-AU');
  assert.equal(spoken[0].rate, 0.82);
  assert.equal(spoken[0].voice, voice);
  assert.equal(status.textContent, 'Playing word pronunciation.');
});

test('Spelling pronunciation waits for voices that are still loading', async () => {
  const voices = [];
  let onVoicesChanged;
  const { context, spoken } = createPronunciationContext({
    voices,
    speechOverrides: {
      addEventListener(name, listener) {
        if (name === 'voiceschanged') onVoicesChanged = listener;
      },
      removeEventListener() {}
    }
  });
  const status = { textContent: '' };

  const playback = context.SpellingPronunciation.speak('wallaby', status);
  assert.equal(status.textContent, 'Loading a pronunciation voice...');
  voices.push({ name: 'Australian English', lang: 'en-AU' });
  onVoicesChanged();

  assert.equal(await playback, true);
  assert.equal(spoken[0].voice, voices[0]);
});

test('Spelling pronunciation falls back to the device voice when no voice is listed', async () => {
  const { context, spoken } = createPronunciationContext({
    voices: [],
    speechOverrides: {
      addEventListener: undefined
    }
  });
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('platypus', status), true);
  assert.equal(spoken[0].voice, undefined);
  assert.equal(status.textContent, 'No voice is ready. Playing with your device default voice.');
});

test('Spelling pronunciation explains when browser speech is unavailable', async () => {
  const { context } = createPronunciationContext();
  delete context.speechSynthesis;
  delete context.SpeechSynthesisUtterance;
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('quokka', status), false);
  assert.match(status.textContent, /Speech playback is unavailable/);
  assert.match(status.textContent, /read the clue/);
});

test('Spelling pronunciation respects the app sound mute setting', async () => {
  const { context, spoken } = createPronunciationContext({ muted: true });
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('wombat', status), false);
  assert.equal(spoken.length, 0);
  assert.equal(status.textContent, 'Sound is muted. Turn on app sound to hear the word.');
});

test('cancelling while voices load prevents queued pronunciation from starting', async () => {
  let onVoicesChanged;
  const { context, spoken } = createPronunciationContext({
    voices: [],
    speechOverrides: {
      addEventListener(name, listener) {
        if (name === 'voiceschanged') onVoicesChanged = listener;
      },
      removeEventListener() {}
    }
  });
  const status = { textContent: '' };

  const playback = context.SpellingPronunciation.speak('echidna', status);
  context.SpellingPronunciation.cancel();
  onVoicesChanged();

  assert.equal(await playback, false);
  assert.equal(spoken.length, 0);
});
