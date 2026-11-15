const HISTORY_ARTIFACT_ACTIVITY_ID = 'history-artifact-detective';
const HISTORY_ARTIFACT_SKILL_ID = 'history_artifact_analysis';

function escapeArtifactHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

const HISTORY_ARTIFACT_CASES = [
  {
    id: 'rosetta-stone', name: 'Rosetta Stone', answer: 'ptolemaic-egypt',
    period: 'Ptolemaic Egypt, 196 BCE', material: 'Granodiorite',
    clues: [
      ['Inspect the writing', 'The same decree is recorded in hieroglyphic, Demotic and Ancient Greek.'],
      ['Analyze the material', 'This hard, dark stone is granodiorite.'],
      ['Read the date', 'The decree was issued in 196 BCE during the reign of Ptolemy V.']
    ],
    explanation: 'The inscriptions let scholars compare Egyptian scripts with Ancient Greek, helping them decipher hieroglyphs.',
    sourceName: 'The British Museum: Rosetta Stone', sourceUrl: 'https://www.britishmuseum.org/collection/object/Y_EA24'
  },
  {
    id: 'indus-seal', name: 'Indus Valley stamp seal', answer: 'mature-harappan',
    period: 'Mature Harappan period, 3rd millennium BCE', material: 'Steatite',
    clues: [
      ['Inspect the design', 'A short line of still-undeciphered signs appears above an animal.'],
      ['Analyze the material', 'The small rectangular plaque is made of steatite.'],
      ['Read the find context', 'Its collection record places it in the Indus Valley during the Mature Harappan period.']
    ],
    explanation: 'Small carved seals are a distinctive part of Indus material culture. Their signs have not yet been deciphered.',
    sourceName: 'The Metropolitan Museum of Art: Stamp seal', sourceUrl: 'https://www.metmuseum.org/art/collection/search/324065'
  },
  {
    id: 'sutton-hoo-helmet', name: 'Sutton Hoo helmet', answer: 'anglo-saxon-england',
    period: 'Anglo-Saxon England, late 6th–early 7th century CE', material: 'Iron with decorated copper-alloy panels',
    clues: [
      ['Inspect the decoration', 'A face mask and animal forms are assembled from decorated panels.'],
      ['Analyze the material', 'The cap is iron, with tinned copper-alloy panels.'],
      ['Read the find context', 'It was found in a ship burial at Sutton Hoo, Suffolk, excavated in 1939.']
    ],
    explanation: 'The helmet came from an exceptionally rich ship burial associated with an early Anglo-Saxon ruler or warrior.',
    sourceName: 'The British Museum: Sutton Hoo helmet guide', sourceUrl: 'https://www.britishmuseum.org/sites/default/files/2021-05/large_print_guide_room_41.pdf'
  },
  {
    id: 'babylonian-tablet', name: 'Babylonian cuneiform tablet', answer: 'late-babylonian',
    period: 'Late Babylonian period', material: 'Clay',
    clues: [
      ['Inspect the marks', 'The wedge-shaped impressions form a cuneiform lexical syllabary.'],
      ['Analyze the material', 'The writing is pressed into a clay tablet.'],
      ['Read the collection record', 'The British Museum catalogues this object as Late Babylonian.']
    ],
    explanation: 'Cuneiform was impressed into clay with a stylus and used across Mesopotamia for many kinds of records and texts.',
    sourceName: 'The British Museum: Cuneiform tablet', sourceUrl: 'https://www.britishmuseum.org/collection/object/W_1881-0701-3157'
  }
];

const HISTORY_ARTIFACT_CHOICES = [
  { id: 'ptolemaic-egypt', label: 'Ptolemaic Egypt' },
  { id: 'mature-harappan', label: 'Mature Harappan (Indus Valley)' },
  { id: 'anglo-saxon-england', label: 'Anglo-Saxon England' },
  { id: 'late-babylonian', label: 'Late Babylonian Mesopotamia' }
];

function isValidHistoryArtifactCases(cases = HISTORY_ARTIFACT_CASES) {
  return Array.isArray(cases) && cases.length > 0 &&
    new Set(cases.map(item => item.id)).size === cases.length &&
    cases.every(item => item.id && item.name && item.answer && item.period && item.material &&
      Array.isArray(item.clues) && item.clues.length === 3 &&
      item.clues.every(clue => Array.isArray(clue) && clue.length === 2 && clue.every(Boolean)) &&
      item.explanation && item.sourceName && /^https:\/\//.test(item.sourceUrl) &&
      HISTORY_ARTIFACT_CHOICES.some(choice => choice.id === item.answer));
}

function shuffleHistoryArtifactCases(cases = HISTORY_ARTIFACT_CASES, random = Math.random) {
  const result = [...cases];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

Object.assign(App.prototype, {
  startHistoryArtifactDetective(random = Math.random) {
    this.currentView = 'history-artifact-detective';
    this.historyArtifactCases = shuffleHistoryArtifactCases(HISTORY_ARTIFACT_CASES, random);
    this.historyArtifactGame = { cluesSeen: 0, answer: null, submitted: false };
    this.rememberModule('history-artifact-detective', '/learning-centre/history/artifact-detective');
    this.historyArtifactActivityEngine = new ActivityEngine();
    this.historyArtifactActivityEngine.startQuiz({
      id: HISTORY_ARTIFACT_ACTIVITY_ID, title: 'Artifact Detective', subject: 'History & Discovery',
      skillId: HISTORY_ARTIFACT_SKILL_ID,
      questions: this.historyArtifactCases.map(item => ({
        id: item.id, prompt: 'Which civilization or period best matches the evidence?',
        hint: item.clues[0][1], answer: item.answer,
        options: HISTORY_ARTIFACT_CHOICES.map(choice => ({ text: choice.label, value: choice.id }))
      })),
      settings: { trackProgress: true, awardStars: true, pointsPerCorrect: 1 }
    });
    this.renderHistoryArtifactDetective();
  },

  revealHistoryArtifactClue() {
    const game = this.historyArtifactGame;
    if (!game || game.submitted || game.cluesSeen >= 3) return false;
    game.cluesSeen++;
    this.renderHistoryArtifactDetective();
    return true;
  },

  chooseHistoryArtifactAnswer(answer) {
    if (!this.historyArtifactGame || this.historyArtifactGame.submitted || this.historyArtifactGame.cluesSeen < 3) return false;
    if (!HISTORY_ARTIFACT_CHOICES.some(choice => choice.id === answer)) return false;
    this.historyArtifactGame.answer = answer;
    this.renderHistoryArtifactDetective();
    return true;
  },

  submitHistoryArtifactAnswer() {
    const game = this.historyArtifactGame;
    if (!game || game.submitted || game.cluesSeen < 3 || !game.answer) return false;
    const correct = this.historyArtifactActivityEngine.submitAnswer(game.answer);
    if (correct === null) return false;
    game.submitted = true;
    game.correct = correct;
    this.renderHistoryArtifactDetective();
    return true;
  },

  advanceHistoryArtifactCase() {
    const game = this.historyArtifactGame;
    if (!game?.submitted) return false;
    const more = this.historyArtifactActivityEngine.nextQuestion();
    if (!more) {
      game.complete = true;
      this.renderHistoryArtifactDetective();
      return true;
    }
    game.cluesSeen = 0;
    game.answer = null;
    game.submitted = false;
    this.renderHistoryArtifactDetective();
    return true;
  },

  renderHistoryArtifactDetective() {
    const main = document.getElementById('app-main');
    const game = this.historyArtifactGame;
    if (!main || !game) return;
    main.dataset.page = 'history-artifact-detective';
    this.updateHeader();
    const index = this.historyArtifactActivityEngine.currentIndex;
    const item = this.historyArtifactCases[index] || this.historyArtifactCases.at(-1);
    const choice = HISTORY_ARTIFACT_CHOICES.find(entry => entry.id === game.answer);
    const clues = item.clues.slice(0, game.cluesSeen).map(([label, clue], clueIndex) =>
      `<li><strong>${escapeArtifactHtml(label)}:</strong> ${escapeArtifactHtml(clue)}</li>`).join('');
    const feedback = game.submitted ? `
      <section class="artifact-result" role="status" aria-live="polite">
        <h2>${game.correct ? 'Evidence matched!' : 'Case revealed'}</h2>
        <p><strong>${escapeArtifactHtml(item.name)}</strong> — ${escapeArtifactHtml(item.period)}. ${escapeArtifactHtml(item.explanation)}</p>
        <p>Material: ${escapeArtifactHtml(item.material)}</p>
        <p>Source: <a href="${escapeArtifactHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeArtifactHtml(item.sourceName)}</a></p>
        <button type="button" data-action="history-artifact-next" class="history-primary-button">${index === this.historyArtifactCases.length - 1 ? 'Finish investigation' : 'Next artifact'}</button>
      </section>` : '';
    main.innerHTML = `
      <div class="artifact-detective">
        <button type="button" data-action="history-hub" class="artifact-back">← Back to History &amp; Discovery</button>
        <header class="artifact-heading"><p class="history-eyebrow">Evidence investigation · ${game.complete ? this.historyArtifactCases.length : index + 1} of ${this.historyArtifactCases.length}</p>
          <h1>Artifact Detective</h1><p>Inspect all three clues, then choose the civilization or period that best fits the evidence.</p></header>
        ${game.complete ? `<section class="artifact-result" role="status"><h2>Investigation complete</h2><p>You examined all ${this.historyArtifactCases.length} artifacts in this finite collection.</p><button type="button" data-action="history-artifact-start" class="history-primary-button">Investigate again</button></section>` : `
          <section class="artifact-case" aria-labelledby="artifact-case-title"><p class="history-eyebrow">Case ${index + 1}</p><h2 id="artifact-case-title">Unknown artifact</h2><p>Material and period are hidden until you submit your conclusion.</p>
            <ol class="artifact-clues" aria-live="polite">${clues}</ol>
            <button type="button" data-action="history-artifact-clue" class="history-secondary-button" ${game.cluesSeen >= 3 ? 'disabled' : ''}>${game.cluesSeen >= 3 ? 'All clues inspected' : `Inspect clue ${game.cluesSeen + 1}`}</button>
            <fieldset class="artifact-choices" ${game.cluesSeen < 3 || game.submitted ? 'disabled' : ''}><legend>Which period does the evidence support?</legend>
              ${HISTORY_ARTIFACT_CHOICES.map(entry => `<label><input type="radio" name="artifact-period" value="${entry.id}" data-action="history-artifact-answer" ${game.answer === entry.id ? 'checked' : ''}><span>${escapeArtifactHtml(entry.label)}</span></label>`).join('')}
            </fieldset>
            <button type="button" data-action="history-artifact-submit" class="history-primary-button" ${!choice || game.cluesSeen < 3 || game.submitted ? 'disabled' : ''}>Submit identification</button>
            ${feedback}</section>`}
      </div>`;
  }
});

window.HistoryArtifactDetective = Object.freeze({ cases: HISTORY_ARTIFACT_CASES, choices: HISTORY_ARTIFACT_CHOICES, isValid: isValidHistoryArtifactCases, shuffle: shuffleHistoryArtifactCases });
