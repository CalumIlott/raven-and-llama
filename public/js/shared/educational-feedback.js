function escapeFeedbackHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

window.EducationalFeedback = {
  render({
    id,
    correct,
    message,
    explanation,
    workedExample,
    audioHint,
    retryAction,
    continueAction,
    continueLabel = 'Continue',
    className = ''
  }) {
    const steps = Array.isArray(workedExample?.steps) ? workedExample.steps : [];
    const example = steps.length
      ? `<div class="educational-feedback__example">
          <h3 class="educational-feedback__example-title">${escapeFeedbackHtml(workedExample.title || 'Worked example')}</h3>
          <ol>${steps.map((step, index) => `
            <li class="educational-feedback__step">
              <span class="educational-feedback__step-number" aria-hidden="true">${index + 1}</span>
              <span><strong>${escapeFeedbackHtml(step.label)}</strong><span>${escapeFeedbackHtml(step.detail)}</span></span>
            </li>
          `).join('')}</ol>
        </div>`
      : '';
    const audio = audioHint
      ? `<div class="educational-feedback__audio">
          <p>${escapeFeedbackHtml(audioHint)}</p>
          <button type="button" data-action="feedback-speak" data-feedback-speak="${escapeFeedbackHtml(audioHint)}">Listen to hint</button>
          <span data-feedback-audio-status aria-live="polite"></span>
        </div>`
      : '';
    const actions = [
      retryAction
        ? `<button type="button" data-action="${escapeFeedbackHtml(retryAction)}" class="educational-feedback__retry">Try again</button>`
        : '',
      continueAction
        ? `<button type="button" data-action="${escapeFeedbackHtml(continueAction)}" class="educational-feedback__continue">${escapeFeedbackHtml(continueLabel)}</button>`
        : ''
    ].filter(Boolean).join('');

    return `<section${id ? ` id="${escapeFeedbackHtml(id)}"` : ''} class="educational-feedback ${correct ? 'is-correct' : 'is-incorrect'} ${escapeFeedbackHtml(className)}" aria-label="Answer feedback">
      <p class="educational-feedback__message font-bold" role="status" aria-live="polite">${escapeFeedbackHtml(message || (correct ? 'Nice work!' : 'Not quite. Review the clue and try a different approach.'))}</p>
      ${explanation ? `<p class="educational-feedback__explanation">${escapeFeedbackHtml(explanation)}</p>` : ''}
      ${example}
      ${audio}
      ${actions ? `<div class="educational-feedback__actions">${actions}</div>` : ''}
    </section>`;
  },

  speak(text, statusElement) {
    const speech = window.speechSynthesis;
    if (!speech || typeof speech.speak !== 'function' || typeof window.SpeechSynthesisUtterance !== 'function') {
      if (statusElement) statusElement.textContent = 'Audio hints are not available in this browser.';
      return false;
    }

    const utterance = new window.SpeechSynthesisUtterance(String(text));
    utterance.onerror = event => {
      if (statusElement) statusElement.textContent = `Audio hint could not be played: ${event.error}.`;
    };
    speech.cancel();
    speech.speak(utterance);
    if (statusElement) statusElement.textContent = 'Playing audio hint.';
    return true;
  }
};
