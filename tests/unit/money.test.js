const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts, loadActivityEngine } = require('../helpers/load-browser-scripts');

function loadMoneyMasters() {
  const context = createBrowserContext({ App: class App {} });
  context.ProfileManager = { getSubjectDifficulty: () => 'medium' };
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  return context.MoneyMasters;
}

test('money games generate valid questions for every difficulty', () => {
  const money = loadMoneyMasters();

  for (const activity of money.ACTIVITIES) {
    for (const difficulty of ['easy', 'medium', 'hard']) {
      for (let index = 0; index < 20; index++) {
        const question = money.generateQuestion(activity.id, difficulty);
        assert.ok(question);

        if (activity.id === 'coin-recognition') {
          assert.ok(question.options.some(option => option.value === question.answer));
          assert.equal(new Set(question.options.map(option => option.value)).size, 4);
          assert.ok(question.options.every(option => money.getDenominations(difficulty).some(item => item.value === option.value)));
        } else if (activity.id === 'build-total') {
          assert.ok(question.target > 0);
          assert.equal(question.target % 5, 0);
          assert.ok(question.denominations.some(item => item.value === 5));
          assert.ok(question.denominations.every(item => money.getDenominations(difficulty).some(coin => coin.value === item.value)));
        } else if (activity.id === 'give-change') {
          assert.equal(question.price + question.answer, question.payment);
          assert.equal(question.price % 5, 0);
          assert.equal(question.answer % 5, 0);
          assert.equal(question.options.length, 4);
          assert.equal(new Set(question.options).size, 4);
          assert.ok(question.options.includes(question.answer));
          assert.ok(question.options.every(option => option >= 0));
          assert.ok(question.prompt.includes(money.formatMoney(question.price)));
        } else {
          assert.ok(question.items.length >= 1 && question.items.length <= 3);
          assert.ok(question.items.every(item => Number.isInteger(item.price) && item.price > 0 && item.price % 5 === 0));
          assert.equal(question.total, question.items.reduce((sum, item) => sum + item.price, 0));
          assert.equal(question.payment - question.total, question.change);
          assert.equal(question.change, question.answer);
          assert.equal(question.change, question.target);
          assert.ok(question.denominations.every(item => money.getDenominations(difficulty).some(allowed => allowed.value === item.value)));
        }
      }
    }
  }
});

test('Shopkeeper transactions support exact tender and validate integer-cent totals', () => {
  const money = loadMoneyMasters();
  const question = money.createShopkeeperQuestion([
    { name: 'Apple', price: 125 },
    { name: 'Pear', price: 75 }
  ], 200, 'easy');

  assert.equal(question.total, 200);
  assert.equal(question.payment, 200);
  assert.equal(question.change, 0);
  assert.equal(question.answer, 0);
  assert.equal(question.target, 0);
  assert.ok(question.denominations.every(item => item.value <= 50));
  assert.throws(() => money.createShopkeeperQuestion([{ name: 'Apple', price: 25 }], 24, 'easy'), /5-cent increments/);
  assert.throws(() => money.createShopkeeperQuestion([{ name: 'Apple', price: 25 }], 20, 'easy'), /must cover the basket total/);
  assert.throws(() => money.createShopkeeperQuestion([{ name: 'Apple', price: 27 }], 30, 'easy'), /5-cent increments/);
});

test('Australian denominations progress from coins to notes and larger amounts', () => {
  const money = loadMoneyMasters();

  assert.deepEqual(
    Array.from(money.DENOMINATIONS, ({ value, label, type }) => [value, label, type]),
    [
      [5, '5c', 'coin'],
      [10, '10c', 'coin'],
      [20, '20c', 'coin'],
      [50, '50c', 'coin'],
      [100, '$1', 'coin'],
      [200, '$2', 'coin'],
      [500, '$5', 'note'],
      [1000, '$10', 'note'],
      [2000, '$20', 'note'],
      [5000, '$50', 'note'],
      [10000, '$100', 'note']
    ]
  );
  assert.ok(money.getDenominations('easy').every(item => item.type === 'coin' && item.value <= 50));
  assert.ok(money.getDenominations('medium').some(item => item.value === 200));
  assert.ok(money.getDenominations('medium').every(item => item.type === 'coin'));
  assert.ok(money.getDenominations('hard').some(item => item.type === 'note'));
  assert.equal(money.getDenominations('hard').at(-1).value, 10000);
  assert.ok(money.DENOMINATIONS.every(item => item.value % 5 === 0));
  assert.equal(money.generateQuestion('unknown-activity'), null);
});

test('Australian currency visuals show the correct coin shapes, finishes, and note colours', () => {
  const money = loadMoneyMasters();
  const fiftyCentCoin = money.DENOMINATIONS.find(item => item.value === 50);
  const oneDollarCoin = money.DENOMINATIONS.find(item => item.value === 100);
  const fiveDollarNote = money.DENOMINATIONS.find(item => item.value === 500);

  assert.deepEqual(
    [fiftyCentCoin.shape, fiftyCentCoin.colour, oneDollarCoin.colour, fiveDollarNote.colour],
    ['dodecagon', 'silver', 'gold', 'pink']
  );
  assert.match(money.renderDenomination(fiftyCentCoin), /money-currency--dodecagon/);
  assert.match(money.renderDenomination(oneDollarCoin), /money-currency--gold/);
  assert.match(money.renderDenomination(fiveDollarNote), /money-currency--pink/);

  const amount = money.renderMoneyAmount(1050, true);
  assert.match(amount, /money-currency--blue/);
  assert.match(amount, /money-currency--dodecagon/);
  assert.match(amount, /\$10/);
  assert.match(amount, /50c/);
  assert.throws(() => money.renderMoneyAmount(101), /5-cent increments/);
});

test('money values are formatted in cents and Australian dollars', () => {
  const money = loadMoneyMasters();

  assert.equal(money.formatMoney(75), '75c');
  assert.equal(money.formatMoney(100), '$1.00');
  assert.equal(money.formatMoney(125), '$1.25');
});

test('money rounds delegate answers and completion to ActivityEngine', () => {
  const context = createBrowserContext({
    App: class App {},
    document: { getElementById: () => null },
    ProfileManager: {
      getSubjectDifficulty: () => 'medium',
      recordActivityScore() {}
    }
  });
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  const app = new context.App();

  app.startMoneyGame('coin-recognition', 'easy');
  for (let index = 0; index < app.moneyGame.questions.length; index++) {
    app.answerMoneyQuestion(app.moneyGame.questions[index].answer);
    app.nextMoneyQuestion();
  }

  assert.equal(app.moneyActivityEngine.status, 'complete');
  assert.equal(app.moneyActivityEngine.score, 6);
  assert.equal(app.moneyGame.index, 6);
});

test('money games use the profile tier by default and honor an explicit difficulty choice', () => {
  const context = createBrowserContext({
    App: class App {},
    ProfileManager: { getSubjectDifficulty: subject => subject === 'maths' ? 'hard' : 'easy' },
    document: { getElementById: () => null }
  });
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  const app = new context.App();

  app.startMoneyGame('coin-recognition');
  assert.equal(app.moneyGame.difficulty, 'hard');

  app.startMoneyGame('coin-recognition', 'easy');
  assert.equal(app.moneyGame.difficulty, 'easy');
});

test('money feedback explains the strategy and allows another attempt', () => {
  const main = { innerHTML: '', dataset: {} };
  const arena = { innerHTML: '' };
  const context = createBrowserContext({
    App: class App {},
    ProfileManager: { getSubjectDifficulty: () => 'medium' },
    document: {
      getElementById: id => id === 'app-main' ? main : id === 'money-arena' ? arena : null
    }
  });
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  const app = new context.App();

  app.startMoneyGame('coin-recognition', 'easy');
  const question = app.moneyGame.questions[0];
  const wrongAnswer = question.options.find(option => option.value !== question.answer).value;
  app.answerMoneyQuestion(wrongAnswer);

  assert.match(arena.innerHTML, /Compare the shape, colour, and printed value/);
  assert.match(arena.innerHTML, /data-action="money-retry"/);
  app.retryMoneyQuestion();
  assert.equal(app.moneyGame.answered, false);
  assert.equal(app.moneyActivityEngine.answered, false);
});

test('Shopkeeper checks exact change, rejects invalid and overpayment coins, and allows retry', () => {
  const main = { innerHTML: '', dataset: {}, addEventListener() {} };
  const arena = { innerHTML: '' };
  const context = createBrowserContext({
    App: class App {},
    ProfileManager: {
      getSubjectDifficulty: () => 'easy',
      recordActivityScore() {}
    },
    document: {
      getElementById: id => id === 'app-main' ? main : id === 'money-arena' ? arena : null
    }
  });
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  const app = new context.App();

  app.startMoneyGame('shopkeeper', 'easy');
  Object.assign(app.moneyGame.questions[0], context.MoneyMasters.createShopkeeperQuestion(
    [{ name: 'Apple', price: 25 }],
    100,
    'easy'
  ));
  app.addMoneyCoin(100);
  assert.deepEqual(Array.from(app.moneyGame.selectedCoins), []);
  app.addMoneyCoin(50);
  app.addMoneyCoin(50);
  assert.deepEqual(Array.from(app.moneyGame.selectedCoins), [50]);

  app.submitMoneyAmount();
  assert.equal(app.moneyGame.lastAnswerCorrect, false);
  app.retryMoneyQuestion();
  assert.deepEqual(Array.from(app.moneyGame.selectedCoins), []);
  app.addMoneyCoin(50);
  app.addMoneyCoin(20);
  app.addMoneyCoin(5);
  app.submitMoneyAmount();
  assert.equal(app.moneyGame.lastAnswerCorrect, true);
  assert.equal(app.moneyActivityEngine.score, 1);
});

test('Shopkeeper scores and records named activity progress through ActivityEngine', () => {
  const main = { innerHTML: '', dataset: {}, addEventListener() {} };
  const arena = { innerHTML: '' };
  const recordedScores = [];
  const context = createBrowserContext({
    App: class App {},
    ProfileManager: {
      getSubjectDifficulty: () => 'medium',
      recordActivityScore: (...args) => recordedScores.push(args)
    },
    document: {
      getElementById: id => id === 'app-main' ? main : id === 'money-arena' ? arena : null
    }
  });
  loadActivityEngine(context);
  loadBrowserScripts(context, 'public/js/mathmasters/money.js');
  const app = new context.App();

  app.startMoneyGame('shopkeeper', 'easy');
  assert.equal(app.moneyActivityEngine.definition.id, 'money-shopkeeper');
  for (const question of app.moneyGame.questions) {
    let remaining = question.change;
    app.moneyGame.selectedCoins = [];
    for (const denomination of [...question.denominations].sort((first, second) => second.value - first.value)) {
      while (remaining >= denomination.value) {
        app.moneyGame.selectedCoins.push(denomination.value);
        remaining -= denomination.value;
      }
    }
    assert.equal(remaining, 0);
    app.submitMoneyAmount();
    app.nextMoneyQuestion();
  }

  assert.equal(app.moneyActivityEngine.status, 'complete');
  assert.equal(app.moneyActivityEngine.score, 6);
  assert.equal(recordedScores.length, 1);
  assert.equal(recordedScores[0][0].id, 'money-shopkeeper');
  assert.equal(recordedScores[0][1], 6);
});
