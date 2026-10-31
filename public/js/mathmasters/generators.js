// Procedural Question & Math Engine for Maths Masters Dojo (Doubled Relaxed Timers)
class QuestionGenerator {
  static randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  static shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static generateChoices(correct, count = 4, variance = 3, allowNegative = false) {
    const choices = new Set([correct]);
    let attempts = 0;
    while (choices.size < count && attempts < 50) {
      attempts++;
      const offset = (Math.random() > 0.5 ? 1 : -1) * QuestionGenerator.randomInt(1, variance);
      const wrong = typeof correct === 'number'
        ? (Number.isInteger(correct) ? correct + offset : Number((correct + offset * 0.1).toFixed(2)))
        : offset;
      if (typeof wrong === 'number' && !allowNegative && wrong < 0) continue;
      if (wrong !== correct) choices.add(wrong);
    }
    while (choices.size < count) choices.add(choices.size + 10);
    return QuestionGenerator.shuffle(Array.from(choices));
  }

  static generateChoicesInRange(correct, min, max, count = 4) {
    const choices = new Set([correct]);
    while (choices.size < count) {
      choices.add(QuestionGenerator.randomInt(min, max));
    }
    return QuestionGenerator.shuffle(Array.from(choices));
  }

  static numberToWords(number) {
    const smallNumbers = [
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (number < 20) return smallNumbers[number];
    if (number < 100) {
      const remainder = number % 10;
      return `${tensWords[Math.floor(number / 10)]}${remainder ? `-${smallNumbers[remainder]}` : ''}`;
    }
    if (number < 1000) {
      const remainder = number % 100;
      return `${smallNumbers[Math.floor(number / 100)]} hundred${remainder ? ` and ${QuestionGenerator.numberToWords(remainder)}` : ''}`;
    }
    const remainder = number % 1000;
    return `${QuestionGenerator.numberToWords(Math.floor(number / 1000))} thousand${remainder
      ? ` ${remainder < 100 ? 'and ' : ''}${QuestionGenerator.numberToWords(remainder)}`
      : ''}`;
  }

  static greatestCommonDivisor(a, b) {
    return b ? QuestionGenerator.greatestCommonDivisor(b, a % b) : a;
  }

  static formatFraction(numerator, denominator) {
    if (numerator === 0) return '0';
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    if (remainder === 0) return String(whole);
    const divisor = QuestionGenerator.greatestCommonDivisor(remainder, denominator);
    const fraction = `${remainder / divisor}/${denominator / divisor}`;
    return whole ? `${whole} ${fraction}` : fraction;
  }

  static generateFractionChoices(numerator, denominator) {
    const answer = QuestionGenerator.formatFraction(numerator, denominator);
    const choices = new Set([answer]);
    for (let value = 0; value <= denominator * 3 && choices.size < 4; value++) {
      const option = QuestionGenerator.formatFraction(value, denominator);
      if (option !== answer) choices.add(option);
    }
    return QuestionGenerator.shuffle(Array.from(choices));
  }

  // --- WHITE BELT ---
  static genWhiteSubitise(diff = 'standard') {
    const isVarB = Math.random() > 0.5;
    const max = diff === 'hard' ? 10 : 6;
    const target = QuestionGenerator.randomInt(1, max);
    return {
      type: 'subitise',
      title: 'Subitising Flash ⚡',
      subtitle: 'Recognise the dot pattern!',
      targetNumber: target,
      layout: (!isVarB && target <= 6) ? 'dice' : 'dots',
      timeLimitSeconds: diff === 'hard' ? 12 : 16,
      answer: target,
      options: QuestionGenerator.generateChoices(target, 4, 3)
    };
  }

  static genWhiteCounting(diff = 'standard') {
    const isVarB = Math.random() > 0.5;
    const max = diff === 'hard' ? 10 : 8;
    const target = QuestionGenerator.randomInt(1, max);
    const emojis = ['🍎', '⭐', '🥋', '🐱', '🚀', '⚽', '🍕', '🎈'];
    const emoji = emojis[QuestionGenerator.randomInt(0, emojis.length - 1)];
    if (!isVarB) {
      return {
        type: 'count_objects',
        title: 'Counting Master (0-10)',
        subtitle: `How many ${emoji} do you count?`,
        count: target,
        itemIcon: emoji,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: target,
        options: QuestionGenerator.generateChoices(target, 4, 3)
      };
    } else {
      const seq = [target - 1, target, target + 1, target + 2].filter(n => n >= 0);
      const missingIdx = 1;
      const missing = seq[missingIdx];
      const display = seq.map((s, i) => i === missingIdx ? '❓' : s);
      return {
        type: 'standard_choice',
        title: 'Counting Hop (0-10)',
        prompt: `What number is missing? [ ${display.join(' , ')} ]`,
        timeLimitSeconds: diff === 'hard' ? 18 : 24,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, 2)
      };
    }
  }

  static genWhiteRecognition(diff = 'standard') {
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const num = QuestionGenerator.randomInt(0, 10);
    const mode = Math.random() > 0.5 ? 'word_to_num' : 'num_to_word';
    return {
      type: 'standard_choice',
      title: 'Recognition Master',
      prompt: mode === 'word_to_num' ? `Which digit is "${words[num]}"?` : `What is the word for "${num}"?`,
      timeLimitSeconds: diff === 'hard' ? 16 : 24,
      answer: mode === 'word_to_num' ? num.toString() : words[num],
      options: mode === 'word_to_num'
        ? QuestionGenerator.generateChoices(num, 4, 3).map(String)
        : QuestionGenerator.shuffle(QuestionGenerator.generateChoices(num, 4, 3).filter(n => n >= 0 && n <= 10).map(i => words[i]))
    };
  }

  static genWhiteWriting(diff = 'standard') {
    const start = QuestionGenerator.randomInt(0, 6);
    const isVarB = Math.random() > 0.5;
    if (!isVarB) {
      const seq = [start, start + 1, start + 2, start + 3];
      const missing = seq[2];
      const display = seq.map((n, i) => i === 2 ? '❓' : n);
      return {
        type: 'standard_choice',
        title: 'Writing Master (0-10)',
        prompt: `Fill in the blank: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, 2)
      };
    } else {
      const s = start + 3;
      const seq = [s, s - 1, s - 2, s - 3];
      const missing = seq[1];
      const display = seq.map((n, i) => i === 1 ? '❓' : n);
      return {
        type: 'standard_choice',
        title: 'Writing Master (Countdown)',
        prompt: `Count backwards: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, 2)
      };
    }
  }

  static genWhitePartition(diff = 'standard') {
    const total = QuestionGenerator.randomInt(3, diff === 'hard' ? 10 : 9);
    const part1 = QuestionGenerator.randomInt(1, total - 1);
    const part2 = total - part1;
    return {
      type: 'partition_balance',
      title: 'Partitioning Master (3-9)',
      prompt: `Split ${total} into two parts:`,
      total: total,
      part1: part1,
      part2: part2,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: part2,
      options: QuestionGenerator.generateChoices(part2, 4, 3)
    };
  }

  // --- YELLOW BELT ---
  static genYellowTenFrame(diff = 'standard') {
    const isVarB = Math.random() > 0.5;
    const count = QuestionGenerator.randomInt(1, diff === 'hard' ? 10 : 9);
    return {
      type: 'ten_frame',
      title: 'Tens Frame Subitising ⚡',
      subtitle: isVarB ? `How many spaces are EMPTY in the frame?` : `How many red counters are filled?`,
      count: count,
      totalCells: 10,
      timeLimitSeconds: diff === 'hard' ? 12 : 16,
      answer: isVarB ? (10 - count) : count,
      options: QuestionGenerator.generateChoices(isVarB ? (10 - count) : count, 4, 3)
    };
  }

  static genYellowDoubles(diff = 'standard') {
    const isVarB = Math.random() > 0.5;
    const n = QuestionGenerator.randomInt(1, diff === 'hard' ? 10 : 8);
    const ans = n * 2;
    return {
      type: 'standard_choice',
      title: 'Doubles Master ⚡',
      prompt: isVarB ? `What is double ${n}?` : `${n} + ${n} = ?`,
      timeLimitSeconds: diff === 'hard' ? 16 : 22,
      answer: ans,
      options: QuestionGenerator.generateChoices(ans, 4, 4)
    };
  }

  static genYellowCounting20(diff = 'standard') {
    const isBackward = Math.random() > 0.5;
    if (!isBackward) {
      const start = QuestionGenerator.randomInt(8, 16);
      const seq = [start, start + 1, start + 2, start + 3];
      const missing = seq[2];
      const display = seq.map((n, i) => i === 2 ? '❓' : n);
      return {
        type: 'standard_choice',
        title: 'Counting 0-20 Master',
        prompt: `What comes next? [ ${display.join(' , ')} ]`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, 3)
      };
    } else {
      const start = QuestionGenerator.randomInt(14, 20);
      const seq = [start, start - 1, start - 2, start - 3];
      const missing = seq[2];
      const display = seq.map((n, i) => i === 2 ? '❓' : n);
      return {
        type: 'standard_choice',
        title: 'Counting 0-20 (Countdown)',
        prompt: `Count backwards: [ ${display.join(' , ')} ]`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, 3)
      };
    }
  }

  static genYellowWriting20(diff = 'standard') {
    const words20 = [
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
    ];
    const num = QuestionGenerator.randomInt(10, 20);
    const mode = Math.random() > 0.5 ? 'num_to_word' : 'word_to_num';
    return {
      type: 'standard_choice',
      title: 'Writing Master (0-20)',
      prompt: mode === 'num_to_word' ? `Which word represents "${num}"?` : `Which digit represents "${words20[num]}"?`,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: mode === 'num_to_word' ? words20[num] : num.toString(),
      options: mode === 'num_to_word'
        ? QuestionGenerator.shuffle(QuestionGenerator.generateChoices(num, 4, 3).filter(n => n >= 0 && n <= 20).map(w => words20[w]))
        : QuestionGenerator.generateChoices(num, 4, 3).map(String)
    };
  }

  static genYellowTensMate(diff = 'standard') {
    const a = QuestionGenerator.randomInt(1, 9);
    const b = 10 - a;
    const isVarB = Math.random() > 0.5;
    return {
      type: 'standard_choice',
      title: 'Tens Mate (Friends of 10) ⚡',
      prompt: isVarB ? `What is the 10s partner for ${a}?` : `${a} + ❓ = 10`,
      timeLimitSeconds: diff === 'hard' ? 16 : 22,
      answer: b,
      options: QuestionGenerator.generateChoices(b, 4, 3)
    };
  }

  static genYellowMoreLess(diff = 'standard') {
    const base = QuestionGenerator.randomInt(4, 18);
    const isMore = Math.random() > 0.5;
    const delta = diff === 'hard' ? QuestionGenerator.randomInt(1, 3) : 1;
    const ans = isMore ? base + delta : base - delta;
    return {
      type: 'standard_choice',
      title: 'More or Less Master',
      prompt: `What number is ${delta} ${isMore ? 'MORE' : 'LESS'} than ${base}?`,
      timeLimitSeconds: diff === 'hard' ? 18 : 24,
      answer: ans,
      options: QuestionGenerator.generateChoices(ans, 4, 3)
    };
  }
  // --- GREEN BELT ---
  static genGreenHalving(diff = 'standard') {
    const half = QuestionGenerator.randomInt(2, diff === 'hard' ? 12 : 10);
    const total = half * 2;
    const isVarB = Math.random() > 0.5;
    return {
      type: 'standard_choice',
      title: 'Halving Master ⚡',
      prompt: isVarB ? `Half of ${total} is ?` : `${total} ÷ 2 = ?`,
      timeLimitSeconds: diff === 'hard' ? 16 : 22,
      answer: half,
      options: QuestionGenerator.generateChoices(half, 4, 3)
    };
  }

  static genGreenAddition(diff = 'standard') {
    const a = QuestionGenerator.randomInt(diff === 'hard' ? 8 : 4, 15);
    const b = QuestionGenerator.randomInt(3, 12);
    const ans = a + b;
    const isVarB = Math.random() > 0.5;
    return {
      type: 'standard_choice',
      title: 'Addition Master ⚡',
      prompt: isVarB ? `${a} + ❓ = ${ans}` : `${a} + ${b} = ?`,
      timeLimitSeconds: diff === 'hard' ? 18 : 24,
      answer: isVarB ? b : ans,
      options: QuestionGenerator.generateChoices(isVarB ? b : ans, 4, 4)
    };
  }

  static genGreenSkipCounting(diff = 'standard') {
    const step = [2, 5, 10][QuestionGenerator.randomInt(0, 2)];
    const isBackward = Math.random() > 0.5 && diff === 'hard';
    if (!isBackward) {
      const start = step * QuestionGenerator.randomInt(1, 4);
      const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
      const missingIdx = QuestionGenerator.randomInt(1, 3);
      const missing = seq[missingIdx];
      const display = seq.map((s, i) => i === missingIdx ? '❓' : s);
      return {
        type: 'standard_choice',
        title: `Skip Counting by ${step}s`,
        prompt: `Sequence: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, step * 2)
      };
    } else {
      const start = step * QuestionGenerator.randomInt(6, 10);
      const seq = [start, start - step, start - step * 2, start - step * 3];
      const missingIdx = 2;
      const missing = seq[missingIdx];
      const display = seq.map((s, i) => i === missingIdx ? '❓' : s);
      return {
        type: 'standard_choice',
        title: `Backwards Skip Counting by ${step}s`,
        prompt: `Sequence: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: missing,
        options: QuestionGenerator.generateChoices(missing, 4, step * 2)
      };
    }
  }

  static genGreenRenaming(diff = 'standard') {
    const tens = QuestionGenerator.randomInt(2, diff === 'hard' ? 9 : 6);
    const ones = QuestionGenerator.randomInt(1, 9);
    const total = tens * 10 + ones;
    const isVarB = Math.random() > 0.5;
    if (!isVarB) {
      return {
        type: 'standard_choice',
        title: 'Renaming Master (Place Value)',
        prompt: `${total} is made of:`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer: `${tens} Tens and ${ones} Ones`,
        options: QuestionGenerator.shuffle([
          `${tens} Tens and ${ones} Ones`,
          `${tens - 1} Tens and ${ones} Ones`,
          `${ones} Tens and ${tens} Ones`,
          `${tens} Tens and ${ones + 2} Ones`
        ])
      };
    } else {
      return {
        type: 'standard_choice',
        title: 'Renaming Master (Expanded Tens)',
        prompt: `${tens}0 + ${ones} = ?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: total,
        options: QuestionGenerator.generateChoices(total, 4, 10)
      };
    }
  }

  static genGreenOrder(diff = 'standard') {
    const set = new Set();
    while (set.size < 4) {
      set.add(QuestionGenerator.randomInt(10, 99));
    }
    const arr = Array.from(set);
    const sorted = [...arr].sort((a, b) => a - b);
    return {
      type: 'order_drag',
      title: 'Order Master',
      prompt: 'Arrange numbers from SMALLEST to LARGEST:',
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      items: QuestionGenerator.shuffle(arr),
      correctOrder: sorted
    };
  }

  static genGreenReadingWriting(diff = 'standard') {
    const number = QuestionGenerator.randomInt(0, 100);
    const words = QuestionGenerator.numberToWords(number);
    const mode = QuestionGenerator.randomInt(0, 2);
    const choices = QuestionGenerator.generateChoicesInRange(number, 0, 100);
    if (mode === 0) {
      return {
        type: 'standard_choice',
        title: 'Reading & Writing Master',
        prompt: `Write ${number} in words:`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer: words,
        options: choices.map(QuestionGenerator.numberToWords)
      };
    }
    if (mode === 1) {
      return {
        type: 'standard_choice',
        title: 'Reading & Writing Master',
        prompt: `Which number is "${words}"?`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer: number,
        options: choices
      };
    }
    const tens = Math.floor(number / 10) * 10;
    const ones = number % 10;
    return {
      type: 'standard_choice',
      title: 'Reading & Writing Master',
      prompt: `${tens} + ${ones} = ?`,
      timeLimitSeconds: diff === 'hard' ? 22 : 30,
      answer: number,
      options: choices
    };
  }

  static genGreen1to10(diff = 'standard') {
    const isAdd = Math.random() > 0.5;
    const a = QuestionGenerator.randomInt(2, 10);
    const b = QuestionGenerator.randomInt(2, 10);
    return {
      type: 'standard_choice',
      title: '1-10 Master ⚡',
      prompt: isAdd ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`,
      timeLimitSeconds: diff === 'hard' ? 14 : 18,
      answer: isAdd ? a + b : Math.max(a, b) - Math.min(a, b),
      options: QuestionGenerator.generateChoices(isAdd ? a + b : Math.max(a, b) - Math.min(a, b), 4, 3)
    };
  }

  // --- BLUE BELT ---
  static genBlueDoubleHalfStrategy(diff = 'standard') {
    const isDouble = Math.random() > 0.5;
    if (isDouble) {
      const n = QuestionGenerator.randomInt(14, diff === 'hard' ? 68 : 45);
      const ans = n * 2;
      return {
        type: 'standard_choice',
        title: 'Doubling Strategy',
        prompt: `Double ${n} = ?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: ans,
        options: QuestionGenerator.generateChoices(ans, 4, 6)
      };
    } else {
      const half = QuestionGenerator.randomInt(12, diff === 'hard' ? 50 : 35);
      const total = half * 2;
      return {
        type: 'standard_choice',
        title: 'Halving Strategy',
        prompt: `Half of ${total} = ?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: half,
        options: QuestionGenerator.generateChoices(half, 4, 6)
      };
    }
  }

  static genBlueFlexibleThinking(diff = 'standard') {
    const a = QuestionGenerator.randomInt(18, diff === 'hard' ? 78 : 48);
    const b = QuestionGenerator.randomInt(14, diff === 'hard' ? 48 : 38);
    const ans = a + b;
    return {
      type: 'standard_choice',
      title: 'Flexible Thinking + Master',
      prompt: `${a} + ${b} = ?`,
      hint: 'Bridge to 10 or split into tens & ones!',
      timeLimitSeconds: diff === 'hard' ? 22 : 30,
      answer: ans,
      options: QuestionGenerator.generateChoices(ans, 4, 8)
    };
  }

  static genBlueFactor(diff = 'standard') {
    const mode = Math.random() > 0.5 ? 'factor' : 'multiple';
    if (mode === 'factor') {
      const targets = [12, 16, 18, 20, 24, 30, 36, 40, 48];
      const target = targets[QuestionGenerator.randomInt(0, targets.length - 1)];
      const factors = [];
      for (let i = 2; i < target; i++) {
        if (target % i === 0) factors.push(i);
      }
      const correct = factors[QuestionGenerator.randomInt(0, factors.length - 1)];
      const nonFactors = [5, 7, 9, 11, 13, 17, 19, 23].filter(n => target % n !== 0);
      return {
        type: 'standard_choice',
        title: 'Factor Master',
        prompt: `Which of these is a FACTOR of ${target}?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: correct,
        options: QuestionGenerator.shuffle([correct, ...QuestionGenerator.shuffle(nonFactors).slice(0, 3)])
      };
    } else {
      const base = QuestionGenerator.randomInt(3, 9);
      const mult = base * QuestionGenerator.randomInt(3, 8);
      const nonMults = [mult - 1, mult + 2, mult + 1].filter(n => n % base !== 0);
      return {
        type: 'standard_choice',
        title: 'Factor Master (Multiples)',
        prompt: `Which number is a MULTIPLE of ${base}?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: mult,
        options: QuestionGenerator.shuffle([mult, ...nonMults.slice(0, 3)])
      };
    }
  }

  static genBluePartitionExpanded(diff = 'standard') {
    const h = QuestionGenerator.randomInt(1, 9);
    const t = QuestionGenerator.randomInt(1, 9);
    const o = QuestionGenerator.randomInt(1, 9);
    const num = h * 100 + t * 10 + o;
    const isVarB = Math.random() > 0.5;
    if (!isVarB) {
      return {
        type: 'standard_choice',
        title: 'Partitioning Master (Hundreds)',
        prompt: `Expand ${num} into Hundreds, Tens, and Ones:`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer: `${h * 100} + ${t * 10} + ${o}`,
        options: QuestionGenerator.shuffle([
          `${h * 100} + ${t * 10} + ${o}`,
          `${h * 100} + ${t} + ${o}`,
          `${h * 10} + ${t * 10} + ${o}`,
          `${h * 100} + ${(t + 1) * 10} + ${o}`
        ])
      };
    } else {
      return {
        type: 'standard_choice',
        title: 'Partitioning Master (Rebuild)',
        prompt: `${h * 100} + ${t * 10} + ${o} = ?`,
        timeLimitSeconds: diff === 'hard' ? 20 : 28,
        answer: num,
        options: QuestionGenerator.generateChoices(num, 4, 15)
      };
    }
  }

  static genBlueSubtraction(diff = 'standard') {
    const a = QuestionGenerator.randomInt(35, diff === 'hard' ? 120 : 85);
    const b = QuestionGenerator.randomInt(12, a - 10);
    const ans = a - b;
    const isVarB = Math.random() > 0.5;
    return {
      type: 'standard_choice',
      title: 'Subtraction Master ⚡',
      prompt: isVarB ? `${a} - ❓ = ${ans}` : `${a} - ${b} = ?`,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: isVarB ? b : ans,
      options: QuestionGenerator.generateChoices(isVarB ? b : ans, 4, 8)
    };
  }

  static genBlueBalancedEquation(diff = 'standard') {
    const a = QuestionGenerator.randomInt(5, 18);
    const b = QuestionGenerator.randomInt(5, 18);
    const leftSum = a + b;
    const c = QuestionGenerator.randomInt(2, leftSum - 1);
    const d = leftSum - c;
    return {
      type: 'balance_scale',
      title: 'Balanced Equation Master',
      prompt: 'Find the missing number to balance both sides:',
      leftA: a,
      leftB: b,
      rightA: c,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer: d,
      options: QuestionGenerator.generateChoices(d, 4, 4)
    };
  }
  // --- BROWN BELT ---
  static genBrownMultiplication(diff = 'standard') {
    const a = QuestionGenerator.randomInt(2, 12);
    const b = QuestionGenerator.randomInt(2, 12);
    const ans = a * b;
    const isVarB = Math.random() > 0.5;
    return {
      type: 'standard_choice',
      title: 'Times Tables Master ⚡',
      prompt: isVarB ? `${a} × ❓ = ${ans}` : `${a} × ${b} = ?`,
      timeLimitSeconds: diff === 'hard' ? 16 : 22,
      answer: isVarB ? b : ans,
      options: QuestionGenerator.generateChoices(isVarB ? b : ans, 4, 6)
    };
  }

  static genBrownArrays(diff = 'standard') {
    const rows = QuestionGenerator.randomInt(2, diff === 'hard' ? 8 : 6);
    const cols = QuestionGenerator.randomInt(2, diff === 'hard' ? 8 : 7);
    const total = rows * cols;
    return {
      type: 'array_grid',
      title: 'Arrays Master',
      prompt: `How many total weapons in this array? (${rows} rows of ${cols})`,
      rows: rows,
      cols: cols,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: total,
      options: QuestionGenerator.generateChoices(total, 4, 5)
    };
  }

  static genBrownFractions(diff = 'standard') {
    const denoms = [2, 3, 4, 6, 8];
    const d = denoms[QuestionGenerator.randomInt(0, denoms.length - 1)];
    const num = QuestionGenerator.randomInt(1, d - 1);
    return {
      type: 'fraction_visual',
      title: 'Fraction Master',
      prompt: 'What fraction of the shape is shaded?',
      numerator: num,
      denominator: d,
      timeLimitSeconds: diff === 'hard' ? 22 : 30,
      answer: `${num}/${d}`,
      options: QuestionGenerator.shuffle([
        `${num}/${d}`,
        `${num + 1 > d ? num - 1 : num + 1}/${d}`,
        `${d - num}/${d}`,
        `${num}/${d === 8 ? 4 : 8}`
      ])
    };
  }

  static genBrownMultiplicative(diff = 'standard') {
    const names = ['Kai', 'Nya', 'Zane', 'Lloyd', 'Jay', 'Cole'];
    const n1 = names[QuestionGenerator.randomInt(0, 2)];
    const n2 = names[QuestionGenerator.randomInt(3, 5)];
    const base = QuestionGenerator.randomInt(3, 9);
    const factor = QuestionGenerator.randomInt(2, diff === 'hard' ? 7 : 5);
    const ans = base * factor;
    return {
      type: 'standard_choice',
      title: 'Multiplicative Master',
      prompt: `${n1} has ${base} stars. ${n2} has ${factor} TIMES as many as ${n1}. How many stars does ${n2} have?`,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer: ans,
      options: QuestionGenerator.generateChoices(ans, 4, 6)
    };
  }

  static genBrownCounting(diff = 'standard') {
    const steps = [3, 4, 6, 7, 8, 9];
    const step = steps[QuestionGenerator.randomInt(0, steps.length - 1)];
    const countDown = Math.random() > 0.5;
    const start = step * QuestionGenerator.randomInt(countDown ? 6 : 1, countDown ? 15 : 12);
    const sequence = Array.from({ length: 5 }, (_, index) => start + index * step * (countDown ? -1 : 1));
    const missingIndex = QuestionGenerator.randomInt(1, 3);
    const answer = sequence[missingIndex];
    const display = sequence.map((number, index) => index === missingIndex ? '❓' : number);
    return {
      type: 'standard_choice',
      title: 'Skip Counting Master',
      prompt: `Count ${countDown ? 'backwards' : 'forwards'} by ${step}s: ${display.join(' , ')}`,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer,
      options: QuestionGenerator.generateChoices(answer, 4, step * 2)
    };
  }

  static genBrownOrder(diff = 'standard') {
    const set = new Set();
    while (set.size < 4) {
      set.add(QuestionGenerator.randomInt(1000, 9999));
    }
    const arr = Array.from(set);
    const sorted = [...arr].sort((a, b) => a - b);
    return {
      type: 'order_drag',
      title: 'Order Master (Thousands)',
      prompt: 'Arrange numbers from SMALLEST to LARGEST:',
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      items: QuestionGenerator.shuffle(arr),
      correctOrder: sorted
    };
  }

  static genBrownReadWrite(diff = 'standard') {
    const number = QuestionGenerator.randomInt(1000, 10000);
    const words = QuestionGenerator.numberToWords(number);
    const choices = QuestionGenerator.generateChoicesInRange(number, 1000, 10000);
    const mode = QuestionGenerator.randomInt(0, 2);
    if (mode === 0) {
      return {
        type: 'standard_choice',
        title: 'Read and Write Master',
        prompt: `Write ${number.toLocaleString('en-GB')} in words:`,
        timeLimitSeconds: diff === 'hard' ? 24 : 32,
        answer: words,
        options: choices.map(QuestionGenerator.numberToWords)
      };
    }
    if (mode === 1) {
      return {
        type: 'standard_choice',
        title: 'Read and Write Master',
        prompt: `Which number is "${words}"?`,
        timeLimitSeconds: diff === 'hard' ? 24 : 32,
        answer: number,
        options: choices
      };
    }
    const thousands = Math.floor(number / 1000) * 1000;
    const hundreds = Math.floor((number % 1000) / 100) * 100;
    const tens = Math.floor((number % 100) / 10) * 10;
    const ones = number % 10;
    return {
      type: 'standard_choice',
      title: 'Read and Write Master',
      prompt: `${thousands} + ${hundreds} + ${tens} + ${ones} = ?`,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer: number,
      options: choices
    };
  }

  static genBrownRenaming(diff = 'standard') {
    const number = QuestionGenerator.randomInt(1000, 10000);
    const values = QuestionGenerator.generateChoicesInRange(number, 1000, 10000);
    const formatExpanded = value => {
      const thousands = Math.floor(value / 1000) * 1000;
      const hundreds = Math.floor((value % 1000) / 100) * 100;
      const tens = Math.floor((value % 100) / 10) * 10;
      return `${thousands} + ${hundreds} + ${tens} + ${value % 10}`;
    };
    const formatPlaceValue = value => {
      const thousands = Math.floor(value / 1000);
      const hundreds = Math.floor((value % 1000) / 100);
      const tens = Math.floor((value % 100) / 10);
      return `${thousands} thousands, ${hundreds} hundreds, ${tens} tens and ${value % 10} ones`;
    };
    const formatHundreds = value =>
      `${Math.floor(value / 100)} hundreds, ${Math.floor((value % 100) / 10)} tens and ${value % 10} ones`;
    const mode = QuestionGenerator.randomInt(0, 2);
    const formatter = [formatExpanded, formatPlaceValue, formatHundreds][mode];
    return {
      type: 'standard_choice',
      title: 'Renaming Master (Thousands)',
      prompt: mode === 0
        ? `Expand ${number.toLocaleString('en-GB')}:`
        : mode === 1
        ? `Rename ${number.toLocaleString('en-GB')} using place values:`
        : `Rename ${number.toLocaleString('en-GB')} using hundreds:`,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer: formatter(number),
      options: values.map(formatter)
    };
  }

  // --- BLACK BELT ---
  static genBlackCounting(diff = 'standard') {
    const mode = QuestionGenerator.randomInt(0, 2);
    if (mode === 0) {
      const start = QuestionGenerator.randomInt(-30, 20);
      const step = QuestionGenerator.randomInt(1, 2);
      const sequence = Array.from({ length: 4 }, (_, index) => start + index * step);
      const missingIndex = QuestionGenerator.randomInt(1, 2);
      const answer = Number((sequence[missingIndex] / 10).toFixed(1));
      const display = sequence.map((value, index) =>
        index === missingIndex ? '❓' : (value / 10).toFixed(1));
      return {
        type: 'standard_choice',
        title: 'Counting Master (Decimals)',
        prompt: `Count forwards by ${(step / 10).toFixed(1)}: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer,
        options: QuestionGenerator.generateChoices(answer, 4, 3, true)
      };
    }
    if (mode === 1) {
      const start = QuestionGenerator.randomInt(-3, -1);
      const sequence = Array.from({ length: 4 }, (_, index) => start + index);
      const missingIndex = QuestionGenerator.randomInt(1, 2);
      const answer = sequence[missingIndex];
      const display = sequence.map((value, index) => index === missingIndex ? '❓' : value);
      return {
        type: 'standard_choice',
        title: 'Counting Master (Negative Numbers)',
        prompt: `Count through zero: ${display.join(' , ')}`,
        timeLimitSeconds: diff === 'hard' ? 22 : 30,
        answer,
        options: QuestionGenerator.generateChoices(answer, 4, 3, true)
      };
    }
    const denominator = [2, 3, 4, 5, 8][QuestionGenerator.randomInt(0, 4)];
    const start = QuestionGenerator.randomInt(denominator, denominator * 3 - 3);
    const sequence = Array.from({ length: 4 }, (_, index) => start + index);
    const missingIndex = QuestionGenerator.randomInt(1, 2);
    const answer = sequence[missingIndex];
    const display = sequence.map((value, index) =>
      index === missingIndex ? '❓' : QuestionGenerator.formatFraction(value, denominator));
    return {
      type: 'standard_choice',
      title: 'Counting Master (Mixed Fractions)',
      prompt: `Count in ${QuestionGenerator.formatFraction(1, denominator)}s: ${display.join(' , ')}`,
      timeLimitSeconds: diff === 'hard' ? 22 : 30,
      answer: QuestionGenerator.formatFraction(answer, denominator),
      options: QuestionGenerator.generateFractionChoices(answer, denominator)
    };
  }

  static genBlackMultiplication(diff = 'standard') {
    const a = QuestionGenerator.randomInt(12, diff === 'hard' ? 99 : 60);
    const b = QuestionGenerator.randomInt(2, 12);
    const product = a * b;
    const findFactor = Math.random() > 0.5;
    const answer = findFactor ? b : product;
    return {
      type: 'standard_choice',
      title: 'Multi-digit Multiplication Master',
      prompt: findFactor ? `${a} × ❓ = ${product}` : `${a} × ${b} = ?`,
      timeLimitSeconds: diff === 'hard' ? 20 : 24,
      answer,
      options: findFactor
        ? QuestionGenerator.generateChoicesInRange(answer, 2, 12)
        : QuestionGenerator.generateChoices(answer, 4, 12)
    };
  }

  static genBlackMentalMultistep(diff = 'standard') {
    const a = QuestionGenerator.randomInt(3, diff === 'hard' ? 12 : 9);
    const b = QuestionGenerator.randomInt(4, diff === 'hard' ? 12 : 8);
    const c = QuestionGenerator.randomInt(5, 30);
    const isAdd = Math.random() > 0.5;
    const ans = isAdd ? (a * b) + c : (a * b) - c;
    return {
      type: 'standard_choice',
      title: 'Mental Master (Multi-Step) ⚡',
      prompt: `(${a} × ${b}) ${isAdd ? '+' : '-'} ${c} = ?`,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: ans,
      options: QuestionGenerator.generateChoices(ans, 4, 10)
    };
  }

  static genBlackDecimalOrder(diff = 'standard') {
    const decimals = [
      Number((Math.random() * 2).toFixed(2)),
      Number((Math.random() * 2).toFixed(2)),
      Number((Math.random() * 2).toFixed(2)),
      Number((Math.random() * 2).toFixed(2))
    ];
    const unique = Array.from(new Set(decimals));
    while (unique.length < 4) {
      unique.push(Number((Math.random() * 2).toFixed(2)));
    }
    const sorted = [...unique].sort((a, b) => a - b);
    return {
      type: 'order_drag',
      title: 'Decimal Order Master',
      prompt: 'Arrange decimals from SMALLEST to LARGEST:',
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      items: QuestionGenerator.shuffle(unique),
      correctOrder: sorted
    };
  }

  static genBlackEquivalence(diff = 'standard') {
    const pairs = [
      { frac: '1/2', dec: '0.5', pct: '50%' },
      { frac: '1/4', dec: '0.25', pct: '25%' },
      { frac: '3/4', dec: '0.75', pct: '75%' },
      { frac: '1/10', dec: '0.1', pct: '10%' },
      { frac: '1/5', dec: '0.2', pct: '20%' },
      { frac: '2/5', dec: '0.4', pct: '40%' },
      { frac: '3/5', dec: '0.6', pct: '60%' },
      { frac: '4/5', dec: '0.8', pct: '80%' },
      { frac: '7/10', dec: '0.7', pct: '70%' }
    ];
    const pair = pairs[QuestionGenerator.randomInt(0, pairs.length - 1)];
    const mode = QuestionGenerator.randomInt(0, 2);
    return {
      type: 'standard_choice',
      title: 'Renaming Master (Equivalence) ⚡',
      prompt: mode === 0 ? `Convert ${pair.frac} to a decimal:` : mode === 1 ? `Convert ${pair.dec} to a percentage:` : `Which fraction equals ${pair.pct}?`,
      timeLimitSeconds: diff === 'hard' ? 20 : 28,
      answer: mode === 0 ? pair.dec : mode === 1 ? pair.pct : pair.frac,
      options: mode === 0
        ? QuestionGenerator.shuffle([pair.dec, ...QuestionGenerator.shuffle(pairs.filter(p => p.dec !== pair.dec).map(p => p.dec)).slice(0, 3)])
        : mode === 1
        ? QuestionGenerator.shuffle([pair.pct, ...QuestionGenerator.shuffle(pairs.filter(p => p.pct !== pair.pct).map(p => p.pct)).slice(0, 3)])
        : QuestionGenerator.shuffle([pair.frac, ...QuestionGenerator.shuffle(pairs.filter(p => p.frac !== pair.frac).map(p => p.frac)).slice(0, 3)])
    };
  }

  static genBlackFractionOrder(diff = 'standard') {
    const fractions = [];
    for (let denominator = 2; denominator <= 12; denominator++) {
      for (let numerator = 1; numerator < denominator; numerator++) {
        const divisor = QuestionGenerator.greatestCommonDivisor(numerator, denominator);
        const fraction = `${numerator / divisor}/${denominator / divisor}`;
        if (!fractions.some(item => item.label === fraction)) {
          fractions.push({ label: fraction, value: numerator / denominator });
        }
      }
    }
    const choices = QuestionGenerator.shuffle(fractions).slice(0, 4);
    const findGreatest = Math.random() > 0.5;
    const correct = choices.reduce((best, item) =>
      findGreatest ? (item.value > best.value ? item : best) : (item.value < best.value ? item : best));
    return {
      type: 'standard_choice',
      title: 'Fraction Order Master',
      prompt: `Which fraction is ${findGreatest ? 'greatest' : 'smallest'}?`,
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      answer: correct.label,
      options: QuestionGenerator.shuffle(choices.map(item => item.label))
    };
  }

  static genBlackMultiplicative(diff = 'standard') {
    const mode = QuestionGenerator.randomInt(0, 2);
    let prompt;
    let answer;
    if (mode === 0) {
      const perHour = QuestionGenerator.randomInt(4, 18);
      const hours = QuestionGenerator.randomInt(2, 8);
      prompt = `A runner covers ${perHour} km each hour. How far in ${hours} hours?`;
      answer = perHour * hours;
    } else if (mode === 1) {
      const scale = QuestionGenerator.randomInt(2, 12);
      const mapLength = QuestionGenerator.randomInt(2, 9);
      prompt = `A map uses 1 cm for ${scale} km. What distance does ${mapLength} cm represent?`;
      answer = scale * mapLength;
    } else {
      const red = QuestionGenerator.randomInt(2, 9);
      const blue = QuestionGenerator.randomInt(2, 9);
      const multiplier = QuestionGenerator.randomInt(2, 6);
      prompt = `The ratio of red to blue beads is ${red}:${blue}. If there are ${red * multiplier} red beads, how many are blue?`;
      answer = blue * multiplier;
    }
    return {
      type: 'standard_choice',
      title: 'Rates, Ratios & Proportions Master',
      prompt,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer,
      options: QuestionGenerator.generateChoices(answer, 4, 8)
    };
  }

  // --- PLATINUM BELT ---
  static genPlatinumBODMAS(diff = 'standard') {
    const templates = [
      () => {
        const a = QuestionGenerator.randomInt(2, 6);
        const b = QuestionGenerator.randomInt(3, 6);
        const c = QuestionGenerator.randomInt(4, 12);
        return { expr: `${c} + ${a} × ${b}`, ans: c + a * b };
      },
      () => {
        const a = QuestionGenerator.randomInt(3, 8);
        const b = QuestionGenerator.randomInt(2, 5);
        const c = QuestionGenerator.randomInt(2, 4);
        return { expr: `(${a} + ${b}) × ${c}`, ans: (a + b) * c };
      },
      () => {
        const a = QuestionGenerator.randomInt(20, 40);
        const b = QuestionGenerator.randomInt(2, 5);
        const c = QuestionGenerator.randomInt(3, 6);
        return { expr: `${a} - ${b} × ${c}`, ans: a - b * c };
      }
    ];
    const item = templates[QuestionGenerator.randomInt(0, templates.length - 1)]();
    return {
      type: 'standard_choice',
      title: 'BODMAS Master (Order of Operations)',
      prompt: `${item.expr} = ?`,
      hint: 'Brackets, then × and ÷, then + and -',
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      answer: item.ans,
      options: QuestionGenerator.generateChoices(item.ans, 4, 8)
    };
  }

  static genPlatinumConversions(diff = 'standard') {
    const conversions = [
      { fromVal: 3.5, fromUnit: 'km', toVal: 3500, toUnit: 'm' },
      { fromVal: 450, fromUnit: 'cm', toVal: 4.5, toUnit: 'm' },
      { fromVal: 2.4, fromUnit: 'kg', toVal: 2400, toUnit: 'g' },
      { fromVal: 1500, fromUnit: 'mL', toVal: 1.5, toUnit: 'L' },
      { fromVal: 2.5, fromUnit: 'hours', toVal: 150, toUnit: 'minutes' },
      { fromVal: 75, fromUnit: 'mm', toVal: 7.5, toUnit: 'cm' }
    ];
    const c = conversions[QuestionGenerator.randomInt(0, conversions.length - 1)];
    return {
      type: 'standard_choice',
      title: 'Conversion Master',
      prompt: `Convert ${c.fromVal} ${c.fromUnit} into ${c.toUnit}:`,
      timeLimitSeconds: diff === 'hard' ? 22 : 32,
      answer: `${c.toVal} ${c.toUnit}`,
      options: QuestionGenerator.shuffle([
        `${c.toVal} ${c.toUnit}`,
        `${c.toVal * 10} ${c.toUnit}`,
        `${c.toVal / 10} ${c.toUnit}`,
        `${c.toVal + 50} ${c.toUnit}`
      ])
    };
  }

  static genPlatinumDivision(diff = 'standard') {
    const divisor = QuestionGenerator.randomInt(3, 9);
    const quotient = QuestionGenerator.randomInt(4, 15);
    const rem = QuestionGenerator.randomInt(1, divisor - 1);
    const dividend = divisor * quotient + rem;
    return {
      type: 'standard_choice',
      title: 'Division Master (Remainders)',
      prompt: `${dividend} ÷ ${divisor} = ?`,
      timeLimitSeconds: diff === 'hard' ? 24 : 32,
      answer: `${quotient} r ${rem}`,
      options: QuestionGenerator.shuffle([
        `${quotient} r ${rem}`,
        `${quotient + 1} r ${rem}`,
        `${quotient} r ${rem === 1 ? 2 : 1}`,
        `${quotient - 1} r ${rem}`
      ])
    };
  }

  static genPlatinumDecimal(diff = 'standard') {
    const isMultiplication = Math.random() > 0.5;
    let prompt;
    let answer;
    if (isMultiplication) {
      const decimal = QuestionGenerator.randomInt(2, 99) / 10;
      const factor = QuestionGenerator.randomInt(2, 9);
      answer = Number((decimal * factor).toFixed(2));
      prompt = `${decimal.toFixed(1)} × ${factor} = ?`;
    } else {
      const divisor = QuestionGenerator.randomInt(2, 40) / 10;
      const quotient = QuestionGenerator.randomInt(2, 20);
      const dividend = Number((divisor * quotient).toFixed(2));
      answer = quotient;
      prompt = `${dividend} ÷ ${divisor.toFixed(1)} = ?`;
    }
    return {
      type: 'standard_choice',
      title: 'Decimal Operations Master',
      prompt,
      timeLimitSeconds: diff === 'hard' ? 22 : 32,
      answer,
      options: QuestionGenerator.generateChoices(answer, 4, 8)
    };
  }

  static genPlatinumFraction(diff = 'standard') {
    const mode = QuestionGenerator.randomInt(0, 3);
    let prompt;
    let numerator;
    let denominator;
    if (mode === 0) {
      denominator = QuestionGenerator.randomInt(3, 12);
      const first = QuestionGenerator.randomInt(1, denominator - 1);
      const second = QuestionGenerator.randomInt(1, denominator - 1);
      prompt = `${first}/${denominator} + ${second}/${denominator} = ?`;
      numerator = first + second;
    } else if (mode === 1) {
      denominator = QuestionGenerator.randomInt(3, 12);
      const first = QuestionGenerator.randomInt(2, denominator - 1);
      const second = QuestionGenerator.randomInt(1, first - 1);
      prompt = `${first}/${denominator} - ${second}/${denominator} = ?`;
      numerator = first - second;
    } else if (mode === 2) {
      const firstDenominator = QuestionGenerator.randomInt(2, 12);
      const secondDenominator = QuestionGenerator.randomInt(2, 12);
      const first = QuestionGenerator.randomInt(1, firstDenominator - 1);
      const second = QuestionGenerator.randomInt(1, secondDenominator - 1);
      prompt = `${first}/${firstDenominator} × ${second}/${secondDenominator} = ?`;
      numerator = first * second;
      denominator = firstDenominator * secondDenominator;
    } else {
      denominator = QuestionGenerator.randomInt(2, 12);
      const whole = QuestionGenerator.randomInt(1, 3);
      const numeratorPart = QuestionGenerator.randomInt(1, denominator - 1);
      const factor = QuestionGenerator.randomInt(2, 5);
      prompt = `${whole} ${numeratorPart}/${denominator} × ${factor} = ?`;
      numerator = (whole * denominator + numeratorPart) * factor;
    }
    return {
      type: 'standard_choice',
      title: 'Fraction Operations Master',
      prompt,
      timeLimitSeconds: diff === 'hard' ? 26 : 36,
      answer: QuestionGenerator.formatFraction(numerator, denominator),
      options: QuestionGenerator.generateFractionChoices(numerator, denominator)
    };
  }

  static genPlatinumProblemSolving(diff = 'standard') {
    const problems = [
      {
        q: "A ninja dojo has 8 training teams. Each team has 6 ninjas. If 15 ninjas graduate today, how many ninjas remain in training?",
        ans: 8 * 6 - 15
      },
      {
        q: "Sensie has 48 shurikens to share equally among 6 student belts. If Kai receives his share and gives 3 to his brother, how many does Kai have left?",
        ans: (48 / 6) - 3
      },
      {
        q: "A ninja scroll costs $4.50 and a belt patch costs $2.50. You buy 2 scrolls and 1 patch and pay with a $20 note. How much change do you receive?",
        ans: 20 - (2 * 4.5 + 2.5)
      }
    ];
    const p = problems[QuestionGenerator.randomInt(0, problems.length - 1)];
    return {
      type: 'standard_choice',
      title: 'Problem Solving Master',
      prompt: p.q,
      timeLimitSeconds: diff === 'hard' ? 44 : 56,
      answer: typeof p.ans === 'number' && !Number.isInteger(p.ans) ? `$${p.ans.toFixed(2)}` : p.ans,
      options: QuestionGenerator.generateChoices(p.ans, 4, 5).map(val =>
        typeof p.ans === 'string' || (typeof p.ans === 'number' && !Number.isInteger(p.ans)) ? `$${Number(val).toFixed(2)}` : val
      )
    };
  }

  static genPlatinumChallenge(diff = 'standard') {
    const generators = [
      QuestionGenerator.genPlatinumBODMAS,
      QuestionGenerator.genPlatinumConversions,
      QuestionGenerator.genPlatinumDivision,
      QuestionGenerator.genPlatinumProblemSolving,
      QuestionGenerator.genPlatinumFraction,
      QuestionGenerator.genPlatinumDecimal
    ];
    const generator = generators[QuestionGenerator.randomInt(0, generators.length - 1)];
    const question = generator.call(QuestionGenerator, diff);
    question.title = 'Grand Master Challenge';
    return question;
  }

  // --- DISPATCHER ---
  static getQuestionForSkill(skillId, diff = 'standard') {
    switch (skillId) {
      case 'white_subitising': return QuestionGenerator.genWhiteSubitise(diff);
      case 'white_counting_10': return QuestionGenerator.genWhiteCounting(diff);
      case 'white_recognition': return QuestionGenerator.genWhiteRecognition(diff);
      case 'white_writing_10': return QuestionGenerator.genWhiteWriting(diff);
      case 'white_partitioning': return QuestionGenerator.genWhitePartition(diff);

      case 'yellow_subitising': return QuestionGenerator.genYellowTenFrame(diff);
      case 'yellow_doubles': return QuestionGenerator.genYellowDoubles(diff);
      case 'yellow_counting_20': return QuestionGenerator.genYellowCounting20(diff);
      case 'yellow_writing_20': return QuestionGenerator.genYellowWriting20(diff);
      case 'yellow_tens_mate': return QuestionGenerator.genYellowTensMate(diff);
      case 'yellow_more_less': return QuestionGenerator.genYellowMoreLess(diff);

      case 'green_halving': return QuestionGenerator.genGreenHalving(diff);
      case 'green_addition': return QuestionGenerator.genGreenAddition(diff);
      case 'green_counting': return QuestionGenerator.genGreenSkipCounting(diff);
      case 'green_reading_writing': return QuestionGenerator.genGreenReadingWriting(diff);
      case 'green_renaming': return QuestionGenerator.genGreenRenaming(diff);
      case 'green_order': return QuestionGenerator.genGreenOrder(diff);
      case 'green_1_10': return QuestionGenerator.genGreen1to10(diff);

      case 'blue_doubling_halving': return QuestionGenerator.genBlueDoubleHalfStrategy(diff);
      case 'blue_flexible_thinking': return QuestionGenerator.genBlueFlexibleThinking(diff);
      case 'blue_factor': return QuestionGenerator.genBlueFactor(diff);
      case 'blue_partitioning': return QuestionGenerator.genBluePartitionExpanded(diff);
      case 'blue_subtraction': return QuestionGenerator.genBlueSubtraction(diff);
      case 'blue_balanced_equation': return QuestionGenerator.genBlueBalancedEquation(diff);

      case 'brown_order': return QuestionGenerator.genBrownOrder(diff);
      case 'brown_multiplication': return QuestionGenerator.genBrownMultiplication(diff);
      case 'brown_arrays': return QuestionGenerator.genBrownArrays(diff);
      case 'brown_counting': return QuestionGenerator.genBrownCounting(diff);
      case 'brown_multiplicative': return QuestionGenerator.genBrownMultiplicative(diff);
      case 'brown_fraction': return QuestionGenerator.genBrownFractions(diff);
      case 'brown_read_write': return QuestionGenerator.genBrownReadWrite(diff);
      case 'brown_renaming': return QuestionGenerator.genBrownRenaming(diff);

      case 'black_counting': return QuestionGenerator.genBlackCounting(diff);
      case 'black_multiplication': return QuestionGenerator.genBlackMultiplication(diff);
      case 'black_mental': return QuestionGenerator.genBlackMentalMultistep(diff);
      case 'black_decimal_order': return QuestionGenerator.genBlackDecimalOrder(diff);
      case 'black_renaming': return QuestionGenerator.genBlackEquivalence(diff);
      case 'black_fraction_order': return QuestionGenerator.genBlackFractionOrder(diff);
      case 'black_multiplicative': return QuestionGenerator.genBlackMultiplicative(diff);

      case 'platinum_division': return QuestionGenerator.genPlatinumDivision(diff);
      case 'platinum_bodmas': return QuestionGenerator.genPlatinumBODMAS(diff);
      case 'platinum_problem_solving': return QuestionGenerator.genPlatinumProblemSolving(diff);
      case 'platinum_conversion': return QuestionGenerator.genPlatinumConversions(diff);
      case 'platinum_fraction': return QuestionGenerator.genPlatinumFraction(diff);
      case 'platinum_decimal': return QuestionGenerator.genPlatinumDecimal(diff);
      case 'platinum_challenge': return QuestionGenerator.genPlatinumChallenge(diff);

      default: return QuestionGenerator.genWhiteSubitise(diff);
    }
  }

  static isValidQuestion(question) {
    if (!question || typeof question !== 'object' || !Number.isFinite(question.timeLimitSeconds) || question.timeLimitSeconds <= 0) {
      return false;
    }
    if (question.type === 'order_drag') {
      return Array.isArray(question.correctOrder) && question.correctOrder.length > 1 &&
        Array.isArray(question.items) && question.items.length === question.correctOrder.length;
    }
    return question.answer !== undefined && Array.isArray(question.options) && question.options.length > 0 &&
      question.options.some(option => String(option).trim().toLowerCase() === String(question.answer).trim().toLowerCase());
  }

  static generateRandomBeltQuestion(beltId, diff = 'standard', previousSkillId = null) {
    const belt = BELTS_DATA.find(item => item.id === beltId);
    if (!belt) return null;
    const skills = belt.skills.length > 1
      ? belt.skills.filter(skill => skill.id !== previousSkillId)
      : belt.skills;
    for (let attempt = 0; attempt < 30; attempt++) {
      const skill = skills[QuestionGenerator.randomInt(0, skills.length - 1)];
      const question = QuestionGenerator.getQuestionForSkill(skill.id, diff);
      if (!QuestionGenerator.isValidQuestion(question)) continue;
      question.skillId = skill.id;
      question.skillName = skill.name;
      question.beltName = belt.name;
      return question;
    }
    return null;
  }

  static generateBeltTest(beltId, diff = 'standard', total = diff === 'hard' ? 12 : 10) {
    const belt = BELTS_DATA.find(b => b.id === beltId);
    if (!belt) return [];
    const questions = [];
    const skills = belt.skills;
    const unique = QuestionGenerator.generateUniqueQuestions(() => {
      const skill = skills[QuestionGenerator.randomInt(0, skills.length - 1)];
      const q = QuestionGenerator.getQuestionForSkill(skill.id, diff);
      q.skillName = skill.name;
      q.beltName = belt.name;
      q.testDifficulty = diff;
      return q;
    }, total);
    return QuestionGenerator.shuffle(unique);
  }

  static generateUniqueQuestions(factory, count) {
    const questions = [];
    const seen = new Set();
    let attempts = 0;
    while (questions.length < count && attempts < count * 30) {
      attempts++;
      const q = factory();
      const key = [q.type, q.layout || '', q.prompt || q.title || '', q.subtitle || '', q.answer, q.targetNumber, q.count, q.rows, q.cols,
        q.items?.join(','), q.correctOrder?.join(','), q.leftA, q.leftB, q.rightA, q.numerator, q.denominator].join('|').toLowerCase();
      if (!seen.has(key)) { seen.add(key); questions.push(q); }
    }
    return questions;
  }
}

window.QuestionGenerator = QuestionGenerator;
