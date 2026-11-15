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

test('Spelling pronunciation applies the learner speech-rate multiplier', async () => {
  const { context, spoken } = createPronunciationContext();
  context.EducationalFeedback = { speechRateMultiplier: () => 1.25 };

  assert.equal(await context.SpellingPronunciation.speak('kangaroo', { textContent: '' }), true);
  assert.equal(spoken[0].rate, 1.025);
});

test('Phonics Trail word pronunciation fills the blank instead of speaking only the missing letter', async () => {
  const { context, spoken } = createPronunciationContext();
  context.document = { getElementById: () => null };
  const app = new context.App();
  app.spellingSafariGame = {
    activity: { type: 'phonics' },
    index: 0,
    questions: [{ type: 'phonics', prompt: 'sh_p', answer: 'i' }]
  };

  assert.equal(await app.speakSpellingSafariWord(), true);
  assert.equal(spoken[0].text, 'ship');
});

test('Spelling pronunciation immediately uses the device voice when the voice list is empty', async () => {
  const { context, spoken } = createPronunciationContext({
    voices: [],
    speechOverrides: {
      addEventListener() {
        assert.fail('Playback must not wait for voiceschanged');
      }
    }
  });
  const status = { textContent: '' };

  const playback = context.SpellingPronunciation.speak('wallaby', status);
  assert.equal(spoken.length, 1, 'speech.speak is called synchronously in the user-action turn');
  assert.equal(spoken[0].voice, undefined);
  assert.equal(status.textContent, 'No voice is ready. Playing with your device default voice.');
  assert.equal(await playback, true);
});

test('Spelling pronunciation retries the device default voice after a selected voice fails', async () => {
  const voice = { name: 'Australian English', lang: 'en-AU' };
  const { context, spoken } = createPronunciationContext({
    voices: [voice],
    speechOverrides: {
      speak(utterance) {
        spoken.push(utterance);
        queueMicrotask(() => {
          if (utterance.voice) utterance.onerror({ error: 'synthesis-failed' });
          else utterance.onend();
        });
      }
    }
  });
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('wallaby', status), true);
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(spoken.length, 2);
  assert.equal(spoken[0].voice, voice);
  assert.equal(spoken[1].voice, undefined);
  assert.equal(status.textContent, 'Pronunciation finished.');
});

test('Spelling pronunciation reports failure when both selected and device voices fail', async () => {
  const voice = { name: 'Australian English', lang: 'en-AU' };
  const { context, spoken } = createPronunciationContext({
    voices: [voice],
    speechOverrides: {
      speak(utterance) {
        spoken.push(utterance);
        queueMicrotask(() => utterance.onerror({ error: utterance.voice ? 'synthesis-failed' : 'not-allowed' }));
      }
    }
  });
  const status = { textContent: '' };

  assert.equal(await context.SpellingPronunciation.speak('quokka', status), true);
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(spoken.length, 2);
  assert.match(status.textContent, /Pronunciation could not be played: not-allowed/);
  assert.match(status.textContent, /read the clue and continue/);
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

test('cancelling pronunciation stops playback queued with the device voice', async () => {
  const helper = createPronunciationContext({ voices: [] });
  const { context, spoken } = helper;
  const status = { textContent: '' };

  const playback = context.SpellingPronunciation.speak('echidna', status);
  assert.equal(spoken.length, 1);
  context.SpellingPronunciation.cancel();

  assert.equal(await playback, true);
  assert.equal(helper.cancelCount, 2);
});
