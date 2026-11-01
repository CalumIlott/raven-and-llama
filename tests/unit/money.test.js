const assert = require('node:assert/strict');
const test = require('node:test');
const { createBrowserContext, loadBrowserScripts } = require('../helpers/load-browser-scripts');

function loadMoneyMasters() {
  const context = createBrowserContext({ App: class App {} });
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
        } else {
          assert.equal(question.price + question.answer, question.payment);
          assert.equal(question.price % 5, 0);
          assert.equal(question.answer % 5, 0);
          assert.equal(question.options.length, 4);
          assert.equal(new Set(question.options).size, 4);
          assert.ok(question.options.includes(question.answer));
          assert.ok(question.options.every(option => option >= 0));
          assert.ok(question.prompt.includes(money.formatMoney(question.price)));
        }
      }
    }
  }
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

test('money values are formatted in cents and Australian dollars', () => {
  const money = loadMoneyMasters();

  assert.equal(money.formatMoney(75), '75c');
  assert.equal(money.formatMoney(100), '$1.00');
  assert.equal(money.formatMoney(125), '$1.25');
});
