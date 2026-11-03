class ActivityEngine {
  constructor() {
    this.definition = null;
    this.status = 'idle';
    this.currentIndex = 0;
    this.score = 0;
    this.questionOutcomes = [];
    this.answered = false;
    this.lastAnswerCorrect = null;
    this.hintsUsed = 0;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.progressRecorded = false;
  }

  validate(definition) {
    if (typeof window.validateActivityDefinition !== 'function') {
      throw new Error('Activity definition validator is not loaded.');
    }
    if (!window.validateActivityDefinition(definition)) {
      const details = (window.validateActivityDefinition.errors || [])
        .map(error => `${error.instancePath || '/'} ${error.message}`)
        .join('; ');
      throw new TypeError(`Invalid activity definition: ${details}`);
    }
    return definition;
  }

  start(definition) {
    this.stopTimer();
    this.definition = this.validate(definition);
    this.status = 'active';
    this.currentIndex = 0;
    this.score = 0;
    this.questionOutcomes = [];
    this.answered = false;
    this.lastAnswerCorrect = null;
    this.hintsUsed = 0;
    this.timeLeft = 0;
    this.progressRecorded = false;
    window.activeActivityEngine = this;
    return this;
  }

  startQuiz({ id, title, subject, questions, settings = {}, skillId }) {
    const normalizedQuestions = questions.map((question, index) => ({
      ...question,
      id: question.id || `${id}-q${index + 1}`,
      type: question.type || 'choice',
      answer: question.answer ?? question.target
    }));
    return this.start({
      version: 1,
      kind: 'quiz',
      id,
      title,
      subject,
      skillId,
      settings,
      questions: normalizedQuestions
    });
  }

  replaceCurrentQuestion(question) {
    if (this.status !== 'active' || this.definition.kind !== 'quiz' ||
      this.definition.settings.unbounded !== true) return false;
    this.definition.questions = [{
      ...question,
      id: question.id || `${this.definition.id}-q${this.currentIndex + 1}`,
      type: question.type || 'choice',
      answer: question.answer ?? question.target
    }];
    this.currentIndex = 0;
    this.questionOutcomes = [];
    this.answered = false;
    this.lastAnswerCorrect = null;
    this.hintsUsed = 0;
    this.timeLeft = 0;
    return true;
  }

  get currentQuestion() {
    return this.definition?.kind === 'quiz'
      ? this.definition.questions[this.currentIndex] || null
      : null;
  }

  submitAnswer(answer) {
    if (this.status !== 'active' || this.definition.kind !== 'quiz' || this.answered) return null;
    const question = this.currentQuestion;
    const expected = question.correctOrder || question.answer;
    return this.recordOutcome(JSON.stringify(answer) === JSON.stringify(expected));
  }

  recordOutcome(isCorrect) {
    if (this.status !== 'active' || this.definition.kind !== 'quiz' || this.answered) return null;
    this.lastAnswerCorrect = Boolean(isCorrect);
    this.answered = true;
    this.questionOutcomes[this.currentIndex] = this.lastAnswerCorrect;
    if (this.lastAnswerCorrect) {
      this.score += this.definition.settings.pointsPerCorrect ?? 1;
    }
    this.stopTimer();
    return this.lastAnswerCorrect;
  }

  allowRetry() {
    if (this.status !== 'active' || this.definition.kind !== 'quiz' ||
      !this.answered || this.lastAnswerCorrect !== false) return false;
    delete this.questionOutcomes[this.currentIndex];
    this.answered = false;
    this.lastAnswerCorrect = null;
    return true;
  }

  nextQuestion() {
    if (this.status !== 'active' || this.definition.kind !== 'quiz' || !this.answered) return false;
    if (this.currentIndex === this.definition.questions.length - 1) {
      this.complete();
      return false;
    }
    this.currentIndex++;
    this.answered = false;
    this.lastAnswerCorrect = null;
    this.hintsUsed = 0;
    this.timeLeft = 0;
    return true;
  }

  useHint() {
    if (this.status !== 'active' || this.definition.kind !== 'quiz') return null;
    const maxHints = this.definition.settings.maxHintsPerQuestion ?? 1;
    const hint = this.currentQuestion?.hint;
    if (this.answered || !hint || this.hintsUsed >= maxHints) return null;
    this.hintsUsed++;
    return hint;
  }

  startTimer(onTimeout) {
    if (this.status !== 'active' || typeof onTimeout !== 'function') return false;
    const seconds = this.currentQuestion?.timeLimitSeconds ?? this.definition.settings.timeLimitSeconds;
    if (!Number.isFinite(seconds)) return false;
    this.stopTimer();
    this.timeLeft = Math.ceil(seconds);
    this.timerInterval = window.setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.stopTimer();
        onTimeout();
      }
    }, 1000);
    return true;
  }

  stopTimer() {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  addScore(points) {
    if (this.status !== 'active' || this.definition.kind !== 'game' ||
      !Number.isFinite(points) || points < 0) {
      return false;
    }
    this.score += points;
    return this.score;
  }

  deductScore(points) {
    if (this.status !== 'active' || this.definition.kind !== 'game' ||
      !Number.isFinite(points) || points < 0) {
      return false;
    }
    this.score = Math.max(0, this.score - points);
    return this.score;
  }

  complete() {
    if (this.status !== 'active') return false;
    const shouldTrackProgress = this.definition.settings.trackProgress !== false;
    if (shouldTrackProgress && this.definition.kind === 'quiz' &&
      this.definition.settings.unbounded !== true) {
      const allQuestionsAnswered = Array.from(
        { length: this.definition.questions.length },
        (_, index) => typeof this.questionOutcomes[index] === 'boolean'
      ).every(Boolean);
      if (!allQuestionsAnswered) return false;
    }

    this.stopTimer();
    this.status = 'complete';
    if (!this.progressRecorded && shouldTrackProgress &&
      typeof ProfileManager !== 'undefined') {
      ProfileManager.recordActivityScore(
        this.definition,
        this.score,
        this.definition.kind === 'quiz'
          ? this.definition.questions.length * (this.definition.settings.pointsPerCorrect ?? 1)
          : null,
        this.definition.kind === 'quiz' && this.definition.settings.unbounded !== true
          ? {
            correctAnswers: this.questionOutcomes.filter(Boolean).length,
            totalAnswers: this.questionOutcomes.filter(result => typeof result === 'boolean').length
          }
          : null
      );
      this.progressRecorded = true;
    }
    if (window.activeActivityEngine === this) window.activeActivityEngine = null;
    if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new window.CustomEvent('raven-llama:activity-completed', {
        detail: {
          id: this.definition.id,
          title: this.definition.title,
          score: this.score
        }
      }));
    }
    return true;
  }

  cancel() {
    if (this.status !== 'active') return false;
    this.stopTimer();
    this.status = 'cancelled';
    if (window.activeActivityEngine === this) window.activeActivityEngine = null;
    return true;
  }
}

window.ActivityEngine = ActivityEngine;
window.activityEngine = new ActivityEngine();
